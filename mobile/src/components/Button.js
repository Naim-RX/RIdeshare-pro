import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';

export default function Button({ title, onPress, disabled = false, loading = false, secondary = false, accessibilityLabel }) {
  const unavailable = disabled || loading;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: unavailable, busy: loading }} disabled={unavailable} onPress={onPress}
      style={({ pressed }) => [styles.button, secondary && styles.secondary, unavailable && styles.disabled, pressed && { opacity: 0.75 }]}>
      {loading && <ActivityIndicator color={secondary ? theme.colors.primary : theme.colors.surface} />}
      <Text style={[styles.text, secondary && { color: theme.colors.primary }, unavailable && { color: theme.colors.textSecondary }]}>{title}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: { minHeight: 48, padding: theme.spacing.md, borderRadius: theme.radius.sm, backgroundColor: theme.colors.primary, flexDirection: 'row', gap: theme.spacing.sm, justifyContent: 'center', alignItems: 'center' },
  secondary: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.primary },
  disabled: { backgroundColor: theme.colors.disabled, borderColor: theme.colors.border },
  text: { ...theme.typography.body, fontWeight: '600', color: theme.colors.surface, textAlign: 'center' },
});
