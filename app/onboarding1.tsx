import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useFonts, Inter_400Regular, Inter_300Light } from '@expo-google-fonts/inter';
import { Lora_500Medium } from '@expo-google-fonts/lora';

export default function OnboardingStep1() {
  const router = useRouter();
  const [name, setName] = useState('');

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_300Light,
    Lora_500Medium
  });

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  const handleNext = () => {
    if (name.trim() === '') {
      alert("Please enter your name to continue.");
      return;
    }
    // In the future, you will save 'name' to your database or global state here
    router.push('/onboarding2'); 
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.subtitle}>Step 1 of 3</Text>
          <Text style={styles.title}>What should we call you?</Text>
          <Text style={styles.description}>
            We want your experience to feel personal and welcoming.
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
          autoFocus={true}
        />

        <Pressable 
          style={[styles.nextButton, name.trim() === '' ? styles.disabledButton : null]} 
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="black" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
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
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    color: 'white',
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    padding: 20,
    marginBottom: 40,
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