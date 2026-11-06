import { Text, View } from 'react-native';
import SecondaryButton from './SecondaryButton';
import { theme } from '../theme';
export default function EmptyState({ title, message, actionLabel, onAction }) {
  return <View style={{ paddingVertical: theme.spacing.xl, gap: theme.spacing.md }}>
    <Text accessibilityRole="header" style={{ ...theme.typography.heading, color: theme.colors.text }}>{title}</Text>
    {message ? <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>{message}</Text> : null}
    {actionLabel && onAction ? <SecondaryButton title={actionLabel} onPress={onAction} /> : null}
  </View>;
}
