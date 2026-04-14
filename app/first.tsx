import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';


export default function Home() {
  
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
    return (
      <ImageBackground 
        source={require('../assets/moon.jpg')} 
        style={styles.bg}
      >

        <View style={styles.container}>
          <View style={styles.row}>
            
            <View>
              <Text style={styles.title}>निद्रा</Text>
              <Text style={styles.subtitle}>Good evening</Text>
            </View>
            <Link href="/settings">
              <Ionicons name='settings-outline' size={30} color="#ccc" style={styles.icon} />                                    
            </Link>
            
          </View>
          
          <Text style={styles.time}>
            {time.toLocaleTimeString()}
          </Text>
          <View style={styles.box}> 
            <View>
              <Text style={styles.boxup}>Initiate Protocol</Text>
              <Text style={styles.bowdown}>Start Sleep Mode</Text>
            </View>
            <Ionicons name='arrow-forward-circle-outline' size={30} color="#ccc" style={styles.icon} />
          </View>
        </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent:'center',
    alignItems:'center'
    
  },
   container: {
  width: 350,
  alignSelf: 'center',
  backgroundColor: 'rgba(0,0,0,0.6)',
  padding: 25,
  borderRadius: 20,
  },
  time: {
  color: 'white',
  fontSize: 40,
  textAlign: 'center',
  marginTop: 5,
},

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  row: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
},
  title: {
    color: 'white',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  boxup:{
    
    color:'white',
    fontSize:24,
  },
  bowdown:{
    
    color:'white',
    fontSize:30,
    fontWeight:'semibold'
  },
  subtitle: {
    color: '#ddd',
    fontSize: 18,
    marginBottom: 30,
  },
  smallText: {
    color: '#ccc',
    marginBottom: 20,
  },
  input: {
    flex: 1, 
    color: 'white',
    padding:5
    
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#ccc',
    marginTop: 20,
    textAlign: 'center',
  },
  linkBlue: {
    color: '#60a5fa',
  },
  inputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'transparent',
  borderRadius: 12,
  padding:10,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
  
  },
  box:{
  flexDirection:'row',
  justifyContent: 'space-between',
  
  paddingLeft: 20,           // optional spacing
  marginTop:20,
    backgroundColor:'transparent',
    borderRadius: 12,
    padding:10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',

  },
  form: {
  width: '100%',
  },

  inputField: {
  flex: 1,
  color: 'white',
  padding: 12,
  },
   icon: {
    marginLeft: 8,
  },
  orText: {
  color: '#ccc',
  textAlign: 'center',
  marginTop: 20,
  marginBottom: 10,
  },

  socialContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 15,
  },

socialIcon: {
  backgroundColor: 'rgba(255,255,255,0.1)',
  padding: 10,
  borderRadius: 50,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
  width: 45,
height: 45,
alignItems: 'center',
justifyContent: 'center',
  
},

  label: {
    color: 'white',
    marginBottom: 5,
    marginTop: 10,
  },

});