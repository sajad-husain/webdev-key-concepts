import { describe, expect, it } from '@jest/globals';

import {
  createInitialState,
  getActiveDays,
  reducer,
  sanitizeState,
  type GameState,
} from '@/services/state';
import { XP } from '@/services/gamification';

function build(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialState(),
    ...overrides,
  };
}

describe('quest XP', () => {
  it('awards XP once when a new quest is completed', () => {
    let state = build({
      quests: [{ id: 'q1', title: 'Read', xp: 20, done: false }],
    });
    state = reducer(state, { type: 'quests/toggle', id: 'q1' });
    expect(state.profile.xp).toBe(20);
    expect(state.quests[0].done).toBe(true);
    expect(state.quests[0].doneAt).toBeDefined();
  });

  it('does not claw back XP when un-completed', () => {
    let state = build({
      quests: [{ id: 'q1', title: 'Read', xp: 20, done: true, doneAt: '2026-01-11' }],
      profile: { xp: 20 },
    });
    state = reducer(state, { type: 'quests/toggle', id: 'q1' });
    expect(state.profile.xp).toBe(20);
    expect(state.quests[0].done).toBe(false);
    expect(state.quests[0].doneAt).toBeDefined();
  });

  it('does not re-award XP for a quest completed before', () => {
    let state = build({
      quests: [{ id: 'q1', title: 'Read', xp: 20, done: false, doneAt: '2026-01-10' }],
      profile: { xp: 20 },
    });
    state = reducer(state, { type: 'quests/toggle', id: 'q1' });
    expect(state.profile.xp).toBe(20);
    expect(state.quests[0].done).toBe(true);
  });

  it('does not refund XP when a completed quest is removed', () => {
    let state = build({
      quests: [{ id: 'q1', title: 'Read', xp: 20, done: true }],
      profile: { xp: 20 },
    });
    state = reducer(state, { type: 'quests/remove', id: 'q1' });
    expect(state.profile.xp).toBe(20);
    expect(state.quests).toHaveLength(0);
  });
});

describe('milestone XP', () => {
  const milestoneState = build({
    goals: [
      {
        id: 'g1',
        title: 'Ship',
        milestones: [{ id: 'm1', title: 'Plan', done: false }],
      },
    ],
  });

  it('awards once and never re-awards the same milestone', () => {
    let state = reducer(milestoneState, { type: 'goals/toggleMilestone', goalId: 'g1', milestoneId: 'm1' });
    expect(state.profile.xp).toBe(XP.milestone);
    expect(state.goals[0].milestones[0].done).toBe(true);

    // un-done: no refund, milestone update still applies
    state = reducer(state, { type: 'goals/toggleMilestone', goalId: 'g1', milestoneId: 'm1' });
    expect(state.profile.xp).toBe(XP.milestone);
    expect(state.goals[0].milestones[0].done).toBe(false);

    // done again: no re-award
    state = reducer(state, { type: 'goals/toggleMilestone', goalId: 'g1', milestoneId: 'm1' });
    expect(state.profile.xp).toBe(XP.milestone);
    expect(state.goals[0].milestones[0].done).toBe(true);
  });

  it('does not refund XP when a goal is removed', () => {
    let state = build({
      goals: [
        {
          id: 'g1',
          title: 'Ship',
          milestones: [{ id: 'm1', title: 'Plan', done: true, doneAt: '2026-01-10' }],
        },
      ],
      profile: { xp: 10 },
    });
    state = reducer(state, { type: 'goals/remove', id: 'g1' });
    expect(state.profile.xp).toBe(10);
    expect(state.goals).toHaveLength(0);
  });
});

