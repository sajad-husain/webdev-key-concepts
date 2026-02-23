export const XP = {
  routineCheck: 5,
  milestone: 10,
  questDefault: 20,
} as const;

export const LEVEL_TITLES = [
  'Rookie',
  'Apprentice',
  'Scout',
  'Fighter',
  'Grinder',
  'Hero',
  'Champion',
  'Legend',
  'Mythic',
  'Godlike',
] as const;

export type Level = {
  level: number;
  title: string;
  min: number;
  next: number;
  /** 0..1 progress toward the next level */
  progress: number;
};

/** XP needed to *enter* a level (1-based). Triangle numbers scaled by 100. */
function xpForLevel(level: number): number {
  return 100 * ((level * (level - 1)) / 2);
}

export function levelForXp(xp: number): Level {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) {
    level += 1;
  }
  const min = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const title =
    LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  const progress = level === 1 && xp === 0 ? 0 : (xp - min) / (next - min);

  return { level, title, min, next, progress };
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDaysKey(key: string, delta: number): string {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day + delta);
  return toDateKey(date);
}

/**
 * Counts consecutive "active" days ending at (or just before) today. If today
 * hasn't been played yet the streak still counts from yesterday — missing a
 * full day is what actually breaks it.
 */
export function streakFor(activeDays: string[], today: string): number {
  const active = new Set(activeDays);
  const start = active.has(today) ? today : addDaysKey(today, -1);
  let streak = 0;
  let cursor = start;

  while (active.has(cursor)) {
    streak += 1;
    cursor = addDaysKey(cursor, -1);
  }

  return streak;
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Returns true if the new XP crosses a level threshold that the old XP did not. */
export function isLevelUp(oldXp: number, newXp: number): boolean {
  return levelForXp(newXp).level > levelForXp(oldXp).level;
}

/** Returns the last 7 days (today + 6 previous) as date keys, newest first. */
export function weekDaysFor(today: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysKey(today, -i));
}

// SM-2 Spaced Repetition Algorithm

export const SM2_MIN_EASE = 1.3;
export const SM2_INITIAL_EASE = 2.5;
export const REVIEW_BASE_XP = 3;
export const REVIEW_GRADE_BONUS = { 0: 0, 1: 1, 2: 2, 3: 4 } as const;
export const STREAK_BONUS_CAP = 5;

type Sm2Input = {
  easeFactor: number;
  interval: number;
  repetitions: number;
};

type Sm2Output = Sm2Input & { nextReview: string };

export type ReviewGrade = 0 | 1 | 2 | 3;

