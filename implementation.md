# CHAPTER 6: IMPLEMENTATION

This chapter details the concrete implementation of Project Nidra, mapping the architectural blueprint defined in Chapter 5 to the specific tools, modules, and coding practices employed during development. Every technology choice is justified against the system's core requirement: enforcing sleep discipline on Android through a battery-efficient, tamper-resistant, and user-hostile-to-exit design.

---

# 6.1 Tools and Technologies Used

The following table enumerates the tools and technologies employed in the implementation of Project Nidra, organized by architectural layer and functional role.

---

## 6.1.1 UI Framework & Navigation

| Technology | Version | Role | Justification |
|---|---|---|---|
| **React Native** | 0.76+ (New Architecture) | Cross-platform mobile UI framework | Enables a shared TypeScript codebase with native performance via the Fabric renderer and JSI (JavaScript Interface) for synchronous native calls. |
| **Expo** | SDK 52 | Managed development workflow | Provides pre-configured build tooling, over-the-air updates, and a curated module ecosystem (`expo-secure-store`, `expo-router`, `expo-font`) that eliminates manual native linking. |
| **expo-router** | v4 | File-system-based navigation | Declarative routing that mirrors web conventions (`app/home.tsx` → `/home`), enabling deep linking, stack-based navigation, and gesture-disabled screens (critical for the Sleep Mode lock). |

## 6.1.2 Data Visualization

| Technology | Version | Role | Justification |
|---|---|---|---|
| **Victory Native** | 41+ | High-fidelity charting library | Built on `@shopify/react-native-skia`, it renders sleep-trend area charts with gradient fills and animated paths directly on the GPU. |
| **React Native Skia** | 1.x | GPU-accelerated 2D rendering engine | Bypasses the Android View Hierarchy for drawing operations. Combined with JSI, it achieves synchronous data binding from Zustand state to the Skia canvas, enabling 60fps chart animations without blocking the JavaScript thread. |

## 6.1.3 State Management & Persistence

| Technology | Version | Role | Justification |
|---|---|---|---|
| **Zustand** | 5.x | Centralized global state manager | Selected for its minimal API surface (no boilerplate, no providers), native middleware composition (`persist`), and TypeScript-first design. Eliminates the Redux ceremony while retaining predictable, immutable state transitions. |
| **expo-secure-store** | 14.x | Encrypted local persistence | Leverages the Android Keystore system to encrypt all persisted state (user identity, sleep patterns, behavioral data) at rest via AES-256. Unlike `AsyncStorage`, data is protected against unauthorized access even on rooted devices. |

## 6.1.4 Native Android APIs

| Technology | API Level | Role | Justification |
|---|---|---|---|
| **AccessibilityService** | API 16+ | Event-driven foreground app detection | Receives OS-level callbacks on `TYPE_WINDOW_STATE_CHANGED` events, enabling the system to detect when a user opens a blocked app *without polling*. This is fundamentally more battery-efficient than `UsageStatsManager`, which requires periodic queries on a timed loop. |
| **WindowManager + System Overlay** | API 23+ (`TYPE_APPLICATION_OVERLAY`) | Full-screen blocking UI | Renders a non-dismissable overlay above all applications when a blocked app is detected, preventing interaction with the restricted content. Requires `SYSTEM_ALERT_WINDOW` permission. |
| **AlarmManager** | API 23+ (`setExactAndAllowWhileIdle`) | Background alarm scheduling | The only Android API capable of firing at a precise timestamp even when the device is in Doze mode and the React Native JS thread has been suspended. Essential for physically waking the user. |
| **SharedPreferences** | API 1+ | Native-side key-value persistence | Stores the blocked app list (`Set<String>`) and sleep mode active flag on disk. Ensures the `AccessibilityService` retains its configuration even after Android kills and restarts the process to reclaim memory. |
| **PackageManager** | API 1+ | Installed application enumeration | Queries `CATEGORY_LAUNCHER` intents to build the list of user-facing installed applications for the App Restrictions selection UI. |

## 6.1.5 Languages & Build Tools

| Technology | Role |
|---|---|
| **TypeScript** | Primary language for all React Native UI, state management, and bridge interface code. Provides compile-time type safety across the entire JavaScript layer. |
| **Kotlin** | Primary language for all Android native module code (`SleepBlockerModule`, `SleepBlockerService`, `AlarmReceiver`). Selected over Java for its null-safety, coroutine support, and concise syntax. |
| **Gradle** | Android build system. Manages native dependencies, permission declarations, and the compilation of Kotlin source into the APK. |

