import type { CognitoUser, User } from '$lib/schemas/User';
import { getDb } from '.';
import type { CognitoUserInfo } from '$lib/auth/cognito';
import { logger } from '$lib/logger';

export async function getUserByAddress(address: string): Promise<User | null> {
  const db = await getDb();
  const user = (await db.json.get(`user:${address}`)) as User | null;
  if (!user) return null;
  return user;
}

export async function createUser(address: string): Promise<User> {
  const db = await getDb();
  const user: User = {
    address,
    createdAt: new Date().toISOString()
  };
  await db.json.set(`user:${address}`, '$', user);
  return user;
}

async function getUserByEmail(email: string): Promise<CognitoUser | null> {
  const db = await getDb();
  const escapedEmail = email.replace(/[.@\\]/g, '\\$&');
  const index = 'idx:user';
  const query = `@email:{${escapedEmail}}`;
  console.log('query: ', query);
  const redisResult = await db.ft.search(index, query);
  console.log('redisResult: ', redisResult);

  const users = redisResult.documents.map((doc) => ({
    ...(doc.value as unknown as CognitoUser)
  })) as CognitoUser[];

  if (!users[0]) return null;
  return users[0];
}

export async function createUserCognitoIfNotExists(userInfo: CognitoUserInfo) {
  const user = await getUserByEmail(userInfo.email);
  logger.info('Existing user in createUserCognitoIfNotExists', { user });
  if (!user) {
    const db = await getDb();
    logger.info('Creating new user in db with: ', { userInfo });
    await db.json.set(`user:${userInfo.sub}`, '$', {
      email: userInfo.email,
      emailVerified: userInfo['email_verified'],
      userStatus: userInfo.email_verified ? 'CONFIRMED' : 'UNCONFIRMED',
      createdAt: new Date().toISOString()
    });
  }
}
