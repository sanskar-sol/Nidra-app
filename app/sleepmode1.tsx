import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import Toast from 'react-native-toast-message';
import { useStore } from '../store/useStore';

const { width } = Dimensions.get('window');

export default function SleepMode() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const activeSleepSession = useStore((state) => state.activeSleepSession);
  const registerSnooze = useStore((state) => state.registerSnooze);
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Sleeper';
  const snoozeModeLabel = activeSleepSession?.mode === 'strict' ? 'Strict snooze: 3 min, one use' : 'Forgiving snooze: 10 min';

  const handleSnooze = () => {
    const result = registerSnooze();
    if (!result.allowed) {
      Toast.show({
        type: 'error',
        text1: 'Snooze Locked',
        text2: 'No snoozes left in strict responsibility mode.',
        position: 'top',
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: `Snoozed ${result.intervalMinutes} min`,
      text2: `Remaining snoozes: ${result.remaining}.`,
      position: 'top',
    });
  };

  return (
    <View style={styles.container}>
      {/* Making the status bar invisible for total immersion  */}
      <StatusBar hidden />

      <View style={styles.content}>
        {/* Top Exit Button - Subtle so it doesn't distract */}
        <Pressable 
          style={styles.closeButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="close-outline" size={32} color="rgba(255,255,255,0.3)" />
        </Pressable>

        {/* The Illustration - Inspired by your 'hugging pillow' reference image */}
        <View style={styles.illustrationContainer}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3069/3069172.png' }} // Replace with your local asset
            style={styles.illustration}
            resizeMode="contain"
          />
          {/* Subtle glow effect behind the illustration */}
          <View style={styles.glow} />
        </View>

        {/* Message Section */}
        <View style={styles.messageContainer}>
          <Text style={styles.protocolText}>Protocol Initiated</Text>
          <Text style={styles.mainTitle}>Sleep Carefree, {displayName}.</Text>
          <Text style={styles.description}>
            Your environment is optimized. We’ll take care of the rest while you rest.
          </Text>
        </View>

        {/* Bottom Status Info */}
        <View style={styles.footer}>
          <View style={styles.statusBadge}>
            <Ionicons name="moon" size={16} color="#B0B0B0" />
            <Text style={styles.statusText}>Deep Sleep Mode Active</Text>
          </View>
          <Text style={styles.snoozeMeta}>{snoozeModeLabel}</Text>
          <Text style={styles.alarmMeta}>
            Alarm: {activeSleepSession ? dayjs(activeSleepSession.actualAlarmTimeISO).format('h:mm A') : 'Not set'}
          </Text>
          <Pressable style={styles.snoozeButton} onPress={handleSnooze}>
            <Text style={styles.snoozeButtonText}>Snooze Alarm</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Matching your Home background [cite: 131]
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    padding: 10,
  },
  illustrationContainer: {
    width: width * 0.8,
    height: width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  illustration: {
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  glow: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: width,
    zIndex: 1,
  },
  messageContainer: {
    alignItems: 'center',
  },
  protocolText: {
    color: '#B0B0B0',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  mainTitle: {
    color: 'white',
    fontFamily: 'Lora_500Medium', // Using Lora for the reassuring message [cite: 125, 165]
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    color: '#808080',
    fontFamily: 'Inter_300Light',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  statusText: {
    color: '#B0B0B0',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  snoozeMeta: {
    color: '#9CA3AF',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 10,
  },
  alarmMeta: {
    color: 'white',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 10,
  },
  snoozeButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  snoozeButtonText: {
    color: 'white',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
});
