import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
export default function SplashScreen() {
  return <SafeAreaView style={styles.screen}>
    <Text accessibilityRole="header" style={styles.title}>RideShare Pro</Text>
    <Text style={styles.subtitle}>Motorcycle Ride Sharing</Text>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.surface, padding: theme.spacing.lg, alignItems: 'center', justifyContent: 'center' },
  title: { ...theme.typography.title, color: theme.colors.primary, textAlign: 'center' },
  subtitle: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.sm, textAlign: 'center' },
});