## 6.1.6 Supplementary Libraries

| Library | Role |
|---|---|
| **dayjs** | Lightweight date manipulation for alarm time formatting and ISO string operations. |
| **react-native-toast-message** | Non-intrusive feedback notifications (snooze confirmations, permission warnings, blocker status). |
| **Google Fonts (Inter, Lora)** | Typography system loaded via `expo-font` at the root layout level for global consistency. |
| **@expo/vector-icons (Ionicons)** | Icon set for navigation elements, status indicators, and action buttons. |

---

# 6.2 Modules Developed

Project Nidra's implementation is decomposed into four distinct modules, each mapping to a specific layer of the system architecture. The modules communicate through well-defined interfaces: Zustand selectors for UI–State binding, the React Native Bridge (via JSI) for State–Native communication, and Android OS callbacks for Native–OS interaction.

---

## 6.2.1 Presentation & UI Module

### Scope
All React Native screen components, the design system, and the Skia-based data visualization pipeline.

### Screens Implemented

| Screen | Route | Key Behavior |
|---|---|---|
| **Login / Signup** | `/`, `/signup` | Email-based authentication with form validation. Redirects to onboarding on first use or home on returning session. |
| **Onboarding (3 screens)** | `/onboarding1–3` | Collects user name, wake-up time, and sleep goal. Persists to Zustand on completion. |
| **Home Dashboard** | `/home` | Displays live clock, computed alarm time, sleep debt indicator, and weekly sleep-trend charts (Victory Native). Houses the "Start Sleep Mode" action. |
| **Sleep Mode** | `/sleepmode1` | Immersive full-screen protocol. Status bar hidden, hardware back button disabled, exit requires 15-second long-press followed by 5-step confirmation chain. Displays active blocker status and permission warnings. |
| **App Restrictions** | `/app-restrictions` | Searchable list of installed applications with toggle-based blocklist management. Features a "Suggested Blocks" section that surfaces common distractors (Instagram, TikTok, YouTube, etc.) for quick selection. |
| **Settings** | `/settings` | User preferences: notification toggles, strict mode, sound, vibration. |
| **Blocker Diagnostics** | `/test-blocker` | Developer/debug screen showing real-time permission status (Overlay, Accessibility), manual service start/stop controls, and permission grant shortcuts. |

### Design System

The UI employs a custom **frosted-glass aesthetic** characterized by:

- **Surface Treatment**: Translucent card backgrounds (`rgba(255, 255, 255, 0.08)`) with 1px border highlights (`rgba(255, 255, 255, 0.1)`) to simulate depth on a `#1E1E1E` base.
- **Typography**: Dual-font system — `Inter` (weights 400–600) for interface elements and `Lora` (weight 500) for emotive headings — loaded globally via `expo-font` in the root `_layout.tsx`.
- **Color Palette**: Curated dark mode with semantic accent colors: `#3b82f6` (primary actions), `#22c55e` (success/active states), `#ef4444` (destructive actions), `#facc15` (warnings/suggested items).
- **Interaction Patterns**: Pressable components with configurable `delayLongPress` for tamper-resistant controls, toast-based feedback for non-blocking notifications.

### Chart Rendering Pipeline

Sleep analytics are rendered using **Victory Native** on the **Skia GPU pipeline**:

1. The `SleepAnalyticsChart` component subscribes to `sleepDebtMinutes` and historical session data from the Zustand `MainStore` via typed selectors.
2. Data mutations in Zustand trigger a React re-render, which synchronously passes updated props to the Victory chart component.
3. Victory delegates path computation and gradient rendering to the Skia canvas, which draws directly to the GPU — bypassing the Android `View` layout and invalidation system.
4. The result is smooth 60fps area chart animations with gradient fills, even during rapid state updates.

---

## 6.2.2 Application Logic & Persistence Module

### Scope
The Zustand global store, the Sleep Math Engine, the snooze policy system, and the encrypted SecureStore persistence layer.

### Store Architecture

The application state is managed by a single Zustand store (`useStore`) that combines user data, session management, and domain logic into a unified, persistable object:

