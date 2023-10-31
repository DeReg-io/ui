import { env } from '$env/dynamic/private';
import { logger } from '$lib/logger';

export async function POST(event) {
  console.log('event.url.origin: ', event.url.origin);
  console.log('env.BASE_URL: ', env.BASE_URL);
  if (event.url.origin !== env.BASE_URL) {
    return new Response('Unauthorized', { status: 401 });
  }
  const body = await event.request.json();

  if (body.level === 'info') {
    logger.info(...body.args);
  } else if (body.level === 'warn') {
    logger.warn(...body.args);
  } else if (body.level === 'error') {
    logger.error(...body.args);
  }

  const response = new Response('Hello DeReg!');
  const url = new URL(env.BASE_URL);
  response.headers.append('Access-Control-Allow-Origin', url.host);
  return response;
}

