const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const { initializeApp, deleteApp } = require('firebase/app');
// Node normally selects the server Auth build. Exercise the installed RN build
// here, using an AsyncStorage-compatible adapter instead of a native device.
const firebaseRequire = createRequire(require.resolve('firebase/auth'));
const authPath = firebaseRequire.resolve('@firebase/auth');
const { initializeAuth, getReactNativePersistence, connectAuthEmulator, createUserWithEmailAndPassword, signOut } = require(path.resolve(path.dirname(authPath), '../rn/index.js'));

test('React Native Auth restores a saved session; logout removes it across reinitialization', async () => {
  const entries = new Map();
  const storage = {
    async getItem(key) { return entries.get(key) ?? null; },
    async setItem(key, value) { entries.set(key, value); },
    async removeItem(key) { entries.delete(key); },
  };
  const config = { apiKey: 'demo-api-key', projectId: 'demo-rideshare-pro' };
  function start() {
    const app = initializeApp(config, 'persistence-test');
    const auth = initializeAuth(app, { persistence: getReactNativePersistence(storage) });
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    return { app, auth };
  }
  let session = start();
  try {
    const { user } = await createUserWithEmailAndPassword(session.auth, `persist-${Date.now()}@example.com`, 'secret123');
    await deleteApp(session.app);
    session = start();
    await session.auth.authStateReady();
    assert.equal(session.auth.currentUser.uid, user.uid);
    await signOut(session.auth);
    await deleteApp(session.app);
    session = start();
    await session.auth.authStateReady();
    assert.equal(session.auth.currentUser, null);
    assert.equal([...entries.values()].some((value) => value.includes(user.uid)), false);
  } finally { await deleteApp(session.app); }
});
