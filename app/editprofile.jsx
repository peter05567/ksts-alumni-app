import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import CustomHeader from '../components/CustomHeader'
import { auth, db } from '../services/firebase'

export default function EditProfileScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    studentId: '',
    year: '',
    program: '',
    department: '',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80'
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            setFormData(prev => ({
              ...prev,
              ...data,
              // Ensure fields exist even if empty in DB
              username: data.username || '',
              email: data.email || auth.currentUser.email || '',
              studentId: data.studentId || '',
              year: data.year || '',
              program: data.program || '',
              department: data.department || '',
              image: data.image || prev.image
            }))
          }
        }
      } catch (error) {
        console.error("Error fetching user data: ", error)
        Alert.alert("Error", "Failed to load user data")
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [])

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!formData.username || !formData.email) {
      Alert.alert("Error", "Username and Email are required")
      return
    }

    setSaving(true)
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid)
      await updateDoc(userRef, {
        username: formData.username,
        email: formData.email,
        studentId: formData.studentId,
        year: formData.year,
        program: formData.program,
        department: formData.department,
        image: formData.image,
        updatedAt: new Date()
      })
      Alert.alert("Success", "Profile updated successfully")
      router.back()
    } catch (error) {
      console.error("Error updating profile: ", error)
      Alert.alert("Error", "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const renderInput = (label, key, placeholder, keyboardType = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={formData[key]}
          onChangeText={(text) => handleChange(key, text)}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          keyboardType={keyboardType}
          autoCapitalize={key === 'email' ? 'none' : 'sentences'}
        />
      </View>
    </View>
  )

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="Edit Profile" 
        onLeftPress={() => router.back()} 
        // We can pass a prop to CustomHeader to change the icon if we updated it, 
        // but for now relying on default or modifying CustomHeader later.
        // Assuming CustomHeader uses the logo which acts as back/home in this context or we can modify CustomHeader.
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Image Section */}
          <View style={styles.imageSection}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: formData.image }} style={styles.profileImage} />
              <TouchableOpacity style={styles.cameraButton} onPress={() => Alert.alert("Coming Soon", "Image upload functionality will be added soon.")}>
                <Ionicons name="camera" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {renderInput("Username", "username", "Enter your username")}
            {renderInput("Email", "email", "Enter your email", "email-address")}
            {renderInput("Student ID", "studentId", "Enter your student ID", "numeric")}
            {renderInput("Year", "year", "e.g., 3", "numeric")}
            {renderInput("Program", "program", "e.g., Computer Science")}
            {renderInput("Department", "department", "e.g., Computer Science")}
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFD700',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  changePhotoText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  formSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
    opacity: 0.9,
  },
  inputContainer: {
    backgroundColor: 'rgba(50, 50, 50, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  input: {
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  saveButton: {
    backgroundColor: '#FFD700',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
