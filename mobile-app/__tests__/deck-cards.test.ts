/// <reference types="jest" />
import { reducer, createInitialState, type Card } from '@/services/state';

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