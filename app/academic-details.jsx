import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import CustomHeader from '../components/CustomHeader'
import { auth, db } from '../services/firebase'

export default function AcademicDetailsScreen() {
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
          if (userDoc.exists()) {
            setUserData(userDoc.data())
          }
        }
      } catch (error) {
        console.error("Error fetching user data: ", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [])

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    )
  }

  const DetailCard = ({ icon, title, value }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color="#FFD700" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value || 'Not set'}</Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="Academic Details" 
        onLeftPress={() => router.back()} 
      />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Student Information</Text>
          <Text style={styles.headerSubtitle}>Your current academic standing</Text>
        </View>

        <View style={styles.cardsContainer}>
          <DetailCard 
            icon="calendar-outline" 
            title="Year" 
            value={userData?.year ? `Year ${userData.year}` : null} 
          />
          
          <DetailCard 
            icon="book-outline" 
            title="Program" 
            value={userData?.program} 
          />
          
          <DetailCard 
            icon="business-outline" 
            title="Department" 
            value={userData?.department} 
          />
          
           <DetailCard 
            icon="school-outline" 
            title="College" 
            value={userData?.college} 
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
          <Text style={styles.infoText}>
            To update these details, please go to Edit Profile.
          </Text>
        </View>
      </ScrollView>
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
  content: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 30,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  cardsContainer: {
    gap: 15,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    flex: 1,
  },
})
