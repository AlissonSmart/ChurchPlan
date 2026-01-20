/**
 * ChurchPlanMobile App
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-url-polyfill/auto';

// Contextos
import { HeaderContext } from './src/contexts/HeaderContext';
import { AuthProvider, AuthContext } from './src/contexts/AuthContext';

// Navegação
import RootNavigator from './src/navigation/RootNavigator';


function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [showLargeTitle, setShowLargeTitle] = React.useState(true);
  
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <HeaderContext.Provider value={{ showLargeTitle, setShowLargeTitle }}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </HeaderContext.Provider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});

export default App;
