import type { Actions } from './$types';
import { env } from '$env/dynamic/private';
import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminGetUserCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { setSessionCookies } from '$lib/util/session-cookies';
import type { CognitoJwtCookie, CognitoUserInfo } from '$lib/auth/cognito';
import cryptoJs from 'crypto-js';
import { logger } from '$lib/logger';
const { enc, HmacSHA256 } = cryptoJs;

const {
  COGNITO_CLIENT_ID,
  COGNITO_CLIENT_SECRET,
  COGNITO_USER_POOL_ID,
  AWS_REGION
} = env;
const cognitoAuthFlow = 'ADMIN_USER_PASSWORD_AUTH';

const client = new CognitoIdentityProviderClient({
  region: AWS_REGION
});

const calculateSecretHash = (
  username: string,
  clientId: string,
  clientSecret: string
): string => {
  const message = username + clientId;
  return enc.Base64.stringify(HmacSHA256(message, clientSecret));
};

type CognitoAuthenticationResult = {
  AccessToken: string;
  ExpiresIn: number;
  IdToken: string;
  RefreshToken: string;
  TokenType: string; // "Bearer"
};

// type CognitoUserInfo = {
//   emailVerified: string; // returned as string from cognito, e.g. 'true'
//   email: string;
//   username: string;
// };

// export type CognitoJwtCookie = {
//   refreshToken: string;
//   userInfo: CognitoUserInfo;
//   iat?: number; // set from JWT, issued at timestamp
// };

async function authenticateUser(
  username: string,
  password: string
): Promise<CognitoAuthenticationResult> {
  try {
    logger.info('Credentials', {
      UserPoolId: COGNITO_USER_POOL_ID,
      ClientId: COGNITO_CLIENT_ID,
      AuthFlow: cognitoAuthFlow,
      username,
      COGNITO_CLIENT_ID,
      COGNITO_CLIENT_SECRET,
      USERNAME: username,
      PASSWORD: password,
      region: AWS_REGION
    });

    const command = new AdminInitiateAuthCommand({
      UserPoolId: COGNITO_USER_POOL_ID,
      ClientId: COGNITO_CLIENT_ID,
      AuthFlow: cognitoAuthFlow,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: calculateSecretHash(
          username,
          COGNITO_CLIENT_ID!,
          COGNITO_CLIENT_SECRET!
        )
      }
    });

    const response = await client.send(command);
    const result = response.AuthenticationResult as CognitoAuthenticationResult;
    return result;
  } catch (error) {
    logger.error('Could not authenticate user with Cognito', error);
    throw error;
  }
}

// Use only after successful authentication
async function getUserInfoAuthenticated(
  username: string
): Promise<CognitoUserInfo> {
  const getUserCommand = new AdminGetUserCommand({
    UserPoolId: COGNITO_USER_POOL_ID,
    Username: username
  });
  const userResponse = await client.send(getUserCommand);
  const result = {
    email_verified: userResponse.UserAttributes?.find(
      (attr) => attr.Name === 'email_verified'
    )?.Value!,
    email: userResponse.UserAttributes?.find((attr) => attr.Name === 'email')
      ?.Value!,
    username: userResponse.Username!
  };
  return result;
}

export const actions = {
  default: async (event) => {
    try {
      logger.info('Submitting login form');
      const { request } = event;
      const formData = Object.fromEntries(await request.formData());
      const username = formData.email.toString();
      const password = formData.password.toString();

      const authResult = await authenticateUser(username, password);
      logger.info('Authenticated user: ', {authResult})
      const userInfo = await getUserInfoAuthenticated(username);
      logger.info('got user info: ', {username})

      const cookie: CognitoJwtCookie = {
        refreshToken: authResult.RefreshToken,
        userInfo
      };
      logger.info('setting session cookie')
      setSessionCookies(event, cookie);

      logger.info('session cookie set!')

      return {
        errors: null
      };
    } catch (err) {
      logger.error(err);
      return {
        errors: true
      };
    }
  }
} satisfies Actions;

export const ssr = true;
