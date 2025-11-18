import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabsNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import SqlFixerScreen from '../screens/SqlFixerScreen';

const Stack = createNativeStackNavigator();

/**
 * Navegador principal do aplicativo quando o usuário está autenticado
 * @returns {React.ReactNode}
 */
const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="SqlFixer" component={SqlFixerScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
