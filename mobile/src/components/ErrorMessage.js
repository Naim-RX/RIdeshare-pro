import { StyleSheet, Text } from 'react-native';
import { theme } from '../theme';
export default function ErrorMessage({ message }) {
  if (!message) return null;
  return <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.text}>{message}</Text>;
}
const styles = StyleSheet.create({ text: { ...theme.typography.caption, color: theme.colors.error, marginVertical: theme.spacing.sm } });
