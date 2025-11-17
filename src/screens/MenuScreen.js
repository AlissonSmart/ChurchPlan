import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const MenuScreen = () => {
  const menuItems = [
    { id: 1, icon: 'cog', title: 'Configurações', subtitle: 'Personalize seu app' },
    { id: 2, icon: 'user', title: 'Perfil', subtitle: 'Edite suas informações' },
    { id: 3, icon: 'bar-chart', title: 'Relatórios', subtitle: 'Visualize estatísticas' },
    { id: 4, icon: 'dollar', title: 'Contribuições', subtitle: 'Gerencie doações' },
    { id: 5, icon: 'book', title: 'Recursos', subtitle: 'Materiais e estudos' },
    { id: 6, icon: 'question-circle', title: 'Ajuda', subtitle: 'Central de suporte' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>U</Text>
          </View>
          <Text style={styles.profileName}>Usuário</Text>
          <Text style={styles.profileEmail}>usuario@churchplan.com</Text>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <FontAwesome name={item.icon} size={20} color="#1877F2" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <FontAwesome name="chevron-right" size={20} color="#8A8D91" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Image
            source={require('../images/lg-church-plan-dark.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerText}>Versão 0.0.1</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
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
  profileEmail: {
    fontSize: 14,
    color: '#65676B',
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
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
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#65676B',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
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
});

export default MenuScreen;
