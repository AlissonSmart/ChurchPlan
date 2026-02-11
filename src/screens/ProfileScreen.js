import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useColorScheme, Alert, Animated, Platform } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { BlurView } from '@react-native-community/blur';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../services/supabase';

const ProfileScreen = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const { signOut, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Animação do header translúcido
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  // Obter inicial do nome
  const getInitial = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const userName = profile?.name || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = profile?.email || user?.email || '';
  const userInitial = getInitial(userName);

  const renderMenuItem = (icon, title, subtitle, rightText, showChevron = true, onPress = () => {}) => {
    return (
      <TouchableOpacity 
        style={[styles.menuItem, isDarkMode && styles.menuItemDark]} 
        onPress={onPress}
      >
        <View style={[styles.menuIconContainer, { backgroundColor: icon.bgColor }]}>
          <FontAwesome name={icon.name} size={18} color="#FFFFFF" />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuTitle, isDarkMode && styles.menuTitleDark]}>{title}</Text>
          {subtitle && <Text style={[styles.menuSubtitle, isDarkMode && styles.menuSubtitleDark]}>{subtitle}</Text>}
        </View>
        <View style={styles.menuRight}>
          {rightText && <Text style={[styles.menuRightText, isDarkMode && styles.menuRightTextDark]}>{rightText}</Text>}
          {showChevron && <FontAwesome name="chevron-right" size={14} color={isDarkMode ? '#6E6E73' : '#C7C7CC'} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[
      styles.container, 
      isDarkMode && styles.containerDark
    ]}>
      {/* Fixed Header com Blur - Estilo Apple */}
      <Animated.View
        style={[
          styles.fixedHeader,
          {
            opacity: headerOpacity,
          },
        ]}
        pointerEvents="box-none"
      >
        {Platform.OS === 'ios' ? (
          <BlurView
            style={styles.blurView}
            blurType={isDarkMode ? 'dark' : 'light'}
            blurAmount={10}
            reducedTransparencyFallbackColor={isDarkMode ? '#1a1a1a' : '#ffffff'}
          />
        ) : (
          <View
            style={[
              styles.blurView,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(26, 26, 26, 0.9)'
                  : 'rgba(255, 255, 255, 0.9)',
              },
            ]}
          />
        )}
        
        {/* Título do Header */}
        <Animated.View
          style={[
            styles.headerTitleContainer,
            { opacity: headerTitleOpacity },
          ]}
        >
          <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
            Configurações
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Botão Voltar Fixo */}
      <View style={styles.fixedBackContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.fixedBackButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <FeatherIcon name="chevron-left" size={28} color={isDarkMode ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, isDarkMode && styles.profileCardDark]}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Text style={styles.profileInitial}>{userInitial}</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, isDarkMode && styles.profileNameDark]}>{userName}</Text>
            <Text style={[styles.profileEmail, isDarkMode && styles.profileEmailDark]}>{userEmail}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Organizações */}
        <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Organizações</Text>
        <View style={[styles.menuSection, isDarkMode && styles.menuSectionDark]}>
          {renderMenuItem(
            { name: 'building', bgColor: '#1877F2' },
            'Family Church',
            'Admin',
            null
          )}
          {renderMenuItem(
            { name: 'plus', bgColor: '#34C759' },
            'Criar Organização',
            null,
            null
          )}
        </View>

        {/* Menu */}
        <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Menu</Text>
        <View style={[styles.menuSection, isDarkMode && styles.menuSectionDark]}>
          {renderMenuItem(
            { name: 'user', bgColor: '#5856D6' },
            'Conta',
            'Informações pessoais',
            null
          )}
          {renderMenuItem(
            { name: 'bell', bgColor: '#FF9500' },
            'Notificações',
            'Configurar alertas',
            null
          )}
          {renderMenuItem(
            { name: 'lock', bgColor: '#32ADE6' },
            'Privacidade',
            'Gerenciar permissões',
            null
          )}
          {renderMenuItem(
            { name: 'question-circle', bgColor: '#5AC8FA' },
            'Suporte e Contato',
            'Ajuda e feedback',
            null
          )}
        </View>

        {/* Versão */}
        <View style={[styles.versionContainer, isDarkMode && styles.versionContainerDark]}>
          <Text style={[styles.versionText, isDarkMode && styles.versionTextDark]}>ChurchPlan v1.0.0</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity 
          style={[styles.logoutButton, isDarkMode && styles.logoutButtonDark]}
          onPress={async () => {
            try {
              await signOut();
              // Não é necessário navegar manualmente, pois o RootNavigator já fará isso
              // quando o estado do usuário mudar para null
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
              console.error('Erro ao fazer logout:', error);
            }
          }}
        >
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 70,
    zIndex: 100,
    overflow: 'hidden',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerTitleContainer: {
    position: 'absolute',
    bottom: 12,
    left: 60,
    right: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  fixedBackContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    zIndex: 101,
  },
  fixedBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 100 : 70,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileCardDark: {
    backgroundColor: '#1C1C1E',
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  profileNameDark: {
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  profileEmailDark: {
    color: '#8E8E93',
  },
  profileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1877F2',
    borderRadius: 16,
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitleDark: {
    color: '#8E8E93',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  menuSectionDark: {
    backgroundColor: '#1C1C1E',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuItemDark: {
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  menuTitleDark: {
    color: '#FFFFFF',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  menuSubtitleDark: {
    color: '#8E8E93',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuRightText: {
    fontSize: 16,
    color: '#8E8E93',
    marginRight: 8,
  },
  menuRightTextDark: {
    color: '#8E8E93',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  versionContainerDark: {},
  versionText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  versionTextDark: {
    color: '#6E6E73',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonDark: {
    backgroundColor: '#1C1C1E',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});

export default ProfileScreen;
