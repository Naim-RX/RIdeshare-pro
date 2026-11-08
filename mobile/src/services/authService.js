import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirebase } from '../config/firebase';
import { validateLogin, validateRegistration } from '../utils/validation';
import { createProfile } from './profileService';

export function watchAuth(onUser, onError) {
  try { return onAuthStateChanged(getFirebase().auth, onUser, onError); }
  catch (error) {
    let active = true;
    queueMicrotask(() => { if (active) onError({ code: 'app/configuration', message: error.message }); });
    return () => { active = false; };
  }
}
export async function login(values) {
  if (Object.keys(validateLogin(values)).length) throw new Error('Invalid login fields');
  return signInWithEmailAndPassword(getFirebase().auth, values.email.trim(), values.password);
}
export async function register(values) {
  if (Object.keys(validateRegistration(values)).length) throw new Error('Invalid registration fields');
  const { user } = await createUserWithEmailAndPassword(getFirebase().auth, values.email.trim(), values.password);
  // Auth and Firestore are separate services. A failed profile write is recovered
  // by the signed-in profile-completion screen, never by storing a password.
  await createProfile(user, values);
  return user;
}
export function logout() { return signOut(getFirebase().auth); }
