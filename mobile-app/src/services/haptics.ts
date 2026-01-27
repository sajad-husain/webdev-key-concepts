import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Light haptic feedback on row toggles and button taps. No-op on web. */
export function tap(): void {
  if (Platform.OS === 'web') {
    return;
  }
  void Haptics.selectionAsync();
}

/** Impact feedback for more meaningful actions. No-op on web. */
export function impact(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
): void {
  if (Platform.OS === 'web') {
    return;
  }
  void Haptics.impactAsync(style);
}

/** Heavy impact for level-up celebrations. No-op on web. */
export function heavyImpact(): void {
  impact(Haptics.ImpactFeedbackStyle.Heavy);
}

/** Celebration haptic for streak milestones. No-op on web. */
export function celebration(): void {
  if (Platform.OS === 'web') {
    return;
  }
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}