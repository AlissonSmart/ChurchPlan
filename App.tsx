/**
 * ChurchPlanMobile App
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, Image, Platform, View, Text, TouchableOpacity } from 'react-native';
// @ts-ignore - Ignorando erro de tipagem
import { BlurView } from '@react-native-community/blur';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// Componentes e telas
import HomeScreen from './src/screens/HomeScreen';
import VideosScreen from './src/screens/VideosScreen';
import GroupsScreen from './src/screens/GroupsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import MenuScreen from './src/screens/MenuScreen';

// Criando o navegador de tabs
const Tab = createBottomTabNavigator();

// Componente de cabeçalho personalizado para cada tela
function Header({ title, route }: { title: string, route: string }) {
  const insets = useSafeAreaInsets();
  const isHome = route === 'Home';
  
  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      {Platform.OS === 'ios' && (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="regular"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        />
      )}
      <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image
          source={require('./src/images/lg-church-plan-icon.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.headerCenter}>
        {!isHome && <Text style={styles.headerTitle}>{title}</Text>}
      </View>
      
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.headerButton}>
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
          <FontAwesome name="bell" size={22} color="#1877F2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>A</Text>
          </View>
        </TouchableOpacity>
      </View>
      </View>
    </View>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: string;
              
              switch (route.name) {
                case 'Agenda':
                  iconName = 'calendar';
                  break;
                case 'Planejar':
                  iconName = 'tasks';
                  break;
                case 'Equipes':
                  iconName = 'users';
                  break;
                case 'CheckIn':
                  iconName = 'map-marker';
                  break;
                case 'Midia':
                  iconName = 'play-circle';
                  break;
                default:
                  iconName = 'question';
              }
              
              return <FontAwesome name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#1877F2',
            tabBarInactiveTintColor: '#65676B',
            tabBarStyle: {
              ...styles.tabBar,
              height: Platform.OS === 'ios' && !Platform.isPad && !Platform.isTV ? 85 : Platform.OS === 'android' ? 65 : 60,
              paddingBottom: Platform.OS === 'ios' && !Platform.isPad && !Platform.isTV ? 30 : Platform.OS === 'android' ? 10 : 5,
              backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.7)' : '#FFFFFF',
            },
            tabBarBackground: () => (
              Platform.OS === 'ios' ? (
                <BlurView
                  style={StyleSheet.absoluteFill}
                  blurType="regular"
                  blurAmount={10}
                />
              ) : null
            ),
            headerShown: true,
            header: ({ navigation, route, options }) => {
              return <Header title={route.name} route={route.name} />;
            },
          })}
        >
          <Tab.Screen 
            name="Agenda" 
            component={HomeScreen} 
            options={{ title: 'Agenda' }}
          />
          <Tab.Screen 
            name="Planejar" 
            component={VideosScreen} 
            options={{ title: 'Planejar' }}
          />
          <Tab.Screen 
            name="Equipes" 
            component={GroupsScreen} 
            options={{ title: 'Equipes' }}
          />
          <Tab.Screen 
            name="CheckIn" 
            component={NotificationsScreen} 
            options={{ title: 'Check-in' }}
          />
          <Tab.Screen 
            name="Midia" 
            component={MenuScreen} 
            options={{ title: 'Mídia' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    paddingTop: 5,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E4E6EB',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(228, 230, 235, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    height: 40,
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1877F2',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FA383E',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1877F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
