import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

let services;
export function getFirebase() {
  if (services) return services;
  const config = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
  if (Object.values(config).some((value) => !value?.trim())) {
    throw new Error('Firebase is not configured. Copy mobile/.env.example to mobile/.env.local, enter your Firebase web app configuration, and restart Expo.');
  }
  const app = getApps().length ? getApp() : initializeApp(config);
  let auth;
  try {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch (error) {
    if (error.code !== 'auth/already-initialized') throw error;
    auth = getAuth(app);
  }
  const db = getFirestore(app);
  if (__DEV__ && process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
    const host = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || '10.0.2.2';
    // Store the connection flag on the Auth instance to survive Fast Refresh.
    if (!auth.emulatorConfig) {
      connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
      connectFirestoreEmulator(db, host, 8080);
    }
  }
  services = { auth, db };
  return services;
}
