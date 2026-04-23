import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useStore } from '../store/useStore';
import { getLatestBedtime, isFriday } from '../store/sleepMath';

// Victory Native (Skia-based)
import { CartesianChart, Line, Area } from "victory-native";
import { Circle, LinearGradient, vec } from "@shopify/react-native-skia";

const { height } = Dimensions.get('window');

const SLEEP_DATA = [
  { day: 0, hours: 6.5 },
  { day: 1, hours: 7.2 },
  { day: 2, hours: 5.8 },
  { day: 3, hours: 8.0 },
  { day: 4, hours: 7.0 },
  { day: 5, hours: 6.9 },
  { day: 6, hours: 7.5 },
];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CHART_GREEN = "#22c55e";

export default function Home() {
  const router = useRouter(); 
  const user = useStore((state) => state.user);
  const sleepGoals = useStore((state) => state.sleepGoals);
  const sleepDebtMinutes = useStore((state) => state.sleepDebtMinutes);
  const startSleepMode = useStore((state) => state.startSleepMode);
  const pointOfNoReturnTriggerISO = useStore((state) => state.pointOfNoReturnTriggerISO);

  const [time, setTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = time.hour(); 
  let greetingMessage = "Good evening 🌆";
  if (currentHour >= 5 && currentHour < 12)  greetingMessage = "Good morning 🌅";
  else if (currentHour >= 12 && currentHour < 17) greetingMessage = "Good afternoon ☀️";
  else if (currentHour >= 17 && currentHour < 21) greetingMessage = "Good evening 🌆";
  else greetingMessage = "Good night 🌙";

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Sleeper';
  const nextAlarm = {
    time: `${sleepGoals.wakeUpHour}:${sleepGoals.wakeUpMinute}`,
    period: sleepGoals.wakeUpPeriod.toLowerCase(),
  };
  const sleepGoal = {
    hours: sleepGoals.goalHours,
    minutes: sleepGoals.goalMinutes,
  };
  const latestBedtime = getLatestBedtime(
    {
      hour: sleepGoals.wakeUpHour,
      minute: sleepGoals.wakeUpMinute,
      period: sleepGoals.wakeUpPeriod,
    },
    (Number.parseInt(sleepGoals.goalHours, 10) || 0) * 60 + (Number.parseInt(sleepGoals.goalMinutes, 10) || 0),
  );

  const showPointOfNoReturnNotice = (() => {
    if (!pointOfNoReturnTriggerISO) return false;
    const triggerTs = Date.parse(pointOfNoReturnTriggerISO);
    if (Number.isNaN(triggerTs)) return false;
    const nowTs = Date.now();
    return nowTs >= triggerTs && nowTs <= triggerTs + 30 * 60 * 1000;
  })();

  const handleStartSleepMode = () => {
    const session = startSleepMode();
    const isStrict = session.mode === 'strict';
    Toast.show({
      type: isStrict ? 'error' : 'success',
      text1: isStrict ? 'Strict Wake Window Applied' : 'Full Sleep Window Available',
      text2: `Alarm set for ${dayjs(session.actualAlarmTimeISO).format('h:mm A')}.`,
      position: 'top',
    });
    router.push('/sleepmode1');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
        bounces={false} 
      >
        <View style={styles.header}>
          <Text style={styles.title}>निद्रा</Text>
          <Pressable onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={30} color="white" />
          </Pressable>
        </View>

        <Text style={styles.greeting}>{greetingMessage}, {displayName}</Text>

        <View style={styles.clockContainer}>
          <View style={styles.clockRow}>
            <Text style={styles.mainClockText}>{time.format('h:mm')}</Text>
            <Text style={styles.ampmText}>{time.format('A')}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.cardHalf}>
            <Text style={styles.cardSubtitle}>Next Alarm</Text>
            <View style={styles.timeValueRow}>
              <Text style={styles.cardValueLarge}>{nextAlarm.time}</Text>
              <Text style={styles.cardValueSmall}>{nextAlarm.period}</Text>
            </View>
          </View>
          <View style={styles.cardHalf}>
            <Text style={styles.cardSubtitle}>Goal</Text>
            <View style={styles.timeValueRow}>
              <Text style={styles.cardValueLarge}>{sleepGoal.hours}</Text>
              <Text style={styles.cardValueSmall}>hrs</Text>
              <Text style={[styles.cardValueLarge, { marginLeft: 8 }]}>{sleepGoal.minutes}</Text>
              <Text style={styles.cardValueSmall}>min</Text>
            </View>
          </View>
        </View>

        {showPointOfNoReturnNotice && (
          <View style={styles.noticeCard}>
            <Ionicons name="alert-circle" size={20} color="#facc15" />
            <Text style={styles.noticeText}>
              You have 30 minutes to go to sleep if you want to hit your full goal tomorrow.
            </Text>
          </View>
        )}

        {isFriday(new Date()) && sleepDebtMinutes > 0 && (
          <View style={styles.noticeCard}>
            <Ionicons name="moon" size={20} color="#93c5fd" />
            <Text style={styles.noticeText}>
              Friday recovery tip: sleep debt is {sleepDebtMinutes} min. Try going to bed earlier tonight.
            </Text>
          </View>
        )}

        <View style={styles.noticeCard}>
          <Ionicons name="time" size={20} color="#a7f3d0" />
          <Text style={styles.noticeText}>
            Latest full-goal bedtime: {latestBedtime.hour}:{latestBedtime.minute} {latestBedtime.period}
          </Text>
        </View>

        {/* ── SLEEP ACTIVITY GRAPH ── */}
        <View style={styles.graphCard}>
          <View style={styles.graphHeader}>
            <Text style={styles.graphTitle}>Weekly Insights</Text>
            <Text style={styles.graphStats}>Avg: 7.1 hrs</Text>
          </View>

          <View style={{ height: 160 }}>
            <CartesianChart
              data={SLEEP_DATA}
              xKey="day"
              yKeys={["hours"]}
              domain={{ y: [0, 10] }}
              domainPadding={{ left: 16, right: 16, top: 24, bottom: 4 }}
              axisOptions={{
                lineColor: "rgba(255,255,255,0.06)",
                labelColor: { x: "transparent", y: "rgba(176,176,176,0.5)" },
                tickCount: { x: 7, y: 4 },
                labelOffset: { x: 0, y: 8 },
                axisSide: { x: "bottom", y: "left" },
              }}
            >
            {({ points, chartBounds }) => (
              <>
                {/* Gradient area fill */}
                <Area
                  points={points.hours}
                  y0={chartBounds.bottom}
                  animate={{ type: "timing", duration: 500 }}
                  curveType="natural"
                >
                  <LinearGradient
                    start={vec(0, chartBounds.top)}
                    end={vec(0, chartBounds.bottom)}
                    colors={["rgba(34, 197, 94, 0.22)", "rgba(34, 197, 94, 0.0)"]}
                  />
                </Area>

                {/* Main line */}
                <Line
                  points={points.hours}
                  color={CHART_GREEN}
                  strokeWidth={2.5}
                  animate={{ type: "timing", duration: 500 }}
                  curveType="natural"
                />

                {/* Dots */}
                {points.hours.map((p, i) => (
                  <Circle
                    key={i}
                    cx={p.x}
                    cy={p.y ?? 0}
                    r={4.5}
                    color={CHART_GREEN}
                  />
                ))}

                {/* Inner dot (white fill = ring effect) */}
                {points.hours.map((p, i) => (
                  <Circle
                    key={`inner-${i}`}
                    cx={p.x}
                    cy={p.y ?? 0}
                    r={2}
                    color="rgba(255,255,255,0.9)"
                  />
                ))}
              </>
            )}
          </CartesianChart>
          </View>

          {/* Custom x-axis labels */}
          <View style={styles.xLabels}>
            {DAY_LABELS.map((label) => (
              <Text key={label} style={styles.xLabel}>{label}</Text>
            ))}
          </View>
        </View>

        <Pressable 
          style={styles.actionCard} 
          onPress={handleStartSleepMode}
        >
          <View style={styles.actionCardContent}>
            <Text style={styles.actionCardSubtitle}>Initiate Protocol</Text>
            <Text style={styles.actionCardTitle}>Start Sleep Mode</Text>
          </View>
          <View style={styles.actionButton}>
            <Ionicons name="arrow-forward" size={24} color="white" />
          </View>
        </Pressable>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E' },
  scrollView: { flex: 1 },
  contentContainer: {
    flexGrow: 1,
    minHeight: height,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 40 : 70,
    paddingBottom: 40,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontFamily: 'Inter_600SemiBold', color: 'white' },
  greeting: { fontSize: 28, color: 'white', fontFamily: 'Lora_400Regular', marginBottom: 10 },
  clockContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 30 },
  clockRow: { flexDirection: 'row', alignItems: 'baseline' },
  mainClockText: { fontSize: 100, color: 'white', fontFamily: 'Inter_300Light', letterSpacing: 1 },
  ampmText: { fontSize: 24, color: 'white', fontFamily: 'Inter_300Light', marginLeft: 8 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  cardHalf: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  cardSubtitle: { color: '#B0B0B0', fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 8 },
  timeValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  cardValueLarge: { color: 'white', fontSize: 30, fontFamily: 'Inter_400Regular' },
  cardValueSmall: { color: '#B0B0B0', fontSize: 15, fontFamily: 'Inter_400Regular', marginLeft: 4 },

  graphCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    paddingBottom: 14,
    marginBottom: 16,
  },
  graphHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  graphTitle: { color: 'white', fontSize: 18, fontFamily: 'Lora_500Medium' },
  graphStats: { color: CHART_GREEN, fontSize: 14, fontFamily: 'Inter_400Regular' },

  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  xLabel: {
    color: 'rgba(176, 176, 176, 0.6)',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    flex: 1,
  },

  actionCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCardContent: { flex: 1 },
  actionCardSubtitle: { color: '#C0C0C0', fontSize: 16, fontFamily: 'Inter_400Regular', marginBottom: 6 },
  actionCardTitle: { color: 'white', fontSize: 28, fontFamily: 'Lora_500Medium' },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  noticeText: {
    color: '#D4D4D4',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
});
