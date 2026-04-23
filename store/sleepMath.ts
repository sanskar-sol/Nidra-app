export type SleepMode = 'forgiving' | 'strict';

export interface ClockTime {
  hour: string;
  minute: string;
  period: string;
}

export interface SleepComputationInput {
  bedtime: Date;
  sleepGoalMinutes: number;
  defaultAlarm: ClockTime;
}

export interface SleepComputationResult {
  idealWakeTime: Date;
  defaultAlarmTime: Date;
  actualAlarmTime: Date;
  mode: SleepMode;
  debtAddedMinutes: number;
}

const MINUTES_PER_DAY = 24 * 60;

export function toMinutesSinceMidnight(time: ClockTime): number {
  const rawHour = Number.parseInt(time.hour, 10);
  const minute = Number.parseInt(time.minute, 10);
  const normalizedHour = Number.isNaN(rawHour) ? 0 : rawHour % 12;
  const normalizedMinute = Number.isNaN(minute) ? 0 : Math.min(Math.max(minute, 0), 59);
  const isPm = (time.period || 'AM').toUpperCase() === 'PM';
  return normalizedHour * 60 + normalizedMinute + (isPm ? 12 * 60 : 0);
}

export function getSleepGoalMinutes(goalHours: string, goalMinutes: string): number {
  const hours = Number.parseInt(goalHours, 10) || 0;
  const minutes = Number.parseInt(goalMinutes, 10) || 0;
  return Math.max(0, (hours * 60) + minutes);
}

export function buildNextDefaultAlarmDate(now: Date, defaultAlarm: ClockTime): Date {
  const alarmMinutes = toMinutesSinceMidnight(defaultAlarm);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const candidate = new Date(today);
  candidate.setMinutes(alarmMinutes);

  // If bedtime is after the alarm clock time for today, alarm should be tomorrow.
  if (candidate <= now) {
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate;
}

export function computeResponsibilityCappedAlarm(
  input: SleepComputationInput,
): SleepComputationResult {
  const idealWakeTime = new Date(input.bedtime.getTime() + input.sleepGoalMinutes * 60 * 1000);
  const defaultAlarmTime = buildNextDefaultAlarmDate(input.bedtime, input.defaultAlarm);

  if (idealWakeTime <= defaultAlarmTime) {
    return {
      idealWakeTime,
      defaultAlarmTime,
      actualAlarmTime: idealWakeTime,
      mode: 'forgiving',
      debtAddedMinutes: 0,
    };
  }

  const debtAddedMinutes = Math.max(
    0,
    Math.round((idealWakeTime.getTime() - defaultAlarmTime.getTime()) / 60000),
  );

  return {
    idealWakeTime,
    defaultAlarmTime,
    actualAlarmTime: defaultAlarmTime,
    mode: 'strict',
    debtAddedMinutes,
  };
}

export function getSnoozePolicy(mode: SleepMode) {
  if (mode === 'strict') {
    return { intervalMinutes: 3, maxSnoozes: 1 };
  }
  return { intervalMinutes: 10, maxSnoozes: 99 };
}

export function getLatestBedtime(defaultAlarm: ClockTime, sleepGoalMinutes: number): ClockTime {
  const alarmMinutes = toMinutesSinceMidnight(defaultAlarm);
  const latestMinutes = (alarmMinutes - sleepGoalMinutes + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hour24 = Math.floor(latestMinutes / 60);
  const minute = latestMinutes % 60;
  const isPm = hour24 >= 12;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return {
    hour: String(hour12).padStart(2, '0'),
    minute: String(minute).padStart(2, '0'),
    period: isPm ? 'PM' : 'AM',
  };
}

export function getPointOfNoReturnTrigger(
  bedtimeReference: Date,
  defaultAlarm: ClockTime,
  sleepGoalMinutes: number,
): Date {
  const defaultAlarmDate = buildNextDefaultAlarmDate(bedtimeReference, defaultAlarm);
  const latestBedtimeTs = defaultAlarmDate.getTime() - sleepGoalMinutes * 60 * 1000;
  const triggerTs = latestBedtimeTs - 30 * 60 * 1000;
  return new Date(triggerTs);
}

export function isFriday(date: Date): boolean {
  return date.getDay() === 5;
}
