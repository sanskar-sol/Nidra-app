# 5.1 System Architecture

System architecture describes the overall structure, organization, and behavioral framework of a software system. It delineates how discrete components interact, communicate, and coordinate to fulfill the functional and non-functional requirements of the application. For Project Nidra—a sleep-enforcement and behavioral-modification platform for Android—the architecture is organized into three distinct layers: the **Presentation Layer** (React Native UI), the **Application Logic & Persistence Layer** (Zustand State Management with SecureStore), and the **Native Platform Layer** (Android Kotlin Bridge with AccessibilityService). Each layer operates with a clear separation of concerns, communicating through well-defined interfaces to ensure maintainability, security, and performance.

---

## 5.1.1 Presentation Layer — React Native UI

The user-facing layer of Project Nidra is implemented as an Expo-managed React Native application utilizing `expo-router` for declarative, file-system-based navigation. The interface employs a custom frosted-glass design language—characterized by translucent card surfaces, subtle background blurs, and a curated dark color palette—to evoke a calm, sleep-conducive visual environment. Typography is served via Google Fonts (`Inter` for interface elements, `Lora` for emotive headings), loaded at the root layout level to guarantee typographic consistency across all screens.

For data visualization, the application integrates `victory-native`, a high-performance charting library built on `@shopify/react-native-skia`. By utilizing the **JavaScript Interface (JSI)**, the application achieves synchronous data synchronization between the Zustand state and the native rendering engine, eliminating the overhead of asynchronous JSON serialization over the legacy bridge. The Skia-backed pipeline offloads drawing operations directly to the GPU, bypassing the standard **Android View Hierarchy** for complex path rendering. This ensures smooth 60fps animations for weekly sleep-trend graphs even during high-frequency state updates.

The Presentation Layer does not manage application state directly. Instead, each screen component subscribes to specific slices of the global Zustand store via typed selector functions, ensuring minimal re-renders and a unidirectional data flow from state to view.

---

## 5.1.2 Application Logic & Persistence Layer — Zustand with SecureStore

The core application logic resides in a centralized Zustand store that governs all mutable application state, including user identity, sleep goals, alarm configurations, active sleep sessions, blocked application lists, accumulated sleep debt, and user preferences. Zustand was selected for its minimal API surface, lack of boilerplate, and native support for middleware composition—qualities that are critical in a resource-constrained mobile environment.

State persistence is achieved through Zustand's `persist` middleware, configured with a custom storage adapter backed by `expo-secure-store`. Unlike conventional `AsyncStorage`-based solutions, SecureStore leverages the Android Keystore system to encrypt all persisted data at rest, ensuring that sensitive user information (email, sleep patterns, behavioral data) is protected against unauthorized access even on compromised devices. The store hydrates automatically on application launch, restoring the user's complete session state—including any active sleep protocol—without requiring re-authentication.

The store also encapsulates all domain logic as co-located actions: sleep-mode initiation (with responsibility-capped alarm computation), snooze registration (with mode-aware quotas), sleep-debt accumulation, and session lifecycle management. This architectural decision ensures that business rules are enforced consistently regardless of which UI screen triggers the operation.

---

## 5.1.3 Native Platform Layer — Android Kotlin Bridge with AccessibilityService

The most architecturally distinctive layer of Project Nidra is its native Android module, implemented in Kotlin and exposed to the React Native runtime via a custom `NativeModule` bridge (`SleepBlocker`). This module provides capabilities that are fundamentally inaccessible from the JavaScript layer: system overlay rendering, accessibility-based foreground detection, installed application enumeration, and dynamic app blocking.

The blocking mechanism is powered by an Android `AccessibilityService`—a system-level service that receives callbacks on window state changes across the entire operating system. To ensure resilience against service restarts or system-level process termination, the list of restricted applications is persisted natively via `SharedPreferences`. When the Sleep Protocol is active, the service maintains this blocklist in memory for high-performance lookups but synchronizes state with the persistent disk storage whenever the JS layer updates the configuration. Upon detecting a foreground transition to any blocked application, the service immediately renders a full-screen system overlay instructing the user to return to sleep, effectively preventing interaction with the restricted application. This approach is significantly more power-efficient than polling-based alternatives, as the service is event-driven and consumes negligible CPU resources during idle periods.

