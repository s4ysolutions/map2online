import Timeout = NodeJS.Timeout;

let skipConfirmTimer: Timeout | null = null;

const CONFIRMATION_TIMEOUT_MS = 100000;

export const startSkipConfirmTimer = (): void => {
  if (skipConfirmTimer) {
    clearTimeout(skipConfirmTimer);
  }
  skipConfirmTimer = setTimeout(() => {
    skipConfirmTimer = null;
  }, CONFIRMATION_TIMEOUT_MS);
};
export const skipConfirmDialog = (): boolean => Boolean(skipConfirmTimer);
