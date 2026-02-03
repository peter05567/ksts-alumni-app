import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack,Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ActivityIndicator, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { auth } from '@/services/firebase';
import { useEffect, useState } from 'react';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator color="#FFD700" />
      </View>
    );
  }
 
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {!user && <Redirect href="/(auth)" />}
      {user && <Redirect href="/(tabs)" />}
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="editprofile" options={{ presentation: 'modal',headerShown: false }} />
        <Stack.Screen name="academic-details" options={{ presentation: 'modal',headerShown: false }} />
        <Stack.Screen name="patrons" options={{ presentation: 'modal',headerShown: false }} />
        <Stack.Screen name="individualchat/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="groupchats/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="group-info/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
