import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    KeyboardAvoidingView, 
    ScrollView, 
    Platform 
} from 'react-native';
import { Link, useRouter } from 'expo-router'; // Added useRouter here

export default function Signup() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter(); // Initialized the router

    const handleSignup = () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        
        // Push the user to the onboarding screen
        router.push('/onboarding1');
    };

    return (
        /* Master wrapper to prevent the white flash at the bottom */
        <View style={styles.masterBackground}>
            <KeyboardAvoidingView 
                style={styles.keyboardView} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.title}>निद्रा</Text>
                    <Text style={styles.subtitle}>Sign up</Text>
                    
                    <Text style={styles.smallText}>
                        If you already have an account register{"\n"}
                        You can{" "}
                        <Link href="/" style={styles.linkBlue}>
                            Login here !
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

                        <Text style={styles.label}>Username</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Enter your username"
                                placeholderTextColor="#aaa"
                                style={styles.input}
                            />
                            <Ionicons name="person-outline" size={18} color="#ccc" style={styles.icon} />
                        </View>

                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Enter your password"
                                placeholderTextColor="#aaa"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
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

                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Confirm your password"
                                placeholderTextColor="#aaa"
                                secureTextEntry={!showConfirmPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                style={styles.input}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons
                                    name={showConfirmPassword ? "eye" : "eye-off"}
                                    size={18}
                                    color="#ccc"
                                />
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity style={styles.button} onPress={handleSignup}>
                            <Text style={styles.buttonText}>Sign up</Text>
                        </TouchableOpacity>
                    </View>   
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
  masterBackground: {
    flex: 1,
    backgroundColor: '#262625', 
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40, 
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
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 15,
  },
  form: {
    width: '100%',
  },
  icon: {
    marginLeft: 8,
  },
  label: {
    color: 'white',
    marginBottom: 8,
    fontWeight: '500',
  },
});