import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals: { user } }) => {
  try {
    const userId = user.userInfo.username;
    return { userId };
  } catch (err) {
    console.error('err in laoyout load for easy-trigger: ', err);
  }
}) satisfies LayoutServerLoad;