```
MainStore
├── user: { name, email }
├── sleepGoals: { wakeUpHour, wakeUpMinute, wakeUpPeriod, goalHours, goalMinutes }
├── sleepGoalMinutes: number
├── defaultAlarm: { hour, minute, period }
├── blockedApps: string[]
├── sleepDebtMinutes: number
├── activeSleepSession: SleepSession | null
├── preferences: { notifications, strictMode, sound, vibration }
│
├── Actions ──────────────────────────────────
├── loginUser(email) → void
├── updateUser(data) → void
├── setWakeUpTime(h, m, p) → void
├── setSleepGoal(h, m) → void
├── toggleAppBlock(packageName) → void
├── startSleepMode(bedtime?) → SleepSession
├── registerSnooze() → SnoozeResult
├── clearSleepSession() → void
└── reduceSleepDebt(minutes) → void
```

A separate `AuthStore` manages authentication state (`isAuthenticated`, `email`) with independent persistence.

### Persistence Middleware

Both stores use Zustand's `persist` middleware with a custom storage adapter:

```typescript
storage: {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
}
```

This adapter routes all serialized state through `expo-secure-store`, which encrypts data using the **Android Keystore** hardware-backed encryption before writing to disk. The store hydrates automatically on application launch, restoring the complete user session — including any active sleep protocol — without re-authentication.

### Sleep Math Engine (`sleepMath.ts`)

The engine implements the **Responsibility-Capped Alarm** algorithm:

1. **`computeResponsibilityCappedAlarm(input)`**: Computes `t_alarm = min(t_ideal, t_default)`. If the user's ideal wake time exceeds their preset alarm, the system caps the alarm at the obligation time, switches to `strict` mode, and records the deficit as sleep debt.
2. **`getSnoozePolicy(mode)`**: Returns mode-specific snooze parameters. Strict mode: 3-minute interval, 1 maximum snooze. Forgiving mode: 10-minute interval, effectively unlimited snoozes.
3. **`buildNextDefaultAlarmDate(now, alarm)`**: Resolves the next occurrence of the user's default alarm, advancing to the following day if the time has already passed.
4. **`getPointOfNoReturnTrigger(ref, alarm, goal)`**: Computes the timestamp 30 minutes before the latest possible bedtime, used to trigger pre-sleep notifications.

### Side Effects

Store actions trigger native side effects when appropriate:

- `toggleAppBlock()` synchronously calls `sleepBlocker.updateBlockedApps()` to sync the blocklist to `SharedPreferences` via the native bridge.
- `startSleepMode()` calls `sleepBlocker.setAlarm(timestamp)` to register the computed alarm time with Android's `AlarmManager`.
- `clearSleepSession()` calls both `sleepBlocker.stop()` and `sleepBlocker.cancelAlarm()` to tear down all native enforcement infrastructure.

---

## 6.2.3 Native Enforcement Engine

### Scope
The Kotlin-based `SleepBlockerModule` (React Native bridge), the `SleepBlockerService` (AccessibilityService), and the `SharedPreferences`-backed native persistence.

### SleepBlockerModule.kt — The Native Bridge

This Kotlin class extends `ReactContextBaseJavaModule` and exposes the following `@ReactMethod`-annotated functions to the JavaScript layer:

| Method | Signature | Behavior |
|---|---|---|
| `startService` | `(promise: Promise) → void` | Writes `is_sleep_mode_active = true` to SharedPreferences. |
| `stopService` | `(promise: Promise) → void` | Writes `is_sleep_mode_active = false` to SharedPreferences. |
| `isAccessibilityServiceEnabled` | `(promise: Promise) → void` | Reads `Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES`, parses the colon-delimited list, and checks if the `SleepBlockerService` component is registered. |
| `canDrawOverlays` | `(promise: Promise) → void` | Delegates to `Settings.canDrawOverlays(context)`. |
| `openAccessibilitySettings` | `() → void` | Launches `ACTION_ACCESSIBILITY_SETTINGS` with `FLAG_ACTIVITY_NEW_TASK`. |
| `openOverlayPermissionSettings` | `() → void` | Launches `ACTION_MANAGE_OVERLAY_PERMISSION` scoped to the app's package URI. |
| `getInstalledApps` | `(promise: Promise) → void` | Queries `PackageManager` for `CATEGORY_LAUNCHER` activities and returns a `WritableArray` of `{ packageName, appName }` maps. |
| `updateBlockedApps` | `(packageNames: ReadableArray) → void` | Converts the JS array to a `Set<String>` and writes it to SharedPreferences under key `blocked_apps`. |

### SleepBlockerService.kt — The AccessibilityService

This class extends `android.accessibilityservice.AccessibilityService` and operates as a persistent, event-driven background service managed entirely by the Android OS:

