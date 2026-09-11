import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getItem, removeItem, setItem } from '@/services/storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns the fallback when nothing is stored', async () => {
    await expect(getItem('score', 0)).resolves.toBe(0);
  });

  it('persists a value and reads it back', async () => {
    await setItem('score', 7);
    await expect(getItem('score', 0)).resolves.toBe(7);
  });

  it('persists arrays and objects', async () => {
    const items = ['win', 'lose', 'tie'];
    await setItem('items', items);
    await expect(getItem('items', [])).resolves.toEqual(items);
  });

  it('removes a stored key', async () => {
    await setItem('items', ['a']);
    await removeItem('items');
    await expect(getItem('items', [])).resolves.toEqual([]);
  });
});