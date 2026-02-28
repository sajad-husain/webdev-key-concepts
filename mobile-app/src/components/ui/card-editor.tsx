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
  onAdd: (front: string, back: string, tags?: string[]) => void;
  onUpdate?: (id: string, front: string, back: string) => void;
  editingCard?: { id: string; front: string; back: string; tags?: string[] } | null;
  onCancel?: () => void;
};

export function CardEditor({ onAdd, onUpdate, editingCard, onCancel }: CardEditorProps) {
  const [front, setFront] = useState(editingCard?.front || '');
  const [back, setBack] = useState(editingCard?.back || '');
  const [tagsInput, setTagsInput] = useState(editingCard?.tags?.join(', ') || '');
  const { showToast } = useToast();

  const isEditing = !!editingCard;

  const parseTags = (input: string): string[] => {
    return input
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  };

  const handleSubmit = () => {
    const f = front.trim();
    const b = back.trim();
    if (!f || !b) return;
    impact();
    const tags = parseTags(tagsInput);
    if (isEditing && editingCard && onUpdate) {
      onUpdate(editingCard.id, f, b);
      showToast({ message: 'Card updated!', type: 'success' });
    } else {
      onAdd(f, b, tags);
      showToast({ message: 'Card added! Reverse card created.', type: 'success' });
    }
    setFront('');
    setBack('');
    setTagsInput('');
    onCancel?.();
  };

  return (
    <Card style={styles.card}>
      <ThemedText type="smallBold">{isEditing ? 'Edit card' : 'Add card'}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {isEditing ? 'Changes will apply to this card only.' : 'A reverse card will be created automatically.'}
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
        returnKeyType="next"
        style={styles.input}
      />
      <Input
        placeholder="Tags (comma-separated, optional)"
        value={tagsInput}
        onChangeText={setTagsInput}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        style={styles.input}
      />
      <Button title={isEditing ? 'Save changes' : 'Add card'} onPress={handleSubmit} />
      {isEditing && onCancel && (
        <Button title="Cancel" variant="ghost" onPress={onCancel} />
      )}
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
