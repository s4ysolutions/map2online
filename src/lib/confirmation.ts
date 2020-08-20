import Timeout = NodeJS.Timeout;

let skipConfirmTimer: Timeout | null = null;

export const startSkipConfirmTimer = () => {
  if (skipConfirmTimer) {
    clearTimeout(skipConfirmTimer)
  }
  skipConfirmTimer = setTimeout(() => {
    skipConfirmTimer = null;
  }, 10000)
}
export const skipConfirmDialog = () => !!skipConfirmTimer;
