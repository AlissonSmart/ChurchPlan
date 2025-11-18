import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, useColorScheme } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import TabScreenWrapper from '../components/TabScreenWrapper';

const MenuScreen = ({ navigation, route }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const menuItems = [
    { id: 1, icon: 'cog', title: 'Configurações', subtitle: 'Personalize seu app' },
    { id: 2, icon: 'user', title: 'Perfil', subtitle: 'Edite suas informações' },
    { id: 3, icon: 'bar-chart', title: 'Relatórios', subtitle: 'Visualize estatísticas' },
    { id: 4, icon: 'dollar', title: 'Contribuições', subtitle: 'Gerencie doações' },
    { id: 5, icon: 'book', title: 'Recursos', subtitle: 'Materiais e estudos' },
    { id: 6, icon: 'question-circle', title: 'Ajuda', subtitle: 'Central de suporte' },
    { id: 7, icon: 'database', title: 'SQL Fixer', subtitle: 'Corrigir permissões do banco' },
  ];

  return (
    <TabScreenWrapper activeTab="Midia" navigation={navigation}>
      <ScrollView style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.content}>
        <View style={[styles.profileSection, isDarkMode && styles.profileSectionDark]}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>U</Text>
          </View>
          <Text style={[styles.profileName, isDarkMode && styles.profileNameDark]}>Usuário</Text>
          <Text style={[styles.profileEmail, isDarkMode && styles.profileEmailDark]}>usuario@churchplan.com</Text>
        </View>

        <View style={[styles.menuSection, isDarkMode && styles.menuSectionDark]}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuItem, isDarkMode && styles.menuItemDark]}
              onPress={() => {
                if (item.id === 7) { // SQL Fixer
                  navigation.navigate('SqlFixer');
                } else if (item.id === 2) { // Perfil
                  navigation.navigate('Profile');
                }
              }}
            >
              <View style={[styles.menuIconContainer, isDarkMode && styles.menuIconContainerDark]}>
                <FontAwesome name={item.icon} size={20} color="#1877F2" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, isDarkMode && styles.menuTitleDark]}>{item.title}</Text>
                <Text style={[styles.menuSubtitle, isDarkMode && styles.menuSubtitleDark]}>{item.subtitle}</Text>
              </View>
              <FontAwesome name="chevron-right" size={20} color={isDarkMode ? '#6E6E73' : '#8A8D91'} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.footer, isDarkMode && styles.footerDark]}>
          <Image
            source={isDarkMode ? require('../images/lg-church-plan-light.png') : require('../images/lg-church-plan-dark.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={[styles.footerText, isDarkMode && styles.footerTextDark]}>Versão 0.0.1</Text>
        </View>
      </View>
    </ScrollView>
    </TabScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
  },
  content: {
    padding: 16,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileSectionDark: {
    backgroundColor: '#2C2C2E',
  },
  profileCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1877F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#050505',
    marginBottom: 4,
  },
  profileNameDark: {
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 14,
    color: '#65676B',
  },
  profileEmailDark: {
    color: '#A0A0A5',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuSectionDark: {
    backgroundColor: '#2C2C2E',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
  },
  menuItemDark: {
    borderBottomColor: '#38383A',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIconContainerDark: {
    backgroundColor: '#3A3A3C',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 2,
  },
  menuTitleDark: {
    color: '#FFFFFF',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#65676B',
  },
  menuSubtitleDark: {
    color: '#A0A0A5',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerDark: {
    // Sem estilos adicionais necessários
  },
  footerLogo: {
    width: 180,
    height: 60,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#8A8D91',
  },
  footerTextDark: {
    color: '#6E6E73',
  },
});

export default MenuScreen;
