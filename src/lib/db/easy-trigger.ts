import type { EasyTrigger } from '$lib/schemas/EasyTrigger';
import { validateEasyTriggerPartial } from '$lib/schemas/EasyTrigger';
import { getDb } from '.';

// enum Network {
//   Mainnet,
//   Goerli
// }

// type safety form validation
async function addEasyTrigger(trigger: EasyTrigger) {
  const db = await getDb();
  await db.json.set(`easyTrigger:${trigger.id}`, '$', {
    name: trigger.name,
    contractAddress: trigger.contractAddress,
    allowlistActive: trigger.allowlistActive,
    allowlist: trigger.allowlist,
    userId: trigger.userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    network: trigger.network,
    isActive: trigger.isActive ?? false
  });
}

async function getEasyTrigger(triggerId: string): Promise<EasyTrigger | null> {
  const db = await getDb();
  const easyTrigger = (await db.json.get(
    `easyTrigger:${triggerId}`
  )) as EasyTrigger | null;
  if (easyTrigger) easyTrigger.id = triggerId;
  return easyTrigger;
}

async function listEasyTriggersByUserId(
  userId: string
): Promise<EasyTrigger[]> {
  console.log('listing easy triggers by user id: ', userId);
  const db = await getDb();
  const escapedUserId = userId.replaceAll('-', '\\-');
  console.log('escapedUserId: ', escapedUserId);
  const index = 'idx:easyTrigger';
  const query = `@userId:{${escapedUserId}}`;
  // const redisResult = await db.ft.search(index, query);
  // redis query that sorts by updatedAt
  const redisResult = await db.ft.search(index, query, {
    SORTBY: {
      BY: 'updatedAt',
      DIRECTION: 'DESC'
    }
  });
  console.log('redisResult: ', redisResult);

  const easyTriggers = redisResult.documents.map((doc) => ({
    ...doc.value,
    id: doc.id.split(':')[1]
  })) as EasyTrigger[];
  // return easyTriggers.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return easyTriggers;
}

async function deleteEasyTrigger(triggerId: string, userId: string) {
  const db = await getDb();

  const existingEasyTrigger = await getEasyTrigger(triggerId);
  if (existingEasyTrigger?.userId !== userId) {
    throw new Error('User is not authorized to delete this trigger');
  }
  await db.json.del(`easyTrigger:${triggerId}`);
}

async function patchEasyTrigger(
  triggerId: string,
  userId: string,
  patch: Partial<EasyTrigger>,
  schemaVerified = false
) {
  const db = await getDb();
  let result;
  const existingTrigger = await getEasyTrigger(triggerId);
  if (!existingTrigger || existingTrigger.userId !== userId) {
    throw new Error('User is not authorized to patch this trigger');
  }
  if (schemaVerified) {
    result = patch;
  } else {
    // can only update contract address if the network is given
    if (!patch.network && patch.contractAddress) {
      patch.network = existingTrigger.network;
    }
    result = await validateEasyTriggerPartial(patch, userId);
  }
  await db.json.set(`easyTrigger:${existingTrigger.id}`, '$', {
    ...existingTrigger,
    ...result,
    updatedAt: new Date().toISOString()
  });
}

export type EasyTriggerNotification = {
  id: string;
  callerUrl: string;
  verifiedDomain: boolean;
  triggeredContract: boolean;
  createdAt: string;
  triggerId: string;
  userId: string;
  body: string;
  manuallyTriggered: boolean;
  network?: string;
  transactionHash?: string;
  seen: boolean;
};

async function listEasyTriggerNotificationsByTriggerId(triggerId: string) {
  const db = await getDb();
  const key = `easyTriggerNotification:${triggerId}`;
  const escapedUserId = triggerId.replaceAll('-', '\\-');
  const index = 'idx:easyTriggerNotification';
  const query = `@triggerId:{${escapedUserId}}`;
  const redisResult = await db.ft.search(index, query, {
    SORTBY: {
      BY: 'createdAt',
      DIRECTION: 'DESC'
    },
    LIMIT: {
      from: 0,
      size: 50
    }
  });
  const notifications = redisResult.documents.map((doc) => ({
    ...doc.value,
    id: doc.id.split(':')[1]
  })) as EasyTriggerNotification[];
  return notifications;
}

async function setEasyTriggerNotificationSeen(ids: string[]) {
  const db = await getDb();
  await Promise.all(
    ids.map(async (id) => {
      await db.json.set(`easyTriggerNotification:${id}`, '$.seen', true);
    })
  );
}

async function getUnseenNotificationCount(userId: string) {
  const db = await getDb();
  const escapedUserId = userId.replaceAll('-', '\\-');
  const index = 'idx:easyTriggerNotification';
  const query = `@userId:{${escapedUserId}} @seen:{false}`;
  const redisResult = await db.ft.search(index, query);
  if (!redisResult.documents) return {};
  const result: Record<string, number> = {};
  redisResult.documents.forEach((doc) => {
    const { triggerId } = doc.value;
    if (result[triggerId]) {
      result[triggerId] += 1;
    } else {
      result[triggerId] = 1;
    }
  });
  return result;
}

export {
  addEasyTrigger,
  getEasyTrigger,
  listEasyTriggersByUserId,
  deleteEasyTrigger,
  patchEasyTrigger,
  listEasyTriggerNotificationsByTriggerId,
  setEasyTriggerNotificationSeen,
  getUnseenNotificationCount
};
