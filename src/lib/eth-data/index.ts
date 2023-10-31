import {
  Alchemy,
  AssetTransfersCategory,
  Network,
  type AssetTransfersResult
} from 'alchemy-sdk';
import web3 from 'web3';
import { env } from '$env/dynamic/private';
import _ from 'lodash';
const { ALCHEMY_KEY } = env;

const config = {
  apiKey: ALCHEMY_KEY,
  network: Network.ETH_MAINNET
};

const alchemy = new Alchemy(config);

async function getCurrentBlock(): Promise<number> {
  const blockNum = await alchemy.core.getBlockNumber();
  return blockNum;
}

function getNumOfBlocks(minutes: number): number {
  const seconds = minutes * 60;
  const blocks = Math.floor(seconds / 12);
  return blocks;
}

type TokenAddressToBalance = { [tokenAddress: string]: number };
type TokenAddressToBalanceHex = { [tokenAddress: string]: string };

export type CleanTransfers = {
  from: string;
  to: string;
  value: number;
  asset: string;
  category: AssetTransfersCategory;
  timestamp: number;
  tokenAddress: string;
  tvl?: number;
  flow?: number;
};

function bigintHexToNumber(hex: string, decimals: number): number {
  const bigIntValue = BigInt(web3.utils.hexToNumberString(hex));
  const scaleFactor = BigInt(10 ** decimals);

  const intPart = bigIntValue / scaleFactor;
  const fractionalPart = bigIntValue % scaleFactor;
  const fractionalAsString = fractionalPart.toString().padStart(decimals, '0');

  return Number(`${intPart}.${fractionalAsString}`);
}

async function addCurrentTokenBalances(
  inflow: CleanTransfers[],
  outflow: CleanTransfers[],
  address: string
): Promise<TokenAddressToBalance> {
  inflow.forEach((t) => (t.flow = 1));
  outflow.forEach((t) => (t.flow = -1));

  const transfers = _.flatten([inflow, outflow]);

  const allTokenAddresses = _.chain(transfers)
    .uniqBy('tokenAddress')
    .map('tokenAddress')
    .pull(null!) // if transfer is ETH, tokenAddress is null
    .value();

  let currentTokenTvlHex: TokenAddressToBalanceHex = {};
  if (allTokenAddresses.length) {
    currentTokenTvlHex = (
      await alchemy.core.getTokenBalances(address, allTokenAddresses)
    ).tokenBalances.reduce((acc: TokenAddressToBalanceHex, tokenBalance) => {
      acc[tokenBalance.contractAddress] = tokenBalance.tokenBalance!;
      return acc;
    }, {});
  }

  // transform bigint hex to number using the correct decimals
  const currentTokenTvl: TokenAddressToBalance = {};
  const currentTokenTvlSymbols: TokenAddressToBalance = {};
  await Promise.all(
    allTokenAddresses.map(async (tokenAddress) => {
      const tokenMetadata = await alchemy.core.getTokenMetadata(tokenAddress);
      const value = bigintHexToNumber(
        currentTokenTvlHex[tokenAddress],
        // TODO: can this be null? - we are getting non null transfers through query
        tokenMetadata.decimals!
      );
      currentTokenTvl[tokenAddress] = value;
      currentTokenTvlSymbols[tokenMetadata.symbol!] = value;
    })
  );

  const hasEthTransfer = _.find(transfers, { tokenAddress: null });
  if (hasEthTransfer) {
    const ethBalance = await alchemy.core.getBalance(address);
    const value = bigintHexToNumber(ethBalance._hex, 18);
    currentTokenTvl['ETH'] = value;
    currentTokenTvlSymbols['ETH'] = value;
  }

  _.chain(transfers)
    .sortBy('timestamp')
    .reverse()
    .forEach((t, i) => {
      const tokenAddress = t.tokenAddress || 'ETH';
      const runningTvl = currentTokenTvl[tokenAddress];
      const tvl = i === 0 ? runningTvl : runningTvl + t.flow! * t.value;
      currentTokenTvl[tokenAddress] = tvl;
      t.tvl = tvl;
    })
    .value();

  return currentTokenTvlSymbols;
}

