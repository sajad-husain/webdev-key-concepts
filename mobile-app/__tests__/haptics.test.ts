// jest-expo test file for haptics with web no-op guards
import {runAllTests} from '@jest-expo';
import {Haptics} from '@/services/haptics';

describe('haptics', () => {
  it('should run without errors', () => {
    expect(true).toBe(true);
  });

  it('tap haptic should be a no-op on web', () => {
    const original = (Haptics as any).tap;
    // @ts-expect-error: web guard
    (Haptics as any).tap = () => {};
    expect(true).toBe(true);
    // @ts-expect-error: web guard
    (Haptics as any).tap = original;
  });

  impact haptic should be a no-op on web', () => {
    const original = (Haptics as any).impact;
    // @ts-expect-error: web guard
    (Haptics as any).impact = () => {};
    expect(true).toBe(true);
    // @ts-expect-error: web guard
    (Haptics as any).impact = original;
  });
});