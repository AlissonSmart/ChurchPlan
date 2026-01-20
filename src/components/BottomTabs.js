import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

const BottomTabs = ({ activeTab, onTabChange }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const tabs = [
    { id: 'Agenda', icon: 'calendar', label: 'Agenda' },
    { id: 'Planejar', icon: 'tasks', label: 'Planejar' },
    { id: 'Equipes', icon: 'users', label: 'Equipes' },
    { id: 'CheckIn', icon: 'map-marker', label: 'Check-in' },
    { id: 'Midia', icon: 'play-circle', label: 'Mídia' },
  ];

  return (
    <View style={[
      styles.container, 
      isDarkMode && styles.containerDark,
      { paddingBottom: insets.bottom }
    ]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tabButton}
          onPress={() => onTabChange(tab.id)}
        >
          <View style={styles.iconContainer}>
            {tab.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{tab.badge}</Text>
              </View>
            )}
            <Icon
              name={tab.icon}
              size={24}
              color={activeTab === tab.id ? '#1877F2' : isDarkMode ? '#A0A0A5' : '#65676B'}
              style={[
                styles.icon,
                activeTab === tab.id && styles.iconActive,
              ]}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === tab.id && styles.activeTabLabel,
              isDarkMode && styles.tabLabelDark,
              activeTab === tab.id && isDarkMode && styles.activeTabLabelDark,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E4E6EB',
    paddingTop: 8,
    // A altura base é 56, mas o paddingBottom vai ser adicionado pelo insets.bottom
    ...Platform.select({
      web: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
      },
    }),
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  icon: {
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
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
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#65676B',
  },
  tabLabelDark: {
    color: '#A0A0A5',
  },
  activeTabLabel: {
    color: '#1877F2',
  },
  activeTabLabelDark: {
    color: '#1877F2',
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
    borderTopColor: '#38383A',
  },
  labelActive: {
    color: '#1877F2',
    fontWeight: '600',
  },
});

export default BottomTabs;
