import { NativeModules, Platform } from 'react-native';

type SleepBlockerNativeModule = {
  startService: () => Promise<boolean>;
  stopService: () => Promise<boolean>;
  canDrawOverlays: () => Promise<boolean>;
  isAccessibilityServiceEnabled: () => Promise<boolean>;
  openOverlayPermissionSettings: () => void;
  openAccessibilitySettings: () => void;
  getInstalledApps: () => Promise<Array<{ packageName: string; appName: string }>>;
  updateBlockedApps: (packageNames: string[]) => void;
  setAlarm: (timestamp: number) => Promise<boolean>;
  cancelAlarm: () => Promise<boolean>;
  stopAlarmMedia: () => Promise<boolean>;
};

const nativeModule = NativeModules.SleepBlocker as SleepBlockerNativeModule | undefined;

const ensureAndroid = () => {
  if (Platform.OS !== 'android') {
    throw new Error('SleepBlocker is available only on Android.');
  }
  if (!nativeModule) {
    throw new Error('SleepBlocker native module is not linked.');
  }
  return nativeModule;
};

export const sleepBlocker = {
  start: () => ensureAndroid().startService(),
  stop: () => ensureAndroid().stopService(),
  canDrawOverlays: () => ensureAndroid().canDrawOverlays(),
  isAccessibilityServiceEnabled: () => ensureAndroid().isAccessibilityServiceEnabled(),
  openOverlayPermissionSettings: () => ensureAndroid().openOverlayPermissionSettings(),
  openAccessibilitySettings: () => ensureAndroid().openAccessibilitySettings(),
  getInstalledApps: () => ensureAndroid().getInstalledApps(),
  updateBlockedApps: (packageNames: string[]) => ensureAndroid().updateBlockedApps(packageNames),
  setAlarm: (timestamp: number) => ensureAndroid().setAlarm(timestamp),
  cancelAlarm: () => ensureAndroid().cancelAlarm(),
  stopAlarmMedia: () => ensureAndroid().stopAlarmMedia(),
};
