const STORAGE_PREFIX = 'loahub';

export const readStorage = (key, fallbackValue) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}:${key}`);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch {
    return fallbackValue;
  }
};

export const writeStorage = (key, value) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}:${key}`, JSON.stringify(value));
  } catch {
    return false;
  }
  return true;
};

