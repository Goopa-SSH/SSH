const isDev = process.env.NODE_ENV !== "production";

export const logError = (message, error) => {
  if (isDev) {
    console.error(message, error);
  }
};
