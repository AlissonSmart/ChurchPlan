import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 * Componente de botão simples com degradê ou vazado
 * @param {Object} props - Propriedades do componente
 * @param {string} props.title - Texto do botão
 * @param {Function} props.onPress - Função chamada ao pressionar o botão
 * @param {string} props.icon - Nome do ícone do FontAwesome
 * @param {boolean} props.outlined - Se verdadeiro, renderiza o botão vazado
 * @param {boolean} props.loading - Se verdadeiro, mostra um indicador de carregamento
 * @param {Object} props.style - Estilos adicionais
 * @returns {React.ReactNode}
 */
const StandardButton = ({ 
  title, 
  onPress, 
  icon, 
  outlined = false,
  loading = false,
  style
}) => {
  // Cores do degradê
  const gradientColors = ['#1ac8aa', '#29a6f8'];
  
  // Renderizar botão com degradê
  if (!outlined) {
    return (
      <TouchableOpacity 
        onPress={loading ? null : onPress}
        activeOpacity={0.8}
        style={[styles.buttonContainer, style]}
        disabled={loading}
      >
        <LinearGradient
          colors={gradientColors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.contentContainer}>
              {icon && (
                <FontAwesome 
                  name={icon} 
                  size={16} 
                  color="#FFFFFF" 
                  style={styles.icon} 
                />
              )}
              <Text style={styles.text}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  
  // Renderizar botão vazado
  return (
    <TouchableOpacity 
      onPress={loading ? null : onPress}
      activeOpacity={0.8}
      style={[styles.outlinedButton, style]}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#29a6f8" size="small" />
      ) : (
        <View style={styles.contentContainer}>
          {icon && (
            <FontAwesome 
              name={icon} 
              size={16} 
              color="#29a6f8" 
              style={styles.icon} 
            />
          )}
          <Text style={styles.outlinedText}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 50, // Botão 100% arredondado (pill shape)
    overflow: 'hidden',
    height: 44, // Altura fixa seguindo padrão iOS
  },
  gradient: {
    height: 44, // Altura fixa seguindo padrão iOS
    paddingHorizontal: 5, // Mínimo possível para texto caber
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50, // Botão 100% arredondado (pill shape)
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%', // Ocupa toda a altura do botão
  },
  text: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500', // Peso da fonte mais leve, como no iOS
    marginLeft: 4,
  },
  icon: {
    // Sem margin-right para centralizar com o texto
    width: 16,
  },
  outlinedButton: {
    borderWidth: 1,
    borderColor: '#29a6f8',
    borderRadius: 50, // Botão 100% arredondado (pill shape)
    height: 44, // Altura fixa seguindo padrão iOS
    paddingHorizontal: 5, // Mínimo possível para texto caber
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  outlinedText: {
    color: '#29a6f8',
    fontSize: 15,
    fontWeight: '500', // Peso da fonte mais leve, como no iOS
    marginLeft: 4,
  },
});

export default StandardButton;
