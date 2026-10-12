import * as ExpoHaptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Light haptic feedback on row toggles and button taps. No-op on web. */
export function tap(): void {
  if (Platform.OS === 'web') {
    return;
  }
  void ExpoHaptics.selectionAsync();
}

/** Impact feedback for more meaningful actions. No-op on web. */
export function impact(
  style: ExpoHaptics.ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle.Light,
): void {
  if (Platform.OS === 'web') {
    return;
  }
  void ExpoHaptics.impactAsync(style);
}

/** Heavy impact for level-up celebrations. No-op on web. */
export function heavyImpact(): void {
  impact(ExpoHaptics.ImpactFeedbackStyle.Heavy);
}

/** Celebration haptic for streak milestones. No-op on web. */
export function celebration(): void {
  if (Platform.OS === 'web') {
    return;
  }
  void ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success);
}

/** Haptics namespace for test compatibility. */
export const Haptics = {
  tap,
  impact,
  heavyImpact,
  celebration,
};