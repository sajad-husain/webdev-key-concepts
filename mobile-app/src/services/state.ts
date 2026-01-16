import { streakFor, todayKey, uid, XP } from '@/services/gamification';

export type Profile = {
  xp: number;
};

export type Quest = {
  id: string;
  title: string;
  xp: number;
  done: boolean;
  doneAt?: string;
};

export type Milestone = {
  id: string;
  title: string;
  done: boolean;
  doneAt?: string;
};

export type Goal = {
  id: string;
  title: string;
  milestones: Milestone[];
};

export type Routine = {
  id: string;
  title: string;
  reminderTime: string | null;
  history: string[];
  /** Days that already earned routine-check XP, kept even if unchecked. */
  claimed?: string[];
};

export type Win = {
  id: string;
  note: string;
  points: number;
};

export type Settings = {
  notifications: boolean;
  /** Whether the "how to play" onboarding card has been dismissed/opened. */
  seenGuide: boolean;
};

export type GameState = {
  profile: Profile;
  quests: Quest[];
  goals: Goal[];
  routines: Routine[];
  wins: Record<string, Win[]>;
  settings: Settings;
};

export type GameAction =
  | { type: 'HYDRATE'; state: GameState }
  | { type: 'quests/add'; title: string; xp: number }
  | { type: 'quests/toggle'; id: string }
  | { type: 'quests/remove'; id: string }
  | { type: 'goals/add'; title: string }
  | { type: 'goals/remove'; id: string }
  | { type: 'goals/addMilestone'; goalId: string; title: string }
  | { type: 'goals/toggleMilestone'; goalId: string; milestoneId: string }
  | { type: 'routines/add'; title: string; reminderTime: string | null }
  | { type: 'routines/remove'; id: string }
  | { type: 'routines/toggleDay'; id: string; date: string }
  | { type: 'wins/add'; date: string; note: string; points: number }
  | { type: 'wins/remove'; date: string; id: string }
  | { type: 'settings/toggleNotifications' }
  | { type: 'settings/markGuideSeen' };

export function createInitialState(): GameState {
  return {
    profile: { xp: 0 },
    quests: [],
    goals: [],
    routines: [],
    wins: {},
    settings: { notifications: true, seenGuide: false },
  };
}

function addXp(state: GameState, delta: number): GameState {
  return {
    ...state,
    profile: { xp: Math.max(0, state.profile.xp + delta) },
  };
}

