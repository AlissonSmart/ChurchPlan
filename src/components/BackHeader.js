import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, useColorScheme } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BackHeader = ({ title, onBack }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={[
        styles.container, 
        isDarkMode && styles.containerDark,
        { paddingTop: insets.top }
      ]}
    >
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <FontAwesome name="chevron-left" size={18} color={isDarkMode ? '#FFFFFF' : '#000000'} />
      </TouchableOpacity>
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>{title}</Text>
      <View style={styles.rightPlaceholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
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
    }),
  },
  containerDark: {
    backgroundColor: 'rgba(28,28,30,0.92)',
    borderBottomColor: '#38383A',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  rightPlaceholder: {
    width: 40,
  },
});

export default BackHeader;
