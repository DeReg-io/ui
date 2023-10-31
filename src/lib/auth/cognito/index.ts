import { env } from '$env/dynamic/private';
import type { SiweMessage } from 'siwe';
const {
  COGNITO_CLIENT_ID,
  COGNITO_CLIENT_SECRET,
  COGNITO_CALLBACK_PATH,
  COGNITO_URL
} = env;

type CognitoTokenResponse = {
  id_token: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
};

function getCognitoRedirectUrl(urlOrigin: string): string {
  // return `${window.location.origin}/${COGNITO_CALLBACK_PATH}`;
  return `${urlOrigin}${COGNITO_CALLBACK_PATH}`;
}

async function getAuthTokensFromCognito(
  code: string,
  urlOrigin: string
): Promise<CognitoTokenResponse> {
  const basicAuthKey = Buffer.from(
    `${COGNITO_CLIENT_ID}:${COGNITO_CLIENT_SECRET}`,
    'utf-8'
  ).toString('base64');
  const response = await fetch(`${COGNITO_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuthKey}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: COGNITO_CLIENT_ID,
      code,
      redirect_uri: getCognitoRedirectUrl(urlOrigin)
    })
  });
  const data: CognitoTokenResponse = await response.json();
  return data;
}

export type CognitoUserInfo = {
  sub?: string;
  email_verified: string; // returned as string from cognito, e.g. 'true'
  email: string;
  username: string;
};

export type SiweUserInfo = {
  siweMessage: SiweMessage;
  username: string; // wallet address
};

export type CookieUserInfo =
  | CognitoUserInfo
  | SiweUserInfo
  | (CognitoUserInfo & SiweUserInfo);

async function getUserInfoFromCognito(accessToken: string) {
  const response = await fetch(`${COGNITO_URL}/oauth2/userInfo`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  const data: CognitoUserInfo = await response.json();
  return data;
}

export type CognitoJwtCookie = {
  refreshToken?: string; // only available with cognito
  userInfo: CookieUserInfo;
  iat?: number; // set from JWT, issued at timestamp
};

export {
  getAuthTokensFromCognito,
  getUserInfoFromCognito,
  getCognitoRedirectUrl
};
