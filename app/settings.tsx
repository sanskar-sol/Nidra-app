import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useRouter } from 'expo-router';

// 1. Import fonts for consistent feel
import { 
  useFonts, 
  Inter_400Regular, 
  Inter_600SemiBold 
} from '@expo-google-fonts/inter';
import { 
  Lora_500Medium
} from '@expo-google-fonts/lora';

const { height } = Dimensions.get('window');

export default function Settings() {
  const router = useRouter();

  // Load fonts
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Lora_500Medium
  });

  const [image, setImage] = useState<string | null>(null);
  
  // 2. Separate states for each toggle to fix the "switch all" bug
  const [notifications, setNotifications] = useState(true);
  const [strictMode, setStrictMode] = useState(false);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
    }
  };

  if (!fontsLoaded) {
    return <View style={styles.container} />; 
  }

  // Helper component for the custom toggle switch
  const ToggleSwitch = ({ value, onValueChange }: { value: boolean, onValueChange: () => void }) => (
    <TouchableOpacity
      onPress={onValueChange}
      style={[styles.switchcontainer, { backgroundColor: value ? "#3b82f6" : "rgba(255,255,255,0.1)" }]}
    >
      <View style={[styles.switchthumb, { alignSelf: value ? 'flex-end' : 'flex-start' }]} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* 3. ScrollView with standard padding/top fix */}
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
          <Text style={styles.name}>Ann Kurian</Text>
          <Text style={styles.email}>ann.kurian@domain.com</Text>
        </View>

        {/* Account Options Card */}
        <View style={styles.card}>
          <TouchableOpacity onPress={() => router.push('/edit')} style={styles.row}>
            <Text style={styles.item}>Edit Profile Information</Text>
            <Ionicons name="chevron-forward" size={18} color="#aaa" />
          </TouchableOpacity>

          <View style={styles.row}>
            <Text style={styles.item}>Notifications</Text>
            <ToggleSwitch value={notifications} onValueChange={() => setNotifications(!notifications)} />
          </View>

          <View style={styles.row}>
            <Text style={styles.item}>Language</Text>
            <Text style={styles.accentText}>English</Text>
          </View>
        </View>

        <Text style={styles.heading}>Preferences</Text>

        {/* Preferences Card - Each toggle fixed */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.item}>Enable Strict Mode</Text>
            <ToggleSwitch value={strictMode} onValueChange={() => setStrictMode(!strictMode)} />
          </View>

          <View style={styles.row}>
            <Text style={styles.item}>Sound</Text>
            <ToggleSwitch value={sound} onValueChange={() => setSound(!sound)} />
          </View>

          <View style={styles.row}>
            <Text style={styles.item}>Vibration</Text>
            <ToggleSwitch value={vibration} onValueChange={() => setVibration(!vibration)} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
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
    backgroundColor: '#1E1E1E' // Matching Home screen background [cite: 83]
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
    fontFamily: 'Inter_400Regular', // Using Lora for the name [cite: 125]
    marginTop: 15,
  },
  email: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Frosted look matching other cards [cite: 84]
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
    backgroundColor: 'rgba(255, 59, 48, 0.1)', // Subtle red for logout
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