The React Native layer communicates with this native module through a typed bridge interface that exposes the following operations: `startService`, `stopService`, `canDrawOverlays`, `isAccessibilityServiceEnabled`, `openOverlayPermissionSettings`, `openAccessibilitySettings`, `getInstalledApps`, `updateBlockedApps`, `setAlarm`, and `cancelAlarm`. All permission-gated operations include pre-flight checks surfaced to the UI layer, enabling the application to guide users through the Android permission grant flow before activating the blocking engine or scheduling precision alarms.

---

## 5.1.4 System Architecture Diagram

```mermaid
graph TD
    subgraph PL["<b>Presentation Layer</b><br/>React Native + Expo Router"]
        UI_LOGIN["Login / Signup<br/>Screens"]
        UI_ONBOARD["Onboarding Flow<br/>(Name, Wake Time, Goal)"]
        UI_HOME["Home Dashboard<br/>Clock, Alarm, Charts"]
        UI_SLEEP["Sleep Mode Screen<br/>Immersive Protocol"]
        UI_RESTRICT["App Restrictions<br/>Selection UI"]
        UI_SETTINGS["Settings &<br/>Preferences"]
        UI_CHARTS["Victory Native<br/>Skia Charts"]
    end

    subgraph AL["<b>Application Logic & Persistence Layer</b><br/>Zustand + SecureStore"]
        AUTH_STORE["Auth Store<br/>(isAuthenticated, email)"]
        MAIN_STORE["Main Store<br/>(user, sleepGoals, preferences,<br/>blockedApps, sleepDebt)"]
        SESSION["Active Sleep Session<br/>(bedtime, alarm, mode,<br/>snooze policy)"]
        SLEEP_MATH["Sleep Math Engine<br/>(alarm computation,<br/>responsibility capping)"]
        PERSIST["Persist Middleware"]
        SECURE["expo-secure-store<br/>(AES-256 Encrypted<br/>Android Keystore)"]
    end

    subgraph NL["<b>Native Platform Layer</b><br/>Android Kotlin Bridge"]
        BRIDGE["SleepBlocker<br/>NativeModule Bridge"]
        SERVICE["AccessibilityService<br/>(Event-Driven<br/>Foreground Detection)"]
        OVERLAY["System Overlay<br/>Blocking Screen"]
        PERMS["Permission Manager<br/>(Overlay + Accessibility)"]
        PKG_QUERY["PackageManager<br/>Installed App Enumeration"]
        NATIVE_STORAGE["SharedPreferences<br/>(Persistent Blocklist)"]
        ALARM_MGR["AlarmManager<br/>(Exact RTC Wakeup)"]
        ALARM_RCV["AlarmReceiver<br/>(Broadcast Handler)"]
    end

    subgraph OS["<b>Android OS</b>"]
        KEYSTORE["Android Keystore<br/>Hardware-Backed Encryption"]
        WINDOW["Window Manager<br/>+ Activity Stack"]
        ACCESSIBILITY["Accessibility<br/>Event Stream"]
    end

    %% Presentation → State
    UI_LOGIN -->|"loginUser(email)"| AUTH_STORE
    UI_ONBOARD -->|"updateUser, setWakeUpTime,<br/>setSleepGoal"| MAIN_STORE
    UI_HOME -->|"startSleepMode()"| SESSION
    UI_RESTRICT -->|"toggleAppBlock(pkg)"| MAIN_STORE
    UI_SETTINGS -->|"updatePreferences"| MAIN_STORE
    UI_SLEEP -->|"registerSnooze(),<br/>clearSleepSession()"| SESSION

    %% State reads
    MAIN_STORE -.->|"selector subscriptions"| UI_HOME
    MAIN_STORE -.->|"selector subscriptions"| UI_SETTINGS
    SESSION -.->|"selector subscriptions"| UI_SLEEP
    AUTH_STORE -.->|"isAuthenticated"| UI_LOGIN

    %% State internals
    SESSION -->|"computeResponsibilityCappedAlarm"| SLEEP_MATH
    MAIN_STORE --> PERSIST
    AUTH_STORE --> PERSIST
    PERSIST -->|"read / write"| SECURE
    SECURE -->|"encryption keys"| KEYSTORE

    %% State → Native
    MAIN_STORE -->|"updateBlockedApps([])"| BRIDGE
    SESSION -->|"start() / stop()"| BRIDGE
    SESSION -->|"setAlarm(timestamp)"| BRIDGE

    %% Native internals
    BRIDGE -->|"startService"| SERVICE
    BRIDGE -->|"stopService"| SERVICE
    BRIDGE -->|"updateBlockedApps"| NATIVE_STORAGE
    NATIVE_STORAGE --> SERVICE
    BRIDGE -->|"permission checks"| PERMS
    BRIDGE -->|"getInstalledApps"| PKG_QUERY
    BRIDGE -->|"setAlarm"| ALARM_MGR
    ALARM_MGR -->|"RTC_WAKEUP"| ALARM_RCV
    ALARM_RCV -->|"launch / notify"| WINDOW
    SERVICE -->|"onAccessibilityEvent"| ACCESSIBILITY
    SERVICE -->|"show overlay"| OVERLAY
    OVERLAY -->|"addView / removeView"| WINDOW

    %% Chart rendering
    UI_HOME --> UI_CHARTS
    UI_CHARTS -.->|"JSI Synchronous Data Bind"| UI_CHARTS
    UI_CHARTS -.->|"Skia GPU Pipeline<br/>(bypasses Native View System)"| WINDOW

    %% Styling
    classDef presentation fill:#1e3a5f,stroke:#60a5fa,color:#e0f2fe,stroke-width:2px
    classDef logic fill:#1e3b1e,stroke:#22c55e,color:#d1fae5,stroke-width:2px
    classDef native fill:#3b1e1e,stroke:#ef4444,color:#fee2e2,stroke-width:2px
    classDef os fill:#2d2d2d,stroke:#9ca3af,color:#e5e7eb,stroke-width:2px

    class UI_LOGIN,UI_ONBOARD,UI_HOME,UI_SLEEP,UI_RESTRICT,UI_SETTINGS,UI_CHARTS presentation
    class AUTH_STORE,MAIN_STORE,SESSION,SLEEP_MATH,PERSIST,SECURE logic
    class BRIDGE,SERVICE,OVERLAY,PERMS,PKG_QUERY native
    class KEYSTORE,WINDOW,ACCESSIBILITY os
```

