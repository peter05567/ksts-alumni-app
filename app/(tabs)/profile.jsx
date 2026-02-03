import CustomHeader from '@/components/CustomHeader'
import { auth, db } from '@/services/firebase'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import React, { useCallback, useState } from 'react'
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function ProfileScreen() {
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Fetch user data from Firestore using useFocusEffect to refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        try {
          if (auth.currentUser) {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
            if (userDoc.exists()) {
              setUserData(userDoc.data())
            }
          }
          setLoading(false)
        } catch (error) {
          console.error("Error fetching user data: ", error)
          setLoading(false)
        }
      }
      fetchUserData()
    }, [])
  )
  
  // Sign Out Function
  const handleSignOut = async () => {
    try {
      Alert.alert(
        "Sign Out",
        "Are you sure you want to sign out?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign Out", style: "destructive", onPress: async () => {
            await signOut(auth)
          } }
        ]
      )
    } catch (error) {
      console.error("Error signing out: ", error)
    }
  }
  

  const MenuOption = ({ icon, title, subtitle, onPress, isDestructive = false }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIconContainer, isDestructive && styles.destructiveIconBg]}>
        <Ionicons name={icon} size={22} color={isDestructive ? "#FF5252" : "#FFD700"} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, isDestructive && styles.destructiveText]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.3)" />
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="My Profile" 
        onLeftPress={() => console.log('Menu')} 
        onRightPress1={() => console.log('Settings')} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: userData?.image }} style={styles.profileImage} />
            <TouchableOpacity style={styles.editImageButton}>
              <Ionicons name="camera" size={16} color="#000" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{userData?.username || 'Loading...'}</Text>
          <Text style={styles.userCollege}>{userData?.college || 'Loading...'}</Text>
          <Text style={styles.userEmail}>{userData?.email || 'Loading...'}</Text>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>ID: {userData?.studentId || 'Loading...'}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/(tabs)/finance')}
          >
            <Ionicons name="wallet-outline" size={24} color="#000" />
            <Text style={styles.actionButtonText}>Finance</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButtonSecondary} 
            onPress={() => router.push('/editprofile')}
          >
            <Ionicons name="pencil-outline" size={24} color="#FFD700" />
            <Text style={styles.actionButtonTextSecondary}>Edit Info</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>Account Settings</Text>
          
          <MenuOption 
            icon="school-outline" 
            title="Academic Details" 
            subtitle="Year, Program, Department"
            onPress={() => router.push('/academic-details')}
          />
          <MenuOption 
            icon="notifications-outline" 
            title="Notifications" 
            subtitle="Manage alerts & updates"
          />
          <MenuOption 
            icon="people-outline" 
            title="Patrons" 
            subtitle="View and know your patrons"
            onPress={() => router.push('/patrons')}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>Support</Text>
          <MenuOption 
            icon="help-circle-outline" 
            title="Help & Support" 
          />
          <MenuOption 
            icon="log-out-outline" 
            title="Log Out" 
            isDestructive 
            onPress={handleSignOut}
          />
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
  scrollContent: {
    paddingBottom: 80,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.1)',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFD700',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userCollege: {
    fontSize: 16,
    color: '#FFD700', // Yellow accent
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  idBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  idText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  actionButtonTextSecondary: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  destructiveIconBg: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  destructiveText: {
    color: '#FF5252',
  },
  menuSubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginTop: 2,
  },
})
