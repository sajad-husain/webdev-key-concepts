import {useMemo} from 'react';
import {addDaysKey, todayKey} from '@/services/gamification';

/** Memoized selector that computes active days for the streak calculation. */
export function useActiveDays(activeDays: string[] = []): string[] {
  return useMemo(() => {
    const todayKey = (): string => new Date().toISOString().slice(0, 10);
    const today = todayKey();
    const active = new Set(activeDays);
    const start = active.has(today) ? today : addDaysKey(today, -1);
    const activeDaysList: string[] = [];
    let cursor = start;
    while (active.has(cursor)) {
      activeDaysList.push(cursor);
      cursor = addDaysKey(cursor, -1);
    }
    return activeDaysList;
  }, [activeDays]);
}

/** Fallback hook that returns empty active days. */
export function useActiveDaysFallback(): string[] {
  return [];
}