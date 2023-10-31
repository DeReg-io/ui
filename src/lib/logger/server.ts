import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import ecsFormat from '@elastic/ecs-winston-format';
// import { mergeLogArgs } from '$lib/util/merge-log-args';
// import { env } from '$env/dynamic/private';
// const { ELASTIC_URL, ELASTIC_USERNAME, ELASTIC_PASSWORD } = env;

const esTransport = new ElasticsearchTransport({
  level: 'info',
  index: 'logs-sveltekit',
  clientOpts: {
    // have to use process.env, because this file is dynamically imported
    // and the the if (browser) check is not enough for the compiler
    node: process.env.ELASTIC_URL || 'http://localhost:9200',
    auth: {
      username: process.env.ELASTIC_USERNAME || 'elastic',
      password: process.env.ELASTIC_PASSWORD || ''
    }
  }
});

const logger = winston.createLogger({
  format: ecsFormat(),
  transports: [
    esTransport,
    new winston.transports.Console({
      format: winston.format.prettyPrint()
    })
  ]
});

esTransport.on('error', (error) => {
  console.debug('Error in esTransport', error);
});

esTransport.on('warning', (warning) => {
  console.debug('Elasticsearch Warning:', warning);
});

// const originalConsoleLog = console.log;
// console.log = function (...args) {
//   console.debug('sending stuff to elastic=================: ', args);
//   // @ts-ignore
//   logger.info(...mergeLogArgs(...args));
//   originalConsoleLog.apply(console, args);
// };

// const originalConsoleWarn = console.warn;
// console.warn = function (...args) {
//   // @ts-ignore
//   logger.warn(...mergeLogArgs(...args));
//   originalConsoleWarn.apply(console, args);
// };

// const originalConsoleError = console.error;
// console.error = function (...args) {
//   // @ts-ignore
//   logger.error(...mergeLogArgs(...args));
//   originalConsoleError.apply(console, args);
// };

// logger.on('error', (error) => {
//   console.error('Error in logger caught', error);
// });

export { logger };
