import { listEasyTriggersByUserId } from '$lib/db';
import type { EasyTrigger } from '$lib/schemas/EasyTrigger';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals: { user } }) => {
  try {
    const userId = user.userInfo.username;
    const easyTriggers: EasyTrigger[] = await listEasyTriggersByUserId(userId);
    return { easyTriggers };
  } catch (err) {
    console.error('err in laoyout load for easy-trigger: ', err);
  }
}) satisfies LayoutServerLoad;