function cleanTransfers(
  transfers: AssetTransfersResult[],
  date: Date,
  currentBlock: number
): CleanTransfers[] {
  const result = transfers.map((transfer) => {
    const blockNum = transfer.blockNum;
    const timestamp =
      date.getTime() -
      // @ts-ignore
      (currentBlock - web3.utils.hexToNumber(blockNum)) * 12 * 1000;
    const value = transfer.value!;
    return {
      from: transfer.from,
      to: transfer.to!,
      value,
      asset: transfer.asset!,
      category: transfer.category,
      timestamp: timestamp,
      tokenAddress: transfer.rawContract.address!
    };
  });
  return result;
}

function timeRangeToMinutes(timeRange: string) {
  const timeRanges: { [range: string]: number } = {
    '24h': 60 * 24,
    '12h': 60 * 12,
    '6h': 60 * 6,
    '3h': 60 * 3,
    '1h': 60,
    '30m': 30
  };

  const minutes = timeRanges[timeRange];
  if (!minutes) {
    throw new Error(`Invalid time range: ${timeRange}`);
  }
  return minutes;
}

type AddressInfo = { fromAddress: string } | { toAddress: string };

async function getAllAssetTransfers(
  params: AddressInfo,
  timeRange: string,
  currentBlock: number
): Promise<AssetTransfersResult[]> {
  const fromBlock =
    currentBlock - getNumOfBlocks(timeRangeToMinutes(timeRange));
  const baseAssetTransfersRequest = {
    excludeZeroValue: true,
    fromBlock: web3.utils.toHex(fromBlock),
    category: [
      AssetTransfersCategory.ERC20,
      AssetTransfersCategory.EXTERNAL,
      AssetTransfersCategory.INTERNAL
    ]
  };
  const allAssetTransfers = [];
  let pageKey: undefined | string;
  do {
    const assetTransfers = await alchemy.core.getAssetTransfers({
      ...params,
      pageKey,
      ...baseAssetTransfersRequest
    });
    allAssetTransfers.push(...assetTransfers.transfers);
    pageKey = assetTransfers.pageKey;
  } while (pageKey);
  return allAssetTransfers;
}

async function getInflowAndOutflow(
  address: string,
  now: Date,
  timeRange: string
) {
  const currentBlock = await getCurrentBlock();
  const [outflowRaw, inflowRaw] = await Promise.all([
    getAllAssetTransfers({ fromAddress: address }, timeRange, currentBlock),
    getAllAssetTransfers({ toAddress: address }, timeRange, currentBlock)
  ]);
  const [outflow, inflow] = [outflowRaw, inflowRaw].map((transfers) =>
    cleanTransfers(transfers, now, currentBlock)
  );
  return { outflow, inflow };
}

export async function getTransferEvents(address: string, timeRange: string) {
  try {
    const now = new Date();
    const { outflow, inflow } = await getInflowAndOutflow(
      address,
      now,
      timeRange
    );

    if (!outflow.length || !inflow.length) {
      console.log('throwing');
      throw new Error(`Not enough transfers found in the last ${timeRange}`);
    }

    const perTokenCurrentTvl = await addCurrentTokenBalances(
      inflow,
      outflow,
      address
    );

    // TODO: for TVL: https://docs.alchemy.com/reference/sdk-gettokenbalances
    // let response = await alchemy.core.getTokenBalances(vitalikAddress, [usdcContract])
    const perTokenInflow = _.groupBy(inflow, 'asset');
    const perTokenOutflow = _.groupBy(outflow, 'asset');

    const [perTokenInflowSum, perTokenOutflowSum] = [
      perTokenInflow,
      perTokenOutflow
    ].map((tokenFlow) =>
      _.mapValues(tokenFlow, (transfers) => _.sumBy(transfers, 'value'))
    );

    //Logging the response to the console
    // TODO: which format do we need
    // all data per timestamp also tvl, outflow, inflow
    // or all seperate
    return {
      perTokenInflowSum,
      perTokenOutflowSum,
      perTokenInflow,
      perTokenOutflow,
      now: now.getTime(),
      perTokenCurrentTvl
    };
  } catch (err: any) {
    if (err.message.includes('Not enough transfers found')) {
      throw new Error(err.message);
    }
    console.error(err);
    throw new Error('An unknown error occurred.');
  }
}
