// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { CognitoJwtCookie } from '$lib/auth/cognito';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: CognitoJwtCookie;
    }
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
