import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const TopBar = ({ activeTab, onTabChange }) => {

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
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{activeTabData.label}</Text>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.iconButton}>
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
    marginVertical: 4,
  },
  centerSection: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 40,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#1877F2',
  },
  tabIcon: {
    fontSize: 24,
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
    fontFamily: 'Inter',
  },
  profileButton: {
    width: 40,
    height: 40,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1877F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
});

export default TopBar;
