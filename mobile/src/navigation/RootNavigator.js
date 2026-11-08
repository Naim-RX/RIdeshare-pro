import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import SplashScreen from '../screens/SplashScreen';
import AccountScreen, { RoleHome } from '../screens/AccountScreen';
import CompleteProfileScreen from '../screens/auth/CompleteProfileScreen';
import Screen from '../components/Screen';
import ErrorMessage from '../components/ErrorMessage';
import LoadingIndicator from '../components/LoadingIndicator';
import SecondaryButton from '../components/SecondaryButton';

export default function RootNavigator() {
  const { user, profile, initializing, profileLoading, profileError, configurationError, retryProfile } = useAuth();
  if (initializing) return <SplashScreen />;
  if (configurationError) return <Screen><ErrorMessage message={configurationError} /></Screen>;
  if (!user) return <AuthNavigator />;
  if (profileLoading) return <AccountScreen title="Account"><LoadingIndicator label="Loading account…" /></AccountScreen>;
  if (profileError) return <AccountScreen title="Profile unavailable"><ErrorMessage message={profileError} /><SecondaryButton title="Retry profile" onPress={retryProfile} /></AccountScreen>;
  if (!profile) return <AccountScreen title="Complete your profile"><CompleteProfileScreen /></AccountScreen>;
  if (profile.status !== 'active') return <AccountScreen title="Account unavailable"><ErrorMessage message="This account is not active. Contact the administrator." /></AccountScreen>;
  if (profile.role === 'customer') return <RoleHome role="customer" />;
  if (profile.role === 'biker') return <RoleHome role="biker" />;
  return <AccountScreen title="Access restricted"><ErrorMessage message="This account cannot access the mobile app. Administrators must use the separate dashboard." /></AccountScreen>;
}
