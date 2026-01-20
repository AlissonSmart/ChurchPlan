import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useColorScheme, Alert } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BackHeader from '../components/BackHeader';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const { signOut, user } = useAuth();

  const handleGoBack = () => {
    navigation.goBack();
  };

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
      <BackHeader title="Configurações" onBack={handleGoBack} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={[styles.profileCard, isDarkMode && styles.profileCardDark]}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Text style={styles.profileInitial}>A</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, isDarkMode && styles.profileNameDark]}>Alisson Martins</Text>
            <Text style={[styles.profileEmail, isDarkMode && styles.profileEmailDark]}>alisson@churchplan.com</Text>
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
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
