import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { deleteCookie } from '$lib/util/delete-session-cookie';
import { getSessionCookies } from '$lib/util/session-cookies';
// need this import to initialize logger globally
import { logger } from '$lib/logger';
import stringify from 'json-stringify-safe';

const unProtectedRoutes = [
  '/auth/callback/cognito',
  '/auth/callback/success',
  '/upgrades',
  '/login',
  '/signup',
  '/gcb',
  '/siwe/create',
  '/siwe/sign'
];

const ignoreAllRoutes = [
  // do not log stuff on log route
  '/api/log'
];

export const handle = (async ({ event, resolve }) => {
  if (ignoreAllRoutes.includes(event.url.pathname)) {
    return resolve(event);
  }
  try {
    // special api key to keep the functions warm
    if (
      event.url.searchParams.get('keepWarmKey') ===
      'b7p_ygAf6xTWyDbc@dgoB@GhFUAWBg'
    ) {
      event.locals.user = {
        // special case for keep warm, ignore ts type errors
        // @ts-ignore
        userInfo: {
          username: 'keepWarmUser'
        }
      };
      logger.info('hooks.server.ts keep warm', JSON.parse(stringify(event)));
      return resolve(event);
    }

    logger.info('hoost.server.ts full event', { event: JSON.parse(stringify(event)) })

    const user = getSessionCookies(event);

    event.locals.user = user;
    logger.info('hooks.server.ts authenticated', JSON.parse(stringify(event)));
    return resolve(event);
  } catch (err) {
    logger.error('hooks.server.ts error', err);

    if (unProtectedRoutes.includes(event.url.pathname)) {
      logger.info(
        'hooks.server.ts unprotected route',
        JSON.parse(stringify(event))
      );
      return resolve(event);
    }

    // delete session cookie
    deleteCookie(event.cookies);
  }

  logger.info('hooks.server.ts unauthenticated', JSON.parse(stringify(event)));

  // const encodedRedirectUrl = encodeURIComponent(
  //   getCognitoRedirectUrl(event.url.origin)
  // );
  // const cognitoLoginUrl = `${COGNITO_LOGIN_URL}&redirect_uri=${encodedRedirectUrl}`;
  // throw redirect(303, cognitoLoginUrl);
  throw redirect(303, '/login');
}) satisfies Handle;
