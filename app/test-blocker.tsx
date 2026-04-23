import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { sleepBlocker } from '../store/sleepBlocker';

export default function TestBlockerScreen() {
  const router = useRouter();
  const [canOverlay, setCanOverlay] = useState<boolean | null>(null);
  const [hasUsageAccess, setHasUsageAccess] = useState<boolean | null>(null);
  const [serviceRunning, setServiceRunning] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshPermissions = useCallback(async () => {
    try {
      const [overlayStatus, usageStatus] = await Promise.all([
        sleepBlocker.canDrawOverlays(),
        sleepBlocker.hasUsageAccess(),
      ]);
      setCanOverlay(overlayStatus);
      setHasUsageAccess(usageStatus);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Permission Check Failed',
        text2: 'Unable to read Android blocker permissions.',
        position: 'top',
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshPermissions();
    }, [refreshPermissions]),
  );

  const openOverlaySettings = () => {
    sleepBlocker.openOverlayPermissionSettings();
  };

  const openUsageSettings = () => {
    sleepBlocker.openUsageAccessSettings();
  };

  const startEngine = async () => {
    setLoading(true);
    try {
      await sleepBlocker.start();
      setServiceRunning(true);
      Toast.show({
        type: 'success',
        text1: 'Engine Started',
        text2: 'Instagram blocker service is active.',
        position: 'top',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Start Failed',
        text2: 'Could not start blocker service.',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const stopEngine = async () => {
    setLoading(true);
    try {
      await sleepBlocker.stop();
      setServiceRunning(false);
      Toast.show({
        type: 'success',
        text1: 'Engine Stopped',
        text2: 'Instagram blocker service has been stopped.',
        position: 'top',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Stop Failed',
        text2: 'Could not stop blocker service.',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (value: boolean | null) => {
    if (value === null) return '#B0B0B0';
    return value ? '#22c55e' : '#ef4444';
  };

  const statusLabel = (value: boolean | null) => {
    if (value === null) return 'Checking...';
    return value ? 'Granted' : 'Missing';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sleep Blocker Test</Text>
          <TouchableOpacity onPress={refreshPermissions}>
            <Ionicons name="refresh" size={24} color="#B0B0B0" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Permission Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Display Over Apps</Text>
            <Text style={[styles.statusValue, { color: statusColor(canOverlay) }]}>
              {statusLabel(canOverlay)}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Usage Access</Text>
            <Text style={[styles.statusValue, { color: statusColor(hasUsageAccess) }]}>
              {statusLabel(hasUsageAccess)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Permission Controls</Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={openOverlaySettings}>
            <Text style={styles.secondaryButtonText}>Open Overlay Permission Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={openUsageSettings}>
            <Text style={styles.secondaryButtonText}>Open Usage Access Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Engine</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Current State</Text>
            <Text style={[styles.statusValue, { color: serviceRunning ? '#22c55e' : '#ef4444' }]}>
              {serviceRunning ? 'Running' : 'Stopped'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={startEngine}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>Start Engine</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.stopButton, loading && styles.disabledButton]}
            onPress={stopEngine}
            disabled={loading}
          >
            <Text style={styles.stopButtonText}>Stop Engine</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Lora_500Medium',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  statusLabel: {
    color: '#E5E5E5',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  statusValue: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#F3F3F3',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  stopButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.25)',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 10,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#ff5c54',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
