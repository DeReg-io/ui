import { error, json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SiweMessage } from 'siwe';
import { createUser, getUserByAddress } from '$lib/db/user';
import { setSessionCookies } from '$lib/util/session-cookies';

export const POST = (async (event) => {
  const { request } = event;
  const { message, signature } = await request.json();
  if (!message || !signature) {
    return json({ error: 'message and signature are required' });
  }

  const SIWEObject = new SiweMessage(message);
  const { data: verifiedMessage } = await SIWEObject.verify({
    signature: signature,
    nonce: message.nonce
  });

  const user = await getUserByAddress(verifiedMessage.address);
  if (!user) {
    await createUser(verifiedMessage.address);
  }
  setSessionCookies(event, {
    userInfo: {
      siweMessage: verifiedMessage,
      username: verifiedMessage.address
    }
  });

  return new Response('ok');
}) satisfies RequestHandler;
