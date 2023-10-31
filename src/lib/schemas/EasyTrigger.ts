// TODO: use ethersjs
import { getIdConnectedToContract } from '$lib/util/contract-connected';
import web3 from 'web3';
import { z } from 'zod';

function isValidURL(str) {
  const res = str.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );

  const ipAddress = str.match(
    /^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/g
  );

  return res !== null || str.includes('localhost') || ipAddress !== null;
}

// we need the userId and network to check if the user is connected to the contract
// the userId is not in the form data so we have to pass it this way and network is
// not accessible in a zod validator
function getEasyTriggerSchema(userId: string, network: string) {
  return z.object({
    id: z.string(),
    name: z
      .string({ required_error: 'Name is required' })
      .min(3, 'Name must be at least 3 characters')
      .max(64, 'Name must be less than 64 characters'),
    contractAddress: z
      .custom<string>((address) => web3.utils.isAddress(address as string), {
        message: 'Invalid contract address'
      })
      .superRefine(async (address, ctx) => {
        const connectedUserId = await getIdConnectedToContract(
          address,
          network
        );
        console.log('connectedUserId : ', connectedUserId);
        if (!connectedUserId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Contract address is not connected to trigger.'
          });
          return z.NEVER;
        }

        if (connectedUserId !== userId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Contract address is connected to another account.'
          });
        }
      }),
    allowlistActive: z.boolean().default(false),
    allowlist: z
      .custom<string>(isValidURL, { message: 'Invalid URL' })
      .array()
      .default([]),
    network: z.enum(['Sepolia', 'Goerli']).default('Sepolia'),
    // default set in db call
    isActive: z.boolean().optional()
  });
}

export type EasyTrigger = {
  id: string;
  name: string;
  contractAddress: string;
  allowlistActive: boolean;
  allowlist: string[];
  userId: string;
  network: string;
  createdAt?: string;
  updatedAt?: string;
  isActive: boolean;
};

type FormData = {
  [k: string]: FormDataEntryValue;
};

async function validateEasyTrigger(formData: FormData, userId: string) {
  const EasyTriggerSchema = getEasyTriggerSchema(userId, formData.network);
  return await EasyTriggerSchema.parseAsync(formData);
}

async function validateEasyTriggerPartial(
  formData: Partial<EasyTrigger>,
  userId: string
) {
  const EasyTriggerSchema = getEasyTriggerSchema(userId, formData.network);
  return await EasyTriggerSchema.partial().parseAsync(formData);
}

export { validateEasyTrigger, validateEasyTriggerPartial };
