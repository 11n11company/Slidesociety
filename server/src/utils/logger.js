const formatTime = () => new Date().toISOString();

export const logger = {
  info: (msg, meta) => {
    console.log(`[${formatTime()}] [INFO] ${msg}`, meta !== undefined ? meta : '');
  },
  warn: (msg, meta) => {
    console.warn(`[${formatTime()}] [WARN] ${msg}`, meta !== undefined ? meta : '');
  },
  error: (msg, err) => {
    console.error(`[${formatTime()}] [ERROR] ${msg}`, err !== undefined ? err : '');
  },
  debug: (msg, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${formatTime()}] [DEBUG] ${msg}`, meta !== undefined ? meta : '');
    }
  }
};

