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
};

export type Win = {
  id: string;
  note: string;
  points: number;
};

export type Settings = {
  notifications: boolean;
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
  | { type: 'settings/toggleNotifications' };

export function createInitialState(): GameState {
  return {
    profile: { xp: 0 },
    quests: [],
    goals: [],
    routines: [],
    wins: {},
    settings: { notifications: true },
  };
}

function addXp(state: GameState, delta: number): GameState {
  return {
    ...state,
    profile: { xp: Math.max(0, state.profile.xp + delta) },
  };
}

function toggleRoutineHistory(history: string[], date: string): { history: string[]; gained: boolean } {
  if (history.includes(date)) {
    return { history: history.filter((d) => d !== date), gained: false };
  }
  return { history: [...history, date], gained: true };
}

export function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

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
      let next: GameState = state;
      const quest = state.quests.find((q) => q.id === action.id);
      if (!quest) {
        return state;
      }
      if (quest.done) {
        next = addXp(state, -quest.xp);
      } else {
        next = addXp(state, quest.xp);
      }
      return {
        ...next,
        quests: state.quests.map((q) =>
          q.id === action.id
            ? { ...q, done: !q.done, doneAt: q.done ? undefined : todayKey() }
            : q,
        ),
      };
    }

    case 'quests/remove': {
      const quest = state.quests.find((q) => q.id === action.id);
      const withXp = quest?.done ? addXp(state, -quest.xp) : state;
      return { ...withXp, quests: state.quests.filter((q) => q.id !== action.id) };
    }

    case 'goals/add': {
      const goal: Goal = { id: uid('goal'), title: action.title, milestones: [] };
      return { ...state, goals: [...state.goals, goal] };
    }

    case 'goals/remove': {
      const goal = state.goals.find((g) => g.id === action.id);
      if (!goal) {
        return state;
      }
      const doneXp = goal.milestones.filter((m) => m.done).length * XP.milestone;
      const withXp = addXp(state, -doneXp);
      return { ...withXp, goals: state.goals.filter((g) => g.id !== action.id) };
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
            xpDelta += nowDone ? XP.milestone : -XP.milestone;
            return {
              ...milestone,
              done: nowDone,
              doneAt: nowDone ? todayKey() : undefined,
            };
          }),
        };
      });
      return xpDelta === 0 ? state : addXp({ ...state, goals }, xpDelta);
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
      const { history, gained } = toggleRoutineHistory(routine.history, action.date);
      const withXp = gained ? addXp(state, XP.routineCheck) : state;
      return {
        ...withXp,
        routines: state.routines.map((r) =>
          r.id === action.id ? { ...r, history } : r,
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
      const win = day.find((w) => w.id === action.id);
      const withXp = win ? addXp(state, -win.points) : state;
      const remaining = day.filter((w) => w.id !== action.id);
      const wins = { ...state.wins };
      if (remaining.length === 0) {
        delete wins[action.date];
      } else {
        wins[action.date] = remaining;
      }
      return { ...withXp, wins };
    }

    case 'settings/toggleNotifications':
      return {
        ...state,
        settings: { ...state.settings, notifications: !state.settings.notifications },
      };

    default:
      return state;
  }
}

/** All days the player was active (checked any routine or logged a win). */
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
  return [...days];
}

export function getStreak(state: GameState): number {
  return streakFor(getActiveDays(state), todayKey());
}