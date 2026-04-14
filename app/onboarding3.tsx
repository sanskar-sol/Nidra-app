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

export default function OnboardingStep3() {
  const router = useRouter();
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');

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
    setHours(text.replace(/[^0-9]/g, ''));
  };

  const handleMinuteChange = (text: string) => {
    setMinutes(text.replace(/[^0-9]/g, ''));
  };

  const handleFinish = () => {
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    // 2. Error Toast for Hours
    if (!hours || isNaN(h) || h < 1 || h > 24) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Goal',
        text2: 'Please enter a valid number of hours (1-24).',
        position: 'top',
      });
      return;
    }
    
    // 3. Error Toast for Minutes
    if (!minutes || isNaN(m) || m < 0 || m > 59) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Goal',
        text2: 'Please enter valid minutes between 00 and 59.',
        position: 'top',
      });
      return;
    }

    // Format minutes to ensure two digits in the message (e.g. '00')
    const formattedMinute = m < 10 && minutes.length === 1 ? `0${m}` : minutes;

    // 4. Personalized feedback based on their sleep goal
    let toastTitle = "Setup Complete!";
    let toastMessage = `Aiming for ${h} hrs and ${formattedMinute} min.`;

    if (h < 6) {
        toastTitle = "Ambitious goal! ⚡";
        toastMessage = "Make sure to listen to your body if you need more rest.";
    } else if (h >= 6 && h <= 7) {
        toastTitle = "Solid target 🎯";
        toastMessage = "Consistency is the key to waking up refreshed.";
    } else if (h === 8) {
        toastTitle = "The sweet spot 🏆";
        toastMessage = "8 hours is the gold standard for recovery.";
    } else if (h > 8) {
        toastTitle = "Recovery mode 🛌";
        toastMessage = "Love the commitment to deep rest and recovery!";
    }

    // 5. Success Toast
    Toast.show({
        type: 'success',
        text1: toastTitle,
        text2: toastMessage,
        position: 'top',
    });

    // In the future, save the sleep goal to your database or global state here
    
    // 6. Delay the redirect so they can read the confirmation
    setTimeout(() => {
        router.replace('/home'); 
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
            <Text style={styles.subtitle}>Step 3 of 3</Text>
            <Text style={styles.title}>What is your sleep goal?</Text>
            <Text style={styles.description}>
              Tell us how much rest you want to get each night. We will track your progress to help you build healthier habits.
            </Text>
          </View>

          <View style={styles.durationInputContainer}>
            <TextInput
              style={styles.timeInput}
              placeholder="08"
              placeholderTextColor="#444"
              keyboardType="number-pad"
              maxLength={2}
              value={hours}
              onChangeText={handleHourChange}
              textAlign="center"
            />
            <Text style={styles.unitText}>hrs</Text>

            <TextInput
              style={styles.timeInput}
              placeholder="00"
              placeholderTextColor="#444"
              keyboardType="number-pad"
              maxLength={2}
              value={minutes}
              onChangeText={handleMinuteChange}
              textAlign="center"
            />
            <Text style={styles.unitText}>min</Text>
          </View>

          <Pressable 
            style={[styles.finishButton, (!hours || !minutes) ? styles.disabledButton : null]} 
            onPress={handleFinish}
          >
            <Text style={styles.finishButtonText}>Finish Setup</Text>
            <Ionicons name="checkmark-circle" size={22} color="black" />
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
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
  unitText: {
    color: '#808080',
    fontFamily: 'Inter_300Light',
    fontSize: 20,
    marginHorizontal: 12,
    paddingBottom: 15,
  },
  finishButton: {
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
  finishButtonText: {
    color: 'black',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: '600',
  }
});