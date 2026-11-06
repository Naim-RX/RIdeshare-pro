import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import TextField from './TextField';
import { theme } from '../theme';
export default function PasswordField({ label = 'Password', ...props }) {
  const [visible, setVisible] = useState(false);
  return <TextField {...props} label={label} autoCapitalize="none" autoCorrect={false} secureTextEntry={!visible}
    trailing={<Pressable accessibilityRole="button" accessibilityLabel={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
      accessibilityState={{ expanded: visible }} onPress={() => setVisible((value) => !value)}
      style={{ minWidth: 64, minHeight: 48, padding: theme.spacing.sm, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ ...theme.typography.caption, color: theme.colors.primary, fontWeight: '600' }}>{visible ? 'Hide' : 'Show'}</Text>
    </Pressable>} />;
}
