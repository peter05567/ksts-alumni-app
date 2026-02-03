import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, setDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { auth, db } from '../../services/firebase'

export default function CreateGroupScreen() {
  const router = useRouter()
  const [groupName, setGroupName] = useState('')
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const currentUser = auth.currentUser

  useEffect(() => {
    if (!currentUser) return

    const usersRef = collection(db, 'users')
    const q = query(usersRef)

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allUsers = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== currentUser.uid)
      setUsers(allUsers)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const toggleUser = (userId) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const handleCreate = async () => {
    if (!groupName.trim() || creating) return

    setCreating(true)
    try {
      const participants = [currentUser.uid, ...Array.from(selectedUsers)]
      
      const groupData = {
        name: groupName.trim(),
        image: `https://ui-avatars.com/api/?name=${groupName.trim()}&background=random&color=fff&size=128`,
        lastMessage: 'Group created',
        lastMessageSender: 'System',
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
        participants: participants,
        messageCount: 0
      }

      const docRef = await addDoc(collection(db, 'groups'), groupData)
      
      // Also initialize read state for creator
      await setDoc(doc(db, 'users', currentUser.uid, 'groupStates', docRef.id), {
          lastReadCount: 0
      })

      router.replace(`/groupchats/${docRef.id}`)
    } catch (error) {
      console.error('Error creating group:', error)
      alert('Failed to create group')
      setCreating(false)
    }
  }

  const filteredUsers = users.filter(u => 
    (u.username || 'User').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderUserItem = ({ item }) => {
    const isSelected = selectedUsers.has(item.id)
    return (
      <TouchableOpacity 
        style={[styles.userItem, isSelected && styles.userItemSelected]} 
        onPress={() => toggleUser(item.id)}
      >
        <Image 
            source={{ uri: item.image || `https://ui-avatars.com/api/?name=${item.username || 'User'}&background=FFD700&color=000` }} 
            style={styles.avatar} 
        />
        <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.username || 'Unknown User'}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <Ionicons 
            name={isSelected ? "checkbox" : "square-outline"} 
            size={24} 
            color={isSelected ? "#FFD700" : "#666"} 
        />
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Group</Text>
        <TouchableOpacity 
            onPress={handleCreate} 
            disabled={!groupName.trim() || creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#FFD700" />
          ) : (
            <Text style={[styles.headerButton, !groupName.trim() && styles.disabledButton]}>Create</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Group Name Input */}
        <View style={styles.inputContainer}>
            <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={24} color="#666" />
            </View>
            <TextInput
                style={styles.nameInput}
                placeholder="Group Name"
                placeholderTextColor="#666"
                value={groupName}
                onChangeText={setGroupName}
            />
        </View>

        {/* Search Users */}
        <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>

        {/* User List */}
        <Text style={styles.sectionTitle}>Select Participants ({selectedUsers.size})</Text>
        {loading ? (
            <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 20 }} />
        ) : (
            <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 30
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButton: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    color: 'rgba(255, 215, 0, 0.3)',
  },
  content: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  nameInput: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 16,
    padding: 10,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  sectionTitle: {
    color: '#666',
    marginLeft: 16,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  userItemSelected: {
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  userEmail: {
    color: '#666',
    fontSize: 12,
  },
})
