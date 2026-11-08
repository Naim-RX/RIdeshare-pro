import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebase } from '../config/firebase';

export function watchProfile(uid, onProfile, onError) {
  return onSnapshot(doc(getFirebase().db, 'users', uid), { includeMetadataChanges: true }, (snapshot) => {
    // Never use a cached role/status as authority for entering the app.
    if (snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) return;
    onProfile(snapshot.exists() ? snapshot.data() : null);
  }, onError);
}

export async function createProfile(user, values) {
  if (!['customer', 'biker'].includes(values.role)) throw new Error('Invalid registration role');
  await setDoc(doc(getFirebase().db, 'users', user.uid), {
    fullName: values.fullName.trim(),
    email: user.email,
    mobile: values.mobile.trim().replace(/[\s()-]/g, ''),
    role: values.role,
    status: 'active',
    createdAt: serverTimestamp(),
  });
}
