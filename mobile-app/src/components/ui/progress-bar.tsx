import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

type ProgressBarProps = {
  /** 0..1, values outside the range are clamped */
  progress: number;
  height?: number;
  /** Optional gradient stops; defaults to the theme tint → accent blend */
  colors?: readonly [string, string];
};

export function ProgressBar({ progress, height = 8, colors }: ProgressBarProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();

  const gradient = colors ?? [theme.tint, theme.accent];

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
      <AnimatedGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { height }, animatedWidth]}
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