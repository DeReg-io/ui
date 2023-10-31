import type { Actions } from './$types';
import { fail, error, type RequestHandler } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { ZodError } from 'zod';
import { randomUUID } from 'crypto';
import { addEasyTrigger, getEasyTrigger, patchEasyTrigger } from '$lib/db';
import { validateEasyTrigger } from '$lib/schemas/EasyTrigger';
import { getIdConnectedToContract } from '$lib/util/contract-connected';

export const load = (async ({ params }) => {
  try {
    const trigger = await getEasyTrigger(params.triggerId);
    return trigger || {};
  } catch (err) {
    throw error(
      404,
      `Could not fetch trigger settings for id ${params.triggerId}`
    );
  }
}) satisfies PageServerLoad;

export const actions = {
  trigger: async ({ request, locals: { user } }) => {
    const formData = Object.fromEntries(await request.formData());
    const allowlist: string[] = [];
    Object.keys(formData).forEach((key) => {
      if (key.includes('allowlist.')) {
        const url = formData[key];
        if (url) {
          allowlist.push(url);
        }
        delete formData[key];
      }
    });
    formData.allowlist = allowlist;
    formData.allowlistActive = formData.allowlistActive === 'on' ? true : false;

    try {
      const userId = user.userInfo.username;
      const result = await validateEasyTrigger(formData, userId);
      console.log('result===========: ', result);

      result.userId = userId;
      if (!result.id || result.id === 'new' || result.id === '') {
        result.id = randomUUID();
        await addEasyTrigger(result);
      } else {
        console.log('patching easy trigger');
        await patchEasyTrigger(result.id, user.userInfo.username, result, true);
        console.log('patching easy trigger done');
      }

      return {
        success: true,
        formData: result
      };
    } catch (err: ZodError | any) {
      console.error('err in save trigger: ', JSON.stringify(err, null, 2));
      // not ZodError
      if (!err.errors) {
        throw err;
      }

      const errors = {};
      err.errors.forEach((zodErr) => {
        errors[zodErr.path.join('.')] = zodErr.message;
      });
      console.log('errors: ', errors);
      console.log('error formData: ', formData);
      return {
        formData,
        errors
      };
    }
  }
} satisfies Actions;
