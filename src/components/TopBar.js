import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Avatar from './Avatar';

const TopBar = ({ activeTab, onTabChange, navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  
  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const tabs = [
    { id: 'Agenda', icon: 'calendar', label: 'Agenda' },
    { id: 'Planejar', icon: 'tasks', label: 'Planejar' },
    { id: 'Equipes', icon: 'users', label: 'Equipes' },
    { id: 'CheckIn', icon: 'map-marker', label: 'Check-in' },
    { id: 'Midia', icon: 'play-circle', label: 'Mídia' },
  ];

  // Encontrar a tab ativa para mostrar o título correto
  const activeTabData = tabs.find(tab => tab.id === activeTab) || tabs[0];
  
  return (
    <View style={[
      styles.container, 
      isDarkMode && styles.containerDark,
      { paddingTop: insets.top }
    ]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>{activeTabData.label}</Text>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={handleProfilePress}
          accessibilityLabel="Notificações"
          accessibilityHint="Navega para a tela de configurações"
        >
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
          <FontAwesome name="bell" size={22} color="#1877F2" />
        </TouchableOpacity>
        <Avatar 
          initial="A" 
          onPress={handleProfilePress} 
          size={36} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
    backgroundColor: 'rgba(255,255,255,0.92)',
    zIndex: 1000,
    paddingTop: 0,
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backdropFilter: 'saturate(180%) blur(16px)',
        WebkitBackdropFilter: 'saturate(180%) blur(16px)',
      },
      default: {
        // native: deixamos sem sombra para manter estilo iOS glass quando usar Blur nativo futuramente
      },
    }),
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
    marginVertical: 8,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: 'rgba(28,28,30,0.92)',
    borderBottomColor: '#38383A',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(228,230,235,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  icon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FA383E',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TopBar;
