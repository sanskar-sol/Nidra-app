import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message'; // 1. Import Toast

import { useFonts, Inter_400Regular, Inter_300Light } from '@expo-google-fonts/inter';
import { Lora_500Medium } from '@expo-google-fonts/lora';

export default function OnboardingStep2() {
  const router = useRouter();
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [period, setPeriod] = useState('AM');

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_300Light,
    Lora_500Medium
  });

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  // Handle input to ensure only numbers are typed
  const handleHourChange = (text: string) => {
    setHour(text.replace(/[^0-9]/g, ''));
  };

  const handleMinuteChange = (text: string) => {
    setMinute(text.replace(/[^0-9]/g, ''));
  };

  const handleNext = () => {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);

    // 2. Replace Alert with error Toast for Hour
    if (!hour || isNaN(h) || h < 1 || h > 12) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Hour',
        text2: 'Please enter a valid hour between 1 and 12.',
        position: 'top',
      });
      return;
    }
    
    // 3. Replace Alert with error Toast for Minute
    if (!minute || isNaN(m) || m < 0 || m > 59) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Minutes',
        text2: 'Please enter valid minutes between 00 and 59.',
        position: 'top',
      });
      return;
    }

    // Format minute to always show two digits in the message (e.g. '05' instead of '5')
    const formattedMinute = m < 10 && minute.length === 1 ? `0${m}` : minute;

    // 4. Personalized logic based on the chosen time
    let toastTitle = "Time Set!";
    let toastMessage = `We'll aim for ${h}:${formattedMinute} ${period}.`;

    if (period === 'AM') {
      if (h === 12 || h < 5) {
        toastTitle = "Whoa, early riser! 🦉";
        toastMessage = "That is seriously early. We'll make sure you're rested.";
      } else if (h >= 5 && h <= 6) {
        toastTitle = "Impressive! 🌅";
        toastMessage = "Getting a head start on the day. Love the discipline!";
      } else if (h >= 7 && h <= 9) {
        toastTitle = "Classic routine ☕";
        toastMessage = "A solid, standard start to your morning.";
      } else if (h >= 10 && h <= 11) {
        toastTitle = "Taking it easy ☀️";
        toastMessage = "Enjoying that extra bit of rest, I see you.";
      }
    } else { // PM
      toastTitle = "Night owl vibes 🌙";
      toastMessage = "We'll optimize your sleep for a later schedule.";
    }

    // 5. Show the personalized success Toast
    Toast.show({
      type: 'success',
      text1: toastTitle,
      text2: toastMessage,
      position: 'top',
    });

    // 6. Delay navigation slightly so they can read the fun message
    setTimeout(() => {
      router.push('/onboarding3'); 
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </Pressable>

          <View style={styles.textContainer}>
            <Text style={styles.subtitle}>Step 2 of 3</Text>
            <Text style={styles.title}>When do you need to wake up?</Text>
            <Text style={styles.description}>
              We'll use this to set your next alarm and calculate your optimal sleep window.
            </Text>
          </View>

          <View style={styles.timeInputContainer}>
            <TextInput
              style={styles.timeInput}
              placeholder="06"
              placeholderTextColor="#444"
              keyboardType="number-pad"
              maxLength={2}
              value={hour}
              onChangeText={handleHourChange}
              textAlign="center"
            />
            <Text style={styles.colon}>:</Text>
            <TextInput
              style={styles.timeInput}
              placeholder="30"
              placeholderTextColor="#444"
              keyboardType="number-pad"
              maxLength={2}
              value={minute}
              onChangeText={handleMinuteChange}
              textAlign="center"
            />
            
            <View style={styles.periodToggle}>
              <Pressable 
                style={[styles.periodButton, period === 'AM' && styles.periodButtonActive]}
                onPress={() => setPeriod('AM')}
              >
                <Text style={[styles.periodText, period === 'AM' && styles.periodTextActive]}>AM</Text>
              </Pressable>
              <Pressable 
                style={[styles.periodButton, period === 'PM' && styles.periodButtonActive]}
                onPress={() => setPeriod('PM')}
              >
                <Text style={[styles.periodText, period === 'PM' && styles.periodTextActive]}>PM</Text>
              </Pressable>
            </View>
          </View>

          <Pressable 
            style={[styles.nextButton, (!hour || !minute) ? styles.disabledButton : null]} 
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="black" />
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    paddingVertical: 80, 
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  textContainer: {
    marginBottom: 40,
  },
  subtitle: {
    color: '#B0B0B0',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    color: 'white',
    fontFamily: 'Lora_500Medium',
    fontSize: 32,
    marginBottom: 12,
  },
  description: {
    color: '#808080',
    fontFamily: 'Inter_300Light',
    fontSize: 16,
    lineHeight: 24,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  timeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    color: 'white',
    fontFamily: 'Inter_400Regular',
    fontSize: 40,
    width: 80,
    height: 90,
  },
  colon: {
    color: 'white',
    fontSize: 40,
    fontFamily: 'Inter_300Light',
    marginHorizontal: 15,
    paddingBottom: 10,
  },
  periodToggle: {
    marginLeft: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  periodButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  periodButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  periodText: {
    color: '#666',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  periodTextActive: {
    color: 'white',
    fontFamily: 'Inter_400Regular',
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: 'black',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: '600',
  }
});