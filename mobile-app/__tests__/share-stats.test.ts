// jest-expo test file for share stats service
import {runAllTests} from '@jest-expo';
import {shareStatsAsText, shareStatsAsImage} from '@/services/share';

describe('share stats', () => {
  it('should share stats as text', () => {
    const state = {
      cards: [],
      reviewLogs: [],
      reviewStreak: { currentStreak: 0, longestStreak: 0, lastReviewDate: null },
      quests: [],
      goals: [],
      wins: {},
      settings: { notifications: false, seenGuide: false },
      decks: [],
    };
    const result = shareStatsAsText(state);
    expect(typeof result).toBe('string');
  });

  it('should share stats as image', () => {
    const state = {
      cards: [],
      reviewLogs: [],
      reviewStreak: { currentStreak: 0, longestStreak: 0, lastReviewDate: null },
      quests: [],
      goals: [],
      wins: {},
      settings: { notifications: false, seenGuide: false },
      decks: [],
    };
    const result = shareStatsAsImage();
    expect(typeof result).toBe('string');
  });
});