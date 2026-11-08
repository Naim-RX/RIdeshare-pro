# Phase 4 validation

Date: November 9, 2026 (Asia/Dhaka).

## Implemented

- Minimal Customer Home with Book a ride header, profile icon, pickup/destination inputs, Continue, recent rides, and Home/History/Profile tabs. Profile displays the authenticated user's data and Logout. History reads up to twenty actual owned rides; Home reads up to five. No operational seed rides are created.
- Route screen with Google place search and manual map taps, two endpoint markers, Google's decoded route line, distance/duration summary, beta warning, and local confirmation. Both endpoints must be selected, not merely typed. Editing either endpoint invalidates the previous route. Late responses cannot restore invalidated routes.
- Expo-compatible react-native-maps integration, a native-key config plugin, and no GPS/location permissions or tracking.
- Authenticated callable proxy for Places API (New) autocomplete/details and Routes API motorcycle routes. Server secret stays outside the mobile bundle; active customer access, input validation, fixed Google endpoints, a 10-second upstream timeout, a per-user 30-operations/minute counter, and two maximum function instances are enforced.
- Firestore rules/index for owned ride reads. All client ride writes and client quota-document access remain denied. Confirmation creates no ride and persists no route.

Files are separated into customer screens/navigation, reusable PlaceField/RouteMap/CustomerRides components, map/history services, route utilities, and a small Functions backend. Setup and cost prerequisites are in [Google Maps setup](google-maps-setup.md).

## Executed checks

Windows, Node 22.22.0, npm 10.9.4, Java 21.0.13.

| Check | Exact result |
| --- | --- |
| `mobile: npm run lint` | Exit 0, zero errors/warnings |
| `mobile: npm test` | Exit 0; 5 validation tests plus 21 Jest interaction/session tests passed |
| `functions: npm test` | Exit 0; 5 proxy tests passed |
| `functions: npm run check` | Exit 0; both backend JavaScript files passed Node syntax checks |
| `mobile: npm run test:firebase` | Exit 0; 7 emulator integration tests passed; emulators shut down successfully |
| `mobile: npm run check:dependencies` | Exit 0; dependencies up to date |
| `mobile: npm run export:android` | Exit 0; 745 modules in 10417 ms, 3.3 MB Hermes bundle and icon assets exported |
| `npx expo config --type public --json` | Exit 0; dynamic native map plugin config resolved without live keys |
| `git diff --check` | Exit 0; no whitespace errors; Windows line-ending notices only |

38 tests passed across mobile validation, component/session tests, backend tests, and Firebase integration.

The native map is **mocked** in Jest. Tests verify map props, two markers, route polyline coordinates, actual-response summary formatting, confirm callback data, changes to either input, manual map taps, empty/invalid coordinates, invalid Place Details, search and route failures, retry, late-response rejection, invalid polylines, and customer tabs. They do not prove that native Google tiles render.

Backend tests mock Google's HTTP responses. They verify the TWO_WHEELER request body, preserved distance/duration, invalid input rejection, unavailable routes, malformed responses, network failures, key/billing failures, and quota failures without leaking secrets. No live Google requests were made.

Firebase integration uses actual local Auth/Firestore emulators and the real rules. The new cases verify owned ride reads, rejection of other-user/unfiltered reads, disabled access, denial of all ride writes, and denial of client mapUsage access. The callable authorization/quota case invokes the callable handler in-process with test auth and actual emulator Firestore; it rejects guests, bikers, and a customer with an exhausted quota before any Google request. It does not test deployed callable HTTP transport or Secret Manager access. Existing registration, credential, persistence, and profile-security tests continue passing.

An initial session-suite failure came from a Firebase ESM import; the session test now mocks the unrelated map service. An initial integration failure was the test's Admin SDK cleanup import; it was fixed and all seven integration cases passed on rerun. Expected permission-denied logs came from negative rule tests. Export emitted environment color-setting warnings, not bundling failures.

Dependency installations reported 46 audit findings in `mobile/` (9 low, 30 moderate, 7 high), and 8 moderate findings in `functions/`. These remain unresolved; no forced dependency downgrade was applied.

## Not verified externally

- Native map tiles, marker/polyline appearance, camera fitting, touch behavior, small-screen layout, and keyboard behavior on Android hardware/emulator.
- Live Google Places/Routes responses, regional motorcycle coverage, production API key restrictions, billing/quotas, or deployed Functions/Secret Manager behavior.
- iOS Google Maps native build/runtime.

No Android device/adb is available and no live map keys were supplied. No Google API or billing setup was enabled, no live Firebase deployment occurred, and no ride was posted.

## Manual Android check after setup

1. Complete [Google Maps prerequisites](google-maps-setup.md), including billing review, restricted native/server keys, quotas, function deployment (or local Functions emulator), and rules/index deployment. Install dependencies in both `mobile/` and `functions/`.
2. Open the app in a compatible Android Expo Go or native build. Sign in as a Customer. Verify Book a ride, profile icon, recent rides, and Home/History/Profile tabs. With no rides, verify the empty state; do not seed fake operational rides for a finished app.
3. Submit empty Home inputs and verify feedback. Enter pickup/destination searches and Continue. Select real predictions for both fields and verify the resolved addresses, two pins, visible Google map/attribution, route line, distance, and estimated duration.
4. Confirm the summary agrees with the Routes API response, allowing only display rounding (kilometres to one decimal, minutes rounded up). It must not show invented distance/ETA or fall back to car/straight-line routing.
5. Change Pickup, then Destination; confirm the previous line/summary disappear until new endpoints resolve. Type arbitrary text without selecting a result; Confirm route must stay disabled. Try the same point for both locations and a location with no motorcycle route.
6. Use Select pickup on map and Select destination on map, tap real points, and verify pins and route recompute without asking for device location. Try changing endpoints while a route request is pending and confirm old results do not reappear.
7. Disconnect networking or simulate Google quota/key failures; verify search/route/map-load feedback and disabled confirmation. Restore service and retry. A map-load timeout is shown after 15 seconds if the native map never becomes ready.
8. Confirm a valid route; verify Home displays its summary and no Firestore ride document is created. Edit a Home endpoint and verify confirmation clears. Check Android back navigation from route and tabs.
9. Check large fonts/small screens, keyboard visibility, scrolling, reachable controls, map attribution, marker/line framing, and Profile logout. Rebuild native apps if changing native keys.

Suggested commit: `feat: add customer home and Google Maps route selection`

Stop at Phase 4. Fare entry, ride posting, bidding, and live tracking are not implemented.
