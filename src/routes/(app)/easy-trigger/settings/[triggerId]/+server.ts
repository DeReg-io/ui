import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { deleteEasyTrigger, patchEasyTrigger } from '$lib/db';

export const DELETE = (async ({ params, locals: { user } }) => {
  try {
    const triggerId = params.triggerId;
    if (!triggerId) throw new Error('No trigger id provided');
    await deleteEasyTrigger(triggerId, user.userInfo.username);
    return new Response('ok');
  } catch (err) {
    throw error(500, err.message);
  }
}) satisfies RequestHandler;

export const PUT = (async ({ request, params, locals: { user } }) => {
  try {
    const body = await request.json();
    const triggerId = params.triggerId;
    if (!triggerId) throw new Error('No trigger id provided');
    await patchEasyTrigger(triggerId, user.userInfo.username, body);
    return new Response('ok');
  } catch (err) {
    throw error(500, err.message);
  }
}) satisfies RequestHandler;
