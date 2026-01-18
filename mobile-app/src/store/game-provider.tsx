import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';

import { getItem, setItem } from '@/services/storage';
import { createInitialState, reducer, type GameAction, type GameState } from '@/services/state';
import { levelForXp, isLevelUp } from '@/services/gamification';
import { impact } from '@/services/haptics';
import * as Haptics from 'expo-haptics';

type GameContextValue = {
  state: GameState;
  dispatch: (action: GameAction) => void;
  hydrated: boolean;
  levelUpBanner: {
    visible: boolean;
    level: number;
    title: string;
    xpGained: number;
    dismiss: () => void;
  };
};

const GameContext = createContext<GameContextValue | null>(null);

const PERSIST_KEYS: { key: string; pick: (state: GameState) => unknown }[] = [
  { key: 'profile', pick: (s) => s.profile },
  { key: 'quests', pick: (s) => s.quests },
  { key: 'goals', pick: (s) => s.goals },
  { key: 'routines', pick: (s) => s.routines },
  { key: 'wins', pick: (s) => s.wins },
  { key: 'settings', pick: (s) => s.settings },
];

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [hydrated, setHydrated] = useState(false);
  const [levelUpBanner, setLevelUpBanner] = useState<{
    visible: boolean;
    level: number;
    title: string;
    xpGained: number;
  }>({ visible: false, level: 1, title: '', xpGained: 0 });
  const prevXpRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [profile, quests, goals, routines, wins, settings] = await Promise.all([
        getItem('profile', createInitialState().profile),
        getItem('quests', createInitialState().quests),
        getItem('goals', createInitialState().goals),
        getItem('routines', createInitialState().routines),
        getItem('wins', createInitialState().wins),
        getItem('settings', createInitialState().settings),
      ]);
      if (cancelled) {
        return;
      }
      dispatch({ type: 'HYDRATE', state: { profile, quests, goals, routines, wins, settings } });
      setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    for (const { key, pick } of PERSIST_KEYS) {
      void setItem(key, pick(state));
    }
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated || prevXpRef.current === 0) {
      prevXpRef.current = state.profile.xp;
      return;
    }
    if (isLevelUp(prevXpRef.current, state.profile.xp)) {
      const newLevel = levelForXp(state.profile.xp);
      setLevelUpBanner({
        visible: true,
        level: newLevel.level,
        title: newLevel.title,
        xpGained: state.profile.xp - prevXpRef.current,
      });
      impact(Haptics.ImpactFeedbackStyle.Heavy);
    }
    prevXpRef.current = state.profile.xp;
  }, [state.profile.xp, hydrated]);

  const dismissLevelUp = () => {
    setLevelUpBanner((prev) => ({ ...prev, visible: false }));
  };

  const value = useMemo(
    () => ({
      state,
      dispatch,
      hydrated,
      levelUpBanner: { ...levelUpBanner, dismiss: dismissLevelUp },
    }),
    [state, hydrated, levelUpBanner],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used inside a GameProvider');
  }
  return context;
}