import { describe, expect, it } from '@jest/globals';

import {
  addDaysKey,
  isLevelUp,
  levelForXp,
  streakFor,
  todayKey,
  weekDaysFor,
  LEVEL_TITLES,
} from '@/services/gamification';

describe('levelForXp', () => {
  it('starts at level 1 with zero progress', () => {
    const level = levelForXp(0);
    expect(level.level).toBe(1);
    expect(level.title).toBe(LEVEL_TITLES[0]);
    expect(level.progress).toBe(0);
  });

  it('enters level 2 at the 100 xp threshold', () => {
    const atThreshold = levelForXp(100);
    expect(atThreshold.level).toBe(2);
    expect(atThreshold.min).toBe(100);
    expect(atThreshold.next).toBe(300);
  });

  it('reports mid-level progress between thresholds', () => {
    // level 2 spans 100..300, so 200 is halfway
    expect(levelForXp(200).progress).toBe(0.5);
  });

  it('returns a title even past the title list', () => {
    const high = levelForXp(100_000);
    expect(high.level).toBeGreaterThan(LEVEL_TITLES.length);
    expect(high.title).toBe(LEVEL_TITLES[LEVEL_TITLES.length - 1]);
  });
});

describe('date keys', () => {
  it('formats today as YYYY-MM-DD', () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('adds and subtracts days across month boundaries', () => {
    expect(addDaysKey('2025-11-30', 1)).toBe('2025-12-01');
    expect(addDaysKey('2025-12-01', -1)).toBe('2025-11-30');
  });
});

describe('streakFor', () => {
  it('is zero when nothing has been checked', () => {
    expect(streakFor([], '2025-11-29')).toBe(0);
  });

  it('counts a run ending today', () => {
    const days = ['2025-11-27', '2025-11-28', '2025-11-29'];
    expect(streakFor(days, '2025-11-29')).toBe(3);
  });

  it('resets when the run is broken', () => {
    const days = ['2025-11-26', '2025-11-27', '2025-11-29'];
    // 11-28 is missing, so only today counts
    expect(streakFor(days, '2025-11-29')).toBe(1);
  });

  it('ignores days older than the current run', () => {
    const days = ['2025-11-01', '2025-11-28', '2025-11-29'];
    expect(streakFor(days, '2025-11-29')).toBe(2);
  });

  it('keeps an alive streak when today has not been checked yet', () => {
    // 11-29 is pending and 11-28 was checked — the streak must survive.
    const days = ['2025-11-27', '2025-11-28'];
    expect(streakFor(days, '2025-11-29')).toBe(2);
  });

  it('does not let the pending-today window mask a real miss', () => {
    // 11-28 is missing, so counting from yesterday must still reset.
    const days = ['2025-11-27', '2025-11-29'];
    expect(streakFor(days, '2025-11-29')).toBe(1);
  });
});

describe('isLevelUp', () => {
  it('returns true when crossing a level boundary', () => {
    expect(isLevelUp(99, 100)).toBe(true); // level 1 -> 2
    expect(isLevelUp(299, 300)).toBe(true); // level 2 -> 3
    expect(isLevelUp(599, 600)).toBe(true); // level 3 -> 4
  });

  it('returns false when staying within the same level', () => {
    expect(isLevelUp(0, 50)).toBe(false);
    expect(isLevelUp(100, 150)).toBe(false);
    expect(isLevelUp(250, 299)).toBe(false);
  });

  it('returns false when XP decreases or stays same', () => {
    expect(isLevelUp(100, 99)).toBe(false);
    expect(isLevelUp(150, 150)).toBe(false);
  });
});

describe('weekDaysFor', () => {
  it('returns 7 days including today, newest first', () => {
    const days = weekDaysFor('2026-01-15');
    expect(days).toHaveLength(7);
    expect(days[0]).toBe('2026-01-15');
    expect(days[6]).toBe('2026-01-09');
  });

  it('handles month boundaries correctly', () => {
    const days = weekDaysFor('2026-03-01');
    expect(days[0]).toBe('2026-03-01');
    expect(days[6]).toBe('2026-02-23');
  });
});