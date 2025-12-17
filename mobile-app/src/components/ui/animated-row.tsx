import type { ReactNode } from 'react';
import Animated, { FadeInUp, FadeOut, useReducedMotion } from 'react-native-reanimated';

type AnimatedRowProps = {
  children: ReactNode;
  delay?: number;
};

/** Gently animates rows as they enter/leave a list; instant when motion is reduced. */
export function AnimatedRow({ children, delay = 0 }: AnimatedRowProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <>{children}</>;
  }

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(200)}
      exiting={FadeOut.duration(150)}>
      {children}
    </Animated.View>
  );
}