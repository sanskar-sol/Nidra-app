import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';

export default function Index() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = () => {
        router.push('/home');  
    };

    return (
        <View style={styles.background}>
            <Text style={styles.title}>निद्रा</Text>
            <Text style={styles.subtitle}>Sign in</Text>

            <Text style={styles.smallText}>
                If you don’t have an account,{"\n"}
                You can{" "}
                <Link href="/signup" style={styles.linkBlue}>
                    Register here !
                </Link>
            </Text>

            <View style={styles.form}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Enter your email address"
                        placeholderTextColor="#aaa"
                        style={styles.input}
                    />
                    <Ionicons name="mail-outline" size={18} color="#ccc" style={styles.icon} />
                </View>

                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Enter your password"
                        placeholderTextColor="#aaa"
                        secureTextEntry={!showPassword}
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? "eye" : "eye-off"}
                            size={18}
                            color="#ccc"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                
                <Text style={styles.orText}>or continue with</Text>

                <View style={styles.socialContainer}>
                    <TouchableOpacity style={styles.socialIcon}>
                        <FontAwesome name="facebook" size={22} color="#1877F2" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialIcon}>
                        <Ionicons name="logo-apple" size={22} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialIcon}>
                        <FontAwesome name="google" size={22} color="#DB4437" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>    
    );
}
const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#262625', // Your new solid background color
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    color: 'white',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: '#ddd',
    fontSize: 18,
    marginBottom: 30,
  },
  smallText: {
    color: '#ccc',
    marginBottom: 20,
    lineHeight: 22,
  },
  input: {
    flex: 1, 
    color: 'white',
    padding: 10,
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
  linkBlue: {
    color: '#60a5fa',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', // Dropped the opacity slightly so it blends nicely with the dark grey
    marginBottom: 15,
  },
  form: {
    width: '100%',
  },
  icon: {
    marginLeft: 8,
  },
  orText: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialIcon: {
    backgroundColor: 'rgba(255,255,255,0.05)', // Made slightly more transparent to look better on solid grey
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: 'white',
    marginBottom: 8,
    fontWeight: '500',
  },
});