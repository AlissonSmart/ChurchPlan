import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  View 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import GradientText from './GradientText';
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
  icon,
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
          <View style={styles.buttonContent}>
            {icon && (
              <FontAwesome name={icon} size={18} color="#FFFFFF" style={styles.buttonIcon} />
            )}
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Versão do botão com borda uniforme e fundo transparente
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
  icon,
  ...props 
}) => {
  const useColorScheme = require('react-native').useColorScheme;
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode ? theme.colors.dark.background : theme.colors.light.background;
  
  return (
    <TouchableOpacity
      style={[styles.outlineButton, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      <View style={[
        styles.outlineView,
        { 
          opacity: disabled ? 0.7 : 1,
          backgroundColor: backgroundColor,
          borderColor: theme.colors.gradient.end,
        }
      ]}>
        {loading ? (
          <ActivityIndicator color={theme.colors.gradient.end} size="small" />
        ) : (
          <View style={styles.buttonContent}>
            {icon && (
              <FontAwesome 
                name={icon} 
                size={18} 
                color={theme.colors.gradient.end} 
                style={styles.buttonIcon} 
              />
            )}
            <Text 
              style={[styles.outlineText, { color: theme.colors.gradient.end }, textStyle]}
            >
              {title}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: theme.sizes.buttonHeight,
    borderRadius: theme.sizes.borderRadius.round,
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: theme.spacing.sm,
  },
  outlineButton: {
    height: theme.sizes.buttonHeight,
    borderRadius: theme.sizes.borderRadius.round,
    overflow: 'hidden',
    marginVertical: theme.spacing.sm,
  },
  outlineView: {
    flex: 1,
    borderWidth: 1,
    borderRadius: theme.sizes.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  outlineText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.gradient.end,
  },
});

export default GradientButton;
