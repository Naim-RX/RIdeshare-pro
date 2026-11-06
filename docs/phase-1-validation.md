# Phase 1 validation

Date: 2026-11-06 (Asia/Dhaka).

## Environment

- Windows PowerShell; Node.js 22.22.0 and npm 10.9.4.
- Node and npm were absent from PATH. An official portable Node distribution was downloaded into ignored `.tools/`; no system installation was changed.
- Expo SDK 56, React 19.2.3, React Native 0.85.3, safe-area-context 5.7.x.
- Commands below ran from `mobile/` with portable Node added to the process PATH.

## Executed checks

| Check | Exact result |
| --- | --- |
| `npm install` | Exit 0; initial dependencies installed and lockfile created |
| `npm install react-native@0.85.3` | Exit 0; aligned with Expo bundled dependency manifest |
| `npm audit fix` | Exit 1; compatible fixes applied, 20 findings remain: 2 low, 15 moderate, 3 high |
| `npm run lint` | Exit 0; no errors or warnings |
| `npm run check:dependencies` | Exit 0; `Dependencies are up to date` |
| `npm run export:android` | Exit 0; `Android Bundled 9806ms index.js (576 modules)`; 1.6 MB Hermes bundle exported to `dist/` |
| `npm start -- --offline --port 8082` with `CI=1` | Metro started and reported `Waiting on http://localhost:8082` |
| HTTP GET `/status` on port 8082 | Returned `packager-status:running` |
| HTTP GET `/` with `expo-platform: android` | HTTP 200; manifest name `RideShare Pro` and Android bundle URL returned |
| `git diff --check` | Exit 0; no whitespace errors (Git emitted its Windows line-ending notice) |
| Ignore-rule checks | Local tooling, dependencies, and `.env.local` matched ignore rules |
| Android device/emulator rendering | Not executed: adb not on PATH; no SDK found at the standard user location; ANDROID_HOME and ANDROID_SDK_ROOT unset |

Initial dependency/export attempts were blocked by permission to initialize `C:/Users/USER/.expo`. They succeeded after rerunning with approved permissions. The initial server attempt hit a sandbox restriction creating the React Native DevTools cache; the approved rerun on port 8082 started without that error. Export emitted environment color-setting warnings, not bundle failures.

The remaining npm audit findings involve transitive Expo/ESLint dependencies, including deepmerge, glob, minimatch, and zod. npm proposes a breaking downgrade to Expo 52 for the remaining automatic fix; that was not applied. These findings remain unresolved. The installed ESLint 9 line also emits an upstream support/deprecation warning; it passes the current Expo config's lint check.

## Acceptance status

Development-server startup and Android bundle compilation passed. Dependency compatibility passed. Device rendering and device runtime behavior are unverified; Phase 1 is not fully accepted until the Android manual check is completed. No automated feature tests were added for this static foundation. Both temporary development servers were stopped after validation. Stopping the final server emitted `Unable to resolve manifest assets ... This operation was aborted`; no custom icons or fonts are configured, and the manifest request had already returned HTTP 200.

## Manual check

Install Node.js 22 LTS, then run `cd mobile`, `npm ci`, and `npm start`. Open the QR code in compatible Android Expo Go, or start an emulator and run `npm run android`. Confirm the heading and welcome card render, clear system bars, support large fonts, and reload without errors. No Firebase project, Google Maps key, or login is required.

Suggested commit: `chore: initialize Expo JavaScript app with theme and linting`