1. **`onServiceConnected()`**: Acquires a reference to the `WindowManager` system service for overlay rendering.
2. **`onAccessibilityEvent(event)`**: The core enforcement loop. On every `TYPE_WINDOW_STATE_CHANGED` event:
   - Extracts `event.packageName`.
   - Reads `SharedPreferences` to check if sleep mode is active and if the package is in the blocked set.
   - If blocked: renders a full-screen `TYPE_APPLICATION_OVERLAY` with a dark background and instructional text, then calls `performGlobalAction(GLOBAL_ACTION_HOME)` to force the user back to the home screen.
   - If not blocked: removes the overlay if one is currently displayed.
3. **`onInterrupt()` / `onDestroy()`**: Safely removes the overlay and releases `WindowManager` references.

### Native Persistence via SharedPreferences

The `SharedPreferences` file `NidraBlockerPrefs` stores two keys:

| Key | Type | Purpose |
|---|---|---|
| `is_sleep_mode_active` | `Boolean` | Master switch. The `AccessibilityService` reads this on every event to determine if enforcement is active. |
| `blocked_apps` | `Set<String>` | The set of Android package names to block. Read by the service on each `onAccessibilityEvent` invocation. |

This design ensures that the enforcement state survives:
- Android killing and restarting the `AccessibilityService` process.
- The React Native app being force-closed by the user.
- System-level memory reclamation during low-RAM conditions.

---

## 6.2.4 Native Alarm & Trigger Module

### Scope
The `AlarmManager` integration within `SleepBlockerModule` and the `AlarmReceiver` broadcast handler.

### Alarm Scheduling

Two additional `@ReactMethod` functions in `SleepBlockerModule.kt` handle alarm lifecycle:

| Method | Behavior |
|---|---|
| `setAlarm(timestamp, promise)` | Creates a `PendingIntent` targeting `AlarmReceiver`, then registers it with `AlarmManager.setExactAndAllowWhileIdle(RTC_WAKEUP, timestamp, pendingIntent)` on API 23+, or `setExact()` on older devices. This ensures the alarm fires at the exact millisecond, even if the device is in Doze mode. |
| `cancelAlarm(promise)` | Recreates the identical `PendingIntent` and calls `alarmManager.cancel(pendingIntent)` to deregister the scheduled wake-up. |

### AlarmReceiver.kt — The Broadcast Handler

This class extends `android.content.BroadcastReceiver` and is declared in `AndroidManifest.xml` with `android:exported="false"`:

1. **`onReceive(context, intent)`**: Triggered by the Android OS at the scheduled timestamp, regardless of app state.
2. Launches `MainActivity` with `FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_CLEAR_TOP` and an `trigger_alarm` intent extra.
3. Displays a system `Toast` as an immediate user-facing notification.

### Manifest Declaration

```xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
<uses-permission android:name="android.permission.USE_EXACT_ALARM"/>

<receiver android:name=".AlarmReceiver" android:exported="false" />
```

### Why AlarmManager and Not setTimeout?

JavaScript's `setTimeout` and `setInterval` execute on the React Native JS thread. When the user locks their phone and goes to sleep, Android will progressively restrict and eventually suspend the JS thread through its Doze battery optimization. A `setTimeout` scheduled for 7 hours in the future will silently fail to fire. `AlarmManager.setExactAndAllowWhileIdle` is the only Android API that provides a contractual guarantee of execution at the requested time, even under aggressive power management.

---

# 6.3 Coding Explanation

This section explains the key coding paradigms and architectural patterns employed across Project Nidra's implementation.

---

## 6.3.1 Separation of Concerns: JavaScript Thread vs. Native OS

Project Nidra enforces a strict separation between the **JavaScript thread** (responsible for UI rendering, state management, and user interaction) and the **Native Android OS** (responsible for enforcement actions that must survive process suspension):

| Responsibility | Thread/Process | Rationale |
|---|---|---|
| Screen rendering, navigation, user input | JS Thread (Hermes) | React Native's reconciler and layout engine operate here. |
| State management, alarm computation, snooze logic | JS Thread (Zustand) | Business rules are co-located with state for atomic consistency. |
| Foreground app detection, overlay rendering | Native OS (AccessibilityService) | Must operate independently of the JS thread, which Android may suspend. |
| Alarm triggering | Native OS (AlarmManager → BroadcastReceiver) | Must fire at a precise time even under Doze mode restrictions. |
| Blocked app list persistence | Native OS (SharedPreferences) | Must be readable by the AccessibilityService without JS thread involvement. |

