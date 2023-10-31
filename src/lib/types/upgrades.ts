export enum AddressType {
  EOA = 'EOA',
  multisig = 'multisig',
  unknown = 'unknown',
  unknownProxyAdminContract = 'unknownProxyAdminContract',
  unknownOwnerContract = 'unknownOwnerAdmin'
}

export type AddressOwner = {
  addressType: AddressType;
  threshold?: number;
  multisigLength?: number;
};

export type UpgradeTableRow = {
  name: string;
  address: string;
  lastUpgrade?: string;
  lastUpgradeTxHash?: string;
  tvl: number;
  owner?: AddressOwner;
};
