import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { getItem, setItem } from '@/services/storage';

const ITEMS_KEY = 'items';

export default function ListScreen() {
  const [items, setItems] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    getItem<string[]>(ITEMS_KEY, []).then((value) => {
      setItems(value);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) {
      setItem(ITEMS_KEY, items);
    }
  }, [items, hydrated]);

  const addItem = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }
    setItems((previous) => [...previous, trimmed]);
    setDraft('');
  };

  const removeItem = (index: number) => {
    setItems((previous) => previous.filter((_, i) => i !== index));
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ThemedView style={styles.headerSection}>
            <ThemedText type="subtitle">Things to do</ThemedText>
            <ThemedText themeColor="textSecondary">
              Add what matters, tick it off the list.
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.composer}>
            <Input
              placeholder="What needs doing?"
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={addItem}
              returnKeyType="done"
              style={styles.input}
            />
            <Button title="Add" onPress={addItem} />
          </ThemedView>

          <FlatList
            data={items}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                Nothing yet — add your first item above.
              </ThemedText>
            }
            renderItem={({ item, index }) => (
              <Card style={styles.row}>
                <ThemedText style={styles.rowText}>{item}</ThemedText>
                <Button title="Remove" variant="ghost" onPress={() => removeItem(index)} />
              </Card>
            )}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.four,
  },
  keyboard: {
    flex: 1,
    gap: Spacing.four,
  },
  headerSection: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.one,
  },
  composer: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  rowText: {
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
});