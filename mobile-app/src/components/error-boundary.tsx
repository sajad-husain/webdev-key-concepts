import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <Card style={styles.fallback}>
          <ThemedText type="smallBold" themeColor="danger">
            Something went wrong
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {this.state.error?.message}
          </ThemedText>
          <Button title="Try again" onPress={this.reset} />
        </Card>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    gap: Spacing.two,
    alignItems: 'center',
    padding: Spacing.three,
  },
});