This separation ensures that the enforcement mechanism remains active even when the user force-closes the React Native application or when Android suspends the JavaScript runtime to conserve battery.

## 6.3.2 Unidirectional Data Flow

The frontend follows a strict **unidirectional data flow** pattern:

```
User Action → Zustand Action → State Mutation → Selector Re-evaluation → UI Re-render
```

Each screen component subscribes to the Zustand store via **typed selector functions**:

```typescript
const blockedApps = useStore((state: StoreState) => state.blockedApps);
```

This pattern provides three guarantees:
1. **Type Safety**: The `StoreState` type annotation eliminates `any` inference across all selector callsites.
2. **Minimal Re-renders**: Components only re-render when their specific slice of state changes, not on any store mutation.
3. **Predictability**: State is never mutated directly by UI components. All mutations flow through store-defined actions, ensuring business rules (e.g., snooze quotas, sleep debt calculations) are enforced consistently regardless of which screen triggers the operation.

## 6.3.3 Asynchronous Bridge Communication

All communication between the JavaScript layer and the Kotlin native module is **asynchronous and Promise-based**:

```typescript
// JS side — sleepBlocker.ts
export const sleepBlocker = {
  start: () => ensureAndroid().startService(),              // Returns Promise<boolean>
  isAccessibilityServiceEnabled: () =>
    ensureAndroid().isAccessibilityServiceEnabled(),         // Returns Promise<boolean>
  setAlarm: (timestamp: number) =>
    ensureAndroid().setAlarm(timestamp),                     // Returns Promise<boolean>
};
```

```kotlin
// Kotlin side — SleepBlockerModule.kt
@ReactMethod
fun startService(promise: Promise) {
    try {
        val prefs = reactContext.getSharedPreferences("NidraBlockerPrefs", Context.MODE_PRIVATE)
        prefs.edit().putBoolean("is_sleep_mode_active", true).apply()
        promise.resolve(true)
    } catch (e: Exception) {
        promise.reject("START_SERVICE_ERROR", e.message, e)
    }
}
```

The `Promise` object bridges the asynchronous boundary: `promise.resolve()` fulfills the JavaScript `Promise`, while `promise.reject()` propagates errors to the JS `catch` handler. This pattern is used consistently for all permission checks, service toggling, and alarm scheduling operations.

## 6.3.4 Event-Driven Enforcement (Not Polling)

The most critical architectural decision in Nidra's native layer is the use of **event-driven** foreground detection via `AccessibilityService` rather than **polling-based** detection via `UsageStatsManager`:

| Approach | Mechanism | Battery Impact | Latency |
|---|---|---|---|
| **Polling (UsageStatsManager)** | Timer loop queries `queryUsageStats()` every N seconds | High — CPU wakes on every interval | Up to N seconds delay |
| **Event-Driven (AccessibilityService)** | OS pushes `TYPE_WINDOW_STATE_CHANGED` callbacks | Negligible — service is idle between events | Instant — triggered on the exact frame of the window transition |

The `AccessibilityService` consumes zero CPU resources while no window transitions are occurring. When a transition event fires, the service performs a single `SharedPreferences` read (a `HashSet.contains()` lookup with O(1) amortized complexity), renders an overlay if necessary, and immediately returns control to the OS. This event-driven model is fundamental to Nidra's viability as an overnight background service — a polling alternative would drain the battery before the user's alarm fires.

## 6.3.5 Tamper Resistance

The Sleep Mode screen implements multiple layers of exit resistance:

1. **Hardware Back Button**: Intercepted via `BackHandler.addEventListener('hardwareBackPress', () => true)`, returning `true` to consume the event and prevent navigation.
2. **Gesture Navigation**: Disabled via `<Stack.Screen options={{ gestureEnabled: false }} />` on the Expo Router stack.
3. **Exit Button**: Requires a 15-second continuous long-press (`delayLongPress={15000}`) before triggering the confirmation flow.
4. **5-Step Confirmation Chain**: Five sequential `Alert.alert()` dialogs with increasingly serious messaging, each offering a "Cancel" escape back to Sleep Mode. Only the final dialog — titled "FINAL CONFIRMATION (5/5)" with a destructive "ABANDON PROTOCOL" button — executes the cleanup and navigation.

This design is intentional: the friction must exceed the momentary impulse to check a distractor app, but remain ultimately escapable for genuine emergencies.
