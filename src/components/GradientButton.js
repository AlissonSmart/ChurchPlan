import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  View 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../styles/theme';

/**
 * Botão com gradiente para telas de autenticação
 * Suporta loading state e opacidade condicional
 */
const GradientButton = ({ 
  title, 
  onPress, 
  disabled = false, 
  loading = false, 
  style, 
  textStyle,
  colors = [theme.colors.gradient.start, theme.colors.gradient.end],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  ...props 
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={[
          styles.gradient,
          { opacity: disabled ? 0.7 : 1 }
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={[styles.text, textStyle]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Versão do botão com borda gradiente e fundo transparente
export const OutlineGradientButton = ({ 
  title, 
  onPress, 
  disabled = false, 
  loading = false, 
  style, 
  textStyle,
  colors = [theme.colors.gradient.start, theme.colors.gradient.end],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  ...props 
}) => {
  return (
    <TouchableOpacity
      style={[styles.outlineButton, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={styles.outlineGradient}
      >
        <View style={[
          styles.outlineInner,
          { opacity: disabled ? 0.7 : 1 }
        ]}>
          {loading ? (
            <ActivityIndicator color={theme.colors.gradient.end} size="small" />
          ) : (
            <Text style={[styles.outlineText, textStyle]}>{title}</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: theme.sizes.buttonHeight,
    borderRadius: theme.sizes.borderRadius.md,
    overflow: 'hidden',
    marginVertical: theme.spacing.sm,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
  },
  outlineButton: {
    height: theme.sizes.buttonHeight,
    borderRadius: theme.sizes.borderRadius.md,
    overflow: 'hidden',
    marginVertical: theme.spacing.sm,
  },
  outlineGradient: {
    flex: 1,
    padding: 2,
    borderRadius: theme.sizes.borderRadius.md,
  },
  outlineInner: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: theme.sizes.borderRadius.md - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    // Cor gradiente não pode ser aplicada diretamente ao texto
    // Usamos uma cor intermediária
    color: theme.colors.gradient.end,
  },
});

export default GradientButton;
