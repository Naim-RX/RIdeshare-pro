const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { MapsError, validateRequest, resolveMaps } = require('./maps');
initializeApp();
const googleMapsKey = defineSecret('GOOGLE_MAPS_SERVER_KEY');

exports.maps = onCall({ region: 'asia-south1', secrets: [googleMapsKey], maxInstances: 2, concurrency: 20, timeoutSeconds: 20 }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Log in to use route selection.');
  const db = getFirestore();
  const profile = await db.doc(`users/${request.auth.uid}`).get();
  if (profile.data()?.role !== 'customer' || profile.data()?.status !== 'active') throw new HttpsError('permission-denied', 'An active customer account is required.');
  try {
    const input = validateRequest(request.data);
    const minute = Math.floor(Date.now() / 60000);
    await db.runTransaction(async (transaction) => {
      const ref = db.doc(`mapUsage/${request.auth.uid}`);
      const snapshot = await transaction.get(ref);
      const previous = snapshot.data();
      const count = previous?.minute === minute ? previous.count : 0;
      if (count >= 30) throw new HttpsError('resource-exhausted', 'Map request limit reached. Please wait a minute.');
      transaction.set(ref, { minute, count: count + 1, expiresAt: Timestamp.fromMillis(Date.now() + 86400000) });
    });
    return await resolveMaps(input, googleMapsKey.value());
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    if (error instanceof MapsError) throw new HttpsError(error.code, error.message);
    throw new HttpsError('internal', 'Unable to complete the map request.');
  }
});
