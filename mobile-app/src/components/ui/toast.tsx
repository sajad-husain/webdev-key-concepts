import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
};

export function Toast({ message, type = 'success', duration = 2000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  // Auto-dismiss
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <ThemedView
      style={[
        styles.container,
        type === 'success' && styles.success,
        type === 'error' && styles.error,
        type === 'info' && styles.info,
      ]}>
    <ThemedText type="small" style={styles.text}>
      {message}
    </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.four,
    right: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  success: {
    backgroundColor: '#22C55E',
  },
  error: {
    backgroundColor: '#EF4444',
  },
  info: {
    backgroundColor: '#3B82F6',
  },
  text: {
    color: '#FFF',
    fontWeight: '600',
  },
});