---

## 5.1.5 Inter-Layer Communication Summary

| Communication Path | Mechanism | Data Flow |
|---|---|---|
| UI → State | Zustand typed selectors & action dispatches | User interactions trigger store mutations |
| State → UI | Reactive subscriptions (auto re-render on slice change) | State changes propagate to subscribed components |
| State → Persistence | Zustand `persist` middleware | Automatic serialization to encrypted SecureStore |
| State → Native | `NativeModules.SleepBlocker` bridge calls | Blocked app list sync, service start/stop |
| Native → OS | AccessibilityService event callbacks | Foreground app detection, overlay rendering |
| Native → UI | Promise-based async returns | Permission status, installed app enumeration |

The three-layer architecture of Project Nidra ensures that the user interface remains decoupled from platform-specific enforcement logic, the application state serves as a single source of truth with encrypted persistence, and the native blocking engine operates at the OS level with minimal resource consumption. This separation enables independent evolution of each layer while maintaining strict behavioral contracts at layer boundaries.

---

# 5.2 UML Diagrams

UML (Unified Modeling Language) diagrams provide a standardized visual representation of the system's behavioral structure and class relationships. Section 5.2 presents two complementary views: a Use Case Diagram that maps the interactions between actors and system features, and a Class Diagram that defines the structure and relationships of the key software entities across all three architectural layers.

---

## 5.2.1 Use Case Diagram

The Use Case Diagram captures the functional scope of Project Nidra from the perspective of its two primary actors: the **User** (the human operating the application) and the **Android OS** (the system-level agent responsible for autonomously triggering scheduled operations while the React Native JS thread is suspended).

