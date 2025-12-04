import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ProgressBarProps = {
  /** 0..1, values outside the range are clamped */
  progress: number;
  height?: number;
};

export function ProgressBar({ progress, height = 8 }: ProgressBarProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();

  const progressValue = useSharedValue(0);
  useEffect(() => {
    progressValue.value = withTiming(progress, {
      duration: reduced ? 0 : 500,
      reduceMotion: ReduceMotion.System,
    });
  }, [progress, progressValue, reduced]);

  const animatedWidth = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(1, progressValue.value)) * 100}%`,
  }));

  return (
    <Animated.View style={[styles.track, { backgroundColor: theme.backgroundElement, height }]}>
      <Animated.View
        style={[styles.fill, { backgroundColor: theme.tint, height }, animatedWidth]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.pill,
  },
});