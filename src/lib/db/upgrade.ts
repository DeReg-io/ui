import type { UpgradeTableRow } from '$lib/types';
import { getDb } from '.';

export async function getAllUpgrades(): Promise<UpgradeTableRow[]> {
  const db = await getDb();
  const keys = await db.keys('proxyContract:*');
  const allUpgrades = await Promise.all(
    keys.map(async (key) => {
      // TODO: propper types
      const upgrade: any = await db.json.get(key);
      // cannot be null, got keys from existing documents
      upgrade!.address = key.split(':')[1];
      return upgrade;
    })
  );
  console.log('allUpgrades', JSON.stringify(allUpgrades, null, 2));
  return allUpgrades.map(
    (upgrade) =>
      ({
        name: upgrade.name,
        address: upgrade.address,
        lastUpgrade:
          upgrade.lastUpgrade === 'EMPTY' ? null : upgrade.lastUpgrade,
        tvl: upgrade?.deFiLlamaData?.chainTvls?.Ethereum,
        lastUpgradeTxHash: upgrade?.lastUpgradeTxHash,
        owner: {
          addressType: upgrade?.ownerAdmin?.currentAddressType,
          threshold: upgrade?.ownerAdmin?.threshold,
          multisigLength: upgrade?.ownerAdmin?.multisigAddresses?.length
        }
      } as UpgradeTableRow)
  );
}
