import { ethers } from 'ethers';
const { Contract, JsonRpcProvider } = ethers;
import { env } from '$env/dynamic/private';

const { RPC_GOERLI_URL, RPC_SEPOLIA_URL } = env;

export async function getIdConnectedToContract(addr: string, network: string) {
  // or sepolia provider
  // https://chainlist.org/?search=sepolia&testnets=true
  let providerUrl;
  if (network === 'Sepolia') {
    providerUrl = RPC_SEPOLIA_URL;
  } else if (network === 'Goerli') {
    providerUrl = RPC_GOERLI_URL;
  } else {
    throw new Error('Invalid network');
  }
  const provider = new JsonRpcProvider(providerUrl);
  const contract = new Contract(
    addr,
    ['function DEREG_OWNER_UUID() external view returns (string memory)'],
    provider
  );
  try {
    return await contract.DEREG_OWNER_UUID.call();
  } catch (err) {
    console.error('Could not check for connected smart contract id: ', err);
    return null;
  }
}
