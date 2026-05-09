import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Dimensions, StatusBar, Platform, Alert, BackHandler, NativeEventEmitter, NativeModules } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import dayjs from 'dayjs';
import Toast from 'react-native-toast-message';
import { useStore, StoreState } from '../store/useStore';
import { sleepBlocker } from '../store/sleepBlocker';

const { width } = Dimensions.get('window');

export default function SleepMode() {
  const router = useRouter();
  const user = useStore((state: StoreState) => state.user);
  const activeSleepSession = useStore((state: StoreState) => state.activeSleepSession);
  const blockedApps = useStore((state: StoreState) => state.blockedApps);
  const registerSnooze = useStore((state: StoreState) => state.registerSnooze);
  const clearSleepSession = useStore((state: StoreState) => state.clearSleepSession);

  const [permissionsOk, setPermissionsOk] = useState(true);
  const [isAlarmFiring, setIsAlarmFiring] = useState(false);
  
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Sleeper';
  const snoozeModeLabel = activeSleepSession?.mode === 'strict' ? 'Strict snooze: 3 min, one use' : 'Forgiving snooze: 10 min';

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });

    // Handle Alarm Events
    let alarmListener: any;
    if (Platform.OS === 'android') {
      const eventEmitter = new NativeEventEmitter(NativeModules.SleepBlocker);
      alarmListener = eventEmitter.addListener('onAlarmTriggered', () => {
        setIsAlarmFiring(true);
      });
    }

    // Ensure blocker is active whenever this screen is viewed
    if (Platform.OS === 'android' && activeSleepSession) {
      async function syncBlocker() {
        try {
          const overlay = await sleepBlocker.canDrawOverlays();
          const accessibility = await sleepBlocker.isAccessibilityServiceEnabled();
          setPermissionsOk(overlay && accessibility);

          if (overlay && accessibility) {
            sleepBlocker.updateBlockedApps(blockedApps);
            await sleepBlocker.start();
          }
        } catch (err) {
          console.error('Failed to sync blocker on mount:', err);
        }
      }
      syncBlocker();
    }

    return () => {
      backHandler.remove();
      if (alarmListener) alarmListener.remove();
    };
  }, [activeSleepSession, blockedApps]);

  const handleSnooze = async () => {
    if (Platform.OS === 'android') {
      await sleepBlocker.stopAlarmMedia().catch(console.error);
    }
    setIsAlarmFiring(false);

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

  const handleStopAlarm = async () => {
    if (Platform.OS === 'android') {
      await sleepBlocker.stopAlarmMedia().catch(console.error);
      sleepBlocker.stop().catch(console.error);
      sleepBlocker.cancelAlarm().catch(console.error);
    }
    setIsAlarmFiring(false);
    clearSleepSession();
    router.replace('/home');
  };

  return (
    <View style={[styles.container, isAlarmFiring && styles.firingContainer]}>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <StatusBar hidden />

      {!permissionsOk && (
        <View style={styles.permissionWarning}>
          <Ionicons name="warning" size={20} color="#facc15" />
          <Text style={styles.warningText}>Blocker inactive. Permissions required.</Text>
          <Pressable onPress={() => router.push('/test-blocker')}>
            <Text style={styles.fixButton}>Fix</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.content}>
        {!isAlarmFiring && (
          <Pressable
            style={styles.closeButton}
            delayLongPress={15000}
            onPress={() => {
              Toast.show({
                type: 'info',
                text1: 'Hold to Exit',
                text2: 'Long press for 15 seconds to break protocol.',
                position: 'bottom',
              });
            }}
            onLongPress={() => {
              const performExit = () => {
                if (Platform.OS === 'android') {
                  sleepBlocker.stop().catch(console.error);
                }
                clearSleepSession();
                router.replace('/home');
              };

              Alert.alert(
                "Break Sleep Protocol? (1/5)",
                "Are you absolutely sure you want to abandon your sleep goal?",
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Yes, I am sure', 
                    onPress: () => Alert.alert(
                      "Confirm Exit (2/5)",
                      "You are currently in Deep Sleep Mode. Your phone environment is optimized. Stay?",
                      [
                        { text: 'Stay in Bed', style: 'cancel' },
                        { 
                          text: 'Continue Exit', 
                          onPress: () => Alert.alert(
                            "Warning (3/5)",
                            "Aborting now will increase your sleep debt. Are you okay with that?",
                            [
                              { text: 'No, let me sleep', style: 'cancel' },
                              { 
                                text: 'Yes, exit anyway', 
                                onPress: () => Alert.alert(
                                  "Last Chance (4/5)",
                                  "You've come this far. Think about how you'll feel tomorrow morning. Still exit?",
                                  [
                                    { text: 'Back to Sleep', style: 'cancel' },
                                    { 
                                      text: 'I really need to exit', 
                                      onPress: () => Alert.alert(
                                        "FINAL CONFIRMATION (5/5)",
                                        "This is the last step. Confirm to PERMANENTLY break the protocol for tonight.",
                                        [
                                          { text: 'Wait, I\'ll stay', style: 'cancel' },
                                          { text: 'ABANDON PROTOCOL', style: 'destructive', onPress: performExit }
                                        ]
                                      )
                                    }
                                  ]
                                )
                              }
                            ]
                          )
                        }
                      ]
                    )
                  }
                ]
              );
            }}
          >
            <Ionicons name="close-outline" size={32} color="rgba(255,255,255,0.3)" />
          </Pressable>
        )}

        <View style={[styles.illustrationContainer, isAlarmFiring && styles.firingIllustration]}>
          <Image
            source={{ uri: isAlarmFiring ? 'https://cdn-icons-png.flaticon.com/512/1041/1041916.png' : 'https://cdn-icons-png.flaticon.com/512/3069/3069172.png' }}
            style={styles.illustration}
            resizeMode="contain"
          />
          <View style={[styles.glow, isAlarmFiring && styles.firingGlow]} />
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.protocolText}>{isAlarmFiring ? 'WAKE UP CALL' : 'Protocol Initiated'}</Text>
          <Text style={styles.mainTitle}>
            {isAlarmFiring ? 'Time to Rise.' : `Sleep Carefree, ${displayName}.`}
          </Text>
          <Text style={styles.description}>
            {isAlarmFiring 
              ? 'Your scheduled rest period has concluded. Let\'s start the day right.' 
              : 'Your environment is optimized. We’ll take care of the rest while you rest.'}
          </Text>
        </View>

        <View style={styles.footer}>
          {isAlarmFiring ? (
            <View style={styles.firingActions}>
              <Pressable style={[styles.actionButton, styles.snoozeAction]} onPress={handleSnooze}>
                <Text style={styles.actionButtonText}>Snooze</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, styles.stopAction]} onPress={handleStopAlarm}>
                <Text style={styles.actionButtonText}>Stop Alarm</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.snoozeMeta}>{snoozeModeLabel}</Text>
              <Text style={styles.alarmMeta}>
                Alarm: {activeSleepSession ? dayjs(activeSleepSession.actualAlarmTimeISO).format('h:mm A') : 'Not set'}
              </Text>
              <Pressable style={styles.snoozeButton} onPress={handleSnooze}>
                <Text style={styles.snoozeButtonText}>Test Snooze</Text>
              </Pressable>
            </>
          )}
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
  firingContainer: {
    backgroundColor: '#2D1B1B', // Deep red for urgency
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
  firingIllustration: {
    transform: [{ scale: 1.1 }],
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
  firingGlow: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    width: width * 0.8,
    height: width * 0.8,
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
  firingActions: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    paddingHorizontal: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  snoozeAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  stopAction: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
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
  permissionWarning: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  warningText: {
    color: '#facc15',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    flex: 1,
  },
  fixButton: {
    color: 'white',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  blockedAppsMeta: {
    color: '#22c55e',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 12,
  },
});
