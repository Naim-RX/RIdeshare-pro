import { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as authService from '../services/authService';
import { createProfile, watchProfile } from '../services/profileService';
import { authErrorMessage } from '../utils/authErrors';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [configurationError, setConfigurationError] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const operation = useRef(false);

  useEffect(() => {
      return authService.watchAuth((nextUser) => {
        setProfile(null);
        setProfileError('');
        setProfileLoading(Boolean(nextUser));
        setUser(nextUser);
        setInitializing(false);
      }, (error) => {
        setConfigurationError(error.code === 'app/configuration' ? error.message : authErrorMessage(error));
        setInitializing(false);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const timeout = setTimeout(() => {
      if (active) {
        setProfileError('Unable to confirm your profile. Check your connection and retry.');
        setProfileLoading(false);
      }
    }, 15000);
    const unsubscribe = watchProfile(user.uid, (nextProfile) => {
      if (!active) return;
      clearTimeout(timeout);
      setProfile(nextProfile);
      setProfileError('');
      setProfileLoading(false);
    }, (error) => {
      if (!active) return;
      clearTimeout(timeout);
      setProfile(null);
      setProfileError(authErrorMessage(error));
      setProfileLoading(false);
    });
    return () => { active = false; clearTimeout(timeout); unsubscribe(); };
  }, [user, retry]);

  async function run(action) {
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    try { return await action(); }
    finally { operation.current = false; setBusy(false); }
  }
  const value = {
    user, profile, initializing, profileLoading, profileError, configurationError, busy,
    login: (values) => run(() => authService.login(values)),
    register: (values) => run(() => authService.register(values)),
    logout: () => run(authService.logout),
    completeProfile: (values) => run(() => createProfile(user, values)),
    retryProfile: () => { setProfileError(''); setProfileLoading(true); setRetry((count) => count + 1); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