```mermaid
graph LR
    User(["👤 User"])
    AndroidOS(["🤖 Android OS"])

    subgraph UC["Project Nidra — Use Cases"]
        UC1["Authenticate User<br/>(Login / Signup)"]
        UC2["Configure Sleep Goals<br/>(Wake Time, Sleep Duration)"]
        UC3["Select Restricted Apps<br/>(App Blocklist Management)"]
        UC4["Initiate Sleep Mode<br/>(Start Protocol)"]
        UC5["Compute Wake Time<br/>(Responsibility-Capped Algorithm)"]
        UC6["Schedule Native Alarm<br/>(AlarmManager Registration)"]
        UC7["Enforce Screen Overlay<br/>(Block Distractor Apps)"]
        UC8["Trigger Alarm<br/>(Physical Wake-Up Call)"]
        UC9["Break Sleep Protocol<br/>(5-Step Confirmation Exit)"]
        UC10["View Sleep Analytics<br/>(Charts & Sleep Debt)"]
    end

    User -->|"provides credentials"| UC1
    User -->|"sets preferences"| UC2
    User -->|"toggles blocklist"| UC3
    User -->|"starts session"| UC4
    User -->|"reviews history"| UC10
    User -->|"long-press + confirm"| UC9

    UC4 -->|"triggers"| UC5
    UC5 -->|"result fed to"| UC6

    AndroidOS -->|"AccessibilityService<br/>window state event"| UC7
    AndroidOS -->|"AlarmManager<br/>RTC_WAKEUP broadcast"| UC8

    UC6 -.->|"schedules"| AndroidOS
    UC3 -.->|"persists via<br/>SharedPreferences"| UC7
```

---

## 5.2.2 Class Diagram

The Class Diagram delineates the structural relationships between the principal software entities across the three architectural layers. It specifies key attributes, method signatures, and dependency relationships to form a complete object-level view of the system.

