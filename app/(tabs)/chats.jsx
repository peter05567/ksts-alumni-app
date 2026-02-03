import CustomHeader from '@/components/CustomHeader'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { auth, db } from '../../services/firebase'



export default function ChatsScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('groups') // 'groups' or 'direct'
  const [rawGroups, setRawGroups] = useState([])
  const [userGroupStates, setUserGroupStates] = useState({})
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!auth.currentUser) return

    // 1. Subscribe to users collection
    const usersRef = collection(db, 'users')
    const qUsers = query(usersRef)

    const unsubscribeUsers = onSnapshot(qUsers, (userSnapshot) => {
      const allUsers = userSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== auth.currentUser?.uid)
      
      setRawUsers(allUsers)
    })

    return () => {
      unsubscribeUsers()
    }
  }, [])

  // Subscribe to Groups
  useEffect(() => {
    if (!auth.currentUser) return

    const groupsRef = collection(db, 'groups')
    const unsubscribeGroups = onSnapshot(groupsRef, (snapshot) => {
      const loadedGroups = snapshot.docs.map(doc => {
         const data = doc.data()
         let timeDisplay = ''
         if (data.lastMessageTime) {
            const date = data.lastMessageTime.toDate ? data.lastMessageTime.toDate() : new Date(data.lastMessageTime)
            timeDisplay = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
         }
         return { 
           id: doc.id, 
           ...data,
           time: timeDisplay,
         }
      })
      setRawGroups(loadedGroups)

      // Ensure General Group exists
      const hasGeneral = loadedGroups.some(g => g.id === 'general')
      if (!hasGeneral) {
        setDoc(doc(db, 'groups', 'general'), {
          name: 'General Chat Group',
          image: 'https://ui-avatars.com/api/?name=General+Chat&background=FFD700&color=000&size=128',
          lastMessage: 'Welcome to General Chat!',
          lastMessageTime: serverTimestamp(),
          createdAt: serverTimestamp(),
          messageCount: 0
        }).catch(err => console.error('Error creating general group:', err))
      }
    })

    return () => unsubscribeGroups()
  }, [])

  // Subscribe to User Group Read States
  useEffect(() => {
    if (!auth.currentUser) return
    const ref = collection(db, 'users', auth.currentUser.uid, 'groupStates')
    const unsubscribeStates = onSnapshot(ref, (snap) => {
        const states = {}
        snap.forEach(doc => states[doc.id] = doc.data())
        setUserGroupStates(states)
    })
    return () => unsubscribeStates()
  }, [])

  // Derive Groups with Unread
  const groups = rawGroups
    .filter(g => {
        // Show if General or if User is in participants
        if (g.id === 'general') return true
        if (g.participants && g.participants.includes(auth.currentUser?.uid)) return true
        return false 
    })
    .map(g => {
     const unread = (g.messageCount || 0) - (userGroupStates[g.id]?.lastReadCount || 0)
     return {
        ...g,
        unread: unread > 0 ? unread : 0
     }
  })

  // State to hold raw data
  const [rawUsers, setRawUsers] = useState([])
  const [chatData, setChatData] = useState({}) // { [chatId]: chatDocData }

  // Listen to chats
  useEffect(() => {
    if (!auth.currentUser) return

    const chatsRef = collection(db, 'chats')
    // We need to find chats where participants include me.
    // Since we just added 'participants' field, old chats might not have it.
    // But for new messages it works.
    
    const unsubscribeChats = onSnapshot(chatsRef, (snapshot) => {
      const data = {}
      snapshot.docs.forEach(doc => {
        const chat = doc.data()
        if (chat.participants && chat.participants.includes(auth.currentUser.uid)) {
           data[doc.id] = chat
        }
        // Also handle legacy way if needed (derived ID check), but we are moving forward.
        // For derived IDs: chat ID contains my UID.
        if (doc.id.includes(auth.currentUser.uid)) {
           data[doc.id] = chat
        }
      })
      setChatData(data)
      setLoading(false)
    })

    return () => unsubscribeChats()
  }, [])

  // Merge Data
  useEffect(() => {
    if (rawUsers.length === 0) return

    const merged = rawUsers.map(u => {
      const chatId = [auth.currentUser?.uid, u.id].sort().join('_')
      const chat = chatData[chatId]
      
      let timeDisplay = ''
      if (chat?.lastMessageTime) {
        // Convert timestamp to readable time
        const date = chat.lastMessageTime.toDate ? chat.lastMessageTime.toDate() : new Date(chat.lastMessageTime)
        timeDisplay = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        // Could add date logic (Yesterday, etc) if needed
      }

      const unreadCount = chat?.['unreadCount.' + auth.currentUser?.uid] || chat?.unreadCount?.[auth.currentUser?.uid] || 0

      // Debug logs
      console.log('Merging user:', u.id, 'Chat ID:', chatId)
      console.log('Chat Data:', chat)
      console.log('Unread Count Raw:', unreadCount)

      return {
        id: u.id,
        name: u.username || 'Unknown User',
        image: u.image || `https://ui-avatars.com/api/?name=${u.username || 'User'}&background=FFD700&color=000`,
        lastMessage: chat?.lastMessage || 'Tap to start chatting',
        time: timeDisplay,
        unread: unreadCount
      }
    })

    // Sort by last message time (descending) so active chats are top
    // Users with no chat come last
    merged.sort((a, b) => {
       const chatA = chatData[[auth.currentUser?.uid, a.id].sort().join('_')]
       const chatB = chatData[[auth.currentUser?.uid, b.id].sort().join('_')]
       const timeA = chatA?.lastMessageTime?.toMillis ? chatA.lastMessageTime.toMillis() : 0
       const timeB = chatB?.lastMessageTime?.toMillis ? chatB.lastMessageTime.toMillis() : 0
       return timeB - timeA
    })

    setUsers(merged)
    setLoading(false)
  }, [rawUsers, chatData])

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => {
        if (activeTab === 'direct') {
          router.push(`/individualchat/${item.id}`)
        } else {
          router.push(`/groupchats/${item.id}`)
        }
      }}
    >
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <View style={styles.lastMessageContainer}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {activeTab === 'groups' && item.lastMessageSender ? `${item.lastMessageSender.split(' ')[0]}: ` : ''}{item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="Chats" 
        leftIcon="menu-outline" 
        rightIcon1="search-outline" 
        rightIcon2="create-outline"
        onLeftPress={() => {}} 
        onRightPress1={() => setIsSearching(!isSearching)}
        onRightPress2={() => {}}
      />

      {isSearching && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <TouchableOpacity onPress={() => {
             setSearchQuery('')
             setIsSearching(false)
          }}>
             <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>Groups</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'direct' && styles.activeTab]}
          onPress={() => setActiveTab('direct')}
        >
          <Text style={[styles.tabText, activeTab === 'direct' && styles.activeTabText]}>Direct</Text>
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      {loading && activeTab === 'direct' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'groups' ? groups : filteredUsers}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.emptyText}>
                {activeTab === 'groups' ? 'No group chats yet' : 'No users found'}
              </Text>
            </View>
          }
        />
      )}

      {/* FAB for Creating Group */}
      {activeTab === 'groups' && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => router.push('/groupchats/create')}
        >
          <Ionicons name="add" size={30} color="#000" />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: '#FFD700',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#FFD700',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 12,
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    height: '100%',
  },
})
