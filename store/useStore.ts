import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import { secureStorage } from './secureStorage';
import { sleepBlocker } from './sleepBlocker';
import {
  ClockTime,
  SleepMode,
  buildNextDefaultAlarmDate,
  computeResponsibilityCappedAlarm,
  getPointOfNoReturnTrigger,
  getSleepGoalMinutes,
  getSnoozePolicy,
} from './sleepMath';

interface User {
  name: string;
  email: string;
}

interface SleepGoals {
  wakeUpHour: string;
  wakeUpMinute: string;
  wakeUpPeriod: string; // 'AM' | 'PM'
  goalHours: string;
  goalMinutes: string;
}

interface Preferences {
  notifications: boolean;
  strictMode: boolean;
  sound: boolean;
  vibration: boolean;
}

interface SleepSession {
  bedtimeISO: string;
  idealWakeTimeISO: string;
  actualAlarmTimeISO: string;
  defaultAlarmTimeISO: string;
  mode: SleepMode;
  snoozeIntervalMinutes: number;
  maxSnoozes: number;
  snoozesUsed: number;
}

export interface StoreState {
  user: User | null;
  sleepGoals: SleepGoals;
  sleepGoalMinutes: number;
  defaultAlarm: ClockTime;
  blockedApps: string[];
  sleepDebtMinutes: number;
  latestBedtimeAlertISO: string | null;
  pointOfNoReturnTriggerISO: string | null;
  activeSleepSession: SleepSession | null;
  preferences: Preferences;
  
  loginUser: (email: string) => void;
  updateUser: (data: Partial<User>) => void;
  setWakeUpTime: (hour: string, minute: string, period: string) => void;
  setSleepGoal: (hours: string, minutes: string) => void;
  toggleAppBlock: (appId: string) => void;
  startSleepMode: (bedtime?: Date) => SleepSession;
  registerSnooze: () => { allowed: boolean; intervalMinutes: number; remaining: number };
  clearSleepSession: () => void;
  reduceSleepDebt: (minutes: number) => void;
  updatePreferences: (data: Partial<Preferences>) => void;
  logoutUser: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      sleepGoals: {
        wakeUpHour: '06',
        wakeUpMinute: '30',
        wakeUpPeriod: 'AM',
        goalHours: '8',
        goalMinutes: '00',
      },
      sleepGoalMinutes: 8 * 60,
      defaultAlarm: {
        hour: '06',
        minute: '30',
        period: 'AM',
      },
      blockedApps: [],
      sleepDebtMinutes: 0,
      latestBedtimeAlertISO: new Date(
        buildNextDefaultAlarmDate(new Date(), { hour: '06', minute: '30', period: 'AM' }).getTime() -
          8 * 60 * 60 * 1000,
      ).toISOString(),
      pointOfNoReturnTriggerISO: getPointOfNoReturnTrigger(
        new Date(),
        { hour: '06', minute: '30', period: 'AM' },
        8 * 60,
      ).toISOString(),
      activeSleepSession: null,
      preferences: {
        notifications: true,
        strictMode: false,
        sound: true,
        vibration: true,
      },

      loginUser: (email) => set({ user: { email, name: '' } }),
      
      updateUser: (data) => set((state) => ({ 
        user: state.user 
          ? { ...state.user, ...data } 
          : { name: data.name || '', email: data.email || '', ...data } as User
      })),
      
      setWakeUpTime: (hour, minute, period) => set((state) => {
        const defaultAlarm = { hour, minute, period };
        const pointOfNoReturnTriggerISO = getPointOfNoReturnTrigger(
          new Date(),
          defaultAlarm,
          state.sleepGoalMinutes,
        ).toISOString();
        const latestBedtimeAlertISO = new Date(
          buildNextDefaultAlarmDate(new Date(), defaultAlarm).getTime() - state.sleepGoalMinutes * 60 * 1000,
        ).toISOString();

        return {
          sleepGoals: { ...state.sleepGoals, wakeUpHour: hour, wakeUpMinute: minute, wakeUpPeriod: period },
          defaultAlarm,
          latestBedtimeAlertISO,
          pointOfNoReturnTriggerISO,
        };
      }),
      
