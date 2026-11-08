# Phase 3 validation

Completed November 9, 2026 (Asia/Dhaka).

## Implemented

- Customer/Biker email-password registration, login, logout, persistent auth, and authenticated context.
- Owned Firestore profiles with name, email, mobile, public role, initial active status, and server creation timestamp. Passwords never enter the profile payload.
- Customer/Biker home routing after server-confirmed profile loading; restricted paths for disabled/admin profiles and profile-read errors.
- Recovery for accounts whose Authentication creation succeeds but Firestore profile creation fails.
- Initial default-deny Firestore rules: owned reads, field/type validation, public roles only at creation, protected ownership/role/status/email/time, no client deletion, no listing or other-user reads.
- Missing-config feedback, loading buttons, Firebase error mapping, retry, and profile-loading timeout.

## Executed checks

Windows, Node 22.22.0, npm 10.9.4, portable Java 21.0.13. SDK dependencies use Firebase 12 and Expo-compatible AsyncStorage 2.2.0. Firebase 13 was initially selected by Expo, but its Node requirement and conflict with rules-unit-testing were resolved by installing Firebase 12; no forced peer-dependency bypass was used.

| Command | Result |
| --- | --- |
| `npm run lint` | Exit 0; zero errors/warnings after fixing two effect-state lint errors |
| `npm test` | Exit 0; 5 Node validation tests and 11 Jest component/session tests passed |
| `npm run test:firebase` | Exit 0; all 5 integration tests passed; Auth/Firestore emulators shut down successfully |
| `npm run check:dependencies` | Exit 0; dependencies up to date |
| `npm run export:android` | Exit 0; 619 modules in 10957 ms, 2.8 MB Hermes bundle exported |

The integration test command used only `demo-rideshare-pro`, not a real project. Its cases performed actual SDK requests against local Auth and Firestore:

1. Customer signup/profile creation, correct login, wrong-password rejection, logout, protected role/status rejection, permitted name update, and forbidden deletion.
2. The corresponding Biker flow.
3. Invalid email rejection by Firebase Authentication.
4. Admin creation, forged ownership/email, password fields, guest/other-user reads, creation-time changes, and unimplemented ride writes rejected by deployed emulator rules; valid owned profile creation accepted.
5. The installed React Native Auth build persisted a session through an AsyncStorage-compatible adapter, restored the same UID after deleting/reinitializing the app, and restored no session after logout. This verifies SDK persistence behavior, not physical-device storage.

Jest tests verify form error display and service calls, public role selection, restored-session/profile gating, Customer/Biker navigation, disabled/admin access restrictions, missing-profile recovery entry, and logout. Existing reusable-component interaction tests remain passing. Firebase credentials/services are mocked only in Jest; the integration tests use real emulators and security rules.

Expected permission-denied logs came from negative rules tests. Export emitted environment color-setting warnings. Firebase CLI emitted optional editor-notification warnings; these did not fail tests. The first emulator run downloaded the Firestore emulator into Firebase's user cache. Portable Node/Java downloads are in ignored `.tools/`.

The final dependency installation reported 46 npm audit findings (9 low, 30 moderate, 7 high), including the development emulator toolchain. These remain unresolved; no forced SDK downgrade or broad unrelated dependency rewrite was performed.

## Not executed

No live Firebase project setup, live signup, rules deployment, trusted admin provisioning, or Android device/emulator UI test was performed. No Firebase config was supplied. Android font/keyboard/layout behavior and native session persistence need a device check. Android bundle compilation does not prove device runtime behavior.

## Manual test after setup

Follow [Firebase setup](firebase-setup.md) for Console or local-emulator configuration, then:

1. Start Expo with `cd mobile` and `npm start -- --clear`; open Android Expo Go or an emulator.
2. Register a Customer with a new email, matching passwords (eight or more characters), name, and valid mobile. Verify Customer home and `users/{uid}` in Firestore. Confirm the document contains no password.
3. Logout, register a Biker using a different email, and verify Biker home and the immutable Biker profile role.
4. Try malformed email and missing fields; confirm local feedback. Try a wrong password and an already-registered email; confirm Firebase error messages and loading recovery.
5. Log in correctly, fully close/reopen the app, and confirm it restores the same role without exposing login during session initialization. Logout, reopen, and confirm login is required.
6. Temporarily interrupt the network during profile creation; reconnect and complete the missing profile. Existing profiles must never be rewritten to choose a different role.
7. Use the emulator integration suite to verify unauthorized role changes. Do not use the Firebase Console to simulate an untrusted client: Console/Admin SDK writes use trusted privileges and bypass client rules.
8. For status handling, set a test profile to disabled through a trusted Console process; confirm its home becomes unavailable and Logout remains possible. Re-enable it through the same trusted process afterward.

Suggested commit: `feat: add Firebase authentication and protected user profiles`

Stop at Phase 3. No ride functionality or admin dashboard is implemented.
