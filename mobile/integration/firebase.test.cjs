const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { initializeApp, deleteApp } = require('firebase/app');
const { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator, doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } = require('firebase/firestore');
const projectId = 'demo-rideshare-pro';
let env;
const apps = [];
before(async () => {
  env = await initializeTestEnvironment({ projectId, firestore: { host: '127.0.0.1', port: 8080, rules: fs.readFileSync('../firestore.rules', 'utf8') } });
  await env.clearFirestore();
});
after(async () => { await Promise.all(apps.map(deleteApp)); await env?.cleanup(); });

function client() {
  const app = initializeApp({ apiKey: 'demo-api-key', projectId }, `test-${apps.length}`);
  apps.push(app);
  const auth = getAuth(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  return { auth, db };
}
function data(email, role) { return { fullName: 'Test User', email, mobile: '+8801712345678', role, status: 'active', createdAt: serverTimestamp() }; }
for (const role of ['customer', 'biker']) {
  test(`real emulator registration creates ${role} profile without password; login and logout work`, async () => {
    const { auth, db } = client();
    const email = `${role}-${Date.now()}@example.com`;
    const { user } = await createUserWithEmailAndPassword(auth, email, 'secret123');
    const ref = doc(db, 'users', user.uid);
    await setDoc(ref, data(email, role));
    assert.equal((await getDoc(ref)).data().role, role);
    assert.equal('password' in (await getDoc(ref)).data(), false);
    await signOut(auth);
    assert.equal(auth.currentUser, null);
    await signInWithEmailAndPassword(auth, email, 'secret123');
    assert.equal(auth.currentUser.uid, user.uid);
    await assert.rejects(signInWithEmailAndPassword(auth, email, 'incorrect'), (error) => ['auth/invalid-credential', 'auth/wrong-password'].includes(error.code));
    await assertFails(updateDoc(ref, { role: role === 'customer' ? 'biker' : 'admin' }));
    await assertFails(updateDoc(ref, { status: 'disabled' }));
    await assertSucceeds(updateDoc(ref, { fullName: 'Updated Name' }));
    await assertFails(deleteDoc(ref));
  });
}
test('invalid email is rejected by Firebase Auth', async () => {
  await assert.rejects(createUserWithEmailAndPassword(client().auth, 'invalid', 'secret123'), (error) => error.code === 'auth/invalid-email');
});
test('rules reject admin creation, forged ownership/email, password and extra fields; deny other users and guests', async () => {
  const email = 'rules@example.com';
  const db = env.authenticatedContext('owner', { email }).firestore();
  const ref = doc(db, 'users', 'owner');
  await assertFails(setDoc(ref, data(email, 'admin')));
  await assertFails(setDoc(doc(db, 'users', 'someone-else'), data(email, 'customer')));
  await assertFails(setDoc(ref, data('forged@example.com', 'customer')));
  await assertFails(setDoc(ref, { ...data(email, 'customer'), password: 'secret123' }));
  await assertSucceeds(setDoc(ref, data(email, 'customer')));
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'users', 'owner')));
  await assertFails(getDoc(doc(env.authenticatedContext('other', { email: 'other@example.com' }).firestore(), 'users', 'owner')));
  await assertFails(updateDoc(ref, { createdAt: serverTimestamp() }));
  await assertFails(setDoc(doc(db, 'rides', 'unimplemented'), { customerId: 'owner' }));
});
