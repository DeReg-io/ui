import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateNonce, SiweMessage } from 'siwe';
import { updateSessionCookies } from '$lib/util/session-cookies';

export const POST = (async (event) => {
  // set on cookie
  const { request } = event;
  const { address, statement } = await request.json();
  if (!address || !statement) {
    return json({ error: 'address and statement are required' });
  }
  const nonce = generateNonce();

  const url = new URL(request.url);

  const message = new SiweMessage({
    domain: url.host,
    address,
    statement,
    uri: url.origin,
    version: '1',
    chainId: 1,
    nonce
  });

  // updateSessionCookies(event, { siweMessage: message });
  // console.log('updated session cookies');

  return json(message.prepareMessage());
}) satisfies RequestHandler;
