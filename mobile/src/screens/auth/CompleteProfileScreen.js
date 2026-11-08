import { useState } from 'react';
import { Text, View } from 'react-native';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';
import ErrorMessage from '../../components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { authErrorMessage } from '../../utils/authErrors';
import { validateRegistration } from '../../utils/validation';
import { theme } from '../../theme';

export default function CompleteProfileScreen() {
  const { user, completeProfile, busy } = useAuth();
  const [values, setValues] = useState({ fullName: '', mobile: '', role: 'customer' });
  const [message, setMessage] = useState('');
  function update(field, value) { setValues((current) => ({ ...current, [field]: value })); setMessage(''); }
  async function submit() {
    if (busy) return;
    // Reuse profile-related validation only; no password is collected again.
    const errors = validateRegistration({ ...values, email: user.email, password: '', confirmPassword: '' });
    const profileErrors = ['fullName', 'mobile', 'role'].map((field) => errors[field]).filter(Boolean);
    if (profileErrors.length) { setMessage(profileErrors.join(' ')); return; }
    try { await completeProfile(values); }
    catch (error) { setMessage(authErrorMessage(error)); }
  }
  return <View style={{ gap: theme.spacing.md }}>
    <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary }}>Your sign-in account exists, but its profile is incomplete. Finish setup to continue.</Text>
    <TextField label="Full name" value={values.fullName} onChangeText={(value) => update('fullName', value)} />
    <TextField label="Mobile Number" value={values.mobile} keyboardType="phone-pad" onChangeText={(value) => update('mobile', value)} />
    <Text style={{ color: theme.colors.text }}>Join as: {values.role === 'customer' ? 'Customer' : 'Biker'}</Text>
    <SecondaryButton title={values.role === 'customer' ? 'Choose Biker' : 'Choose Customer'} disabled={busy} onPress={() => update('role', values.role === 'customer' ? 'biker' : 'customer')} />
    <ErrorMessage message={message} />
    <PrimaryButton title="Complete profile" loading={busy} onPress={submit} />
  </View>;
}
