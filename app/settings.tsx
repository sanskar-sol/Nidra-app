import { View, Text, Image, TouchableOpacity, StyleSheet, Switch, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';

export default function Settings() {

  const router = useRouter();
  

  const [image, setImage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [strictMode, setStrictMode] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);

  // 📸 Pick Image
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

  return (
    <ImageBackground 
        source={require('../assets/moon.jpg')} 
        style={styles.container}
    >
    <View style={styles.container}>

      {/* 🔵 Top Section */}
      <View style={styles.top}>
        <TouchableOpacity 
            onPress={() => router.back()}
            style={{ padding: 10 }}
        >
            <Ionicons name='arrow-back' size={30} color="black" />
        </TouchableOpacity>
      </View> 
      

      {/* 👤 Profile */}
      <View style={styles.profileBox}>
        
        <View>
          <Image
            source={
              image
                ? { uri: image }
                : require('../assets/default-avatar.png')
            }
            style={styles.avatar}
          />

          <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
            <Ionicons name="pencil" size={16} color="black" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>Ann Kurian</Text>
        <Text style={styles.email}>youremail@domain.com | +91 XXXXXXXX</Text>
      </View>

      {/* ⚙️ Options */}
      <View style={styles.card}>

        <TouchableOpacity onPress={() => router.push('/edit')}>
          <Text style={styles.item}>Edit profile information</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <Text style={styles.item}>Notifications</Text>
          <TouchableOpacity
  onPress={() => setNotifications(!notifications)}
  style={[styles.switchcontainer, { backgroundColor: notifications ? "#4f7cff" : "#444" }]}
>
  <View
    style={[styles.switchthumb, { alignSelf: notifications ? 'flex-end' : 'flex-start' }]}
  />
</TouchableOpacity>
        </View>
      

        <View style={styles.row}>
          <Text style={styles.item}>Language</Text>
          <Text style={{ color: '#4f7cff' }}>English</Text>
        </View>

      </View>

      {/* ⚙️ Settings */}
      <Text style={styles.heading}>Setting</Text>

      <View style={styles.card}>
        
        <View style={styles.row}>
          <Text style={styles.item}>Enable Strict Mode</Text>
          <TouchableOpacity
  onPress={() => setNotifications(!notifications)}
  style={[styles.switchcontainer, { backgroundColor: notifications ? "#4f7cff" : "#444" }]}
>
  <View
    style={[styles.switchthumb, { alignSelf: notifications ? 'flex-end' : 'flex-start' }]}
  />
</TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.item}>Sound</Text>
          <TouchableOpacity
  onPress={() => setNotifications(!notifications)}
  style={[styles.switchcontainer, { backgroundColor: notifications ? "#4f7cff" : "#444" }]}
>
  <View
    style={[styles.switchthumb, { alignSelf: notifications ? 'flex-end' : 'flex-start' }]}
  />
</TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.item}>Vibration</Text>
          <TouchableOpacity
  onPress={() => setNotifications(!notifications)}
  style={[styles.switchcontainer, { backgroundColor: notifications ? "#4f7cff" : "#444" }]}
>
  <View
    style={[styles.switchthumb, { alignSelf: notifications ? 'flex-end' : 'flex-start' }]}
  />
</TouchableOpacity>
        </View>

      </View>

      {/* 🚪 Logout */}
      <TouchableOpacity style={styles.logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  top: {
    height: 120,
    backgroundColor: '#3b82f6',             // 👈 IMPORTANT
  justifyContent: 'center',
  paddingHorizontal: 15,
  
  },
  switchcontainer: {
    width: 45,
    height: 23,
    borderRadius: 20,
    justifyContent: 'center',
    padding: 3,},

switchthumb: {width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "white",},

  profileBox: {
    alignItems: 'center',
    marginTop: -50,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 6,
    borderRadius: 20,
  },

  name: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },

  email: {
    color: 'white',
    fontSize: 12,
  },

  card: {
    backgroundColor: 'transparent',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    borderColor:'white',
    borderWidth:1,
  },

  item: {
    color: 'white',
    fontSize: 14,
    marginVertical: 10,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  heading: {
    color: 'white',
    marginLeft: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },

  logout: {
    margin: 20,
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },

  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});