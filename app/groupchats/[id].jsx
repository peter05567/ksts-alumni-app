import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
    addDoc,
    collection,
    doc,
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

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [group, setGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const flatListRef = useRef(null)

  const currentUser = auth.currentUser

  // Fetch Group Details
  useEffect(() => {
    if (!id) return
    const groupRef = doc(db, 'groups', id)
    const unsubscribe = onSnapshot(groupRef, (doc) => {
        if (doc.exists()) {
            setGroup(doc.data())
        }
    })
    return () => unsubscribe()
  }, [id])

  // Update User's Last Read Count
  useEffect(() => {
    if (group?.messageCount && currentUser && id) {
       const userGroupStateRef = doc(db, 'users', currentUser.uid, 'groupStates', id)
       setDoc(userGroupStateRef, {
          lastReadCount: group.messageCount
       }, { merge: true }).catch(err => console.error("Error updating read state:", err))
    }
  }, [group?.messageCount, id, currentUser])

  // Listen for Messages
  useEffect(() => {
    if (!id) return

    const messagesRef = collection(db, 'groups', id, 'messages')
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
  }, [id])

  const handleSend = async () => {
    if (inputText.trim().length === 0 || !id || !currentUser) return

    const text = inputText.trim()
    setInputText('')

    try {
      // 1. Add message to subcollection
      await addDoc(collection(db, 'groups', id, 'messages'), {
        text: text,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        senderImage: currentUser.photoURL || null,
        createdAt: serverTimestamp(),
      })

      // 2. Update Group Metadata
      const groupRef = doc(db, 'groups', id)
      await setDoc(groupRef, {
        lastMessage: text,
        lastMessageSender: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
        lastMessageTime: serverTimestamp(),
        messageCount: increment(1)
      }, { merge: true })
      
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
            source={{ uri: item.senderImage || `https://ui-avatars.com/api/?name=${item.senderName || 'User'}&background=FFD700&color=000` }} 
            style={styles.messageAvatar} 
          />
        )}
        <View style={{ maxWidth: '100%' }}>
            {!isMe && <Text style={styles.senderName}>{item.senderName}</Text>}
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
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Image 
            source={{ uri: group?.image || 'https://ui-avatars.com/api/?name=Group&background=FFD700&color=000' }} 
            style={styles.headerAvatar} 
          />
          <View>
            <Text style={styles.headerName}>{group?.name || 'Group Chat'}</Text>
            <Text style={styles.headerStatus}>{messages.length} messages</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.headerIcon}
          onPress={() => router.push(`/group-info/${id}`)}
        >
          <Ionicons name="information-circle-outline" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
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
    color: 'rgba(255, 255, 255, 0.5)',
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
    maxWidth: '85%',
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
    alignSelf: 'flex-start',
    marginTop: 18, // Align with bubble roughly
  },
  senderName: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    marginBottom: 2,
    marginLeft: 4,
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