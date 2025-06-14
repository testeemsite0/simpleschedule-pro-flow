
const isDevelopment = import.meta.env.DEV;
const isDebugEnabled = import.meta.env.VITE_DEBUG === 'true';

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  booking: (message: string, ...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.log(`[BOOKING] ${message}`, ...args);
    }
  }
};
