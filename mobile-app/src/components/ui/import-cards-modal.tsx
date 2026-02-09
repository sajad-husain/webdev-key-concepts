import { useState } from 'react';
import { StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useToast } from '@/components/ui/toast-provider';
import { parseCSV } from '@/services/csv-parser';
import { impact } from '@/services/haptics';
import { FlatList } from 'react-native';

type ImportCardsModalProps = {
  deckId: string;
  onImport: (cards: { front: string; back: string }[]) => void;
  onClose: () => void;
};

export function ImportCardsModal({ deckId, onImport, onClose }: ImportCardsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [parsedCards, setParsedCards] = useState<{ front: string; back: string }[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const { showToast } = useToast();

  const handleFilePick = async () => {
    try {
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (pickerResult.canceled || !pickerResult.assets?.[0]?.uri) {
        return;
      }

      setIsLoading(true);
      const response = await fetch(pickerResult.assets[0].uri);
      const text = await response.text();
      
      const parseResult = parseCSV(text);
      setParsedCards(parseResult.cards);
      setParseErrors(parseResult.errors);
      setShowPreview(true);
      setIsLoading(false);
      
      if (parseResult.errors.length > 0) {
        showToast({ message: `${parseResult.errors.length} row(s) had errors`, type: 'error' });
      }
    } catch (error) {
      setIsLoading(false);
      showToast({ message: 'Failed to import file', type: 'error' });
    }
  };

  const handleConfirmImport = () => {
    if (parsedCards.length === 0) {
      showToast({ message: 'No valid cards to import', type: 'error' });
      return;
    }
    impact();
    onImport(parsedCards);
    showToast({ message: `Imported ${parsedCards.length} cards`, type: 'success' });
    onClose();
  };

  const handleExport = () => {
    showToast({ message: 'Export functionality coming soon', type: 'info' });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.modalContainer}>
        <ThemedView style={styles.modalContent}>
          <ThemedText type="smallBold">Processing CSV...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.modalContainer}>
      <ThemedView style={styles.modalContent}>
        <ThemedText type="subtitle">Import Cards</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Select a CSV file with columns: front,back
        </ThemedText>

        {!showPreview ? (
          <ThemedView style={styles.buttonGroup}>
            <Button title="Choose CSV File" onPress={handleFilePick} />
            <Button title="Export Current Cards" variant="ghost" onPress={handleExport} />
          </ThemedView>
        ) : (
          <ThemedView style={styles.previewSection}>
            <ThemedView style={styles.previewHeader}>
              <ThemedText type="smallBold">Preview ({parsedCards.length} cards)</ThemedText>
            </ThemedView>
            {parseErrors.length > 0 && (
              <ThemedView style={styles.errorBanner}>
                <ThemedText type="small" themeColor="danger">
                  {parseErrors.length} row(s) skipped due to errors
                </ThemedText>
              </ThemedView>
            )}
            <FlatList
              data={parsedCards.slice(0, 10)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <ThemedView style={styles.previewRow}>
                  <ThemedText type="small" numberOfLines={1}>{item.front}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>{item.back}</ThemedText>
                </ThemedView>
              )}
            />
            {parsedCards.length > 10 && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.moreText}>
                ... and {parsedCards.length - 10} more
              </ThemedText>
            )}
            <ThemedView style={styles.buttonGroup}>
              <Button title="Cancel" variant="ghost" onPress={() => setShowPreview(false)} />
              <Button title="Import Cards" onPress={handleConfirmImport} />
            </ThemedView>
          </ThemedView>
        )}
        <Button title="Close" variant="ghost" onPress={onClose} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    maxHeight: '80%',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  previewSection: {
    gap: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBanner: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  moreText: {
    textAlign: 'center',
    paddingVertical: 8,
  },
});