import { NativeModules, Platform } from 'react-native';

type SleepBlockerNativeModule = {
  startService: () => Promise<boolean>;
  stopService: () => Promise<boolean>;
  canDrawOverlays: () => Promise<boolean>;
  hasUsageAccess: () => Promise<boolean>;
  openOverlayPermissionSettings: () => void;
  openUsageAccessSettings: () => void;
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
  hasUsageAccess: () => ensureAndroid().hasUsageAccess(),
  openOverlayPermissionSettings: () => ensureAndroid().openOverlayPermissionSettings(),
  openUsageAccessSettings: () => ensureAndroid().openUsageAccessSettings(),
};
