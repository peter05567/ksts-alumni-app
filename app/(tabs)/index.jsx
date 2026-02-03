import CustomHeader from '@/components/CustomHeader'
import React from 'react'
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// Dummy Data matching the image
const NEWS_DATA = [
  {
    id: '1',
    category: 'Finance',
    title: 'Alumni Scholarship Fund Reaches Record High for 2024',
    description: 'Thanks to the generous contributions of alumni, the KSTS Scholarship Fund has surpassed its target, providing financial aid...',
    author: 'Finance Committee',
    date: 'December 01, 2023',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', // Graduation/Scholarship related
  },
  {
    id: '2',
    category: 'Sports',
    title: 'KSTS Annual Sports Day: A Day of Athletic Prowess',
    description: 'The KSTS community celebrated its annual sports day with enthusiastic participation from students and faculty. Records were...',
    author: 'Sports Department',
    date: 'September 18, 2023',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', // Sports related
  },
  {
    id: '3',
    category: 'Academics',
    title: 'New Science Laboratory Inaugurated by the Vice Chancellor',
    description: 'State-of-the-art facilities added to the science department to enhance practical learning experiences for all students.',
    author: 'Admin Office',
    date: 'August 15, 2023',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', // Science lab related
  },
]

const NewsCard = ({ item }) => (
  <View style={styles.card}>
    {/* Image Section */}
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
    </View>

    {/* Content Section */}
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      
      <View style={styles.metaContainer}>
        <Text style={styles.metaText}>{item.author}</Text>
        <Text style={styles.metaText}>{item.date}</Text>
      </View>

      <TouchableOpacity>
        <Text style={styles.readMore}>Read More</Text>
      </TouchableOpacity>
    </View>
  </View>
)

export default function index() {
  return (
    <View style={styles.container}>
      <CustomHeader 
        rightIcon1='notifications-outline'
        rightIcon2='person-circle-outline'
        title="KSTS KNUST" 
        onLeftPress={() => console.log('Menu')} 
        onRightPress1={() => console.log('Notif')} 
        onRightPress2={() => console.log('Profile')} 
      />
      
      <FlatList
        data={NEWS_DATA}
        renderItem={({ item }) => <NewsCard item={item} />}
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
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  readMore: {
    color: '#FFD700', // Yellow link
    fontWeight: 'bold',
    fontSize: 14,
  },
})
