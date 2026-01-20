import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 * Componente de botão de ação
 * @param {Object} props - Propriedades do componente
 * @param {string} props.title - Texto do botão
 * @param {Function} props.onPress - Função chamada ao pressionar o botão
 * @param {string} props.icon - Nome do ícone do FontAwesome
 * @param {string} props.backgroundColor - Cor de fundo do botão
 * @param {Object} props.style - Estilos adicionais
 * @returns {React.ReactNode}
 */
const ActionButton = ({ 
  title, 
  onPress, 
  icon, 
  backgroundColor = '#00C6AE', 
  style 
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor }, 
        style
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon && (
        <FontAwesome 
          name={icon} 
          size={20} 
          color="#FFFFFF" 
          style={styles.icon} 
        />
      )}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ActionButton;
