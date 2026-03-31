// jest-expo test file for notifications permission status
import {runAllTests} from '@jest-expo';
import {notificationsSupported, getPermissionStatus, ensurePermissions} from '@/services/notifications';

describe('notifications permission', () => {
  it('should return supported status', () => {
    expect(notificationsSupported()).toBe(true);
  });

  it('should return permission status object', () => {
    const status = getPermissionStatus({status: 'undetermined', granted: false} as any);
    expect(status).toHaveProperty('granted');
    expect(status).toHaveProperty('status');
  });

  it('ensurePermissions should return PermissionStatus', async () => {
    const result = await ensurePermissions();
    expect(result).toHaveProperty('granted');
    expect(result).toHaveProperty('status');
  });
});