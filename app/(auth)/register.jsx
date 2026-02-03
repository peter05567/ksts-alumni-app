import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useState } from 'react'
import { Alert, FlatList, ImageBackground, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { auth, db } from '../../services/firebase'

// Import the background image
const bgImage = require('../../assets/images/bg.jpg')

const COLLEGES = [
  'College of Agriculture and Natural Resources',
  'College of Art and Built Environment',
  'College of Humanities and Social Sciences',
  'College of Engineering',
  'College of Health Sciences',
  'College of Science'
]

export default function RegisterScreen() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [college, setCollege] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    // Implement register logic here
    if (!username || !email || !password || !college) {
      Alert.alert('Please fill in all fields')
      return
    }
    if (!COLLEGES.includes(college)) {
      Alert.alert('Please select a valid college')
      return
    }
    setLoading(true)
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create a Firestore document for the user
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        college,
        createdAt: new Date()
      })

      console.log('User registered successfully:', user)
      setLoading(false)
    } catch (error) {
      console.error('Error registering user:', error.message)
      setLoading(false)
      Alert.alert('Registration Error', error.message)
    }
  }

  const renderCollegeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.modalItem} 
      onPress={() => {
        setCollege(item)
        setModalVisible(false)
      }}
    >
      <Text style={styles.modalItemText}>{item}</Text>
      {college === item && <Ionicons name="checkmark" size={20} color="#FFD700" />}
    </TouchableOpacity>
  )

  return (
    <View style={styles.mainContainer}>
      <ImageBackground 
        source={bgImage} 
        style={styles.backgroundImage} 
        resizeMode="cover"
        imageStyle={{ opacity: 0.15 }} // Make image almost invisible
      >
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.contentContainer}>
                <View style={styles.headerContainer}>
                  <Text style={styles.title}>Create Account</Text>
                  <Text style={styles.subtitle}>Sign up to get started</Text>
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#FFD700" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Username"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#FFD700" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <TouchableOpacity 
                    style={styles.inputContainer} 
                    onPress={() => setModalVisible(true)}
                  >
                    <Ionicons name="school-outline" size={20} color="#FFD700" style={styles.inputIcon} />
                    <Text style={[styles.input, !college && { color: 'rgba(255, 255, 255, 0.5)' }]}>
                      {college || "Select College"}
                    </Text>
                    <Ionicons name="chevron-down-outline" size={20} color="rgba(255, 255, 255, 0.5)" />
                  </TouchableOpacity>

                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color="#FFD700" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>

                  <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
                    <Text style={styles.registerButtonText}>{loading ? 'Registering...' : 'Sign Up'}</Text>
                  </TouchableOpacity>

                  <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity onPress={()=>router.push('/(auth)')}>
                      <Text style={styles.loginLink}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select College</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={COLLEGES}
                renderItem={renderCollegeItem}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </Modal>

      </ImageBackground>
      <StatusBar barStyle="light-content" />
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000', // Black background base
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    padding: 20,
    backgroundColor: 'rgba(20, 20, 20, 0.8)', // Very dark glassmorphism
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)', // Subtle yellow border
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 10,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(50, 50, 50, 0.5)',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
    textAlignVertical: 'center', // Helpful for Android Text component in row
    paddingVertical: 15, // To match TextInput padding roughly if needed
  },
  registerButton: {
    backgroundColor: '#FFD700', // Yellow/Gold background
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#000', // Black text
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  loginLink: {
    color: '#FFD700', // Yellow link
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalItemText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
})
