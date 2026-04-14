import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';

// Imports for Inter and Lora fonts [cite: 5, 6]
import { 
  useFonts, 
  Inter_300Light, 
  Inter_400Regular, 
  Inter_600SemiBold 
} from '@expo-google-fonts/inter';
import { 
  Lora_400Regular,
  Lora_500Medium
} from '@expo-google-fonts/lora';

const { height } = Dimensions.get('window');

export default function Home() {
  const router = useRouter(); // [cite: 7, 164]

  // Load fonts for consistent UI feel [cite: 7, 162]
  let [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_600SemiBold,
    Lora_400Regular,
    Lora_500Medium
  });

  // Time state for the live clock [cite: 8]
  const [time, setTime] = useState(dayjs());

  // Variables for Next Alarm and Sleep Goal [cite: 9, 10]
  const [nextAlarm] = useState({ time: '6:56', period: 'am' });
  const [sleepGoal] = useState({ hours: '6', minutes: '57' });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs()); // Updates time every second [cite: 10]
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!fontsLoaded) {
    return <View style={styles.container} />; 
  }

  // Logic to determine the greeting and emoji based on the current hour [cite: 12, 172, 173]
  const currentHour = time.hour(); 
  let greetingMessage = "Good evening 🌆";

  if (currentHour >= 5 && currentHour < 12) {
    greetingMessage = "Good morning 🌅";
  } else if (currentHour >= 12 && currentHour < 17) {
    greetingMessage = "Good afternoon ☀️";
  } else if (currentHour >= 17 && currentHour < 21) {
    greetingMessage = "Good evening 🌆";
  } else {
    greetingMessage = "Good night 🌙";
  }

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

        {/* Dynamic greeting with simple emojis [cite: 18, 203, 204] */}
        <Text style={styles.greeting}>{greetingMessage}, San</Text>

        <View style={styles.clockContainer}>
          <View style={styles.clockRow}>
            <Text style={styles.mainClockText}>
              {time.format('h:mm')}
            </Text>
            <Text style={styles.ampmText}>
              {time.format('A')} 
            </Text>
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

        {/* Re-directed to /sleepmode1  */}
        <Pressable 
          style={styles.actionCard} 
          onPress={() => router.push('/sleepmode1')}
        >
          <View style={styles.actionCardContent}>
            <Text style={styles.actionCardSubtitle}>Initiate Protocol</Text>
            <Text style={styles.actionCardTitle}>Start Sleep Mode</Text>
          </View>
          <View style={styles.actionButton}>
            <Ionicons name="arrow-forward" size={24} color="white" />
          </View>
        </Pressable>

        <View style={{height: 60}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Solid dark background [cite: 22]
  },
  scrollView: {
    flex: 1, 
  },
  contentContainer: {
    flexGrow: 1,
    minHeight: height,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 40 : 70, 
    paddingBottom: 40, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold', 
    color: 'white',
  },
  greeting: {
    fontSize: 28,
    color: 'white',
    fontFamily: 'Lora_400Regular', // Lora font for greeting [cite: 23]
    marginBottom: 10,
  },
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  clockRow: {
    flexDirection: 'row',
    alignItems: 'baseline', 
  },
  mainClockText: {
    fontSize: 100,
    color: 'white',
    fontFamily: 'Inter_300Light', 
    letterSpacing: 1,
  },
  ampmText: {
    fontSize: 24,
    color: 'white',
    fontFamily: 'Inter_300Light', 
    marginLeft: 8, 
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cardHalf: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  cardSubtitle: {
    color: '#B0B0B0',
    fontSize: 13,
    fontFamily: 'Inter_400Regular', 
    marginBottom: 8,
  },
  timeValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardValueLarge: {
    color: 'white',
    fontSize: 30,
    fontFamily: 'Inter_400Regular', 
  },
  cardValueSmall: {
    color: '#B0B0B0',
    fontSize: 15,
    fontFamily: 'Inter_400Regular', 
    marginLeft: 4,
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
  actionCardContent: {
    flex: 1,
  },
  actionCardSubtitle: {
    color: '#C0C0C0',
    fontSize: 16,
    fontFamily: 'Inter_400Regular', 
    marginBottom: 6,
  },
  actionCardTitle: {
    color: 'white',
    fontSize: 28,
    fontFamily: 'Lora_500Medium', 
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  }
});