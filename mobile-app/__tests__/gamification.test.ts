import { describe, expect, it } from '@jest/globals';

import {
  addDaysKey,
  calculateReviewXp,
  isLevelUp,
  levelForXp,
  sm2NextReview,
  streakFor,
  todayKey,
  weekDaysFor,
  LEVEL_TITLES,
  SM2_MIN_EASE,
  SM2_INITIAL_EASE,
  REVIEW_BASE_XP,
  REVIEW_GRADE_BONUS,
  STREAK_BONUS_CAP,
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

describe('sm2NextReview', () => {
  const today = '2026-01-22';
  const freshCard = { easeFactor: SM2_INITIAL_EASE, interval: 0, repetitions: 0 };

  it('Grade Again resets card to 1-day interval', () => {
    const result = sm2NextReview(0, { easeFactor: 2.5, interval: 10, repetitions: 5 }, today);
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.nextReview).toBe('2026-01-23');
  });

  it('Grade Good on new card sets 1-day interval', () => {
    const result = sm2NextReview(2, freshCard, today);
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
    expect(result.nextReview).toBe('2026-01-23');
  });

  it('Grade Good on second review sets 6-day interval', () => {
    const card = { easeFactor: 2.5, interval: 1, repetitions: 1 };
    const result = sm2NextReview(2, card, today);
    expect(result.repetitions).toBe(2);
    expect(result.interval).toBe(6);
    expect(result.nextReview).toBe('2026-01-28');
  });

  it('Grade Good on third+ review multiplies interval by ease', () => {
    const card = { easeFactor: 2.5, interval: 6, repetitions: 2 };
    const result = sm2NextReview(2, card, today);
    expect(result.interval).toBe(Math.round(6 * 2.5)); // 15
    expect(result.nextReview).toBe('2026-02-06');
  });

  it('Grade Hard uses ease factor but no repetition bump', () => {
    const card = { easeFactor: 2.5, interval: 6, repetitions: 2 };
    const result = sm2NextReview(1, card, today);
    expect(result.repetitions).toBe(3);
    expect(result.easeFactor).toBeGreaterThanOrEqual(SM2_MIN_EASE);
  });

  it('Grade Easy increases ease factor more', () => {
    const card = { easeFactor: 2.5, interval: 6, repetitions: 2 };
    const resultEasy = sm2NextReview(3, card, today);
    const resultGood = sm2NextReview(2, card, today);
    expect(resultEasy.easeFactor).toBeGreaterThan(resultGood.easeFactor);
  });

  it('ease factor never drops below SM2_MIN_EASE', () => {
    let card = { easeFactor: SM2_MIN_EASE, interval: 1, repetitions: 0 };
    for (let i = 0; i < 10; i++) {
      card = sm2NextReview(0, card, today);
    }
    expect(card.easeFactor).toBeGreaterThanOrEqual(SM2_MIN_EASE);
  });
});

describe('calculateReviewXp', () => {
  it('returns base XP for Again (grade 0)', () => {
    expect(calculateReviewXp(0, 0)).toBe(REVIEW_BASE_XP + REVIEW_GRADE_BONUS[0]);
  });

  it('adds streak bonus up to cap', () => {
    const xpNoStreak = calculateReviewXp(2, 0);
    const xpStreak5 = calculateReviewXp(2, 5);
    const xpStreak10 = calculateReviewXp(2, 10);
    expect(xpStreak5 - xpNoStreak).toBe(STREAK_BONUS_CAP);
    expect(xpStreak10 - xpNoStreak).toBe(STREAK_BONUS_CAP); // capped
  });

  it('Easy grade earns most XP', () => {
    expect(calculateReviewXp(3, 0)).toBeGreaterThan(calculateReviewXp(2, 0));
    expect(calculateReviewXp(2, 0)).toBeGreaterThan(calculateReviewXp(1, 0));
    expect(calculateReviewXp(1, 0)).toBeGreaterThan(calculateReviewXp(0, 0));
  });
});