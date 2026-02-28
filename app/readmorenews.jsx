import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { db } from '../services/firebase'

export default function readmorenews() {
  const { id } = useLocalSearchParams()
  const [newsItem, setNewsItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) return
      try {
        const docRef = doc(db, 'news', id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setNewsItem({ id: docSnap.id, ...docSnap.data() })
        } else {
          console.log('No such document!')
        }
      } catch (error) {
        console.error('Error fetching news:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [id])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    )
  }

  if (!newsItem) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>News item not found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>News Details</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: newsItem.image }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{newsItem.category}</Text>
          </View>
        </View>

        {/* Title and Metadata */}
        <Text style={styles.title}>{newsItem.title}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={16} color="#888" />
            <Text style={styles.metaText}>{newsItem.author || 'Admin'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color="#888" />
            <Text style={styles.metaText}>
              {newsItem.date || (newsItem.createdAt?.toDate ? new Date(newsItem.createdAt.toDate()).toLocaleDateString() : 'Recent')}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Full Content */}
        <Text style={styles.description}>
          {newsItem.description}
        </Text>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.1)',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    margin: 16,
    lineHeight: 32,
  },
  metaContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metaText: {
    color: '#888',
    marginLeft: 6,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  description: {
    color: '#ddd',
    fontSize: 16,
    lineHeight: 26,
    paddingHorizontal: 16,
    textAlign: 'justify',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  backButton: {
    marginTop: 20,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: '#FFD700',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
})