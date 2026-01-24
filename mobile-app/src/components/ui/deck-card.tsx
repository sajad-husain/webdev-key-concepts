import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { impact } from '@/services/haptics';

type DeckCardProps = {
  name: string;
  description?: string;
  total: number;
  due: number;
  onPress: () => void;
};

export function DeckCard({ name, description, total, due, onPress }: DeckCardProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={() => { impact(); onPress(); }}>
      <ThemedView style={[styles.card, { backgroundColor: theme.card }]}>
        <ThemedView style={styles.header}>
          <ThemedText type="smallBold" numberOfLines={1}>{name}</ThemedText>
          {due > 0 && (
            <ThemedView style={[styles.badge, { backgroundColor: theme.accent }]}>
              <ThemedText type="small" style={[styles.badgeText, { color: theme.accentContrast }]}>
                {due}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
        {description ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {description}
          </ThemedText>
        ) : null}
        <ThemedText type="small" themeColor="textSecondary">
          {total} cards
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    gap: Spacing.one,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  badgeText: {
    fontWeight: '700',
  },
});
