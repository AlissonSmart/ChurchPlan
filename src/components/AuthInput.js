import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  useColorScheme
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import theme from '../styles/theme';

/**
 * Input personalizado para telas de autenticação
 * Suporta dark mode e animações
 */
const AuthInput = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry, 
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  icon,
  onFocus,
  onBlur,
  ...props 
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  
  // Animação para quando o input recebe foco
  const focusAnim = useState(new Animated.Value(0))[0];
  
  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (onFocus) onFocus();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (onBlur) onBlur();
  };
  
  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };
  
  // Cores dinâmicas baseadas no tema e no modo (claro/escuro)
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  
  // Interpolação de cores para animação de foco
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, theme.colors.gradient.start],
  });
  
  const backgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.input, isDarkMode ? '#3C3C3E' : '#F8F8F8'],
  });
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          borderColor: borderColor,
          backgroundColor: backgroundColor,
        }
      ]}
    >
      {icon && (
        <FontAwesome 
          name={icon} 
          size={18} 
          color={isFocused ? theme.colors.gradient.start : colors.inputPlaceholder} 
          style={styles.icon}
        />
      )}
      
      <TextInput
        style={[
          styles.input,
          { color: colors.inputText },
          icon && styles.inputWithIcon
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.inputPlaceholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isSecure}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      
      {secureTextEntry && (
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={toggleSecureEntry}
          activeOpacity={0.7}
        >
          <FontAwesome
            name={isSecure ? 'eye-slash' : 'eye'}
            size={18}
            color={colors.inputPlaceholder}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: theme.sizes.inputHeight,
    borderRadius: theme.sizes.borderRadius.md,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    height: '100%',
  },
  inputWithIcon: {
    paddingLeft: theme.spacing.sm,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  eyeIcon: {
    padding: theme.spacing.sm,
    marginRight: -theme.spacing.sm,
  },
});

export default AuthInput;
