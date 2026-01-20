import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../styles/theme';

/**
 * Componente de controle segmentado simples
 */
const SegmentedControl = ({ segments, selectedKey, onSelect, style }) => {
  return (
    <View style={[styles.container, style]}>
      {segments.map((segment) => {
        const isSelected = segment.key === selectedKey;
        const backgroundColor = isSelected 
          ? (segment.key === 'people' ? '#007AFF' : '#1ac8aa')
          : '#F2F2F7';
        const textColor = isSelected ? '#FFFFFF' : '#8E8E93';
        
        return (
          <TouchableOpacity
            key={segment.key}
            style={[
              styles.segment,
              { backgroundColor },
              isSelected && styles.selectedSegment
            ]}
            onPress={() => onSelect(segment.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.segmentText, { color: textColor }]}>
              {segment.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#F2F2F7',
    height: 36, // Altura fixa para corresponder à imagem
  },
  segment: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSegment: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default SegmentedControl;
