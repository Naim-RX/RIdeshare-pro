import { useState } from 'react';
import { Keyboard, View } from 'react-native';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import TextField from '../../components/TextField';
import PasswordField from '../../components/PasswordField';
import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';
import ErrorMessage from '../../components/ErrorMessage';
import { validateLogin } from '../../utils/validation';
import { theme } from '../../theme';

export default function LoginScreen({ onRegister }) {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage('');
  }
  function submit() {
    Keyboard.dismiss();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setMessage(Object.keys(nextErrors).length ? 'Check the highlighted fields.' : 'Login is not available yet. Authentication will be connected in a future phase.');
  }
  return <Screen>
    <ScreenHeader title="RideShare Pro" subtitle="Welcome back. Log in to continue." />
    <TextField label="Email" value={values.email} onChangeText={(value) => update('email', value)} error={errors.email}
      keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" />
    <PasswordField value={values.password} onChangeText={(value) => update('password', value)} error={errors.password}
      autoComplete="current-password" returnKeyType="done" onSubmitEditing={submit} />
    <ErrorMessage message={message} />
    <View style={{ gap: theme.spacing.md }}>
      <PrimaryButton title="Login" onPress={submit} />
      <SecondaryButton title="New here? Register" onPress={onRegister} />
    </View>
  </Screen>;
}
