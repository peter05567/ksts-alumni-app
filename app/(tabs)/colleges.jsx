import CustomHeader from '@/components/CustomHeader'
import { Ionicons } from '@expo/vector-icons'
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// Dummy Data for Colleges
const COLLEGES_DATA = [
  {
    id: '1',
    name: 'College of Engineering',
    location: 'KNUST, Kumasi',
    alumni: '2,500 Alumni',
    description: 'The College of Engineering is a hub for innovation, research, and technical excellence, producing world-class engineers.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', // Engineering/Tech related
  },
  {
    id: '2',
    name: 'College of Science',
    location: 'KNUST, Kumasi',
    alumni: '1,800 Alumni',
    description: 'Dedicated to advancing scientific knowledge and practical applications, the College of Science fosters discovery.',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1486&q=80', // Science building related
  },
  {
    id: '3',
    name: 'College of Humanities & Social Sciences',
    location: 'KNUST, Kumasi',
    alumni: '3,200 Alumni',
    description: 'Exploring the complexities of human society and culture, this college provides critical insights into global challenges.',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', // Humanities/University building
  },
]

const CollegeCard = ({ item }) => (
  <View style={styles.card}>
    {/* Image Section */}
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
    </View>

    {/* Content Section */}
    <View style={styles.cardContent}>
      <Text style={styles.collegeName}>{item.name}</Text>
      
      <View style={styles.metaRow}>
        <Text style={styles.locationText}>{item.location}</Text>
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="people-outline" size={16} color="#FFD700" style={styles.icon} />
        <Text style={styles.alumniText}>{item.alumni}</Text>
      </View>

      <Text style={styles.descriptionText} numberOfLines={3}>{item.description}</Text>

      <TouchableOpacity style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>View Details</Text>
      </TouchableOpacity>
    </View>
  </View>
)

export default function CollegesScreen() {
  return (
    <View style={styles.container}>
      <CustomHeader 
        title="Colleges" 
        onLeftPress={() => console.log('Menu')} 
        onRightPress1={() => console.log('Filter')} 
        onRightPress2={() => console.log('Search')} 
      />
      
      <FlatList
        data={COLLEGES_DATA}
        renderItem={({ item }) => <CollegeCard item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black background
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for bottom tabs
  },
  card: {
    backgroundColor: 'rgba(20, 20, 20, 1)', // Dark card background
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)', // Subtle yellow border
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    padding: 10,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  collegeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  alumniText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginVertical: 12,
    lineHeight: 20,
  },
  viewDetailsButton: {
    backgroundColor: '#FFD700', // Yellow background
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  viewDetailsText: {
    color: '#000', // Black text
    fontSize: 16,
    fontWeight: 'bold',
  },
})
