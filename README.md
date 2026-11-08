# RideShare Pro

Phase 3: Expo UI with Firebase email/password authentication, persistent sessions, owned Firestore profiles, Customer/Biker navigation, and logout. Maps and ride operations are not implemented.

## Setup

Install Node.js 22 LTS (22.13 or newer) and npm, then run:

```powershell
cd mobile
npm ci
npm start
```

On Android, scan the QR code using a compatible Expo Go version with the phone and computer on the same network. For an already running emulator, run `npm run android` with Android SDK platform-tools on PATH. If Expo Go does not support this SDK, get the matching Android version from https://expo.dev/go. Allow local development server access through the firewall if needed.

Before starting, copy `mobile/.env.example` to `mobile/.env.local` and complete [Firebase setup](docs/firebase-setup.md), or use the documented local emulator configuration. Restart Expo after environment changes. Client environment variables must never contain server secrets. Missing configuration produces a setup message instead of a crash.

## Commands

Run inside `mobile/`:

| Command | Purpose |
| --- | --- |
| `npm start` | Start Expo development server |
| `npm run android` | Start Expo and open Android |
| `npm run ios` | Open iOS simulator on macOS |
| `npm run lint` | ESLint check with zero warnings allowed |
| `npm run lint:fix` | Apply automatic lint fixes |
| `npm test` | Run local validation and component interaction tests |
| `npm run test:validation` | Run validation tests with Node |
| `npm run test:ui` | Run Expo/Jest component tests |
| `npm run test:firebase` | Run Auth/Firestore emulator integration and security-rule tests (Java 21 required) |
| `npm run emulators` | Start local Auth/Firestore emulators for development |
| `npm run check:dependencies` | Verify Expo dependency compatibility |
| `npm run export:android` | Bundle Android JavaScript into ignored `dist/` |

Exporting validates bundling; it does not create an APK or verify device rendering.

## Structure

```text
mobile/
  App.js                       Root provider and status bar
  index.js                     Expo entry point
  app.json                     App and platform configuration
  eslint.config.js             Flat ESLint configuration
  jest.config.js               Expo-compatible component test configuration
  package.json                 Dependencies and scripts
  package-lock.json            Reproducible dependency versions
  src/
    components/                Shared fields, buttons, feedback, cards, screen layout
    navigation/AuthNavigator.js  Splash/login/registration flow and Android back handling
    navigation/RootNavigator.js  Auth state, profile gating, and Customer/Biker routing
    context/AuthContext.js     Persistent session and profile subscription state
    config/firebase.js        Lazy Firebase initialization and local emulator connections
    services/                 Authentication and owned-profile operations
    screens/SplashScreen.js    Plain white brand screen
    screens/auth/              Login and registration forms
    theme/index.js             Colors, system typography, spacing, radii
    utils/validation.js        Pure local form validation
  tests/                       Validation and component interaction tests
  integration/                 Real emulator integration and rules tests
firestore.rules                Profile ownership, immutable role/status, default deny
firebase.json                  Emulator and rules configuration
```

Keep Firebase and map calls outside screens. Current navigation uses local state and authenticated profile gating; add the planned navigation library as the ride flows grow. Form passwords are cleared when leaving a screen and are never persisted by application code. Firebase auth session persistence uses AsyncStorage.

Git ignores dependencies, Expo caches, exports, generated native projects, local tools, environment files, and signing artifacts. Placeholder-only `.env.example` files may be committed. Revisit native folder ignore rules if native source customization becomes necessary.

## Manual Android check

1. Launch the app through Expo Go or an emulator.
2. Confirm the white splash shows RideShare Pro and Motorcycle Ride Sharing, then opens login.
3. Follow the Phase 2 checklist for validation, navigation, keyboard, and small-screen checks.
4. Reload and confirm the splash and login render again.

Actual initialization check results are recorded in `docs/phase-1-validation.md`.
Phase 2 component usage, check results, and the manual device checklist are in `docs/phase-2-validation.md`.
Current authentication setup is in `docs/firebase-setup.md`; Phase 3 check results are in `docs/phase-3-validation.md`.
