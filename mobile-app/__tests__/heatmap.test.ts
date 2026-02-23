import { describe, expect, it } from '@jest/globals';

import {
  generateReviewHeatmap,
  getWeekIndex,
  getDayOfWeek,
  todayKey,
  addDaysKey,
  comparePeriods,
  type ReviewLog,
  type StatsRange,
} from '@/services/gamification';

function makeLog(id: string, dateKey: string): ReviewLog {
  return {
    id,
    cardId: 'card-1',
    deckId: 'deck-1',
    grade: 2,
    reviewedAt: `${dateKey}T12:00:00.000Z`,
    xpEarned: 5,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 1,
  };
}

describe('generateReviewHeatmap', () => {
  const today = todayKey();
  const yesterday = addDaysKey(today, -1);
  const weekAgo = addDaysKey(today, -7);
  const monthAgo = addDaysKey(today, -30);

  it('returns empty cells for empty logs', () => {
    const result = generateReviewHeatmap([], 1, today);
    expect(result.cells).toHaveLength(31); // ~1 month
    expect(result.totalReviews).toBe(0);
    expect(result.maxCount).toBe(0);
    expect(result.cells.every((c) => c.level === 0)).toBe(true);
  });

  it('counts reviews per date correctly', () => {
    const logs = [
      makeLog('log-1', today),
      makeLog('log-2', today),
      makeLog('log-3', yesterday),
    ];
    const result = generateReviewHeatmap(logs, 1, today);
    const todayCell = result.cells.find((c) => c.date === today);
    const yesterdayCell = result.cells.find((c) => c.date === yesterday);
    expect(todayCell?.count).toBe(2);
    expect(yesterdayCell?.count).toBe(1);
  });

  it('sets level based on count relative to max', () => {
    const logs = [
      makeLog('log-1', today),
      makeLog('log-2', today),
      makeLog('log-3', today),
      makeLog('log-4', today), // 4 reviews today
      makeLog('log-5', yesterday), // 1 review yesterday
    ];
    const result = generateReviewHeatmap(logs, 1, today);
    const todayCell = result.cells.find((c) => c.date === today);
    const yesterdayCell = result.cells.find((c) => c.date === yesterday);
    expect(todayCell?.level).toBe(4); // max
    expect(yesterdayCell?.level).toBeGreaterThanOrEqual(1);
  });

  it('respects monthsBack parameter', () => {
    const logs = [makeLog('log-1', addDaysKey(today, -400))]; // ~13 months ago
    const result = generateReviewHeatmap(logs, 12, today);
    const logCell = result.cells.find((c) => c.date === addDaysKey(today, -400));
    expect(logCell).toBeUndefined(); // Outside 12 months
  });

  it('includes logs within the range', () => {
    const logs = [makeLog('log-1', addDaysKey(today, -300))]; // ~10 months ago
    const result = generateReviewHeatmap(logs, 12, today);
    const logCell = result.cells.find((c) => c.date === addDaysKey(today, -300));
    expect(logCell).toBeDefined();
    expect(logCell?.count).toBe(1);
  });

  it('returns correct start and end dates', () => {
    const result = generateReviewHeatmap([], 6, today);
    expect(result.startDate).toBe(addDaysKey(today, -180));
    expect(result.endDate).toBe(today);
  });

  it('calculates totalReviews correctly', () => {
    const logs = [
      makeLog('log-1', today),
      makeLog('log-2', today),
      makeLog('log-3', yesterday),
    ];
    const result = generateReviewHeatmap(logs, 1, today);
    expect(result.totalReviews).toBe(3);
  });

  it('handles custom today parameter', () => {
    const customToday = '2026-06-15';
    const logs = [makeLog('log-1', '2026-06-10')];
    const result = generateReviewHeatmap(logs, 1, customToday);
    const logCell = result.cells.find((c) => c.date === '2026-06-10');
    expect(logCell?.count).toBe(1);
  });
});

describe('getWeekIndex', () => {
  it('returns 0 for start date', () => {
    expect(getWeekIndex('2026-01-01', '2026-01-01')).toBe(0);
  });

  it('returns correct week index for dates within first week', () => {
    expect(getWeekIndex('2026-01-03', '2026-01-01')).toBe(0);
    expect(getWeekIndex('2026-01-07', '2026-01-01')).toBe(0);
  });

  it('returns 1 for second week', () => {
    expect(getWeekIndex('2026-01-08', '2026-01-01')).toBe(1);
    expect(getWeekIndex('2026-01-14', '2026-01-01')).toBe(1);
  });

  it('handles month boundaries', () => {
    expect(getWeekIndex('2026-02-01', '2026-01-01')).toBe(4);
  });
});

describe('getDayOfWeek', () => {
  it('returns correct day of week (0=Sunday)', () => {
    // 2026-01-01 is a Thursday
    expect(getDayOfWeek('2026-01-01')).toBe(4); // Thursday
    expect(getDayOfWeek('2026-01-03')).toBe(6); // Saturday
    expect(getDayOfWeek('2026-01-04')).toBe(0); // Sunday
    expect(getDayOfWeek('2026-01-05')).toBe(1); // Monday
  });
});

