import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spacing } from '@/constants/theme';
import { impact } from '@/services/haptics';
import { useToast } from './toast-provider';

type CardEditorProps = {
  onAdd: (front: string, back: string) => void;
};

export function CardEditor({ onAdd }: CardEditorProps) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const { showToast } = useToast();

  const handleSubmit = () => {
    const f = front.trim();
    const b = back.trim();
    if (!f || !b) return;
    impact();
    onAdd(f, b);
    showToast({ message: 'Card added! Reverse card created.', type: 'success' });
    setFront('');
    setBack('');
  };

  return (
    <Card style={styles.card}>
      <ThemedText type="smallBold">Add card</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        A reverse card will be created automatically.
      </ThemedText>
      <Input
        placeholder="Front (question)"
        value={front}
        onChangeText={setFront}
        returnKeyType="next"
        style={styles.input}
      />
      <Input
        placeholder="Back (answer)"
        value={back}
        onChangeText={setBack}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        style={styles.input}
      />
      <Button title="Add card" onPress={handleSubmit} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
  },
  input: {
    flex: 1,
  },
});
