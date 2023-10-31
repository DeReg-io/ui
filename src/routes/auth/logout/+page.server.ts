import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { deleteCookie } from '$lib/util/delete-session-cookie';

export const load = (async (event) => {
  try {
    const { cookies } = event;
    deleteCookie(cookies);
  } catch (err) {
    console.error(err);
    throw error(500, 'Unknown error deleting session cookie');
  }

  throw redirect(302, '/');
}) satisfies PageServerLoad;