export function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'HYDRATE':
      // Sanitize on the way in so a corrupt or stale persisted slice can
      // never crash a screen or blow away defaults with a nil shape.
      return sanitizeState(action.state);

    case 'quests/add': {
      const quest: Quest = {
        id: uid('quest'),
        title: action.title,
        xp: action.xp,
        done: false,
      };
      return { ...state, quests: [...state.quests, quest] };
    }

    case 'quests/toggle': {
      const quest = state.quests.find((q) => q.id === action.id);
      if (!quest) {
        return state;
      }
      const becomingDone = !quest.done;
      const firstClaim = becomingDone && quest.doneAt === undefined;
      const withXp = firstClaim ? addXp(state, quest.xp) : state;
      return {
        ...withXp,
        quests: state.quests.map((q) =>
          q.id === action.id
            ? {
                ...q,
                done: becomingDone,
                doneAt: firstClaim ? todayKey() : q.doneAt,
              }
            : q,
        ),
      };
    }

    case 'quests/remove': {
      return { ...state, quests: state.quests.filter((q) => q.id !== action.id) };
    }

    case 'goals/add': {
      const goal: Goal = { id: uid('goal'), title: action.title, milestones: [] };
      return { ...state, goals: [...state.goals, goal] };
    }

    case 'goals/remove': {
      return { ...state, goals: state.goals.filter((g) => g.id !== action.id) };
    }

    case 'goals/addMilestone': {
      return {
        ...state,
        goals: state.goals.map((goal) =>
          goal.id === action.goalId
            ? {
                ...goal,
                milestones: [
                  ...goal.milestones,
                  { id: uid('milestone'), title: action.title, done: false },
                ],
              }
            : goal,
        ),
      };
    }

    case 'goals/toggleMilestone': {
      let xpDelta = 0;
      const goals = state.goals.map((goal) => {
        if (goal.id !== action.goalId) {
          return goal;
        }
        return {
          ...goal,
          milestones: goal.milestones.map((milestone) => {
            if (milestone.id !== action.milestoneId) {
              return milestone;
            }
            const nowDone = !milestone.done;
            const firstClaim = nowDone && milestone.doneAt === undefined;
            if (firstClaim) {
              xpDelta += XP.milestone;
            }
            return {
              ...milestone,
              done: nowDone,
              doneAt: firstClaim ? todayKey() : milestone.doneAt,
            };
          }),
        };
      });
      return xpDelta === 0 ? { ...state, goals } : addXp({ ...state, goals }, xpDelta);
    }

    case 'routines/add': {
      const routine: Routine = {
        id: uid('routine'),
        title: action.title,
        reminderTime: action.reminderTime,
        history: [],
      };
      return { ...state, routines: [...state.routines, routine] };
    }

    case 'routines/remove': {
      return { ...state, routines: state.routines.filter((r) => r.id !== action.id) };
    }

    case 'routines/toggleDay': {
      const routine = state.routines.find((r) => r.id === action.id);
      if (!routine) {
        return state;
      }
      const wasChecked = routine.history.includes(action.date);
      const claimed = routine.claimed ?? routine.history;

      if (wasChecked) {
        return {
          ...state,
          routines: state.routines.map((r) =>
            r.id === action.id
              ? { ...r, history: r.history.filter((d) => d !== action.date) }
              : r,
          ),
        };
      }

      const alreadyClaimed = claimed.includes(action.date);
      const withXp = alreadyClaimed ? state : addXp(state, XP.routineCheck);
      return {
        ...withXp,
        routines: state.routines.map((r) =>
          r.id === action.id
            ? {
                ...r,
                history: [...r.history, action.date],
                claimed: alreadyClaimed
                  ? r.claimed
                  : [...(r.claimed ?? r.history), action.date],
              }
            : r,
        ),
      };
    }

    case 'wins/add': {
      const win: Win = { id: uid('win'), note: action.note, points: action.points };
      const day = state.wins[action.date] ?? [];
      const withXp = addXp(state, action.points);
      return {
        ...withXp,
        wins: { ...state.wins, [action.date]: [...day, win] },
      };
    }

    case 'wins/remove': {
      const day = state.wins[action.date] ?? [];
      const remaining = day.filter((w) => w.id !== action.id);
      const wins = { ...state.wins };
      if (remaining.length === 0) {
        delete wins[action.date];
      } else {
        wins[action.date] = remaining;
      }
      return { ...state, wins };
    }

    case 'settings/toggleNotifications':
      return {
        ...state,
        settings: { ...state.settings, notifications: !state.settings.notifications },
      };

    case 'settings/markGuideSeen':
      if (state.settings.seenGuide) {
        return state;
      }
      return { ...state, settings: { ...state.settings, seenGuide: true } };

    default:
      return state;
  }
}

/** All days the player was active (checked a routine, logged a win, or finished a quest/milestone). */
export function getActiveDays(state: GameState): string[] {
  const days = new Set<string>();
  for (const routine of state.routines) {
    for (const day of routine.history) {
      days.add(day);
    }
  }
  for (const day of Object.keys(state.wins)) {
    days.add(day);
  }
  for (const quest of state.quests) {
    if (quest.doneAt) {
      days.add(quest.doneAt);
    }
  }
  for (const goal of state.goals) {
    for (const milestone of goal.milestones) {
      if (milestone.doneAt) {
        days.add(milestone.doneAt);
      }
    }
  }
  return [...days];
}

