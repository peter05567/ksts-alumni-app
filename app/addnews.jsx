import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { auth, db } from '../services/firebase'

const CATEGORIES = ['Academics', 'Sports', 'Finance', 'Events', 'General']

export default function AddNewsScreen() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)

  const pickImage = async () => {
    try {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.5,
        base64: true,
      })

      if (!result.canceled) {
        setImage(`data:image/jpeg;base64,${result.assets[0].base64}`)
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'Failed to pick image')
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const currentUser = auth.currentUser
      
      const newsData = {
        title: title.trim(),
        description: description.trim(),
        category,
        image: image || `https://ui-avatars.com/api/?name=${category}&background=random&size=512`,
        author: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin',
        authorId: currentUser?.uid || 'anonymous',
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) // Store formatted date for display
      }

      await addDoc(collection(db, 'news'), newsData)
      
      Alert.alert('Success', 'News added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ])
    } catch (error) {
      console.error('Error adding news:', error)
      Alert.alert('Error', 'Failed to add news. Image might be too large.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add News</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter news title"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.categoryChipSelected
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[
                    styles.categoryText,
                    category === cat && styles.categoryTextSelected
                  ]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Image Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image (Optional)</Text>
            
            {image ? (
              <View>
                <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
                <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
                    <Text style={styles.changeImageText}>Change Image</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                <Ionicons name="image-outline" size={40} color="#FFD700" />
                <Text style={styles.imagePickerText}>Pick an image from gallery</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter news content..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.submitButtonText}>Publish News</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? 30 : 0
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,215,0,0.1)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  textArea: {
    height: 150,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryChipSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  categoryText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  categoryTextSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
  imagePickerButton: {
    width: '100%',
    height: 150,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 10,
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  changeImageButton: {
    marginTop: 10,
    alignSelf: 'center',
    padding: 10,
  },
  changeImageText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FFD700',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
