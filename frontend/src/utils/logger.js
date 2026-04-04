/* eslint-disable no-console */
const noop = () => {};

const devLogger = (message, error) => console.error(message, error);

export const logError =
  process.env.NODE_ENV !== "production" ? devLogger : noop;
