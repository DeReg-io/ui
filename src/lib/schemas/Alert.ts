import { z } from 'zod';
import web3 from 'web3';
import { isContractGcb } from '$lib/util/is-contract-gcb';

export type Alert = {
  id: string;
  name: string;
  isActive: boolean;
  userId: string;
  contractAddress: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AlertContract = {
  id: string;
  name?: string;
  userId: string;
  address: string;
  network: string;
  createdAt?: string;
  updatedAt?: string;
};

function getAlertContractSchema(network: string) {
  return z.object({
    id: z.string(),
    name: z.string().optional(),
    network: z.enum(['Sepolia', 'Goerli']).default('Sepolia'),
    address: z
      .custom<string>((address) => web3.utils.isAddress(address as string), {
        message: 'Invalid contract address'
      })
      .superRefine(async (address, ctx) => {
        const isGcb = await isContractGcb(address, network);
        if (!isGcb) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Contract address is not a ERC-7265 implementation.'
          });
        }
      })
  });
}

export async function validateAlertContract(formData: FormData) {
  const AlertSchema = getAlertContractSchema(formData.network);
  return await AlertSchema.parseAsync(formData);
}
