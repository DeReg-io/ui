import { env } from '$env/dynamic/private';
import type { RedisClientType } from 'redis';
import { createClient } from 'redis';

const { REDIS_URL } = env;
let client: RedisClientType;
export async function getDb() {
  console.log('in getDb');
  if (client) return client;
  console.log('creating client: ', REDIS_URL);
  client = createClient({
    url: REDIS_URL
  });
  console.log('connecting to redis');
  await client.connect();
  initializeIndexes(client);
  return client;
}

const indexes = [
  {
    name: 'idx:alert',
    command:
      'FT.CREATE idx:alert ON JSON PREFIX 1 alert: SCHEMA $.isActive AS isActive TAG $.userId AS userId TAG $.updatedAt AS updatedAt TEXT SORTABLE $.createdAt AS createdAt TEXT SORTABLE'
  },
  {
    name: 'idx:alertContract',
    command:
      'FT.CREATE idx:alertContract ON JSON PREFIX 1 alertContract: SCHEMA $.userId AS userId TAG $.updatedAt AS updatedAt TEXT SORTABLE $.createdAt AS createdAt TEXT SORTABLE'
  },
  {
    name: 'idx:proxyContract',
    command:
      'FT.CREATE idx:proxyContract ON JSON PREFIX 1 proxyContract: SCHEMA $.isLabeledName AS isLabeledName TAG $.lastLabeledName AS lastLabeledName TEXT $.lastUpgrade AS lastUpgrade TEXT SORTABLE $.ownerAdmin.lastAdminChange AS ownerAdminLastAdminChange TEXT SORTABLE $.ownerAdmin.lastOwnerChange AS ownerAdminLastOwnerChange TEXT SORTABLE $.isLabeledOwnerAdmin AS isLabeledOwnerAdmin TAG $.name AS name TEXT $.implementationName AS implementationName TEXT'
  },
  {
    name: 'idx:easyTrigger',
    command:
      'FT.CREATE idx:easyTrigger ON JSON PREFIX 1 easyTrigger: SCHEMA $.userId AS userId TAG $.updatedAt AS updatedAt TEXT SORTABLE $.createdAt AS createdAt TEXT SORTABLE'
  },
  {
    name: 'idx:easyTriggerNotification',
    command:
      'FT.CREATE idx:easyTriggerNotification ON JSON PREFIX 1 easyTriggerNotification: SCHEMA $.userId AS userId TAG $.triggerId AS triggerId TAG $.seen AS seen TAG $.createdAt AS createdAt TEXT SORTABLE'
  },
  {
    name: 'idx:user',
    command:
      'FT.CREATE idx:user ON JSON PREFIX 1 user: SCHEMA $.email AS email TAG $.createdAt AS createdAt TEXT SORTABLE'
  },
  {
    name: 'idx:alertDefinition',
    command:
      'FT.CREATE idx:alertDefinition ON JSON PREFIX 1 alertDefinition: SCHEMA $.contractAddress AS contractAddress TAG $.userId AS userId TAG $.createdAt AS createdAt TEXT SORTABLE $.updatedAt AS updatedAt TEXT SORTABLE'
  },
  {
    name: 'idx:monitoredContract',
    command:
      'FT.CREATE idx:monitoredContract ON JSON PREFIX 1 monitoredContract: SCHEMA $.userIds.* AS userIds TAG $.alchemyWebhookId AS alchemyWebhookId TAG $.updatedAt AS updatedAt TEXT SORTABLE $.createdAt AS createdAt TEXT SORTABLE'
  },
  {
    name: 'idx:assetTransferDoc',
    command:
      'FT.CREATE idx:assetTransferDoc ON JSON PREFIX 1 assetTransferDoc: SCHEMA $.from AS from TAG $.to AS to TAG $.asset AS asset TAG $.timestamp AS timestamp NUMERIC SORTABLE'
  }
];

async function initializeIndexes(redis: RedisClientType) {
  try {
    for (const index of indexes) {
      try {
        console.log('creating index for: ', index.name);
        const redisResult = await redis.sendCommand(index.command.split(' '));
        console.log('redisResult: ', redisResult);
      } catch (err: any) {
        if (!err.message.includes('Index already exist')) {
          throw err;
        }
      }
    }
  } catch (err: any) {
    console.log('err message: ', err.message);
    console.error('Failed to create indexes on Redis: ', err);
  }
}

export * from './easy-trigger';
export * from './upgrade';
export * from './alert';
