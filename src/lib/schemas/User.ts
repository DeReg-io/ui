export type User = {
  address: string;
  createdAt: string;
};

export type CognitoUser = {
  email: string;
  emailVerified: boolean;
  userStatus: string;
  // TODO: old users have no createdAt
  createdAt?: string;
};
