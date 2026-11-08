# Firebase setup (Phase 3)

## Firebase Console

1. Create a Firebase project in the Firebase Console. Choose a Firestore region near your users when creating the database; use the default database.
2. In Authentication → Sign-in method, enable Email/Password (not email-link sign-in). Set the project's password policy to at least eight characters. The mobile form enforces eight characters locally; stronger Console policies may produce an additional validation error.
3. Create Cloud Firestore in production mode. Publish this repository's `firestore.rules` through the Rules editor, or deploy just the rules using the command below. Do not leave test-mode rules enabled.
4. In Project settings → Your apps, register a Web app to obtain the Firebase JavaScript SDK configuration. The Expo app uses the JavaScript SDK: an Android `google-services.json` file is not needed for this implementation.
5. Copy `mobile/.env.example` to `mobile/.env.local` and populate the four Firebase web config values. These are client configuration values, not service-account credentials. Never add an Admin SDK private key to Expo environment variables.
6. Keep `EXPO_PUBLIC_USE_FIREBASE_EMULATORS=false` for the real project. Restart using `npm start -- --clear` after changing environment values.

To deploy rules (from `mobile/`, with Node on PATH):

```powershell
npx firebase login
npx firebase deploy --config ../firebase.json --only firestore:rules --project YOUR_REAL_PROJECT_ID
```

No live project was created, modified, or deployed during implementation. Your Firebase project configuration is required for real-project sign-in.

## Local emulators

Install Java 21 or newer and add its `bin` folder to PATH. From `mobile/`:

```powershell
npm run test:firebase
# Or leave the emulators running for phone/emulator testing:
npm run emulators
```

The test command starts Auth and Firestore with project `demo-rideshare-pro`, runs integration tests, and shuts them down. It uses no live Firebase project. Test accounts/data are temporary; emulator startup does not import/export persistent data.

For the mobile app, use these **local-only** values in `.env.local`:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=demo-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-rideshare-pro.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=demo-rideshare-pro
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:android:demo
EXPO_PUBLIC_USE_FIREBASE_EMULATORS=true
EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=10.0.2.2
```

`10.0.2.2` reaches the host PC from the standard Android emulator. A physical phone needs your PC's LAN IP and the same private network; permit local firewall connections to ports 8080 and 9099. Emulators bind to all interfaces for this purpose and must only be used on a trusted development network. The app only enables emulator connections in development builds. Do not ship the demo config.

Implementation-time portable tooling is in ignored `.tools/`. To use it in this workspace:

```powershell
$env:Path = 'D:\RIdeshare-pro\.tools\node-v22.22.0-win-x64;D:\RIdeshare-pro\.tools\java\jdk-21.0.13+9-jre\bin;' + $env:Path
cd D:\RIdeshare-pro\mobile
npm run test:firebase
```

## Admin provisioning

There is no public admin registration. The mobile app rejects admin profiles. Do not grant admin privileges by editing client state or accepting a role field from an untrusted caller.

Provision administrators using a trusted Admin SDK environment operated by a project administrator:

1. Create the account under Firebase Authentication → Users and copy its UID.
2. In a separate trusted script/project (outside the mobile bundle), install `firebase-admin` and authenticate with Application Default Credentials using a principal authorized to manage Firebase Auth and Firestore.
3. Use the Admin SDK to set the custom claim and profile. For example, after replacing the UID and project ID:

```javascript
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp({ credential: applicationDefault(), projectId: 'YOUR_PROJECT_ID' });
async function provision() {
  const user = await getAuth().getUser('ADMIN_UID');
  await getAuth().setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
  await getFirestore().doc(`users/${user.uid}`).set({
    fullName: 'Administrator', email: user.email, mobile: '',
    role: 'admin', status: 'active', createdAt: FieldValue.serverTimestamp(),
  });
}
provision().catch((error) => { console.error(error.message); process.exitCode = 1; });
```

This is a provisioning example, not an app endpoint, and was not executed. Admin SDK writes bypass client rules. Future dashboard authorization must require a verified admin custom claim, not merely trust a client role value. Admin dashboard implementation is outside Phase 3.

## Security and recovery

Public registration creates exactly one owned profile with an initial Customer/Biker role and active status. Rules enforce field types, the Auth-token email, a server creation timestamp, and an exact field allowlist. Profiles cannot contain passwords or arbitrary additional fields. Owners can read their own profile and change only full name/mobile while active; they cannot list profiles, delete them, or change role, email, status, or creation time. All other collections are denied until later phases define their permissions.

Firebase Auth creation and the Firestore profile write cannot be one atomic transaction. If the profile write fails, the Auth account remains. Log in with that email/password to complete its missing profile. Do not repeatedly register the same email or silently delete the account. Existing profiles cannot be overwritten to change role. Profile access errors provide retry/logout. A server-confirmed profile is required before entering a role home; offline loading times out after 15 seconds and offers retry.

Disabling an account in Firebase Authentication blocks future sign-ins. Profile status is also checked by mobile navigation; subsequent feature rules must enforce active status server-side. Phase 3 exposes no ride data. Passwords are passed only to Firebase Auth, never written to Firestore or application logs. Firebase's persisted auth session is stored through AsyncStorage; passwords are not persisted by the app.

References: [Expo Firebase integration](https://docs.expo.dev/guides/using-firebase/), [Firebase auth persistence API](https://firebase.google.com/docs/reference/js/auth), [Firestore emulator rule testing](https://firebase.google.com/docs/firestore/security/test-rules-emulator).
