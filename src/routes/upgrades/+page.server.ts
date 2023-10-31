import type { PageServerLoad } from './$types';
import type { UpgradeTableRow } from '$lib/types';
import { getAllUpgrades } from '$lib/db';

export const load = (async ({ locals: { user } }) => {
  const allUpgrades = await getAllUpgrades();
  return { table: allUpgrades };
}) satisfies PageServerLoad;
