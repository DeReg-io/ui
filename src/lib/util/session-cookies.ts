import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import type { CognitoJwtCookie, CookieUserInfo } from '$lib/auth/cognito';
import type { RequestEvent, ServerLoadEvent } from '@sveltejs/kit';
const { NODE_ENV, JWT_SECRET, COOKIE_VALIDITY } = env;

export function setSessionCookies(
  event: ServerLoadEvent | RequestEvent,
  cookie: CognitoJwtCookie
) {
  const token = jwt.sign(cookie, JWT_SECRET);
  event.cookies.set('session', token, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: NODE_ENV !== 'development',
    maxAge: +COOKIE_VALIDITY
  });
}

export function updateSessionCookies(
  event: ServerLoadEvent | RequestEvent,
  update: Partial<CookieUserInfo>
) {
  const cookie = getSessionCookies(event);
  setSessionCookies(event, { ...cookie, ...update });
}

export function getSessionCookies(
  event: ServerLoadEvent | RequestEvent
): CognitoJwtCookie {
  const encodedCookie = event.cookies.get('session');
  if (!encodedCookie) {
    throw Error('Could not decode session cookie');
  }
  const user = jwt.verify(encodedCookie, JWT_SECRET) as CognitoJwtCookie;
  return user;
}
