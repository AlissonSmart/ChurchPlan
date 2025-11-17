import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, StyleSheet, Platform } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const TopBar = ({ activeTab, onTabChange }) => {
  const [searchText, setSearchText] = useState('');

  const tabs = [
    { id: 'Agenda', icon: 'calendar', label: 'Agenda' },
    { id: 'Planejar', icon: 'tasks', label: 'Planejar' },
    { id: 'Equipes', icon: 'users', label: 'Equipes' },
    { id: 'CheckIn', icon: 'map-marker', label: 'Check-in' },
    { id: 'Midia', icon: 'play-circle', label: 'Mídia' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../images/lg-church-plan-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={16} color="#65676B" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar no ChurchPlan"
            placeholderTextColor="#65676B"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <View style={styles.centerSection}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
            onPress={() => onTabChange(tab.id)}
          >
            <FontAwesome
              name={tab.icon}
              size={24}
              color={activeTab === tab.id ? '#1877F2' : '#65676B'}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="th" size={20} color="#65676B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
          <FontAwesome name="bell" size={20} color="#65676B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>U</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    borderRadius: 8,
  },
  logo: {
    width: 40,
    height: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240,242,245,0.7)',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    flex: 1,
    maxWidth: 240,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#050505',
    outlineStyle: 'none',
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
