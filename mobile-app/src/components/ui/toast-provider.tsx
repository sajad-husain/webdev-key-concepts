import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Toast } from './toast';
import type { ToastProps } from './toast';

type ToastContextValue = {
  showToast: (props: Omit<ToastProps, 'onClose'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);
  const idCounter = useRef(0);

  const showToast = (props: Omit<ToastProps, 'onClose'>) => {
    const id = String(++idCounter.current);
    setToasts((prev) => [...prev, { ...props, id, onClose: () => dismissToast(id) }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.container}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    flexDirection: 'column',
    gap: 8,
    pointerEvents: 'none',
  },
});