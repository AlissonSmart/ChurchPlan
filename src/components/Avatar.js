import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';

/**
 * Componente de Avatar reutilizável
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.initial - Inicial do nome do usuário
 * @param {Function} props.onPress - Função a ser chamada ao clicar no avatar
 * @param {number} props.size - Tamanho do avatar (padrão: 36)
 * @returns {React.ReactNode}
 */
const Avatar = ({ initial = 'A', onPress, size = 36 }) => {
  const isDarkMode = useColorScheme() === 'dark';
  
  const circleSize = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };
  
  const textSize = {
    fontSize: size * 0.5,
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      accessibilityLabel="Avatar do usuário"
      accessibilityHint="Toque para acessar as configurações do perfil"
    >
      <View style={[
        styles.circle, 
        circleSize,
        isDarkMode && styles.circleDark
      ]}>
        <Text style={[styles.text, textSize]}>{initial}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    backgroundColor: '#1877F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleDark: {
    backgroundColor: '#2E89FF',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default Avatar;
