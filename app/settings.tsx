import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message'; 
import { useStore } from '../store/useStore';

export default function Settings() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const user = useStore((state) => state.user);
  const sleepGoals = useStore((state) => state.sleepGoals);
  const preferences = useStore((state) => state.preferences);
  const updatePreferences = useStore((state) => state.updatePreferences);
  const logoutUser = useStore((state) => state.logoutUser);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        // Kept this Toast: Good for confirming a successful upload
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: 'Looking good! Your new avatar is set.',
          position: 'top',
        });
    }
  };

  const handleLogout = () => {
    // Kept this Toast: Nice sign-off experience
    Toast.show({
      type: 'success',
      text1: 'Logged Out',
      text2: 'Sleep well. See you next time.',
      position: 'top',
    });

    logoutUser();

    setTimeout(() => {
      router.replace('/');
    }, 1200);
  };

  const handleComingSoon = () => {
    // Kept this Toast: Prevents the button from feeling broken
    Toast.show({
      type: 'success', 
      text1: 'Coming Soon',
      text2: 'This feature will be available in the next update.',
      position: 'top',
    });
  };

  // Helper component for the custom toggle switch
  const ToggleSwitch = ({ value, onValueChange }: { value: boolean, onValueChange: () => void }) => (
    <TouchableOpacity
      onPress={onValueChange}
      style={[styles.switchcontainer, { backgroundColor: value ? "#3b82f6" : "rgba(255,255,255,0.1)" }]}
    >
      <View style={[styles.switchthumb, { alignSelf: value ? 'flex-end' : 'flex-start' }]} />
    </TouchableOpacity>
  );

  const displayName = user?.name?.trim() || 'Dreamer';
  const displayEmail = user?.email?.trim() || 'No email saved';
  const wakeUpTime = `${sleepGoals.wakeUpHour}:${sleepGoals.wakeUpMinute} ${sleepGoals.wakeUpPeriod}`;
  const sleepGoalLabel = `${sleepGoals.goalHours} hrs ${sleepGoals.goalMinutes} min`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name='arrow-back' size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 28 }} /> 
        </View>

        {/* Profile Section */}
        <View style={styles.profileBox}>
          <View>
            <Image
              source={image ? { uri: image } : require('../assets/default-avatar.png')} 
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
              <Ionicons name="pencil" size={14} color="black" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{displayEmail}</Text>
        </View>

        {/* Sleep Profile Card */}
        <Text style={styles.heading}>Sleep Profile</Text>
        <View style={styles.card}>
          <TouchableOpacity onPress={() => router.push('/onboarding2')} style={styles.row}>
            <Text style={styles.item}>Wake-up Time</Text>
            <View style={styles.rightContent}>
              <Text style={styles.valueText}>{wakeUpTime}</Text>
              <Ionicons name="chevron-forward" size={18} color="#aaa" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/onboarding3')} style={styles.row}>
            <Text style={styles.item}>Sleep Goal</Text>
            <View style={styles.rightContent}>
              <Text style={styles.valueText}>{sleepGoalLabel}</Text>
              <Ionicons name="chevron-forward" size={18} color="#aaa" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Options Card */}
        <Text style={styles.heading}>Account</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleComingSoon}>
            <Text style={styles.item}>Edit Profile Information</Text>
            <Ionicons name="chevron-forward" size={18} color="#aaa" />
          </TouchableOpacity>

          <View style={styles.row}>
            <Text style={styles.item}>Notifications</Text>
            <ToggleSwitch 
              value={preferences.notifications} 
              onValueChange={() => updatePreferences({ notifications: !preferences.notifications })} 
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.item}>Language</Text>
            <Text style={styles.accentText}>English</Text>
          </View>
        </View>

        <Text style={styles.heading}>Device Preferences</Text>

        {/* Preferences Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.item}>Enable Strict Mode</Text>
            <ToggleSwitch 
              value={preferences.strictMode} 
              onValueChange={() => updatePreferences({ strictMode: !preferences.strictMode })} 
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.item}>Sound</Text>
            <ToggleSwitch 
              value={preferences.sound} 
              onValueChange={() => updatePreferences({ sound: !preferences.sound })} 
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.item}>Vibration</Text>
            <ToggleSwitch 
              value={preferences.vibration} 
              onValueChange={() => updatePreferences({ vibration: !preferences.vibration })} 
            />
          </View>

          <TouchableOpacity style={styles.row} onPress={() => router.push('/test-blocker')}>
            <Text style={styles.debugItem}>Sleep Blocker Diagnostics</Text>
            <Ionicons name="chevron-forward" size={18} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1E1E1E' 
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Lora_500Medium',
  },
  profileBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 6,
    borderRadius: 15,
  },
  name: {
    color: 'white',
    fontSize: 22,
    fontFamily: 'Inter_400Regular', 
    marginTop: 15,
  },
  email: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)', 
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 25,
  },
  heading: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  item: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  debugItem: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    color: '#B0B0B0',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  accentText: {
    color: '#3b82f6',
    fontFamily: 'Inter_600SemiBold',
  },
  switchcontainer: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    padding: 2,
  },
  switchthumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)', 
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  logoutText: {
    color: '#ff3b30',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
});
