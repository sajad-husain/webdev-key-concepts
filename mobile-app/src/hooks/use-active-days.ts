import {useMemo} from 'react';
import {useGameState} from '@/services/store';
import {todayKey, addDaysKey} from '@/services/gamification';

/** Memoized selector that computes active days for the streak calculation. */
export function useActiveDays(): string[] {
  const {activeDays} = useGameState();
  return useMemo(() => {
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