/** Apply SM-2 algorithm to calculate next review schedule. */
export function sm2NextReview(
  grade: ReviewGrade,
  card: Sm2Input,
  today: string,
): Sm2Output {
  let { easeFactor, interval, repetitions } = card;

  if (grade === 0) {
    // Again: reset repetitions, interval to 1 day
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  easeFactor = Math.max(
    SM2_MIN_EASE,
    easeFactor + (0.1 - (3 - grade) * (0.08 + (3 - grade) * 0.02)),
  );

  const nextReview = addDaysKey(today, interval);

  return { easeFactor, interval, repetitions, nextReview };
}

/** Calculate XP earned for a review based on grade and streak. */
export function calculateReviewXp(grade: ReviewGrade, streak: number): number {
  return REVIEW_BASE_XP + REVIEW_GRADE_BONUS[grade] + Math.min(streak, STREAK_BONUS_CAP);
}

export type StatsRange = '7d' | '30d' | '90d' | 'all';

export type ReviewLog = {
  id: string;
  cardId: string;
  deckId: string;
  grade: 0 | 1 | 2 | 3;
  reviewedAt: string;
  xpEarned: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
};

/** Filter review logs by a time range. */
export function filterLogsByRange(logs: ReviewLog[], range: StatsRange, today: string = todayKey()): ReviewLog[] {
  if (range === 'all') {
    return logs;
  }

  const daysBack = range === '7d' ? 6 : range === '30d' ? 29 : 89;
  const cutoffKey = addDaysKey(today, -daysBack);

  return logs.filter((log) => {
    const logDate = log.reviewedAt.slice(0, 10);
    return logDate >= cutoffKey;
  });
}

export type HeatmapCell = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type HeatmapData = {
  cells: HeatmapCell[];
  startDate: string;
  endDate: string;
  totalReviews: number;
  maxCount: number;
};

/** Generate heatmap data for review activity (GitHub-style contribution calendar). */
export function generateReviewHeatmap(
  logs: ReviewLog[],
  monthsBack: number = 12,
  today: string = todayKey()
): HeatmapData {
  const endDate = today;
  const startDate = addDaysKey(today, -monthsBack * 30);

  const countsByDate = new Map<string, number>();
  for (const log of logs) {
    const dateKey = log.reviewedAt.slice(0, 10);
    if (dateKey >= startDate && dateKey <= endDate) {
      countsByDate.set(dateKey, (countsByDate.get(dateKey) || 0) + 1);
    }
  }

  let maxCount = 0;
  for (const count of countsByDate.values()) {
    if (count > maxCount) maxCount = count;
  }

  const cells: HeatmapCell[] = [];
  let current = startDate;
  while (current <= endDate) {
    const count = countsByDate.get(current) || 0;
    let level: HeatmapCell['level'] = 0;
    if (count > 0) {
      if (maxCount <= 3) {
        level = Math.min(count, 4) as HeatmapCell['level'];
      } else {
        const ratio = count / maxCount;
        if (ratio > 0.75) level = 4;
        else if (ratio > 0.5) level = 3;
        else if (ratio > 0.25) level = 2;
        else level = 1;
      }
    }
    cells.push({ date: current, count, level });
    current = addDaysKey(current, 1);
  }

  const totalReviews = Array.from(countsByDate.values()).reduce((a, b) => a + b, 0);

  return { cells, startDate, endDate, totalReviews, maxCount };
}

/** Get the week index (0-based) for a date key relative to start date. */
export function getWeekIndex(dateKey: string, startDate: string): number {
  const start = new Date(startDate);
  const target = new Date(dateKey);
  const diffDays = Math.floor((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

/** Get the day of week (0=Sunday, 6=Saturday) for a date key. */
export function getDayOfWeek(dateKey: string): number {
  const date = new Date(dateKey);
  return date.getDay();
}

export type PeriodComparison = {
  current: {
    totalReviews: number;
    totalXp: number;
    avgXp: number;
    retention: number;
    gradeCounts: number[];
  };
  previous: {
    totalReviews: number;
    totalXp: number;
    avgXp: number;
    retention: number;
    gradeCounts: number[];
  };
  delta: {
    totalReviews: number;
    totalXp: number;
    avgXp: number;
    retention: number;
  };
};

/** Compare current period with previous period of same length. */
export function comparePeriods(
  logs: ReviewLog[],
  range: StatsRange,
  today: string = todayKey()
): PeriodComparison {
  const currentLogs = filterLogsByRange(logs, range, today);

  const currentTotalReviews = currentLogs.length;
  const currentTotalXp = currentLogs.reduce((sum, log) => sum + log.xpEarned, 0);
  const currentAvgXp = currentTotalReviews > 0 ? Math.round(currentTotalXp / currentTotalReviews) : 0;

  const currentGradeCounts = [0, 0, 0, 0];
  for (const log of currentLogs) {
    if (log.grade >= 0 && log.grade <= 3) currentGradeCounts[log.grade]++;
  }
  const currentGoodReviews = currentGradeCounts[2] + currentGradeCounts[3];
  const currentRetention = currentTotalReviews > 0
    ? Math.round((currentGoodReviews / currentTotalReviews) * 100)
    : 0;

  let previousLogs: ReviewLog[];
  if (range === 'all') {
    previousLogs = [];
  } else {
    const daysBack = range === '7d' ? 6 : range === '30d' ? 29 : 89;
    const periodLength = daysBack + 1;
    const previousEndKey = addDaysKey(today, -(periodLength));
    const previousStartKey = addDaysKey(previousEndKey, -periodLength + 1);

    previousLogs = logs.filter((log) => {
      const logDate = log.reviewedAt.slice(0, 10);
      return logDate >= previousStartKey && logDate <= previousEndKey;
    });
  }

  const previousTotalReviews = previousLogs.length;
  const previousTotalXp = previousLogs.reduce((sum, log) => sum + log.xpEarned, 0);
  const previousAvgXp = previousTotalReviews > 0 ? Math.round(previousTotalXp / previousTotalReviews) : 0;

  const previousGradeCounts = [0, 0, 0, 0];
  for (const log of previousLogs) {
    if (log.grade >= 0 && log.grade <= 3) previousGradeCounts[log.grade]++;
  }
  const previousGoodReviews = previousGradeCounts[2] + previousGradeCounts[3];
  const previousRetention = previousTotalReviews > 0
    ? Math.round((previousGoodReviews / previousTotalReviews) * 100)
    : 0;

  return {
    current: {
      totalReviews: currentTotalReviews,
      totalXp: currentTotalXp,
      avgXp: currentAvgXp,
      retention: currentRetention,
      gradeCounts: currentGradeCounts,
    },
    previous: {
      totalReviews: previousTotalReviews,
      totalXp: previousTotalXp,
      avgXp: previousAvgXp,
      retention: previousRetention,
      gradeCounts: previousGradeCounts,
    },
    delta: {
      totalReviews: currentTotalReviews - previousTotalReviews,
      totalXp: currentTotalXp - previousTotalXp,
      avgXp: currentAvgXp - previousAvgXp,
      retention: currentRetention - previousRetention,
    },
  };
}