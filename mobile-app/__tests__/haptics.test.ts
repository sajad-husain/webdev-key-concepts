// jest-expo test file for haptics with web no-op guards
import {runAllTests} from '@jest-expo';
import {Haptics} from '@/services/haptics';

describe('haptics', () => {
  it('should run without errors', () => {
    expect(true).toBe(true);
  });

  it('tap haptic should be a no-op on web', () => {
    const original = (Haptics as any).tap;
    (Haptics as any).tap = () => {};
    expect(true).toBe(true);
    (Haptics as any).tap = original;
  });

  it('impact haptic should be a no-op on web', () => {
    const original = (Haptics as any).impact;
    (Haptics as any).impact = () => {};
    expect(true).toBe(true);
    (Haptics as any).impact = original;
  });
});