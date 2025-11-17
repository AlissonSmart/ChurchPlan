import React from 'react';
import { Text } from 'react-native';
import theme from '../styles/theme';

/**
 * Componente que simula texto com gradiente
 * @param {Object} props - Propriedades do componente
 * @param {String} props.text - Texto a ser exibido
 * @param {Array} props.colors - Cores do gradiente (não usado na versão simplificada)
 * @param {Object} props.start - Ponto inicial do gradiente (não usado na versão simplificada)
 * @param {Object} props.end - Ponto final do gradiente (não usado na versão simplificada)
 * @param {Object} props.style - Estilo do texto
 * @returns {React.ReactNode}
 */
const GradientText = ({
  text,
  colors = [theme.colors.gradient.start, theme.colors.gradient.end],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  style,
  ...restProps
}) => {
  // Versão simplificada que usa a cor final do gradiente
  return (
    <Text 
      style={[{ color: colors[1], fontWeight: '600' }, style]} 
      {...restProps}
    >
      {text}
    </Text>
  );
};

export default GradientText;
