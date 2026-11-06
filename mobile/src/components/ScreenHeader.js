import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
export default function ScreenHeader({ title, subtitle }) {
  return <View style={styles.header}>
    <Text accessibilityRole="header" style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>;
}
const styles = StyleSheet.create({
  header: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl },
  title: { ...theme.typography.title, color: theme.colors.text },
  subtitle: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: theme.spacing.sm },
});
