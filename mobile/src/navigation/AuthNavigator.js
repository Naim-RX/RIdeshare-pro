import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegistrationScreen from '../screens/auth/RegistrationScreen';

export default function AuthNavigator() {
  const [screen, setScreen] = useState('splash');
  useEffect(() => {
    const timer = setTimeout(() => setScreen('login'), 1200);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen !== 'register') return false;
      setScreen('login');
      return true;
    });
    return () => subscription.remove();
  }, [screen]);
  if (screen === 'splash') return <SplashScreen />;
  if (screen === 'register') return <RegistrationScreen onLogin={() => setScreen('login')} />;
  return <LoginScreen onRegister={() => setScreen('register')} />;
}
