import { useState } from 'react';
import { Text } from 'react-native';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { authErrorMessage } from '../utils/authErrors';
import { theme } from '../theme';

export default function AccountScreen({ title, children }) {
  const { logout, busy } = useAuth();
  const [error, setError] = useState('');
  return <Screen>
    <ScreenHeader title={title} />
    {children}
    <ErrorMessage message={error} />
    <SecondaryButton title="Logout" loading={busy} onPress={async () => {
      setError('');
      try { await logout(); } catch (nextError) { setError(authErrorMessage(nextError)); }
    }} />
  </Screen>;
}

export function RoleHome({ role }) {
  const { profile } = useAuth();
  return <AccountScreen title={role === 'customer' ? 'Customer home' : 'Biker home'}>
    <Text style={{ ...theme.typography.heading, color: theme.colors.text, marginBottom: theme.spacing.md }}>Welcome, {profile.fullName}</Text>
    <Text style={{ ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }}>You are signed in as a {role}. Ride features will be added in a future phase.</Text>
  </AccountScreen>;
}
