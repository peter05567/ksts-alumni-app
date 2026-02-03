import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { arrayRemove, arrayUnion, collection, doc, onSnapshot, query, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { auth, db } from '../../services/firebase'

export default function GroupInfoScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [group, setGroup] = useState(null)
  const [participants, setParticipants] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [isAdding, setIsAdding] = useState(false)
  
  const currentUser = auth.currentUser

  // Fetch Group
  useEffect(() => {
    if (!id) return
    const sub = onSnapshot(doc(db, 'groups', id), (doc) => {
        if (doc.exists()) setGroup({ id: doc.id, ...doc.data() })
    })
    return () => sub()
  }, [id])

  // Fetch All Users (for adding)
  useEffect(() => {
    const q = query(collection(db, 'users'))
    const sub = onSnapshot(q, (snap) => {
        setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => sub()
  }, [])

  // Derive Participants
  useEffect(() => {
    if (group?.participants && allUsers.length > 0) {
        const parts = allUsers.filter(u => group.participants.includes(u.id))
        setParticipants(parts)
    }
  }, [group, allUsers])

  const handleAddUser = async (userId) => {
    try {
        await updateDoc(doc(db, 'groups', id), {
            participants: arrayUnion(userId)
        })
        // Don't close adding immediately, allows adding multiple
    } catch (err) {
        console.error(err)
    }
  }

  const handleRemoveUser = async (userId) => {
    try {
        await updateDoc(doc(db, 'groups', id), {
            participants: arrayRemove(userId)
        })
    } catch (err) {
        console.error(err)
    }
  }

  // Filter users not in group for "Add" list
  const nonParticipants = allUsers.filter(u => !group?.participants?.includes(u.id))

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Info</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.groupHeader}>
        <Image 
            source={{ uri: group?.image || 'https://ui-avatars.com/api/?name=Group&background=FFD700&color=000' }} 
            style={styles.groupImage} 
        />
        <Text style={styles.groupName}>{group?.name}</Text>
        <Text style={styles.participantCount}>{participants.length} participants</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Participants</Text>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)}>
            <Ionicons name={isAdding ? "close-circle" : "add-circle"} size={28} color="#FFD700" />
        </TouchableOpacity>
      </View>

      {isAdding && (
        <View style={styles.addSection}>
            <Text style={styles.subTitle}>Add Participants</Text>
            {nonParticipants.length === 0 ? (
                <Text style={styles.emptyText}>No users to add</Text>
            ) : (
                <FlatList
                    data={nonParticipants}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.addUserItem} onPress={() => handleAddUser(item.id)}>
                            <Image source={{ uri: item.image || `https://ui-avatars.com/api/?name=${item.username}&background=random` }} style={styles.smallAvatar} />
                            <Text style={styles.smallName} numberOfLines={1}>{item.username || 'User'}</Text>
                            <View style={styles.addIconContainer}>
                                <Ionicons name="add" size={16} color="#000" />
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
      )}

      <FlatList
        data={participants}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
            <View style={styles.participantItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={{ uri: item.image || `https://ui-avatars.com/api/?name=${item.username}&background=random` }} style={styles.avatar} />
                    <Text style={styles.name}>{item.username || 'User'}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveUser(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </TouchableOpacity>
            </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  groupImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFD700',
    marginBottom: 12,
  },
  groupName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  participantCount: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  addSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  subTitle: {
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 16,
    marginBottom: 12,
    fontSize: 12,
  },
  addUserItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  smallAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 4,
    backgroundColor: '#333',
  },
  smallName: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
  },
  addIconContainer: {
    position: 'absolute',
    bottom: 14,
    right: 0,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#333',
  },
  name: {
    color: '#fff',
    fontSize: 16,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    marginLeft: 16,
    fontStyle: 'italic',
  },
})
