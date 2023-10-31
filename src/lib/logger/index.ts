import { browser } from '$app/environment';
import type winston from 'winston';

type FrontendLogger = {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
};

let logger: winston.Logger | FrontendLogger;

if (browser) {
  const frontendAppName = 'frontendSvelteKit';

  logger = {
    info: (...args: any[]) => {
      args.push({ service: { name: frontendAppName } });
      console.log(...args);
      fetch('/api/log', {
        method: 'POST',
        body: JSON.stringify({
          level: 'info',
          args
        })
      }).catch((err) => {
        console.error('Error in info frontend logger', err);
      });
    },

    warn: (...args: any[]) => {
      args.push({ service: { name: frontendAppName } });
      console.warn(...args);
      fetch('/api/log', {
        method: 'POST',
        body: JSON.stringify({
          level: 'warn',
          args
        })
      }).catch((err) => {
        console.error('Error in warn frontend logger', err);
      });
    },

    error: (...args: any[]) => {
      args.push({ service: { name: frontendAppName } });
      console.error(...args);
      fetch('/api/log', {
        method: 'POST',
        body: JSON.stringify({
          level: 'error',
          args
        })
      }).catch((err) => {
        console.error('Error in error frontend logger', err);
      });
    }
  };

  window.addEventListener('unhandledrejection', function (event) {
    logger.error('Unhandled promise rejection', event);
  });
} else {
  const serverLogger = await import('./server');
  logger = serverLogger.logger;
}

export { logger };