describe('routine XP', () => {
  it('awards XP on the first check of a day and records the claim', () => {
    let state = build({
      routines: [{ id: 'r1', title: 'Run', reminderTime: null, history: [] }],
    });
    state = reducer(state, { type: 'routines/toggleDay', id: 'r1', date: '2026-01-12' });
    expect(state.profile.xp).toBe(XP.routineCheck);
    expect(state.routines[0].history).toContain('2026-01-12');
    expect(state.routines[0].claimed).toContain('2026-01-12');
  });

  it('keeps XP and the claim when a check is undone', () => {
    let state = build({
      routines: [
        { id: 'r1', title: 'Run', reminderTime: null, history: ['2026-01-12'], claimed: ['2026-01-12'] },
      ],
      profile: { xp: XP.routineCheck },
    });
    state = reducer(state, { type: 'routines/toggleDay', id: 'r1', date: '2026-01-12' });
    expect(state.profile.xp).toBe(XP.routineCheck);
    expect(state.routines[0].history).not.toContain('2026-01-12');
  });

  it('never re-awards a day that was checked before', () => {
    let state = build({
      routines: [
        { id: 'r1', title: 'Run', reminderTime: null, history: ['2026-01-12'], claimed: ['2026-01-12'] },
      ],
      profile: { xp: XP.routineCheck },
    });
    // uncheck then re-check the same day
    state = reducer(state, { type: 'routines/toggleDay', id: 'r1', date: '2026-01-12' });
    state = reducer(state, { type: 'routines/toggleDay', id: 'r1', date: '2026-01-12' });
    expect(state.profile.xp).toBe(XP.routineCheck);
    expect(state.routines[0].history).toContain('2026-01-12');
  });

  it('treats a legacy routine history as already claimed', () => {
    let state = build({
      routines: [{ id: 'r1', title: 'Run', reminderTime: null, history: ['2026-01-11'] }],
    });
    state = reducer(state, { type: 'routines/toggleDay', id: 'r1', date: '2026-01-11' });
    expect(state.profile.xp).toBe(0);
  });
});

describe('win XP', () => {
  it('does not refund XP when a win is removed', () => {
    let state = build({
      wins: { '2026-01-12': [{ id: 'w1', note: 'A small win', points: 5 }] },
      profile: { xp: 5 },
    });
    state = reducer(state, { type: 'wins/remove', date: '2026-01-12', id: 'w1' });
    expect(state.profile.xp).toBe(5);
    expect(state.wins['2026-01-12']).toBeUndefined();
  });
});

describe('getActiveDays', () => {
  it('includes quest and milestone completion days', () => {
    const state = build({
      quests: [{ id: 'q1', title: 'Read', xp: 20, done: true, doneAt: '2026-01-02' }],
      goals: [
        {
          id: 'g1',
          title: 'Ship',
          milestones: [{ id: 'm1', title: 'Plan', done: true, doneAt: '2026-01-03' }],
        },
      ],
      routines: [
        { id: 'r1', title: 'Run', reminderTime: null, history: ['2026-01-01'] },
      ],
      wins: { '2026-01-04': [{ id: 'w1', note: 'Win', points: 5 }] },
    });
    expect(getActiveDays(state).sort()).toEqual(['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04']);
  });
});

describe('sanitizeState', () => {
  it('returns defaults for junk input', () => {
    expect(sanitizeState(null)).toEqual(createInitialState());
    expect(sanitizeState([])).toEqual(createInitialState());
    expect(sanitizeState('garbage')).toEqual(createInitialState());
  });

  it('falls back per slice and coerces bad shapes', () => {
    const state = sanitizeState({
      profile: { xp: 'lots' },
      quests: [{ id: 'q1', title: 'Read', xp: 20, done: true }, { id: 42 }],
      wins: null,
      settings: { notifications: 'yes' },
    });
    expect(state.profile.xp).toBe(0);
    expect(state.quests).toHaveLength(1);
    expect(state.wins).toEqual({});
    expect(state.settings.notifications).toBe(true);
  });

  it('backfills claimed from history for legacy routines', () => {
    const state = sanitizeState({
      routines: [{ id: 'r1', title: 'Run', reminderTime: '07:00', history: ['2026-01-11'], claimed: [] }],
    });
    expect(state.routines[0].claimed).toEqual(['2026-01-11']);
  });
});