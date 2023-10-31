import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { user } }) => {
  throw redirect(303, '/easy-trigger');
}) satisfies PageServerLoad;
