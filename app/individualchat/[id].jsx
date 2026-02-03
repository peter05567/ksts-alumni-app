import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
    addDoc,
    collection,
    doc,
    getDoc,
    increment,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc
} from 'firebase/firestore'
import { useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { auth, db } from '../../services/firebase'

export default function IndividualChatScreen() {
  const { id } = useLocalSearchParams() // Assuming id is the recipient's UID
  const router = useRouter()
  const [recipient, setRecipient] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const flatListRef = useRef(null)

  const currentUser = auth.currentUser
  
  // Generate a consistent Chat ID based on the two User IDs
  const chatId = currentUser && id 
    ? [currentUser.uid, id].sort().join('_') 
    : null

  // Fetch Recipient Details
  useEffect(() => {
    const fetchRecipient = async () => {
      try {
        if (!id) return
        const userDoc = await getDoc(doc(db, 'users', id))
        if (userDoc.exists()) {
          setRecipient(userDoc.data())
        }
      } catch (error) {
        console.error("Error fetching recipient: ", error)
      }
    }
    fetchRecipient()

    // Reset unread count when entering chat
    if (chatId && currentUser) {
      const chatRef = doc(db, 'chats', chatId)
      // We use setDoc with merge to ensure doc exists or just update
      // But updateDoc fails if doc doesn't exist.
      // Safe to use setDoc with merge: true
      setDoc(chatRef, {
        [`unreadCount.${currentUser.uid}`]: 0
      }, { merge: true }).catch(err => console.log("Error resetting unread: ", err))
    }
  }, [id, chatId, currentUser])

  // Listen for Messages
  useEffect(() => {
    if (!chatId) return

    const messagesRef = collection(db, 'chats', chatId, 'messages')
    const q = query(messagesRef, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }))
      setMessages(msgs)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [chatId])

  const handleSend = async () => {
    if (inputText.trim().length === 0 || !chatId || !currentUser) return

    const text = inputText.trim()
    setInputText('')

    try {
      // 1. Add message to subcollection
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: text,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'User', // Fallback if needed
        createdAt: serverTimestamp(),
      })

      // 2. Update Chat Metadata (for the chat list)
      const chatRef = doc(db, 'chats', chatId)
      console.log('Updating metadata for chat:', chatId, 'Recipient:', id)
      
      await setDoc(chatRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        participants: [currentUser.uid, id],
        [`unreadCount.${id}`]: increment(1)
      }, { merge: true })
      
      console.log('Metadata updated successfully')
      
    } catch (error) {
      console.error("Error sending message: ", error)
    }
  }

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === currentUser?.uid
    return (
      <View style={[
        styles.messageContainer, 
        isMe ? styles.myMessageContainer : styles.theirMessageContainer
      ]}>
        {!isMe && (
          <Image 
            source={{ uri: recipient?.image || 'https://ui-avatars.com/api/?name=User&background=FFD700&color=000' }} 
            style={styles.messageAvatar} 
          />
        )}
        <View style={[
          styles.bubble, 
          isMe ? styles.myBubble : styles.theirBubble
        ]}>
          <Text style={[
            styles.messageText, 
            isMe ? styles.myMessageText : styles.theirMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={styles.timestamp}>
            {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Chat Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Image 
            source={{ uri: recipient?.image || 'https://ui-avatars.com/api/?name=User&background=FFD700&color=000' }} 
            style={styles.headerAvatar} 
          />
          <View>
            <Text style={styles.headerName}>{recipient?.username || 'Chat'}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="videocam-outline" size={24} color="#FFD700" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="call-outline" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={styles.keyboardAvoidingView}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item._id}
            inverted
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add" size={24} color="#FFD700" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Message..."
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            multiline
          />
          
          <TouchableOpacity 
            style={[styles.sendButton, inputText.trim().length === 0 && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={inputText.trim().length === 0}
          >
            <Ionicons name="send" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.1)',
    backgroundColor: '#000',
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  headerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerStatus: {
    color: '#FFD700',
    fontSize: 12,
  },
  headerIcon: {
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '100%',
  },
  myBubble: {
    backgroundColor: '#FFD700',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#000',
  },
  theirMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.1)',
    backgroundColor: '#000',
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#FFD700',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
})
