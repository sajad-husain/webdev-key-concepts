import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = '@life-game';

export async function getItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(`${KEY_PREFIX}:${key}`);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(`${KEY_PREFIX}:${key}`, JSON.stringify(value));
  } catch {
    // Best effort — a failed write should never crash the UI.
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${KEY_PREFIX}:${key}`);
  } catch {
    // Best effort.
  }
}

export async function clearAll(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const prefixedKeys = keys.filter((k) => k.startsWith(KEY_PREFIX));
    await AsyncStorage.multiRemove(prefixedKeys);
  } catch {
    // Best effort.
  }
}