```mermaid
classDiagram

    %% ─── PRESENTATION LAYER ───────────────────────────────────────────────
    class HomeScreen {
        +render() JSX
        +handleStartSleepMode() void
        +checkPermissions() Promise~void~
    }

    class SleepModeScreen {
        +permissionsOk: boolean
        +handleSnooze() void
        +handleExit() void
        +syncBlocker() Promise~void~
    }

    class AppRestrictionsScreen {
        +query: string
        +suggestedApps: App[]
        +render() JSX
    }

    class SleepAnalyticsChart {
        +data: SleepEntry[]
        +render() SkiaCanvas
        +animatePath() void
    }

    %% ─── APPLICATION LOGIC LAYER ──────────────────────────────────────────
    class MainStore {
        +user: User
        +blockedApps: string[]
        +sleepGoalMinutes: number
        +defaultAlarm: string
        +sleepDebtMinutes: number
        +preferences: Preferences
        +toggleAppBlock(packageName: string) void
        +updateUser(data: Partial~User~) void
        +reduceSleepDebt(minutes: number) void
    }

    class AuthStore {
        +isAuthenticated: boolean
        +email: string
        +loginUser(email: string) void
        +logoutUser() void
    }

    class SessionStore {
        +activeSleepSession: SleepSession
        +latestBedtimeAlertISO: string
        +startSleepMode(bedtime: Date) SleepSession
        +registerSnooze() SnoozeResult
        +clearSleepSession() void
    }

    class SleepMathEngine {
        +computeResponsibilityCappedAlarm(input: AlarmInput) AlarmResult
        +getSnoozePolicy(mode: string) SnoozePolicy
        -applyDebtPenalty(debt: number) number
    }

    class SecureStorageAdapter {
        +getItem(key: string) Promise~string~
        +setItem(key: string, value: string) Promise~void~
        +removeItem(key: string) Promise~void~
    }

    %% ─── NATIVE BRIDGE (JS side) ──────────────────────────────────────────
    class SleepBlockerBridge {
        +start() Promise~boolean~
        +stop() Promise~boolean~
        +canDrawOverlays() Promise~boolean~
        +isAccessibilityServiceEnabled() Promise~boolean~
        +openAccessibilitySettings() void
        +openOverlayPermissionSettings() void
        +getInstalledApps() Promise~App[]~
        +updateBlockedApps(packages: string[]) void
        +setAlarm(timestamp: number) Promise~boolean~
        +cancelAlarm() Promise~boolean~
    }

    %% ─── NATIVE PLATFORM LAYER (Kotlin) ───────────────────────────────────
    class SleepBlockerModule {
        -reactContext: ReactApplicationContext
        +getName() String
        +startService(promise: Promise) void
        +stopService(promise: Promise) void
        +isAccessibilityServiceEnabled(promise: Promise) void
        +openAccessibilitySettings() void
        +canDrawOverlays(promise: Promise) void
        +getInstalledApps(promise: Promise) void
        +updateBlockedApps(packageNames: ReadableArray) void
        +setAlarm(timestamp: Double, promise: Promise) void
        +cancelAlarm(promise: Promise) void
    }

    class SleepAccessibilityService {
        -windowManager: WindowManager
        -overlayView: View
        +onServiceConnected() void
        +onAccessibilityEvent(event: AccessibilityEvent) void
        +onInterrupt() void
        -isAppBlocked(packageName: String) Boolean
        -showOverlay() void
        -removeOverlay() void
    }

    class NativeStorageHelper {
        -PREFS_NAME: String = "NidraBlockerPrefs"
        -KEY_BLOCKED_APPS: String = "blocked_apps"
        -KEY_SLEEP_ACTIVE: String = "is_sleep_mode_active"
        +saveBlockedApps(packages: Set~String~) void
        +getBlockedApps() Set~String~
        +setSleepModeActive(active: Boolean) void
        +isSleepModeActive() Boolean
    }

    class SmartAlarmReceiver {
        +onReceive(context: Context, intent: Intent) void
        -launchAlarmActivity(context: Context) void
        -notifyUser(context: Context) void
    }

    %% ─── RELATIONSHIPS ────────────────────────────────────────────────────

    %% Presentation → Store
    HomeScreen ..> MainStore : reads blockedApps, sleepGoal
    HomeScreen ..> SessionStore : calls startSleepMode()
    SleepModeScreen ..> SessionStore : calls registerSnooze(), clearSleepSession()
    SleepModeScreen ..> MainStore : reads blockedApps
    AppRestrictionsScreen ..> MainStore : calls toggleAppBlock()
    SleepAnalyticsChart ..> MainStore : reads sleepDebtMinutes

    %% Store internals
    SessionStore --> SleepMathEngine : delegates alarm computation
    MainStore --> SecureStorageAdapter : persist middleware
    AuthStore --> SecureStorageAdapter : persist middleware

    %% Store → Native Bridge
    MainStore ..> SleepBlockerBridge : updateBlockedApps()
    SessionStore ..> SleepBlockerBridge : setAlarm(), start(), stop(), cancelAlarm()

    %% JS Bridge → Native Module
    SleepBlockerBridge ..> SleepBlockerModule : NativeModules call (JSI)

    %% Native Module → Platform Services
    SleepBlockerModule --> NativeStorageHelper : read / write blocklist & state
    SleepBlockerModule --> SmartAlarmReceiver : schedules via AlarmManager
    SleepAccessibilityService --> NativeStorageHelper : reads blocklist on event

    %% Native Platform → OS
    SleepAccessibilityService ..> SmartAlarmReceiver : independent OS lifecycle
```

---

## 5.2.3 Diagram Summary

| Diagram | Purpose | Key Insight |
|---|---|---|
| **Use Case** | Maps actor–system interactions | The Android OS is a distinct, autonomous actor that triggers blocking and alarm events independently of the user |
| **Class Diagram** | Defines entity structure and relationships | The `NativeStorageHelper` decouples the blocklist persistence from both the JS state and the running service, ensuring lifecycle safety |

---

# 5.3 Flowcharts

Flowcharts are graphical representations of the step-by-step process followed in the system. They illustrate how data moves through architectural layers, how decisions are evaluated, and how different processes are executed from start to end. The following flowcharts capture the three most critical operational flows within Project Nidra.

---

## 5.3.1 Sleep Protocol Lifecycle Flowchart

This flowchart traces the complete lifecycle of a Sleep Mode session—from the user pressing "Start Sleep Mode" on the Home Screen, through the permission verification gate, the Responsibility-Capped alarm computation, the native service activation, and finally the two possible termination paths: a natural alarm wake-up or a manual 5-step protocol break.