      setSleepGoal: (hours, minutes) => set((state) => {
        const sleepGoalMinutes = getSleepGoalMinutes(hours, minutes);
        const pointOfNoReturnTriggerISO = getPointOfNoReturnTrigger(
          new Date(),
          state.defaultAlarm,
          sleepGoalMinutes,
        ).toISOString();
        const latestBedtimeAlertISO = new Date(
          buildNextDefaultAlarmDate(new Date(), state.defaultAlarm).getTime() - sleepGoalMinutes * 60 * 1000,
        ).toISOString();

        return {
          sleepGoals: { ...state.sleepGoals, goalHours: hours, goalMinutes: minutes },
          sleepGoalMinutes,
          latestBedtimeAlertISO,
          pointOfNoReturnTriggerISO,
        };
      }),

      toggleAppBlock: (appId) =>
        set((state) => {
          const exists = state.blockedApps.includes(appId);
          const newBlockedApps = exists
            ? state.blockedApps.filter((id) => id !== appId)
            : [...state.blockedApps, appId];
            
          if (Platform.OS === 'android') {
            try {
              sleepBlocker.updateBlockedApps(newBlockedApps);
            } catch (error) {
              console.error('Failed to sync native blocker', error);
            }
          }
            
          return { blockedApps: newBlockedApps };
        }),

      startSleepMode: (bedtime = new Date()) => {
        const state = get();
        const result = computeResponsibilityCappedAlarm({
          bedtime,
          sleepGoalMinutes: state.sleepGoalMinutes,
          defaultAlarm: state.defaultAlarm,
        });
        const policy = getSnoozePolicy(result.mode);
        const latestBedtime = new Date(result.defaultAlarmTime.getTime() - state.sleepGoalMinutes * 60 * 1000);
        const latestBedtimeAlertISO = latestBedtime.toISOString();
        const pointOfNoReturnTriggerISO = new Date(latestBedtime.getTime() - 30 * 60 * 1000).toISOString();

        const session: SleepSession = {
          bedtimeISO: bedtime.toISOString(),
          idealWakeTimeISO: result.idealWakeTime.toISOString(),
          actualAlarmTimeISO: result.actualAlarmTime.toISOString(),
          defaultAlarmTimeISO: result.defaultAlarmTime.toISOString(),
          mode: result.mode,
          snoozeIntervalMinutes: policy.intervalMinutes,
          maxSnoozes: policy.maxSnoozes,
          snoozesUsed: 0,
        };

        if (Platform.OS === 'android') {
          try {
            sleepBlocker.setAlarm(result.actualAlarmTime.getTime());
          } catch (error) {
            console.error('Failed to schedule native alarm', error);
          }
        }

        set((prev) => ({
          activeSleepSession: session,
          sleepDebtMinutes: prev.sleepDebtMinutes + result.debtAddedMinutes,
          latestBedtimeAlertISO,
          pointOfNoReturnTriggerISO,
        }));

        return session;
      },

      registerSnooze: () => {
        const session = get().activeSleepSession;
        if (!session) {
          return { allowed: false, intervalMinutes: 0, remaining: 0 };
        }

        const nextUsed = session.snoozesUsed + 1;
        const allowed = nextUsed <= session.maxSnoozes;
        if (!allowed) {
          return {
            allowed: false,
            intervalMinutes: session.snoozeIntervalMinutes,
            remaining: 0,
          };
        }

        const nextAlarm = new Date(Date.parse(session.actualAlarmTimeISO));
        nextAlarm.setMinutes(nextAlarm.getMinutes() + session.snoozeIntervalMinutes);
        const remaining = Math.max(0, session.maxSnoozes - nextUsed);

        set({
          activeSleepSession: {
            ...session,
            snoozesUsed: nextUsed,
            actualAlarmTimeISO: nextAlarm.toISOString(),
          },
        });

        return {
          allowed: true,
          intervalMinutes: session.snoozeIntervalMinutes,
          remaining,
        };
      },

      clearSleepSession: () => {
        if (Platform.OS === 'android') {
          sleepBlocker.stop().catch(console.error);
          sleepBlocker.cancelAlarm().catch(console.error);
        }
        set({ activeSleepSession: null, latestBedtimeAlertISO: null, pointOfNoReturnTriggerISO: null });
      },

      reduceSleepDebt: (minutes) =>
        set((state) => ({ sleepDebtMinutes: Math.max(0, state.sleepDebtMinutes - Math.max(0, minutes)) })),
      
      updatePreferences: (data) => set((state) => ({ 
        preferences: { ...state.preferences, ...data } 
      })),
      
      // As requested regarding device preferences, restrict logout purging strictly to user fields.
      logoutUser: () => set({ user: null }), 
    }),
    {
      name: 'nidra-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
