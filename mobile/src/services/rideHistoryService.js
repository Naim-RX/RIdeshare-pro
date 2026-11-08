import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getFirebase } from '../config/firebase';

export function watchCustomerRides(uid, count, onRides, onError) {
  const request = query(collection(getFirebase().db, 'rides'), where('customerId', '==', uid), orderBy('createdAt', 'desc'), limit(count));
  return onSnapshot(request, (snapshot) => onRides(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))), onError);
}
