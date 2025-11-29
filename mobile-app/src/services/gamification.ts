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
 * Counts consecutive "active" days ending today. An entry for today is
 * required; a gap on the most recent day resets the streak.
 *
 * NOTE: known gap — a streak that is still alive but has no entry for today
 * yet (today is pending) is reported as zero.
 */
export function streakFor(activeDays: string[], today: string): number {
  const active = new Set(activeDays);
  let streak = 0;
  let cursor = today;

  while (active.has(cursor)) {
    streak += 1;
    cursor = addDaysKey(cursor, -1);
  }

  return streak;
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}