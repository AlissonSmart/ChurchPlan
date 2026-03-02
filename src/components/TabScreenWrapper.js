import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import TopBar from './TopBar';
import BottomTabs from './BottomTabs';

/**
 * TabScreenWrapper - Componente que encapsula as telas com TopBar e BottomTabs
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Conteúdo da tela
 * @param {string} props.activeTab - Aba ativa atual
 * @param {Function} props.navigation - Objeto de navegação
 * @returns {React.ReactNode}
 */
const TabScreenWrapper = ({ children, activeTab, navigation }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    translateAnim.setValue(6);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab, fadeAnim, translateAnim]);

  // Função para mudar de aba
  const handleTabChange = (tabId) => {
    navigation.navigate(tabId);
  };

  return (
    <View style={styles.container}>
      <TopBar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        navigation={navigation} 
      />
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: translateAnim }] }
        ]}
      >
        {children}
      </Animated.View>
      <BottomTabs activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    // Garantir que o conteúdo não seja cortado pelo TopBar ou BottomTabs
    marginTop: 0,
    marginBottom: 0,
  },
});

export default TabScreenWrapper;
