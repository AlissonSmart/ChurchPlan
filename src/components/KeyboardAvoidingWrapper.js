import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Animated,
  StyleSheet,
  Dimensions,
  useColorScheme
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../styles/theme';

const { height } = Dimensions.get('window');

/**
 * Componente wrapper que gerencia o comportamento do teclado
 * Evita que o teclado sobreponha os campos de entrada
 * Suporta animações suaves quando o teclado aparece/desaparece
 */
const KeyboardAvoidingWrapper = ({
  children,
  contentContainerStyle,
  scrollEnabled = true,
  bounces = true,
  showsVerticalScrollIndicator = false,
  keyboardShouldPersistTaps = 'handled',
  ...props
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  // Animação para quando o teclado aparece/desaparece
  const translateY = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
        
        Animated.timing(translateY, {
          toValue: -Math.min(e.endCoordinates.height * 0.5, 100),
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
        
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );
    
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);
  
  const backgroundColor = isDarkMode ? theme.colors.dark.background : theme.colors.light.background;
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      {...props}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentContainer,
            {
              paddingTop: insets.top,
              paddingBottom: insets.bottom + (isKeyboardVisible ? keyboardHeight * 0.1 : 0),
              minHeight: height,
            },
            contentContainerStyle,
          ]}
          scrollEnabled={scrollEnabled}
          bounces={bounces}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        >
          <Animated.View
            style={[
              styles.innerContainer,
              { transform: [{ translateY }] }
            ]}
          >
            {children}
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  innerContainer: {
    flex: 1,
  },
});

export default KeyboardAvoidingWrapper;
