import type { AlertContract } from '$lib/schemas/Alert';
import { getDb } from '.';

export async function listAlertContractsByUserId(
  userId: string
): Promise<AlertContract[]> {
  const db = await getDb();
  const escapedUserId = userId.replaceAll('-', '\\-');
  const index = 'idx:alertContract';
  const query = `@userId:{${escapedUserId}}`;
  const redisResult = await db.ft.search(index, query, {
    SORTBY: {
      BY: 'updatedAt',
      DIRECTION: 'DESC'
    }
  });

  const alertContracts = redisResult.documents.map((doc) => ({
    ...doc.value,
    id: doc.id.split(':')[1]
  })) as AlertContract[];

  return alertContracts;
}

export async function addAlertContract(
  alertContract: AlertContract
): Promise<AlertContract> {
  const db = await getDb();
  const doc: AlertContract = {
    id: alertContract.id,
    name: alertContract.name,
    userId: alertContract.userId,
    address: alertContract.address,
    network: alertContract.network,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await db.json.set(`alertContract:${alertContract.id}`, '$', doc);
  return doc;
}
// ============
// TODO: update updateAt of AlertContract, so we can auto select it in the UI
// ============
