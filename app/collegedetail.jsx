import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const { width } = Dimensions.get('window')

// Mock Departments Data
const DEPARTMENTS_DATA = {
  'College of Engineering': [
    'Civil Engineering', 'Mechanical Engineering', 'Electrical & Electronic Engineering', 
    'Computer Engineering', 'Chemical Engineering', 'Aerospace Engineering',
    'Materials Engineering', 'Geomatic Engineering'
  ],
  'College of Science': [
    'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 
    'Biochemistry', 'Optometry', 'Food Science', 'Environmental Science'
  ],
  'College of Humanities and Social Sciences': [
    'Law', 'Sociology', 'Economics', 'English', 'Geography', 
    'History', 'Political Science', 'Religious Studies'
  ],
  'College of Agriculture and Natural Resources': [
    'Agriculture', 'Agribusiness', 'Landscape Design', 'Forest Resources Technology',
    'Animal Science', 'Crop and Soil Sciences'
  ],
  'College of Art and Built Environment': [
    'Architecture', 'Planning', 'Painting and Sculpture', 'Industrial Art',
    'Building Technology', 'Land Economy'
  ],
  'College of Health Sciences': [
    'Medicine and Dentistry', 'Pharmacy', 'Nursing', 'Medical Laboratory Technology',
    'Sports and Exercise Science', 'Public Health'
  ]
}

export default function CollegeDetail() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { name, location, description, image, alumniCount } = params

  const departments = DEPARTMENTS_DATA[name] || ['General Department']

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Image Section */}
        <View style={styles.imageHeader}>
          <Image source={{ uri: image }} style={styles.headerImage} resizeMode="cover" />
          <View style={styles.overlay} />
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="#FFD700" />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{alumniCount}</Text>
              <Text style={styles.statLabel}>Alumni</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{departments.length}</Text>
              <Text style={styles.statLabel}>Departments</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descriptionText}>{description}</Text>
          </View>

          {/* Departments Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Departments</Text>
            <View style={styles.departmentsGrid}>
              {departments.map((dept, index) => (
                <View key={index} style={styles.departmentChip}>
                  <View style={styles.dot} />
                  <Text style={styles.departmentText}>{dept}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Contact / Action Button */}
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Contact College Administration</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageHeader: {
    height: 300,
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  headerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerContent: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    color: '#f0f0f0',
    fontSize: 16,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#121212',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  departmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  departmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#333',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
    marginRight: 8,
  },
  departmentText: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  actionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  }
})
