import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const highlights = [
  {
    title: 'Score each day',
    body: 'Keep a running counter of your wins, losses, and ties — a little scoreboard for life.',
  },
  {
    title: 'Make a list',
    body: 'Track the things that actually matter and tick them off one by one.',
  },
  {
    title: 'Stay on track',
    body: 'It all stays on your phone. No account, no cloud, just you.',
  },
];

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <ThemedView style={styles.heroLogo}>
            <AnimatedIcon />
          </ThemedView>
          <ThemedText type="title" style={styles.title}>
            Life&apos;s a game
          </ThemedText>
          <ThemedText style={styles.tagline} themeColor="textSecondary">
            Keep score, keep lists, keep going.
          </ThemedText>
        </ThemedView>

        <ThemedText type="code" style={styles.code}>
          how it works
        </ThemedText>

        <ThemedView style={styles.highlights}>
          {highlights.map((item) => (
            <Card key={item.title} style={styles.card}>
              <ThemedText type="smallBold">{item.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.body}
              </ThemedText>
            </Card>
          ))}
        </ThemedView>

        <Button title="Start scoring" style={styles.cta} />

        {Platform.OS === 'web' && <ThemedText type="small">also runs in the browser</ThemedText>}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  heroLogo: {
    marginBottom: Spacing.two,
  },
  title: {
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    fontSize: 18,
  },
  code: {
    textTransform: 'uppercase',
  },
  highlights: {
    gap: Spacing.three,
    alignSelf: 'stretch',
  },
  card: {
    padding: Spacing.three,
  },
  cta: {
    alignSelf: 'stretch',
    marginTop: Spacing.two,
  },
});