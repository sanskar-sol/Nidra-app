import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_300Light, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Lora_400Regular, Lora_500Medium } from '@expo-google-fonts/lora';

// 1. Define your custom toast layouts
const toastConfig = {
  // Custom Success Toast
  success: (props: any) => (
    <View style={styles.toastCard}>
      <Ionicons name="checkmark-circle" size={28} color="#3b82f6" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{props.text1}</Text>
        {props.text2 ? <Text style={styles.subtitle}>{props.text2}</Text> : null}
      </View>
    </View>
  ),
  
  // Custom Error Toast
  error: (props: any) => (
    <View style={styles.toastCard}>
      <Ionicons name="alert-circle" size={28} color="#ff3b30" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{props.text1}</Text>
        {props.text2 ? <Text style={styles.subtitle}>{props.text2}</Text> : null}
      </View>
    </View>
  ),
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_600SemiBold,
    Lora_400Regular,
    Lora_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {/* 2. Pass the custom config to the Toast component */}
      <Toast config={toastConfig} />
    </>
  );
}

// 3. Apply your app's signature styling
const styles = StyleSheet.create({
  toastCard: {
    width: '90%',
    backgroundColor: '#1E1E1E', // Base dark background
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Matches your home screen cards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold', // Your bold font
    marginBottom: 2,
  },
  subtitle: {
    color: '#B0B0B0', // Your muted subtitle color
    fontSize: 14,
    fontFamily: 'Inter_400Regular', // Your regular font
  }
});
