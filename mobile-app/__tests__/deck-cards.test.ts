/// <reference types="jest" />
/// <reference types="jest" />
import { reducer, createInitialState, type Card, getDueCards } from '@/services/state';

describe('Card Reducer Logic', () => {
  it('creates two cards with correct properties on cards/add', () => {
    const initialState = createInitialState();
    const deckId = 'test-deck';
    const front = 'Question';
    const back = 'Answer';

    const action = {
      type: 'cards/add' as const,
      deckId,
      front,
      back,
    };

    const newState = reducer(initialState, action);

    expect(newState.cards).toHaveLength(2);

    const originalCard = newState.cards.find((c: Card) => !c.isReversed);
    const reverseCard = newState.cards.find((c: Card) => c.isReversed);

    expect(originalCard).toBeTruthy();
    expect(originalCard?.front).toBe(front);
    expect(originalCard?.back).toBe(back);
    expect(originalCard?.deckId).toBe(deckId);
    expect(originalCard?.isReversed).toBe(false);
    expect(originalCard?.easeFactor).toBe(2.5);
    expect(originalCard?.interval).toBe(0);
    expect(originalCard?.repetitions).toBe(0);

    expect(reverseCard).toBeTruthy();
    expect(reverseCard?.front).toBe(back);
    expect(reverseCard?.back).toBe(front);
    expect(reverseCard?.deckId).toBe(deckId);
    expect(reverseCard?.isReversed).toBe(true);
    expect(reverseCard?.easeFactor).toBe(2.5);
  });

  it('adds cards even with empty strings (validation happens in UI)', () => {
    const initialState = createInitialState();
    const deckId = 'test-deck';

    const action = {
      type: 'cards/add' as const,
      deckId,
      front: '',
      back: '',
    };

    const newState = reducer(initialState, action);
    expect(newState.cards).toHaveLength(2);
  });

  it('removes card correctly', () => {
    const initialState = createInitialState();
    const deckId = 'test-deck';

    // Add a card first
    const addAction = {
      type: 'cards/add' as const,
      deckId,
      front: 'Q',
      back: 'A',
    };
    const stateWithCards = reducer(initialState, addAction);
    const cardId = stateWithCards.cards[0].id;

    // Remove the card
    const removeAction = {
      type: 'cards/remove' as const,
      id: cardId,
    };
    const newState = reducer(stateWithCards, removeAction);

    expect(newState.cards).toHaveLength(1); // Only reverse card remains
    expect(newState.cards.find((c) => c.id === cardId)).toBeUndefined();
  });

  it('updates card correctly', () => {
    const initialState = createInitialState();
    const deckId = 'test-deck';

    // Add a card first
    const addAction = {
      type: 'cards/add' as const,
      deckId,
      front: 'Old Front',
      back: 'Old Back',
    };
    const stateWithCards = reducer(initialState, addAction);
    const cardId = stateWithCards.cards[0].id;

    // Update the card
    const updateAction = {
      type: 'cards/update' as const,
      id: cardId,
      front: 'New Front',
      back: 'New Back',
    };
    const newState = reducer(stateWithCards, updateAction);

    const updatedCard = newState.cards.find((c) => c.id === cardId);
    expect(updatedCard?.front).toBe('New Front');
    expect(updatedCard?.back).toBe('New Back');
  });
});