```mermaid
flowchart TD
    START(["User taps 'Start Sleep Mode'"])
    CHECK_APPS{"blockedApps.length > 0?"}
    ALERT_NO_APPS["Alert: 'No Apps Selected'\nRedirect to App Restrictions"]
    CHECK_OVERLAY{"canDrawOverlays() == true?"}
    CHECK_A11Y{"isAccessibilityServiceEnabled()\n== true?"}
    ALERT_PERMS["Alert: 'Permissions Required'\nRedirect to Test Blocker"]
    COMPUTE["computeResponsibilityCappedAlarm()\n─────────────────────\nt_ideal = bedtime + sleepGoal\nt_max = nextDefaultAlarm\nt_alarm = min(t_ideal, t_max)"]
    DETERMINE_MODE{"t_ideal ≤ t_max?"}
    MODE_FORGIVING["mode = 'forgiving'\nsnooze: 10 min, unlimited\ndebt = 0"]
    MODE_STRICT["mode = 'strict'\nsnooze: 3 min, 1 use\ndebt = t_ideal − t_max"]
    BUILD_SESSION["Build SleepSession object\nPersist to Zustand + SecureStore"]
    SYNC_NATIVE["sleepBlocker.updateBlockedApps()\nsleepBlocker.start()"]
    SCHEDULE_ALARM["sleepBlocker.setAlarm(t_alarm)\n→ AlarmManager.setExactAndAllowWhileIdle()"]
    NAVIGATE["Navigate to SleepMode Screen\nStatusBar hidden, back disabled"]
    SLEEPING(["User is sleeping\n─────────────────────\nAccessibilityService monitors\nforeground app transitions"])

    ALARM_FIRES["AlarmReceiver.onReceive()\nLaunch app + wake device"]
    USER_WAKES["User wakes up naturally\nSession ends"]

    MANUAL_EXIT["User long-presses X (15s)"]
    CONFIRM_1{"Confirm 1/5:\n'Abandon sleep goal?'"}
    CONFIRM_2{"Confirm 2/5:\n'Environment optimized. Stay?'"}
    CONFIRM_3{"Confirm 3/5:\n'Increase sleep debt?'"}
    CONFIRM_4{"Confirm 4/5:\n'Think about tomorrow.'"}
    CONFIRM_5{"Confirm 5/5:\n'PERMANENTLY break?'"}
    CANCEL(["User cancels\nReturn to Sleep Mode"])

    CLEANUP["sleepBlocker.stop()\nsleepBlocker.cancelAlarm()\nclearSleepSession()"]
    HOME(["Navigate to Home Screen"])

    START --> CHECK_APPS
    CHECK_APPS -- No --> ALERT_NO_APPS
    ALERT_NO_APPS --> HOME
    CHECK_APPS -- Yes --> CHECK_OVERLAY
    CHECK_OVERLAY -- No --> ALERT_PERMS
    CHECK_A11Y -- No --> ALERT_PERMS
    ALERT_PERMS --> HOME
    CHECK_OVERLAY -- Yes --> CHECK_A11Y
    CHECK_A11Y -- Yes --> COMPUTE
    COMPUTE --> DETERMINE_MODE
    DETERMINE_MODE -- Yes --> MODE_FORGIVING
    DETERMINE_MODE -- No --> MODE_STRICT
    MODE_FORGIVING --> BUILD_SESSION
    MODE_STRICT --> BUILD_SESSION
    BUILD_SESSION --> SYNC_NATIVE
    SYNC_NATIVE --> SCHEDULE_ALARM
    SCHEDULE_ALARM --> NAVIGATE
    NAVIGATE --> SLEEPING

    SLEEPING -->|"AlarmManager fires"| ALARM_FIRES
    ALARM_FIRES --> CLEANUP
    SLEEPING -->|"User attempts exit"| MANUAL_EXIT

    MANUAL_EXIT --> CONFIRM_1
    CONFIRM_1 -- Cancel --> CANCEL
    CONFIRM_1 -- Yes --> CONFIRM_2
    CONFIRM_2 -- Cancel --> CANCEL
    CONFIRM_2 -- Continue --> CONFIRM_3
    CONFIRM_3 -- Cancel --> CANCEL
    CONFIRM_3 -- Yes --> CONFIRM_4
    CONFIRM_4 -- Cancel --> CANCEL
    CONFIRM_4 -- Yes --> CONFIRM_5
    CONFIRM_5 -- Cancel --> CANCEL
    CONFIRM_5 -- "ABANDON" --> CLEANUP
    CLEANUP --> HOME
    USER_WAKES --> CLEANUP
```

