import { describe, expect, it } from '@jest/globals';

import { filterLogsByRange, todayKey, addDaysKey, type StatsRange, type ReviewLog } from '@/services/gamification';

function makeLog(id: string, dateKey: string, grade: 0 | 1 | 2 | 3 = 2): ReviewLog {
  return {
    id,
    cardId: 'card-1',
    deckId: 'deck-1',
    grade,
    reviewedAt: `${dateKey}T12:00:00.000Z`,
    xpEarned: 5,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 1,
  };
}

describe('filterLogsByRange', () => {
  const today = todayKey();
  const yesterday = addDaysKey(today, -1);
  const sevenDaysAgo = addDaysKey(today, -6);
  const eightDaysAgo = addDaysKey(today, -7);
  const twentyNineDaysAgo = addDaysKey(today, -28);
  const thirtyDaysAgo = addDaysKey(today, -29);
  const eightyNineDaysAgo = addDaysKey(today, -88);
  const ninetyDaysAgo = addDaysKey(today, -89);
  const ninetyOneDaysAgo = addDaysKey(today, -90);

  const logs: ReviewLog[] = [
    makeLog('log-today', today),
    makeLog('log-yesterday', yesterday),
    makeLog('log-7d', sevenDaysAgo),
    makeLog('log-8d', eightDaysAgo),
    makeLog('log-30d', twentyNineDaysAgo),
    makeLog('log-31d', thirtyDaysAgo),
    makeLog('log-90d', eightyNineDaysAgo),
    makeLog('log-91d', ninetyDaysAgo),
    makeLog('log-92d', ninetyOneDaysAgo),
  ];

  it('returns all logs for "all" range', () => {
    const result = filterLogsByRange(logs, 'all', today);
    expect(result).toHaveLength(logs.length);
  });

  it('7d range includes today and previous 6 days (7 total)', () => {
    const result = filterLogsByRange(logs, '7d', today);
    expect(result).toHaveLength(3); // today, yesterday, 7d ago
    expect(result.map((l) => l.id)).toEqual(['log-today', 'log-yesterday', 'log-7d']);
  });

  it('30d range includes today and previous 29 days (30 total)', () => {
    const result = filterLogsByRange(logs, '30d', today);
    // 30d range: today + 29 days back = 30 days total (inclusive)
    // Includes: today, yesterday, 7d, 8d, 30d (29 days back), 31d (30 days back - at cutoff)
    expect(result).toHaveLength(6);
    expect(result.map((l) => l.id)).toEqual(['log-today', 'log-yesterday', 'log-7d', 'log-8d', 'log-30d', 'log-31d']);
  });

  it('90d range includes today and previous 89 days (90 total)', () => {
    const result = filterLogsByRange(logs, '90d', today);
    // 90d range: today + 89 days back = 90 days total (inclusive)
    // cutoff = addDaysKey(today, -89)
    // Includes: today, yesterday, 7d, 8d, 30d, 31d, 90d (88 days back), 91d (89 days back - at cutoff)
    // Excludes: log-92d (90 days back, outside range)
    expect(result).toHaveLength(8);
    expect(result.map((l) => l.id)).toEqual([
      'log-today',
      'log-yesterday',
      'log-7d',
      'log-8d',
      'log-30d',
      'log-31d',
      'log-90d',
      'log-91d',
    ]);
  });

  it('returns empty array for empty input', () => {
    const result = filterLogsByRange([], '7d', today);
    expect(result).toHaveLength(0);
  });

  it('excludes logs exactly on the boundary for 7d (8 days ago is excluded)', () => {
    const result = filterLogsByRange(logs, '7d', today);
    expect(result.find((l) => l.id === 'log-8d')).toBeUndefined();
  });

  it('excludes logs just outside the 7d range (7 days ago is excluded)', () => {
    const result = filterLogsByRange(logs, '7d', today);
    // log-8d is at 7 days back, outside the 7-day range (today + 6 days back)
    expect(result.find((l) => l.id === 'log-8d')).toBeUndefined();
  });

  it('excludes logs just outside the 30d range (30 days ago is excluded)', () => {
    // Need a log at 30 days back (beyond the 29-day cutoff)
    const thirtyDaysBack = addDaysKey(today, -30);
    const logsWithExtra = [...logs, makeLog('log-32d', thirtyDaysBack)];
    const result = filterLogsByRange(logsWithExtra, '30d', today);
    expect(result.find((l) => l.id === 'log-32d')).toBeUndefined();
  });

  it('excludes logs just outside the 90d range (90 days ago is excluded)', () => {
    const ninetyDaysBack = addDaysKey(today, -90);
    const logsWithExtra = [...logs, makeLog('log-93d', ninetyDaysBack)];
    const result = filterLogsByRange(logsWithExtra, '90d', today);
    expect(result.find((l) => l.id === 'log-93d')).toBeUndefined();
  });

  it('includes logs exactly at the 7d cutoff (6 days ago)', () => {
    const result = filterLogsByRange(logs, '7d', today);
    // 7d includes today + 6 days back = 7 days total
    // log-7d is at 6 days back (cutoff), so it's included
    expect(result.find((l) => l.id === 'log-7d')).toBeDefined();
  });

  it('includes logs exactly at the 30d cutoff (29 days ago)', () => {
    const result = filterLogsByRange(logs, '30d', today);
    // 30d includes today + 29 days back = 30 days total
    // log-31d is at 29 days back (cutoff), so it's included
    expect(result.find((l) => l.id === 'log-31d')).toBeDefined();
  });

  it('includes logs exactly at the 90d cutoff (89 days ago)', () => {
    const result = filterLogsByRange(logs, '90d', today);
    // 90d includes today + 89 days back = 90 days total
    // log-91d is at 89 days back (cutoff), so it's included
    expect(result.find((l) => l.id === 'log-91d')).toBeDefined();
  });

  it('does not mutate original logs array', () => {
    const originalLength = logs.length;
    filterLogsByRange(logs, '7d', today);
    expect(logs).toHaveLength(originalLength);
  });

  it('works with custom today parameter', () => {
    const customToday = '2026-02-15';
    const customLogs = [
      makeLog('log-1', '2026-02-10'),
      makeLog('log-2', '2026-02-14'),
      makeLog('log-3', '2026-02-15'),
    ];
    const result = filterLogsByRange(customLogs, '7d', customToday);
    expect(result).toHaveLength(3);
  });
});