import { ActivityIndicator, Text, View } from 'react-native';
import { theme } from '../theme';
export default function LoadingIndicator({ label = 'Loading…' }) {
  return <View accessibilityLabel={label} accessibilityState={{ busy: true }} style={{ padding: theme.spacing.lg, gap: theme.spacing.sm, alignItems: 'center' }}>
    <ActivityIndicator color={theme.colors.primary} size="large" />
    <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>{label}</Text>
  </View>;
}
