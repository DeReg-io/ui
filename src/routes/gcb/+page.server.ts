import { getTransferEvents } from '$lib/eth-data';
import type { PageServerLoad } from './$types';

// 0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD // eth and tvl
// 0x028171bCA77440897B824Ca71D1c56caC55b68A3 // erc20 and tvl
// 0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640 // multi erc20

export const load = (async ({ url: { searchParams } }) => {
  const addresses = searchParams.get('addresses')?.split(',') || [];
  const timeRange = searchParams.get('range') || '3h';

  if (!addresses.length) {
    return {
      error: 'No address provided.'
    };
  }

  console.log('addresses', addresses[0]);
  console.log('timeRange', timeRange);
  try {
    const result = await getTransferEvents(addresses[0], timeRange);
    return {
      data: result
    };
  } catch (err: any) {
    console.log('err.message: ', err.message);
    return {
      error: err.message
    };
  }
}) satisfies PageServerLoad;