---

## 5.3.2 App Blocking Enforcement Flowchart

This flowchart details the event-driven blocking mechanism that runs entirely at the Android OS level, independent of the React Native JavaScript thread. It shows how the `AccessibilityService` intercepts window state changes and decides whether to display a blocking overlay.

```mermaid
flowchart TD
    OS_EVENT(["Android OS fires\nAccessibilityEvent"])
    CHECK_TYPE{"event.eventType ==\nTYPE_WINDOW_STATE_CHANGED?"}
    IGNORE_EVENT(["Ignore event\nReturn immediately"])
    EXTRACT["Extract event.packageName"]
    READ_PREFS["Read SharedPreferences\n─────────────────────\nis_sleep_mode_active?\nblocked_apps set"]
    CHECK_ACTIVE{"is_sleep_mode_active\n== true?"}
    ALLOW(["App allowed\nRemove overlay if present"])
    CHECK_BLOCKED{"packageName ∈\nblocked_apps?"}
    SHOW_OVERLAY["Render full-screen overlay\n'This app can wait.\nInitiate Sleep Protocol now.'"]
    GO_HOME["performGlobalAction\n(GLOBAL_ACTION_HOME)\nForce user to home screen"]

    OS_EVENT --> CHECK_TYPE
    CHECK_TYPE -- No --> IGNORE_EVENT
    CHECK_TYPE -- Yes --> EXTRACT
    EXTRACT --> READ_PREFS
    READ_PREFS --> CHECK_ACTIVE
    CHECK_ACTIVE -- No --> ALLOW
    CHECK_ACTIVE -- Yes --> CHECK_BLOCKED
    CHECK_BLOCKED -- No --> ALLOW
    CHECK_BLOCKED -- Yes --> SHOW_OVERLAY
    SHOW_OVERLAY --> GO_HOME
```

---

## 5.3.3 Native Alarm Scheduling Flowchart

This flowchart traces the alarm lifecycle from the moment the JavaScript layer requests a wake-up to the point the Android OS physically wakes the device.

```mermaid
flowchart TD
    JS_CALL(["JS calls sleepBlocker.setAlarm(timestamp)"])
    BRIDGE["SleepBlockerModule.setAlarm()\nreceives timestamp as Double"]
    GET_AM["Get AlarmManager from\nContext.ALARM_SERVICE"]
    CREATE_PI["Create PendingIntent\n→ AlarmReceiver.class\nFLAG_UPDATE_CURRENT | FLAG_IMMUTABLE"]
    CHECK_SDK{"Build.VERSION.SDK_INT\n≥ M (API 23)?"}
    SET_IDLE["alarmManager\n.setExactAndAllowWhileIdle(\nRTC_WAKEUP, timestamp, PI)"]
    SET_EXACT["alarmManager\n.setExact(\nRTC_WAKEUP, timestamp, PI)"]
    SCHEDULED(["Alarm registered with OS\nPromise resolves true"])

    DOZE(["Device enters Doze mode\nJS thread suspended\n─────────────────────\nAlarmManager persists independently"])

    TRIGGER["OS triggers RTC_WAKEUP\nat scheduled timestamp"]
    RECEIVER["AlarmReceiver.onReceive()"]
    LAUNCH["Launch MainActivity\nwith trigger_alarm extra"]
    TOAST["Toast: 'Nidra Protocol:\nWake up call!'"]

    JS_CALL --> BRIDGE
    BRIDGE --> GET_AM
    GET_AM --> CREATE_PI
    CREATE_PI --> CHECK_SDK
    CHECK_SDK -- "≥ API 23" --> SET_IDLE
    CHECK_SDK -- "< API 23" --> SET_EXACT
    SET_IDLE --> SCHEDULED
    SET_EXACT --> SCHEDULED
    SCHEDULED --> DOZE
    DOZE -->|"Time reached"| TRIGGER
    TRIGGER --> RECEIVER
    RECEIVER --> LAUNCH
    RECEIVER --> TOAST
```

---

# 5.4 Algorithm

