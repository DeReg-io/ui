export function mergeLogArgs(...args: any[]): any[] {
  let message = '';
  let meta = {};
  args.forEach((arg) => {
    if (typeof arg === 'string') {
      message += arg;
    } else if (typeof arg === 'object') {
      meta = {
        ...meta,
        ...arg
      };
    }
  });
  const result = [];
  if (message) {
    result.push(message);
  }
  if (Object.keys(meta).length) {
    result.push(meta);
  }
  return result;
}
