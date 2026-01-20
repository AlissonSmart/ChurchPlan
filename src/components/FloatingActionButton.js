import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 * Componente de botão de ação flutuante
 * @param {Object} props - Propriedades do componente
 * @param {Function} props.onPress - Função chamada ao pressionar o botão
 * @param {string} props.icon - Nome do ícone do FontAwesome
 * @param {Object} props.style - Estilos adicionais
 * @returns {React.ReactNode}
 */
const FloatingActionButton = ({ onPress, icon = 'plus', style }) => {
  return (
    <TouchableOpacity 
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <FontAwesome name={icon} size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5E5CEC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default FloatingActionButton;
