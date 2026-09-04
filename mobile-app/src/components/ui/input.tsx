import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type InputProps = TextInputProps;

export function Input({ style, placeholderTextColor, ...rest }: InputProps) {
  const theme = useTheme();

  return (
    <TextInput
      style={[
        styles.base,
        { backgroundColor: theme.backgroundElement, color: theme.text },
        style,
      ]}
      placeholderTextColor={placeholderTextColor ?? theme.textSecondary}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    fontSize: 16,
  },
});