describe('comparePeriods', () => {
  const today = todayKey();
  const yesterday = addDaysKey(today, -1);
  const weekAgo = addDaysKey(today, -7);
  const twoWeeksAgo = addDaysKey(today, -14);
  const thirtyDaysAgo = addDaysKey(today, -30);
  const sixtyDaysAgo = addDaysKey(today, -60);

  function makeLogWithGrade(id: string, dateKey: string, grade: 0 | 1 | 2 | 3 = 2): ReviewLog {
    return {
      id,
      cardId: 'card-1',
      deckId: 'deck-1',
      grade,
      reviewedAt: `${dateKey}T12:00:00.000Z`,
      xpEarned: grade === 0 ? 3 : grade === 1 ? 4 : grade === 2 ? 5 : 7,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 1,
    };
  }

  it('returns zero deltas for empty logs', () => {
    const result = comparePeriods([], '7d', today);
    expect(result.current.totalReviews).toBe(0);
    expect(result.previous.totalReviews).toBe(0);
    expect(result.delta.totalReviews).toBe(0);
    expect(result.delta.totalXp).toBe(0);
    expect(result.delta.retention).toBe(0);
  });

  it('calculates correct deltas for 7d range', () => {
    const logs = [
      // Current period (last 7 days)
      makeLogWithGrade('log-1', today, 2),
      makeLogWithGrade('log-2', yesterday, 3),
      makeLogWithGrade('log-3', addDaysKey(today, -3), 2),
      // Previous period (7-14 days ago)
      makeLogWithGrade('log-4', addDaysKey(today, -8), 2),
      makeLogWithGrade('log-5', addDaysKey(today, -10), 1),
    ];
    const result = comparePeriods(logs, '7d', today);
    expect(result.current.totalReviews).toBe(3);
    expect(result.previous.totalReviews).toBe(2);
    expect(result.delta.totalReviews).toBe(1);
    expect(result.current.totalXp).toBe(5 + 7 + 5); // 17
    expect(result.previous.totalXp).toBe(5 + 4); // 9
    expect(result.delta.totalXp).toBe(8);
  });

  it('calculates retention correctly', () => {
    const logs = [
      // Current: 2 Good, 1 Easy = 3/3 = 100% retention
      makeLogWithGrade('log-1', today, 2),
      makeLogWithGrade('log-2', yesterday, 3),
      makeLogWithGrade('log-3', addDaysKey(today, -3), 2),
      // Previous: 1 Good, 1 Again = 1/2 = 50% retention
      makeLogWithGrade('log-4', addDaysKey(today, -8), 2),
      makeLogWithGrade('log-5', addDaysKey(today, -10), 0),
    ];
    const result = comparePeriods(logs, '7d', today);
    expect(result.current.retention).toBe(100);
    expect(result.previous.retention).toBe(50);
    expect(result.delta.retention).toBe(50);
  });

  it('handles 30d range with previous period', () => {
    const logs = [
      // Current period (last 30 days)
      makeLogWithGrade('log-1', today, 2),
      makeLogWithGrade('log-2', addDaysKey(today, -15), 2),
      // Previous period (30-60 days ago)
      makeLogWithGrade('log-3', addDaysKey(today, -45), 2),
    ];
    const result = comparePeriods(logs, '30d', today);
    expect(result.current.totalReviews).toBe(2);
    expect(result.previous.totalReviews).toBe(1);
    expect(result.delta.totalReviews).toBe(1);
  });

  it('handles 90d range with previous period', () => {
    const logs = [
      makeLogWithGrade('log-1', today, 2),
      makeLogWithGrade('log-2', addDaysKey(today, -45), 2),
      makeLogWithGrade('log-3', addDaysKey(today, -95), 2),
      makeLogWithGrade('log-4', addDaysKey(today, -140), 2),
    ];
    const result = comparePeriods(logs, '90d', today);
    expect(result.current.totalReviews).toBe(2);
    expect(result.previous.totalReviews).toBe(2);
    expect(result.delta.totalReviews).toBe(0);
  });

  it('returns empty previous for all range', () => {
    const logs = [
      makeLogWithGrade('log-1', today, 2),
      makeLogWithGrade('log-2', addDaysKey(today, -100), 2),
    ];
    const result = comparePeriods(logs, 'all', today);
    expect(result.current.totalReviews).toBe(2);
    expect(result.previous.totalReviews).toBe(0);
    expect(result.delta.totalReviews).toBe(2);
  });

  it('calculates grade counts for both periods', () => {
    const logs = [
      makeLogWithGrade('log-1', today, 3), // Easy
      makeLogWithGrade('log-2', yesterday, 2), // Good
      makeLogWithGrade('log-3', addDaysKey(today, -8), 2), // Good (previous)
      makeLogWithGrade('log-4', addDaysKey(today, -10), 1), // Hard (previous)
    ];
    const result = comparePeriods(logs, '7d', today);
    expect(result.current.gradeCounts).toEqual([0, 0, 1, 1]); // 1 Good, 1 Easy
    expect(result.previous.gradeCounts).toEqual([0, 1, 1, 0]); // 1 Hard, 1 Good
  });

  it('handles custom today parameter', () => {
    const customToday = '2026-06-15';
    const logs = [
      makeLogWithGrade('log-1', '2026-06-10', 2),
      makeLogWithGrade('log-2', '2026-06-05', 2),
    ];
    const result = comparePeriods(logs, '7d', customToday);
    expect(result.current.totalReviews).toBe(1); // Only 2026-06-10 is within 7 days
    expect(result.previous.totalReviews).toBe(1); // 2026-06-05 is in previous period
  });
});