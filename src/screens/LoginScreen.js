import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapper';
import AuthInput from '../components/AuthInput';
import GradientButton, { OutlineGradientButton } from '../components/GradientButton';
import theme from '../styles/theme';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === 'dark';
  
  // Animações
  const logoOpacity = useState(new Animated.Value(1))[0];
  const formTranslateY = useState(new Animated.Value(0))[0];
  
  // Cores dinâmicas baseadas no tema e no modo (claro/escuro)
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      setIsLoading(true);
      await signIn(email, password);
      // Navegação será tratada pelo AuthNavigator
    } catch (error) {
      Alert.alert(
        'Erro ao fazer login',
        error.message || 'Verifique suas credenciais e tente novamente'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <KeyboardAvoidingWrapper>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
            },
          ]}
        >
          <Image
            source={isDarkMode ? 
              require('../images/lg-church-plan-light.png') : 
              require('../images/lg-church-plan-dark.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Planeje e organize sua igreja
          </Text>
        </Animated.View>

        <View style={styles.formContainer}>
          <AuthInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            icon="envelope"
          />

          <AuthInput
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize="none"
            icon="lock"
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
          >
            <Text style={[styles.forgotPasswordText, { color: theme.colors.gradient.end }]}>
              Esqueceu a senha?
            </Text>
          </TouchableOpacity>

          <GradientButton
            title="Entrar"
            onPress={handleLogin}
            disabled={isLoading || !email || !password}
            loading={isLoading}
          />

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>ou</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <OutlineGradientButton
            title="Criar uma nova conta"
            onPress={handleSignUp}
          />
        </View>
      </View>
    </KeyboardAvoidingWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: width * 0.6,
    height: 80,
  },
  tagline: {
    fontSize: theme.typography.fontSize.md,
    marginTop: theme.spacing.sm,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  forgotPasswordText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
  },
});

export default LoginScreen;
