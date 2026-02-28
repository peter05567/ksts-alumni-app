import CustomHeader from '@/components/CustomHeader'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { auth, db } from '../../services/firebase'

const NewsCard = ({ item, onDelete }) => (
  <View style={styles.card}>
    {/* Image Section */}
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
      {auth.currentUser?.uid === item.authorId && (
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => onDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>

    {/* Content Section */}
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription} numberOfLines={2} ellipsizeMode="tail">
        {item.description}
      </Text>
      
      <View style={styles.metaContainer}>
        <Text style={styles.metaText}>{item.author || 'Admin'}</Text>
        <Text style={styles.metaText}>
          {item.date || (item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Recent')}
        </Text>
      </View>

      <TouchableOpacity onPress={() => router.push(`/readmorenews?id=${item.id}`)}>
        <Text style={styles.readMore}>Read More</Text>
      </TouchableOpacity>
    </View>
  </View>
)

export default function index() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setNews(newsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleDelete = (id) => {
    Alert.alert(
      "Delete News",
      "Are you sure you want to delete this news item?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'news', id))
            } catch (error) {
              console.error("Error deleting news:", error)
              Alert.alert("Error", "Failed to delete news")
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.container}>
      <CustomHeader 
        rightIcon1='notifications-outline'
        rightIcon2='add-circle-outline'
        title="KSTS KNUST" 
        onLeftPress={() => console.log('Menu')} 
        onRightPress1={() => console.log('Notif')} 
        onRightPress2={() => router.push('/addnews')} 
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : (
        <FlatList
          data={news}
          renderItem={({ item }) => <NewsCard item={item} onDelete={handleDelete} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No news available yet.</Text>
          }
        />
      )}
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
    height: 200,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FFD700', // Yellow badge
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 28,
  },
  cardDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    lineHeight: 22,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 12,
  },
  metaText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  readMore: {
    color: '#FFD700', // Yellow link
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    alignSelf: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    opacity: 0.6,
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
})
