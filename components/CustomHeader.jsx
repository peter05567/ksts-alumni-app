import { Ionicons } from '@expo/vector-icons'
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function CustomHeader({ title ,leftIcon, onLeftPress, onRightPress1, onRightPress2, rightIcon1, rightIcon2 }) {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.content}>
          {/* Left Icon */}
          <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
            <Image source={require('@/assets/images/logo.jpg')} style={styles.icon} />
          </TouchableOpacity>

          {/* Title in Middle */}
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
          </View>

          {/* Two Icons on Right */}
          <View style={styles.rightContainer}>
            <TouchableOpacity onPress={onRightPress1} style={styles.iconButton}>
              <Ionicons name={rightIcon1} size={24} color="#FFD700" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onRightPress2} style={[styles.iconButton, styles.lastIcon]}>
              <Ionicons name={rightIcon2} size={24} color="#FFD700" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000', // Black background
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)', // Subtle yellow border
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  safeArea: {
    backgroundColor: '#000',
  },
  content: {
    height: 56, // Standard header height
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastIcon: {
    marginRight: -8, // Compensate for padding to align with edge
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    borderRadius: 25,
  },
})
