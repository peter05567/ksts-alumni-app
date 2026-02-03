import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Alert, FlatList, Image, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import CustomHeader from '../components/CustomHeader'

// Mock Data for Patrons
const PATRONS = [
  {
    id: '1',
    name: 'Prof. Kwasi Obiri-Danso',
    college: 'College of Science',
    department: 'Department of Biochemistry',
    phone: '0200000001',
    image: 'https://ui-avatars.com/api/?name=Kwasi+Obiri-Danso&background=FFD700&color=000'
  },
  {
    id: '2',
    name: 'Dr. Mrs. Rita Akosua Dickson',
    college: 'College of Health Sciences',
    department: 'Department of Pharmacy',
    phone: '0200000002',
    image: 'https://ui-avatars.com/api/?name=Rita+Akosua+Dickson&background=FFD700&color=000'
  },
  {
    id: '3',
    name: 'Prof. Ellis Owusu-Dabo',
    college: 'College of Health Sciences',
    department: 'School of Public Health',
    phone: '0200000003',
    image: 'https://ui-avatars.com/api/?name=Ellis+Owusu-Dabo&background=FFD700&color=000'
  },
  {
    id: '4',
    name: 'Dr. Samuel Adu-Gyamfi',
    college: 'College of Humanities and Social Sciences',
    department: 'History and Political Studies',
    phone: '0200000004',
    image: 'https://ui-avatars.com/api/?name=Samuel+Adu-Gyamfi&background=FFD700&color=000'
  },
  {
    id: '5',
    name: 'Ing. Prof. Mike Agbesi Acheampong',
    college: 'College of Engineering',
    department: 'Civil Engineering',
    phone: '0200000005',
    image: 'https://ui-avatars.com/api/?name=Mike+Agbesi+Acheampong&background=FFD700&color=000'
  }
]

export default function Patrons() {
  const router = useRouter()

  const handleMessage = (phone, name) => {
    const message = `Hello ${name}, I am contacting you from the KSTS app.`
    const url = Platform.select({
      ios: `sms:${phone}&body=${message}`,
      android: `sms:${phone}?body=${message}`
    })

    Linking.canOpenURL(url).then(supported => {
      if (!supported) {
        Alert.alert('Error', 'Messaging is not supported on this device')
      } else {
        return Linking.openURL(url)
      }
    }).catch(err => console.error('An error occurred', err))
  }

  const renderPatron = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Image source={{ uri: item.image }} style={styles.patronImage} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.college}>{item.college}</Text>
          <Text style={styles.department}>{item.department}</Text>
        </View>
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={() => handleMessage(item.phone, item.name)}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="Patrons" 
        onLeftPress={() => {}} // Logo press
        rightIcon1="notifications-outline"
        onRightPress1={() => {}}
      />
      
      <FlatList
        data={PATRONS}
        renderItem={renderPatron}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
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
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#1a1a1a', // Dark gray card background
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700', // Gold/Yellow accent
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  patronImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFD700', // Gold border
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  college: {
    fontSize: 14,
    color: '#FFD700', // Yellow for college
    marginBottom: 2,
    fontWeight: '600',
  },
  department: {
    fontSize: 13,
    color: '#ccc', // Light gray for department
  },
  messageButton: {
    backgroundColor: '#FFD700', // Yellow button
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  messageText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
})
