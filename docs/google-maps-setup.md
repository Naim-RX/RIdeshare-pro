# Google Maps setup for Phase 4

No Google API was enabled, live key configured, function deployed, or billable map request executed during implementation. Read the billing and quota notes before enabling services.

## Library and build requirements

The app uses the Expo SDK 56-compatible `react-native-maps` version selected by `expo install` (1.27.2), not expo-maps. It is included in compatible Expo Go. Android Expo Go can be used for an initial map check without compiling a custom binary. Standalone Android builds need your own Maps SDK key in native configuration.

The app explicitly uses the Google provider on both platforms so that Google Places/Routes data is displayed on a Google map. Google Maps on iOS needs a native development/standalone build with the iOS Maps key; do not use iOS Expo Go for this screen. Native key changes require rebuilding the binary, not just reloading JavaScript.

`mobile/app.config.js` configures the library's Expo plugin. On Windows with Android SDK, JDK, and a running emulator/device, a local native build can be created from `mobile/` with `npx expo run:android`. This was not executed here. No device location permissions are requested and no location SDK or GPS tracking was added.

Reference: [Expo SDK 56 react-native-maps](https://docs.expo.dev/versions/v56.0.0/sdk/map-view/).

## APIs, billing, keys, and quotas — before enabling

1. Choose the Google Cloud project associated with your Firebase project and link a billing account. Firebase Cloud Functions deployment also requires a billing-enabled Blaze project. Both Google Maps calls and the proxy's Functions/Firestore/Secret Manager operations can incur costs.
2. Enable only Maps SDK for Android, Places API (New), and Routes API. Add Maps SDK for iOS only if you will build/test iOS. The app does not need Maps JavaScript API, legacy Directions API, Geocoding API, or location tracking.
3. Create separate keys. Restrict the Android key to Maps SDK for Android and the Android app package `com.ridesharepro.mobile` plus the signing certificate's SHA-1 fingerprint. Debug and release certificates differ; register the fingerprints for the builds you actually use. Restrict the iOS key to Maps SDK for iOS and bundle ID `com.ridesharepro.mobile`.
4. Restrict the **server key** to Places API (New) and Routes API. Store it in Functions Secret Manager. Do not put it in the mobile `.env.local`, any `EXPO_PUBLIC_*` variable, source code, or Firestore. Android/iOS application restrictions are not valid protection for server web-service calls. IP restrictions require a stable server egress IP; default Functions egress is dynamic. If you require IP restrictions, configure fixed egress first rather than inventing an IP allowlist.
5. Review current SKU pricing before enabling. This app requests `TWO_WHEELER`; Google bills it at higher rates than basic driving and coverage varies by region. No car-route or straight-line fallback is substituted for unavailable motorcycle routes. Distance and duration always come from the Routes API response.
6. Under Cloud Console → APIs & Services → Quotas, set conservative project-wide quotas for Places and Routes appropriate to your testing budget, including daily limits wherever exposed. A starting testing target could be 100 route requests per day and low per-minute limits; available quota controls vary by API, so verify the actual Console settings. Set billing budget alerts, but remember alerts are not spending caps. Monitor Maps usage and Functions/Firestore billing separately.

The callable also enforces 30 total map operations per signed-in active customer per minute using a server-only Firestore counter, and has `maxInstances: 2`. This is defense in depth, not a global spending cap. Place search is debounced 400 ms, requires three characters, returns at most five suggestions, and uses session tokens ending with Place Details. Invalid requests are rejected before the Google call. Route calls request only distance, duration, and encoded polyline.

References: [key security/proxy guidance](https://developers.google.com/maps/api-security-best-practices), [Places setup and billing](https://developers.google.com/maps/documentation/places/web-service/get-api-key), [motorcycle mode and billing warning](https://developers.google.com/maps/documentation/routes/route_two_wheel), [Routes usage and billing](https://developers.google.com/maps/documentation/routes/usage-and-billing).

## Configure and deploy manually

First complete [Firebase authentication setup](firebase-setup.md). Then from the repository root:

```powershell
cd functions
npm ci
cd ../mobile
npx firebase login
npx firebase functions:secrets:set GOOGLE_MAPS_SERVER_KEY --project YOUR_REAL_PROJECT_ID
npx firebase deploy --config ../firebase.json --only functions:maps,firestore:rules,firestore:indexes --project YOUR_REAL_PROJECT_ID
```

Enter the server key at the CLI's secret prompt, not as a command-line literal. The function is deployed in `asia-south1`, matching the client. No admin endpoint, arbitrary URL proxy, or ride-posting function is deployed by this code. Wait for the Firestore index to finish building before checking history.

Set only native keys in `mobile/.env.local`:

```dotenv
GOOGLE_MAPS_ANDROID_KEY=YOUR_ANDROID_RESTRICTED_KEY
GOOGLE_MAPS_IOS_KEY=YOUR_IOS_RESTRICTED_KEY
```

Keep the real Firebase client configuration and `EXPO_PUBLIC_USE_FIREBASE_EMULATORS=false` for the deployed function. Restart Expo after changes; rebuild native apps after changing native keys.

## Local Functions emulator (optional live Google calls)

Install dependencies in both `functions/` and `mobile/`, with Java 21 on PATH. Put `GOOGLE_MAPS_SERVER_KEY=YOUR_SERVER_KEY` in **`functions/.secret.local`**, which Git ignores, then run `npm run emulators:maps` from `mobile/`. Follow the Firebase setup document's demo-project mobile environment and host-IP instructions. The Functions emulator uses port 5001; permit it on the private development network if testing with a phone.

Emulating Firebase does **not** emulate Google Maps: real Places/Routes calls still require an enabled, billed Google project and can be charged. Automated proxy tests mock Google responses and the security integration tests stop before contacting Google. Never treat emulator keys as safe to commit.

## Recent rides and confirmation

Home reads the latest five owned Firestore rides; History reads up to twenty. The deployed index filters by `customerId` and orders `createdAt` descending. Expected display fields are `pickupLabel`, `destinationLabel`, and `status`. No operational seed data is created. Empty data displays an empty state; permission/index/network errors are shown as errors.

Confirm route stores the selected endpoints and summary only in current component state and returns Home. Editing either Home field clears confirmation. It does not persist a ride, calculate fare, submit bids, or post a request. The Dhaka default map viewport is just a camera starting point and does not represent the customer's current location.

The motorcycle-route beta warning is displayed below the map. Google map attribution remains visible within the native map; do not crop it or replace the map provider when displaying Google Places/Routes results. Do not persist Google place/route data beyond what the applicable Maps terms permit.
