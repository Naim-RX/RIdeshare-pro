import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebase } from '../config/firebase';

let callable;
async function request(data) {
  if (!callable) {
    const functions = getFunctions(getFirebase().auth.app, 'asia-south1');
    if (__DEV__ && process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
      connectFunctionsEmulator(functions, process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || '10.0.2.2', 5001);
    }
    callable = httpsCallable(functions, 'maps', { timeout: 20000 });
  }
  try { return (await callable(data)).data; }
  catch (error) {
    const messages = {
      'functions/unauthenticated': 'Please log in again to choose a route.',
      'functions/permission-denied': 'An active customer account is required.',
      'functions/resource-exhausted': 'Map request limit reached. Please try again later.',
      'functions/not-found': data.action === 'route' ? 'No motorcycle route is available between these points.' : 'This place is unavailable. Select another result.',
      'functions/invalid-argument': 'Choose valid, different pickup and destination locations.',
    };
    throw new Error(messages[error.code] || 'Unable to reach the map service. Check your connection and map setup, then retry.');
  }
}
export const searchPlaces = (query, sessionToken) => request({ action: 'autocomplete', query, sessionToken });
export const resolvePlace = (placeId, sessionToken) => request({ action: 'place', placeId, sessionToken });
export const getRoute = (pickup, destination) => request({ action: 'route', pickup, destination });
