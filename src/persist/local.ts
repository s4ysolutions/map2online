export const persistedLocal = <T>(key: string, defaultValue: T, forcedValue?: string): T => {
  if (forcedValue) {
    return JSON.parse(forcedValue);
  }
  const serialized = localStorage.getItem(key);
  return serialized ? JSON.parse(serialized) : defaultValue;
};

export const persistLocal = <T>(key: string, value: T): void => {
  if (value === undefined) {
    localStorage.removeItem(key);
  } else {
    const valueToStore = value instanceof Function ? value(persistedLocal(key, value)) : value;
    localStorage.setItem(
      key,
      JSON.stringify(valueToStore)
    );
  }
};