describe('Navigation Logic', () => {
  it('getDueCards returns cards due for review for a specific deck', () => {
    const initialState = createInitialState();
    const deckId = 'test-deck';
    const today = new Date().toISOString().slice(0, 10);

    // Add cards to the deck
    const addAction = {
      type: 'cards/add' as const,
      deckId,
      front: 'Q1',
      back: 'A1',
    };
    let state = reducer(initialState, addAction);

    // Manually set one card as due today, one as due tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    state = reducer(state, {
      type: 'cards/update' as const,
      id: state.cards[0].id,
      front: 'Q1',
      back: 'A1',
    });

    // Direct manipulation for test - set nextReview
    const cards = state.cards.map((c: Card) =>
      c.id === state.cards[0].id ? { ...c, nextReview: today } : { ...c, nextReview: tomorrowStr }
    );
    state = { ...state, cards };

    const dueCards = getDueCards(state, deckId);
    expect(dueCards.length).toBeGreaterThanOrEqual(1);
    expect(dueCards.every((c) => c.nextReview <= today)).toBe(true);
  });

  it('getDueCards returns empty array for deck with no due cards', () => {
    const initialState = createInitialState();
    const deckId = 'test-deck';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const addAction = {
      type: 'cards/add' as const,
      deckId,
      front: 'Q1',
      back: 'A1',
    };
    let state = reducer(initialState, addAction);

    // Set both cards to be due tomorrow
    const cards = state.cards.map((c: Card) => ({ ...c, nextReview: tomorrowStr }));
    state = { ...state, cards };

    const dueCards = getDueCards(state, deckId);
    expect(dueCards.length).toBe(0);
  });
});

describe('Full Cycle E2E', () => {
  it('simulates full deck→card→review cycle', () => {
    let state = createInitialState();
    const deckId = 'e2e-deck';

    // 1. Create deck - need to manually set ID since reducer generates it
    state = reducer(state, { type: 'decks/add', name: 'E2E Deck', description: 'Test' });
    const deck = state.decks[0];
    const actualDeckId = deck.id;

    // 2. Add cards to deck
    state = reducer(state, { type: 'cards/add', deckId: actualDeckId, front: 'Capital of France?', back: 'Paris' });
    state = reducer(state, { type: 'cards/add', deckId: actualDeckId, front: '2 + 2?', back: '4' });

    // Should have 4 cards (2 pairs with reverses)
    expect(state.cards.filter(c => c.deckId === actualDeckId)).toHaveLength(4);

    // 3. Verify cards are due for review today
    const dueCards = state.cards.filter(c => c.deckId === actualDeckId && c.nextReview <= new Date().toISOString().slice(0, 10));
    expect(dueCards.length).toBe(4);

    // 4. Simulate reviewing first card with "Good" grade
    const firstCard = dueCards[0];
    const grade = 2; // Good
    const xpEarned = 3 + 2 + 0; // base + grade bonus + streak (0)

    state = reducer(state, { type: 'review/submit', cardId: firstCard.id, grade, xpEarned });
    state = reducer(state, { type: 'reviewStreak/update', date: new Date().toISOString().slice(0, 10) });

    // Card should have updated SM-2 values
    const updatedCard = state.cards.find(c => c.id === firstCard.id);
    expect(updatedCard?.repetitions).toBe(1);
    expect(updatedCard?.interval).toBe(1);
    expect(updatedCard?.easeFactor).toBeGreaterThanOrEqual(2.5);

    // Review log should be created
    expect(state.reviewLogs).toHaveLength(1);
    expect(state.reviewLogs[0].cardId).toBe(firstCard.id);
    expect(state.reviewLogs[0].grade).toBe(grade);

    // 5. Simulate reviewing second card with "Again"
    const secondCard = dueCards[1];
    state = reducer(state, { type: 'review/submit', cardId: secondCard.id, grade: 0, xpEarned: 3 });
    state = reducer(state, { type: 'reviewStreak/update', date: new Date().toISOString().slice(0, 10) });

    const resetCard = state.cards.find(c => c.id === secondCard.id);
    expect(resetCard?.repetitions).toBe(0);
    expect(resetCard?.interval).toBe(1);

    // 6. Verify XP was awarded
    const totalXp = state.reviewLogs.reduce((sum, log) => sum + log.xpEarned, 0);
    expect(totalXp).toBeGreaterThan(0);
    expect(state.profile.xp).toBe(totalXp);

    // 7. Review streak should be updated
    expect(state.reviewStreak.currentStreak).toBe(1);
  });
});