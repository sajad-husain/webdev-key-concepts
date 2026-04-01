// jest-expo test file for share stats service
import {runAllTests} from '@jest-expo';
import {shareStatsText, shareStatsPNG} from '@/services/share';

describe('share stats', () => {
  it('should share stats as text', () => {
    const result = shareStatsText();
    expect(typeof result).toBe('string');
  });

  it('should share stats as PNG', () => {
    const result = shareStatsPNG();
    expect(typeof result).toBe('string');
  });
});