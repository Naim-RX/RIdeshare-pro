# RideShare Pro

Phase 2: JavaScript Expo UI foundation with splash, login, registration, and reusable components. Firebase, maps, authentication, and ride operations are not connected. Valid form submissions explicitly explain that authentication is unavailable; they never create an account or log in.

## Setup

Install Node.js 22 LTS (22.13 or newer) and npm, then run:

```powershell
cd mobile
npm ci
npm start
```

On Android, scan the QR code using a compatible Expo Go version with the phone and computer on the same network. For an already running emulator, run `npm run android` with Android SDK platform-tools on PATH. If Expo Go does not support this SDK, get the matching Android version from https://expo.dev/go. Allow local development server access through the firewall if needed.

No environment variables or API keys are needed. Future local configuration belongs in ignored `.env.local` files. Client environment variables must never contain server secrets.

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
    screens/SplashScreen.js    Plain white brand screen
    screens/auth/              Login and registration forms
    theme/index.js             Colors, system typography, spacing, radii
    utils/validation.js        Pure local form validation
  tests/                       Validation and component interaction tests
```

Add authentication state, configuration, and services as their features are implemented. Keep Firebase and map calls outside screens. No empty feature folders are needed yet. Current navigation uses local state for two forms; replace it with the planned navigation library as authenticated flows are added. Form values are cleared when leaving a screen and are never persisted.

Git ignores dependencies, Expo caches, exports, generated native projects, local tools, environment files, and signing artifacts. Placeholder-only `.env.example` files may be committed. Revisit native folder ignore rules if native source customization becomes necessary.

## Manual Android check

1. Launch the app through Expo Go or an emulator.
2. Confirm the white splash shows RideShare Pro and Motorcycle Ride Sharing, then opens login.
3. Follow the Phase 2 checklist for validation, navigation, keyboard, and small-screen checks.
4. Reload and confirm the splash and login render again.

Actual initialization check results are recorded in `docs/phase-1-validation.md`.
Phase 2 component usage, check results, and the manual device checklist are in `docs/phase-2-validation.md`.
