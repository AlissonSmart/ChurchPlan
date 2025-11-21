import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Tema centralizado para o aplicativo
 * Contém cores, espaçamentos, tamanhos e estilos comuns
 */
const theme = {
  // Cores principais
  colors: {
    // Cores de marca
    primary: '#1877F2',
    secondary: '#0ECFB5',
    gradient: {
      start: '#1ac8aa',
      end: '#29a6f8',
    },
    
    // Cores de interface - Light Mode
    light: {
      background: '#FFFFFF',
      card: '#FFFFFF',
      text: '#1C1C1E',
      textSecondary: '#8E8E93',
      border: '#E4E6EB',
      input: '#F5F5F5',
      inputText: '#1C1C1E',
      inputPlaceholder: '#A0A0A5',
      shadow: 'rgba(0, 0, 0, 0.1)',
      primary: '#1877F2',
      danger: '#FF3B30',
      inputBackground: '#F5F5F5',
    },
    
    // Cores de interface - Dark Mode
    dark: {
      background: '#121212',
      card: '#1C1C1E',
      text: '#FFFFFF',
      textSecondary: '#8E8E93',
      border: 'rgba(255, 255, 255, 0.1)',
      input: '#2C2C2E',
      inputText: '#FFFFFF',
      inputPlaceholder: '#8E8E93',
      shadow: 'rgba(0, 0, 0, 0.3)',
      primary: '#1877F2',
      danger: '#FF453A',
      inputBackground: '#2C2C2E',
    },
    
    // Cores de estado
    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    info: '#5AC8FA',
  },
  
  // Espaçamentos
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Tamanhos
  sizes: {
    screenWidth: width,
    screenHeight: height,
    buttonHeight: 56,
    inputHeight: 56,
    borderRadius: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      round: 9999,
    },
  },
  
  // Tipografia
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xxs: 9,
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
  },
  
  // Sombras
  shadows: {
    light: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
      },
    },
    dark: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
      },
    },
  },
};

export default theme;
