import { StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../theme';
import ErrorMessage from './ErrorMessage';

export default function TextField({ label, error, trailing, inputRef, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.row, error && { borderColor: theme.colors.error }, props.editable === false && { backgroundColor: theme.colors.disabled }]}>
        <TextInput ref={inputRef} accessibilityLabel={label} accessibilityHint={error || undefined}
          placeholderTextColor={theme.colors.textSecondary} {...props} style={styles.input} />
        {trailing}
      </View>
      <ErrorMessage message={error} />
    </View>
  );
}
const styles = StyleSheet.create({
  field: { marginBottom: theme.spacing.md },
  label: { ...theme.typography.caption, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.sm, backgroundColor: theme.colors.surface },
  input: { ...theme.typography.body, color: theme.colors.text, minHeight: 48, flex: 1, padding: theme.spacing.md },
});
