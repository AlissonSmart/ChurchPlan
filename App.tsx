/**
 * ChurchPlanMobile App
 *
 * @format
 */

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, Platform, View, Text, TouchableOpacity, Animated } from 'react-native';
// @ts-ignore - Ignorando erro de tipagem
import { BlurView } from '@react-native-community/blur';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// Componentes e telas
import HomeScreen from './src/screens/HomeScreen';
import VideosScreen from './src/screens/VideosScreen';
import GroupsScreen from './src/screens/GroupsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import MenuScreen from './src/screens/MenuScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { HeaderContext } from './src/contexts/HeaderContext';

// Criando os navegadores
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Componente de cabeçalho personalizado para cada tela
function Header({ title, route, navigation }: { title: string, route: string, navigation: any }) {
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === 'dark';
  const { showLargeTitle } = useContext(HeaderContext);
  const shouldShowLargeTitle = route === 'Agenda' && showLargeTitle;
  const largeTitleAnim = useRef(new Animated.Value(shouldShowLargeTitle ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(largeTitleAnim, {
      toValue: shouldShowLargeTitle ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [shouldShowLargeTitle, largeTitleAnim]);

  const collapsedOpacity = largeTitleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const largeOpacity = largeTitleAnim;
  
  return (
    <View
      style={[
        styles.headerContainer,
        {
          paddingTop: insets.top,
          paddingBottom: 8,
        },
        isDarkMode ? styles.headerContainerDark : styles.headerContainerLight,
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={isDarkMode ? 'materialDark' : 'materialLight'}
          blurAmount={30}
          reducedTransparencyFallbackColor={isDarkMode ? '#1C1C1E' : '#FFFFFF'}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            isDarkMode ? styles.headerTranslucentDark : styles.headerTranslucentLight,
          ]}
        />
      )}

      <View style={styles.headerContentWrapper}>
        <Animated.View
          style={[
            styles.headerLargeContent,
            {
              opacity: largeOpacity,
            },
          ]}
          pointerEvents={shouldShowLargeTitle ? 'auto' : 'none'}
        >
          <Text style={[styles.headerLargeTitle, isDarkMode && styles.headerLargeTitleDark]}>{title}</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.headerButton, isDarkMode && styles.headerButtonDark]}>
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
              <FontAwesome name="bell" size={22} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={[styles.profileCircle, isDarkMode && styles.profileCircleDark]}>
                <Text style={styles.profileText}>A</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.headerCollapsedContent,
            {
              opacity: collapsedOpacity,
            },
          ]}
          pointerEvents={!shouldShowLargeTitle ? 'auto' : 'none'}
        >
          <Text style={[styles.headerCollapsedTitle, isDarkMode && styles.headerCollapsedTitleDark]}>{title}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

function MainTabs() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
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
            tabBarInactiveTintColor: isDarkMode ? '#A0A0A5' : '#65676B',
            tabBarStyle: {
              ...styles.tabBar,
              height: Platform.OS === 'ios' && !Platform.isPad && !Platform.isTV ? 85 : Platform.OS === 'android' ? 65 : 60,
              paddingBottom: Platform.OS === 'ios' && !Platform.isPad && !Platform.isTV ? 30 : Platform.OS === 'android' ? 10 : 5,
              backgroundColor: Platform.OS === 'ios'
                ? 'transparent'
                : (isDarkMode ? 'rgba(28, 28, 30, 0.4)' : 'rgba(255, 255, 255, 0.4)'),
              borderTopColor: isDarkMode ? 'rgba(56, 56, 58, 0.3)' : 'rgba(228, 230, 235, 0.3)',
            },
            tabBarBackground: () => (
              Platform.OS === 'ios' ? (
                <BlurView
                  style={StyleSheet.absoluteFill}
                  blurType={isDarkMode ? 'materialDark' : 'materialLight'}
                  blurAmount={30}
                />
              ) : (
                <View
                  style={isDarkMode ? styles.tabBarBackgroundDark : styles.tabBarBackgroundLight}
                />
              )
            ),
            headerShown: true,
            header: ({ navigation, route, options }) => {
              return <Header title={route.name} route={route.name} navigation={navigation} />;
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
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [showLargeTitle, setShowLargeTitle] = useState(true);

  const headerContextValue = useMemo(() => ({
    showLargeTitle,
    setShowLargeTitle,
  }), [showLargeTitle]);
  
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <HeaderContext.Provider value={headerContextValue}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </HeaderContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    paddingTop: 5,
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
    position: 'relative',
    overflow: 'hidden',
  },
  headerContainerLight: {
    backgroundColor: 'transparent',
  },
  headerContainerDark: {
    borderBottomColor: 'rgba(56, 56, 58, 0.8)',
    backgroundColor: 'transparent',
  },
  headerTranslucentLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  headerTranslucentDark: {
    backgroundColor: 'rgba(28, 28, 30, 0.4)',
  },
  headerContentWrapper: {
    height: 64,
    justifyContent: 'flex-end',
  },
  headerLargeContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerLargeTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerLargeTitleDark: {
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCollapsedContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerCollapsedTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  headerCollapsedTitleDark: {
    color: '#FFFFFF',
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
  headerButtonDark: {
    backgroundColor: 'rgba(255,255,255,0.18)',
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
  profileCircleDark: {
    backgroundColor: '#2E89FF',
  },
  profileText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabBarBackgroundLight: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  tabBarBackgroundDark: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 30, 0.4)',
  },
});

export default App;