export function getStreak(state: GameState): number {
  return streakFor(getActiveDays(state), todayKey());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function toFiniteNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function toPoints(value: unknown): { id: string; note: string; points: number } | null {
  if (!isRecord(value)) {
    return null;
  }
  const id = typeof value.id === 'string' ? value.id : '';
  const note = typeof value.note === 'string' ? value.note : '';
  const points = toFiniteNumber(value.points);
  return id ? { id, note, points } : null;
}

function toRoutine(value: unknown): Routine | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.title !== 'string') {
    return null;
  }
  const history = asStringArray(value.history);
  const storedClaimed = Array.isArray(value.claimed) ? asStringArray(value.claimed) : [];
  // A legacy routine has history but no claimed list — those days already
  // earned XP, so merge them in to keep the farm fix airtight.
  const claimed = [...new Set([...history, ...storedClaimed])];
  const reminderTime =
    value.reminderTime === null || typeof value.reminderTime === 'string'
      ? (value.reminderTime as string | null)
      : null;
  return { id: value.id, title: value.title, reminderTime, history, claimed };
}

function toMilestone(value: unknown): Milestone | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.title !== 'string') {
    return null;
  }
  return {
    id: value.id,
    title: value.title,
    done: value.done === true,
    doneAt: typeof value.doneAt === 'string' ? value.doneAt : undefined,
  };
}

function toQuest(value: unknown): Quest | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.title !== 'string') {
    return null;
  }
  return {
    id: value.id,
    title: value.title,
    xp: toFiniteNumber(value.xp),
    done: value.done === true,
    doneAt: typeof value.doneAt === 'string' ? value.doneAt : undefined,
  };
}

function toGoal(value: unknown): Goal | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.title !== 'string') {
    return null;
  }
  const milestones = Array.isArray(value.milestones)
    ? value.milestones.map(toMilestone).filter((m): m is Milestone => m !== null)
    : [];
  return { id: value.id, title: value.title, milestones };
}

/**
 * Guards whatever was read from storage so a corrupt or old value can never
 * crash the app or wipe a slice back to a nil shape. Missing fields fall back
 * to the initial state defaults.
 */
export function sanitizeState(input: unknown): GameState {
  const base = createInitialState();
  if (!isRecord(input)) {
    return base;
  }
  const quests = Array.isArray(input.quests)
    ? input.quests.map(toQuest).filter((q): q is Quest => q !== null)
    : base.quests;
  const goals = Array.isArray(input.goals)
    ? input.goals.map(toGoal).filter((g): g is Goal => g !== null)
    : base.goals;
  const routines = Array.isArray(input.routines)
    ? input.routines.map(toRoutine).filter((r): r is Routine => r !== null)
    : base.routines;
  const wins = isRecord(input.wins)
    ? Object.fromEntries(
        Object.entries(input.wins).map(([key, list]) => [key, toWins(list)]),
      )
    : base.wins;
  return {
    profile: isRecord(input.profile) ? { xp: toFiniteNumber(input.profile.xp) } : base.profile,
    quests,
    goals,
    routines,
    wins,
    settings: isRecord(input.settings)
      ? {
          notifications: input.settings.notifications !== false,
          seenGuide: input.settings.seenGuide === true,
        }
      : base.settings,
  };
}

function toWins(list: unknown): Win[] {
  return Array.isArray(list) ? list.map(toPoints).filter((w): w is Win => w !== null) : [];
}

export const GAME_STATE_VERSION = 1 as const;

export type SerializedGameState = {
  version: typeof GAME_STATE_VERSION;
  exportedAt: string;
  state: GameState;
};

export function serializeState(state: GameState): SerializedGameState {
  return {
    version: GAME_STATE_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  };
}

export function deserializeState(input: unknown): GameState {
  if (!isRecord(input)) {
    return createInitialState();
  }
  const version = typeof input.version === 'number' ? input.version : 0;
  if (version !== GAME_STATE_VERSION) {
    return createInitialState();
  }
  if (!isRecord(input.state)) {
    return createInitialState();
  }
  return sanitizeState(input.state);
}