The core algorithmic logic of Project Nidra centers on the **Responsibility-Capped Alarm** computation—a deterministic function that resolves the tension between a user's desired sleep duration and their real-world obligations (represented by a preset alarm). This algorithm governs the session mode, snooze policy, and accumulated sleep debt for every session.

---

## 5.4.1 Responsibility-Capped Alarm Algorithm

### Problem Statement

Given a user who goes to bed at time `t_bed` with a desired sleep duration of `G` minutes and a preset default alarm at `t_default`, compute the actual alarm time `t_alarm` that satisfies:

> **t_alarm = min(t_ideal, t_default)**

Where `t_ideal = t_bed + G`. If the user went to bed too late to achieve their full sleep goal before their obligation alarm, the system must cap the alarm, switch to strict behavioral mode, and record the resulting sleep debt.

### Pseudocode

```
ALGORITHM: ComputeResponsibilityCappedAlarm
─────────────────────────────────────────────

INPUT:
    t_bed           ← Current bedtime (timestamp)
    G               ← Sleep goal (minutes)
    alarm_default   ← User's preset alarm (HH:MM AM/PM)

OUTPUT:
    t_alarm         ← Actual alarm time (timestamp)
    mode            ← 'forgiving' | 'strict'
    debt            ← Minutes of sleep debt added

BEGIN
    // Step 1: Compute the ideal wake-up time
    t_ideal ← t_bed + (G × 60 × 1000)     // milliseconds

    // Step 2: Resolve the next occurrence of the default alarm
    t_default ← BuildNextAlarmDate(t_bed, alarm_default)
        // If alarm_default time has already passed today,
        // advance to tomorrow

    // Step 3: Apply the responsibility cap
    IF t_ideal ≤ t_default THEN
        // User went to bed early enough
        t_alarm ← t_ideal
        mode    ← 'forgiving'
        debt    ← 0
    ELSE
        // User went to bed too late — cap at obligation
        t_alarm ← t_default
        mode    ← 'strict'
        debt    ← ROUND((t_ideal − t_default) / 60000)
    END IF

    RETURN { t_alarm, mode, debt }
END
```

### Snooze Policy Derivation

```
ALGORITHM: GetSnoozePolicy
─────────────────────────────────────────────

INPUT:
    mode ← 'forgiving' | 'strict'

OUTPUT:
    interval    ← Snooze duration (minutes)
    max_snoozes ← Maximum allowed snoozes

BEGIN
    IF mode = 'strict' THEN
        interval    ← 3
        max_snoozes ← 1
    ELSE
        interval    ← 10
        max_snoozes ← 99    // effectively unlimited
    END IF

    RETURN { interval, max_snoozes }
END
```

### Snooze Registration

```
ALGORITHM: RegisterSnooze
─────────────────────────────────────────────

INPUT:
    session ← Active SleepSession

OUTPUT:
    allowed     ← Boolean
    remaining   ← Snoozes left
    interval    ← Minutes snoozed

BEGIN
    IF session = NULL THEN
        RETURN { allowed: false, remaining: 0, interval: 0 }
    END IF

    next_used ← session.snoozesUsed + 1

    IF next_used > session.maxSnoozes THEN
        RETURN { allowed: false, remaining: 0, interval: session.interval }
    END IF

    // Advance the alarm by the snooze interval
    session.actualAlarmTime ← session.actualAlarmTime + (session.interval × 60 × 1000)
    session.snoozesUsed ← next_used
    remaining ← session.maxSnoozes − next_used

    RETURN { allowed: true, remaining, interval: session.interval }
END
```

---

## 5.4.2 Algorithm Complexity Analysis

| Algorithm | Time Complexity | Space Complexity | Notes |
|---|---|---|---|
| `ComputeResponsibilityCappedAlarm` | O(1) | O(1) | Pure arithmetic comparison; no iteration |
| `GetSnoozePolicy` | O(1) | O(1) | Single conditional branch |
| `RegisterSnooze` | O(1) | O(1) | In-place mutation of session state |
| `IsAppBlocked` (native) | O(1) amortized | O(n) | `HashSet.contains()` lookup against n blocked apps |
| `BuildNextAlarmDate` | O(1) | O(1) | Date arithmetic with single comparison |

All core algorithms execute in constant time, ensuring zero perceptible latency during user interactions and negligible CPU overhead during the event-driven blocking loop.
