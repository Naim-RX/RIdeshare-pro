# Phase 2: UI foundation

Implemented November 7, 2026 (Asia/Dhaka). No Firebase or Google Maps dependencies were added.

## Behavior and structure

The plain white splash displays the wordmark and subtitle for 1.2 seconds before opening login. Login and registration are connected by visible buttons; Android back from registration returns to login. Exiting either form discards its local values, including passwords. These forms do not persist or send data.

Shared `Screen` uses safe-area insets, KeyboardAvoidingView (padding on iOS, height on Android), a scrolling content container, and handled keyboard taps. Android's keyboard layout mode is explicitly resize. The content is top-aligned, with a 600-point maximum width and no fixed form heights. Typography uses system fonts and permits system font scaling.

Validation requires an email and password for login. Registration additionally requires a full name of at least two characters, a mobile number containing 7–15 digits (optional leading + and formatting spaces/parentheses/hyphens), an eight-character password, matching confirmation, and Customer or Biker role. This accepts international numbers rather than enforcing a Bangladesh-only format. Field errors clear on edit and are checked again on submission. Valid submissions explain that authentication is not connected.

## Reusable component interfaces

| Component | Main props |
| --- | --- |
| PrimaryButton / SecondaryButton | `title`, `onPress`, `disabled`, `loading`, `accessibilityLabel` |
| TextField | `label`, `error`, `inputRef`, standard TextInput props |
| PasswordField | TextField props, with an independent accessible show/hide control |
| ScreenHeader | `title`, optional `subtitle` |
| StatusBadge | `status` (known statuses have readable labels; unknown values remain visible) |
| LoadingIndicator | Optional `label` |
| EmptyState | `title`, optional `message`, `actionLabel`, `onAction` |
| ErrorMessage | Optional `message`; hidden when empty |
| RideCard | `ride: { status, pickupLabel, destinationLabel, fareLabel?, routeLabel? }`, optional `onPress`, `actionLabel` |
| BidCard | `bid: { bikerName, fareLabel, ratingLabel?, status? }`, optional `onSelect`, `disabled`, `loading` |

Cards render caller-supplied display values; they contain no operational fixtures, queries, or assignment logic. Fare labels should include currency. Optional card actions only appear when callbacks are supplied. Buttons have a minimum 48-point touch height and expose disabled/busy states. Errors use text and accessibility announcements. Role selection uses radio semantics.

New development dependencies: Jest 29, jest-expo 56, React Native Testing Library 13, and matching React Test Renderer 19.2.3. These verify interactions without adding runtime services.

## Executed checks

On Windows using portable Node 22.22.0 and npm 10.9.4:

| Command | Result |
| --- | --- |
| `npm run lint` | Exit 0, no errors or warnings |
| `npm test` | Exit 0; 5 validation tests and 7 component tests passed |
| `npm run check:dependencies` | Exit 0; dependencies up to date |
| `npm run export:android` | Exit 0; Android bundled 587 modules in 6665 ms, exported a 1.6 MB Hermes bundle |

Tests exercise password visibility and retained value, invalid/valid local submissions, confirmation mismatch, Biker selection, splash timeout, login/registration links, Android back callback, disabled/loading buttons, card actions, and loading/empty feedback. Test fixtures exist only in tests. Initial test failures (an incorrect empty-field count, missing Jest lint globals, and a disabled-button event simulation issue) were fixed before the passing run.

Installing the testing dependencies completed successfully and reported 28 audit findings: 10 low, 15 moderate, 3 high. Upstream toolchain findings remain unresolved. No forced dependency downgrade was performed. Export emitted environment color-setting warnings but no bundling errors.

## Manual Android checklist — not executed here

No Android device/emulator is available in this environment, so visual layouts, native keyboard behavior, and real-device runtime behavior remain unverified. Component tests and bundle export do not prove those behaviors.

1. Run `cd mobile`, `npm ci`, and `npm start`. Open a compatible Android Expo Go installation or launch an emulator using `npm run android`.
2. Confirm the splash is white and contains only the wordmark/subtitle, followed by the login screen.
3. Submit empty login; verify email/password errors. Try a malformed email, then valid fields; verify the not-connected message and no false login success.
4. Type a password, show it, hide it, and confirm the value remains unchanged. Repeat independently for both registration password fields.
5. Open registration; submit empty fields, a short password, invalid phone number, and mismatched confirmation. Verify the relevant errors. Correct them and confirm the not-connected message.
6. Select Customer and Biker; verify selection styling. Return using the Login button and Android back; verify login appears and passwords are cleared on revisiting.
7. On a small device with large system text, open every keyboard, scroll to the bottom, and confirm focused fields and submit/navigation controls remain reachable above the keyboard. Check email and phone keyboard types. Drag to dismiss the keyboard and verify buttons respond to the first tap while it is open.
8. Check screen-reader labels for fields, password controls, role selection, and errors; ensure text clears system bars.

Suggested commit: `feat: add RideShare UI components and local auth forms`

Stop after Phase 2. Authentication and ride behavior require a subsequent approved phase.
