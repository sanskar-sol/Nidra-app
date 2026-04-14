import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, Dimensions, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

// 1. Import Inter and Lora fonts with their specific weights
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
const MOON_IMAGE_URL = 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?q=80&w=1968&auto=format&fit=crop';

export default function Home() {
  // 2. Load all the fonts
  let [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_600SemiBold,
    Lora_400Regular,
    Lora_500Medium
  });

  const [time, setTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!fontsLoaded) {
    return <View style={styles.container} />; 
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.backgroundContainer}>
        <Image 
          source={{ uri: MOON_IMAGE_URL }} 
          style={styles.moonImage}
          resizeMode="cover"
        />
        <View style={styles.darkOverlay} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
        bounces={false} 
      >
        
        <View style={styles.header}>
          <Text style={styles.title}>निद्रा</Text>
          <Pressable>
            <Ionicons name="settings-outline" size={30} color="white" />
          </Pressable>
        </View>

        {/* Lora applied here */}
        <Text style={styles.greeting}>Good evening , San</Text>

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
              <Text style={styles.cardValueLarge}>6:56</Text>
              <Text style={styles.cardValueSmall}>am</Text>
            </View>
          </View>
          <View style={styles.cardHalf}>
            <Text style={styles.cardSubtitle}>Goal</Text>
            <View style={styles.timeValueRow}>
              <Text style={styles.cardValueLarge}>6</Text>
              <Text style={styles.cardValueSmall}>hrs</Text>
              <Text style={[styles.cardValueLarge, { marginLeft: 8 }]}>57</Text>
              <Text style={styles.cardValueSmall}>min</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.actionCard}>
          <View style={styles.actionCardContent}>
            <Text style={styles.actionCardSubtitle}>Initiate Protocol</Text>
            {/* Lora applied here */}
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
    backgroundColor: '#1E1E1E',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: height * 0.55,
  },
  moonImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 30, 30, 0.4)',
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
    fontFamily: 'Inter_600SemiBold', // Replaced fontWeight with Inter
    color: 'white',
  },
  greeting: {
    fontSize: 28,
    color: 'white',
    fontFamily: 'Lora_400Regular', // Applied Lora
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
    fontFamily: 'Inter_300Light', // Applied Inter Light
    letterSpacing: 1,
  },
  ampmText: {
    fontSize: 24,
    color: 'white',
    fontFamily: 'Inter_300Light', // Applied Inter Light
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
    fontFamily: 'Inter_400Regular', // Applied Inter
    marginBottom: 8,
  },
  timeValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardValueLarge: {
    color: 'white',
    fontSize: 30,
    fontFamily: 'Inter_400Regular', // Applied Inter
  },
  cardValueSmall: {
    color: '#B0B0B0',
    fontSize: 15,
    fontFamily: 'Inter_400Regular', // Applied Inter
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
    fontFamily: 'Inter_400Regular', // Applied Inter
    marginBottom: 6,
  },
  actionCardTitle: {
    color: 'white',
    fontSize: 28,
    fontFamily: 'Lora_500Medium', // Applied Lora (Medium weight for better button hierarchy)
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