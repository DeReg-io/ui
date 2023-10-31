import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import {
  getUnseenNotificationCount,
  listEasyTriggerNotificationsByTriggerId,
  setEasyTriggerNotificationSeen
} from '$lib/db';
import { logger } from '$lib/logger';

export const GET = (async ({ url: { searchParams }, locals: { user } }) => {
  try {
    const type = searchParams.get('type');
    if (type === 'allNotifications') {
      const triggerId = searchParams.get('triggerId');
      if (!triggerId) throw new Error('No trigger id provided');
      const notifications = await listEasyTriggerNotificationsByTriggerId(
        triggerId
      );
      return json(notifications);
    } else if (type === 'unseenCount') {
      const userId = user.userInfo.username;
      const unseen = await getUnseenNotificationCount(userId);
      return json(unseen);
    } else {
      throw new Error('Invalid type');
    }
  } catch (err) {
    throw error(500, err.message);
  }
}) satisfies RequestHandler;

export const PATCH = (async ({ request }) => {
  try {
    const body = await request.json();
    await setEasyTriggerNotificationSeen(body.ids);
    return new Response('ok');
  } catch (err: any) {
    throw error(500, err.message);
  }
}) satisfies RequestHandler;
