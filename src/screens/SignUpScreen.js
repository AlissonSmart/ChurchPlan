import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import authService from '../services/authService';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapper';
import AuthInput from '../components/AuthInput';
import GradientButton from '../components/GradientButton';
import theme from '../styles/theme';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === 'dark';
  
  // Cores dinâmicas baseadas no tema e no modo (claro/escuro)
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const handleSignUp = async () => {
    // Validação básica
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setIsLoading(true);
      await authService.signUpWithEmailPtBr({ name, email, password });
      Alert.alert(
        'Conta criada',
        'Sua conta foi criada com sucesso. Agora você já pode entrar.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.error('SIGNUP ERROR NO SCREEN:', error);
      Alert.alert('Erro ao criar conta', error.message || 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <KeyboardAvoidingWrapper>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.input }]}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome name="chevron-left" size={18} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Criar Conta</Text>
          <View style={styles.placeholder} />
        </View>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Preencha os campos abaixo para criar sua conta
        </Text>

        <View style={styles.formContainer}>
          <AuthInput
            placeholder="Nome completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            icon="user"
          />

          <AuthInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="none"
            autoComplete="off"
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

          <AuthInput
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
            autoCapitalize="none"
            icon="lock"
          />

          <GradientButton
            title="Criar Conta"
            onPress={handleSignUp}
            disabled={isLoading || !name || !email || !password || !confirmPassword}
            loading={isLoading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Já tem uma conta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.loginText, { color: theme.colors.gradient.end }]}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
  },
  loginText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
});

export default SignUpScreen;
