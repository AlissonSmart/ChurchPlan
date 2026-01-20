import React from 'react';
import { View, StyleSheet, useColorScheme, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// Telas
import HomeScreen from '../screens/HomeScreen';
import PlanningScreen from '../screens/PlanningScreen';
import TeamsScreen from '../screens/TeamsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MenuScreen from '../screens/MenuScreen';

const Tab = createBottomTabNavigator();

/**
 * Navegador de abas principal
 * @returns {React.ReactNode}
 */
const MainTabsNavigator = () => {
  const isDarkMode = useColorScheme() === 'dark';
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
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
        tabBarActiveTintColor: '#5E5CEC',
        tabBarInactiveTintColor: isDarkMode ? '#A0A0A5' : '#65676B',
        tabBarStyle: {
          display: 'none', // Oculta a barra de navegação padrão, pois usamos o TabScreenWrapper
        },
        tabBarLabelStyle: {
          fontSize: 12,
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
        component={PlanningScreen} 
        options={{ title: 'Planejar' }}
      />
      <Tab.Screen 
        name="Equipes" 
        component={TeamsScreen} 
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
};

const styles = StyleSheet.create({
  tabBarBackgroundLight: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  tabBarBackgroundDark: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 30, 0.4)',
  },
});

export default MainTabsNavigator;
