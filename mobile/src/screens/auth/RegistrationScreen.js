import { useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import TextField from '../../components/TextField';
import PasswordField from '../../components/PasswordField';
import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';
import ErrorMessage from '../../components/ErrorMessage';
import { validateRegistration } from '../../utils/validation';
import { theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { authErrorMessage } from '../../utils/authErrors';

export default function RegistrationScreen({ onLogin }) {
  const { register, busy } = useAuth();
  const [values, setValues] = useState({ fullName: '', email: '', mobile: '', password: '', confirmPassword: '', role: 'customer' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, ...(field === 'password' ? { confirmPassword: undefined } : {}) }));
    setMessage('');
  }
  async function submit() {
    if (busy) return;
    Keyboard.dismiss();
    const nextErrors = validateRegistration(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { setMessage('Check the highlighted fields.'); return; }
    setMessage('');
    try { await register(values); }
    catch (error) { setMessage(authErrorMessage(error)); }
  }
  return <Screen>
    <ScreenHeader title="Create your account" subtitle="Join RideShare Pro as a customer or biker." />
    <TextField label="Full name" value={values.fullName} onChangeText={(value) => update('fullName', value)} error={errors.fullName} autoCapitalize="words" autoComplete="name" />
    <TextField label="Email" value={values.email} onChangeText={(value) => update('email', value)} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" />
    <TextField label="Mobile Number" value={values.mobile} onChangeText={(value) => update('mobile', value)} error={errors.mobile} keyboardType="phone-pad" autoComplete="tel" />
    <PasswordField value={values.password} onChangeText={(value) => update('password', value)} error={errors.password} autoComplete="new-password" />
    <Text style={{ ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: theme.spacing.md }}>Use at least 8 characters.</Text>
    <PasswordField label="Confirm password" value={values.confirmPassword} onChangeText={(value) => update('confirmPassword', value)} error={errors.confirmPassword} autoComplete="new-password" returnKeyType="done" onSubmitEditing={submit} />
    <Text style={{ ...theme.typography.caption, color: theme.colors.text, marginBottom: theme.spacing.sm }}>I want to join as</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel="Account role" style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
      {['customer', 'biker'].map((role) => <Pressable key={role} accessibilityRole="radio" accessibilityState={{ checked: values.role === role }}
        onPress={() => update('role', role)} style={{ flex: 1, minHeight: 48, padding: theme.spacing.md, borderRadius: theme.radius.sm, borderWidth: 1, borderColor: values.role === role ? theme.colors.primary : theme.colors.border, backgroundColor: values.role === role ? theme.colors.primaryTint : theme.colors.surface }}>
        <Text style={{ ...theme.typography.body, textAlign: 'center', fontWeight: values.role === role ? '600' : '400', color: values.role === role ? theme.colors.primary : theme.colors.text }}>{role === 'customer' ? 'Customer' : 'Biker'}</Text>
      </Pressable>)}
    </View>
    <ErrorMessage message={errors.role || message} />
    <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.md }}>
      <PrimaryButton title="Create Account" onPress={submit} loading={busy} />
      <SecondaryButton title="Already registered? Login" onPress={onLogin} disabled={busy} />
    </View>
  </Screen>;
}
