import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Platform,
  StatusBar,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { sleepBlocker } from '../store/sleepBlocker';

export default function OnboardingStep4() {
  const router = useRouter();
  const [canOverlay, setCanOverlay] = useState(false);
  const [hasUsageAccess, setHasUsageAccess] = useState(false);

  // Check permissions on mount and when returning to the app
  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const overlay = await sleepBlocker.canDrawOverlays();
        const usage = await sleepBlocker.isAccessibilityServiceEnabled();
        setCanOverlay(overlay);
        setHasUsageAccess(usage);
      } catch (error) {
        console.error('Failed to check permissions', error);
      }
    } else {
      // iOS mock
      setCanOverlay(true);
      setHasUsageAccess(true);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const handleFinish = () => {
    if (!canOverlay || !hasUsageAccess) {
      Toast.show({
        type: 'error',
        text1: 'Permissions Required',
        text2: 'Please grant both permissions to proceed.',
        position: 'top',
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Ready to Sleep',
      text2: 'Your setup is complete!',
      position: 'top',
    });

    setTimeout(() => {
      router.replace('/home'); 
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.content}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </Pressable>

          <View style={styles.textContainer}>
            <Text style={styles.subtitle}>Step 4 of 4</Text>
            <Text style={styles.title}>Enable Sleep Blocker</Text>
            <Text style={styles.description}>
              Project Nidra requires two system permissions to aggressively block apps while you sleep.
            </Text>
          </View>

          <View style={styles.permissionsContainer}>
            <Pressable 
              style={[styles.permissionCard, canOverlay && styles.permissionCardGranted]} 
              onPress={() => {
                sleepBlocker.openOverlayPermissionSettings();
                setTimeout(checkPermissions, 3000);
              }}
            >
              <View style={styles.permissionIconBox}>
                <Ionicons name="layers-outline" size={24} color={canOverlay ? "#3b82f6" : "white"} />
              </View>
              <View style={styles.permissionTextContent}>
                <Text style={styles.permissionTitle}>Display Over Apps</Text>
                <Text style={styles.permissionDesc}>Allows us to cover distracting apps with the lockdown screen.</Text>
              </View>
              <Ionicons 
                name={canOverlay ? "checkmark-circle" : "chevron-forward"} 
                size={24} 
                color={canOverlay ? "#3b82f6" : "#666"} 
              />
            </Pressable>

            <Pressable 
              style={[styles.permissionCard, hasUsageAccess && styles.permissionCardGranted]} 
              onPress={() => {
                sleepBlocker.openAccessibilitySettings();
                setTimeout(checkPermissions, 3000);
              }}
            >
              <View style={styles.permissionIconBox}>
                <Ionicons name="shield-checkmark-outline" size={24} color={hasUsageAccess ? "#3b82f6" : "white"} />
              </View>
              <View style={styles.permissionTextContent}>
                <Text style={styles.permissionTitle}>Accessibility Service</Text>
                <Text style={styles.permissionDesc}>Allows us to detect when you try to open a restricted app.</Text>
              </View>
              <Ionicons 
                name={hasUsageAccess ? "checkmark-circle" : "chevron-forward"} 
                size={24} 
                color={hasUsageAccess ? "#3b82f6" : "#666"} 
              />
            </Pressable>
          </View>
          
          <Pressable style={styles.refreshButton} onPress={checkPermissions}>
            <Ionicons name="refresh" size={16} color="#aaa" />
            <Text style={styles.refreshButtonText}>Refresh Status</Text>
          </Pressable>

          <Pressable 
            style={[styles.finishButton, (!canOverlay || !hasUsageAccess) ? styles.disabledButton : null]} 
            onPress={handleFinish}
          >
            <Text style={styles.finishButtonText}>Enter Dashboard</Text>
            <Ionicons name="arrow-forward" size={20} color="black" />
          </Pressable>
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
  permissionsContainer: {
    marginBottom: 20,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  permissionCardGranted: {
    borderColor: 'rgba(59, 130, 246, 0.5)',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  permissionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  permissionTextContent: {
    flex: 1,
    paddingRight: 10,
  },
  permissionTitle: {
    color: 'white',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  permissionDesc: {
    color: '#9CA3AF',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 30,
    gap: 6,
  },
  refreshButtonText: {
    color: '#aaa',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
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
