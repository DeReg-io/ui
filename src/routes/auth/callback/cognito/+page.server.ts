import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
  getAuthTokensFromCognito,
  getUserInfoFromCognito
} from '$lib/auth/cognito';
import type { CognitoJwtCookie as CognitoJwtUser } from '$lib/auth/cognito';
import { setSessionCookies } from '$lib/util/session-cookies';
import { createUserCognitoIfNotExists } from '$lib/db/user';

export const load = (async (event) => {
  try {
    const { url } = event;
    const code = url.searchParams.get('code');
    if (!code) throw error(404, 'Code not found');
    const { access_token, refresh_token } = await getAuthTokensFromCognito(
      code,
      url.origin
    );

    const userInfo = await getUserInfoFromCognito(access_token);

    await createUserCognitoIfNotExists(userInfo);

    delete userInfo.sub;
    const cookie: CognitoJwtUser = {
      refreshToken: refresh_token,
      userInfo
    };
    console.log('setting session cookie:', cookie);
    setSessionCookies(event, cookie);
    console.log('session cookie set');
  } catch (err) {
    console.error(err);
    throw error(
      500,
      'Unknown error setting session cookie after successful login'
    );
  }

  // a redirect to a ssr: false page is necessary, otherwise cookie
  // does not get saved and starts an redirect endless loop
  throw redirect(302, '/auth/callback/success');
}) satisfies PageServerLoad;
