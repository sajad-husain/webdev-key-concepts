import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Radius, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';

type LevelUpBannerProps = {
  visible: boolean;
  onDismiss: () => void;
  level: number;
  title: string;
  xpGained: number;
};

export function LevelUpBanner({ visible, onDismiss, level, title, xpGained }: LevelUpBannerProps) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: reduced ? 0 : 300 });
      translateY.value = withTiming(0, { duration: reduced ? 0 : 400 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withDelay(100, withTiming(50, { duration: 200 }));
    }
  }, [visible, opacity, translateY, reduced]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }), []);

  if (!visible && opacity.value === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, animatedStyle]} pointerEvents={visible ? 'auto' : 'none'}>
      <Pressable style={styles.backdrop} onPress={onDismiss} accessibilityRole="button" />
      <Animated.View style={[styles.banner, animatedStyle]}>
        <LinearGradient
          colors={['#8B5CF6', '#D97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBg}>
          <ThemedView style={styles.content}>
            <ThemedView style={styles.iconWrapper}>
              <ThemedText style={styles.levelNumber}>{level}</ThemedText>
            </ThemedView>
            <ThemedText type="title" style={styles.levelLabel}>
              Level Up!
            </ThemedText>
            <ThemedText type="subtitle" style={styles.titleText}>
              {title}
            </ThemedText>
            <ThemedText type="smallBold" themeColor="gold" style={styles.xpText}>
              +{xpGained} XP
            </ThemedText>
            <Button title="Awesome!" variant="secondary" onPress={onDismiss} style={styles.dismissButton} />
          </ThemedView>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  banner: {
    width: '100%',
    maxWidth: 340,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  gradientBg: {
    padding: Spacing.five,
    alignItems: 'center',
  },
  content: {
    gap: Spacing.two,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  levelLabel: {
    color: '#fff',
    textAlign: 'center',
  },
  titleText: {
    color: '#fff',
    textAlign: 'center',
    opacity: 0.95,
  },
  xpText: {
    color: '#FBBF24',
  },
  dismissButton: {
    marginTop: Spacing.two,
    width: '100%',
  },
});