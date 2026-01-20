import React from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import TabScreenWrapper from '../components/TabScreenWrapper';

const GroupsScreen = ({ navigation, route }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const groups = [
    { id: 1, name: 'Jovens', members: 45, icon: 'music' },
    { id: 2, name: 'Louvor', members: 12, icon: 'music' },
    { id: 3, name: 'Crianças', members: 28, icon: 'child' },
    { id: 4, name: 'Intercessão', members: 18, icon: 'hands-o' },
  ];

  return (
    <TabScreenWrapper activeTab="Equipes" navigation={navigation}>
      <ScrollView style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <FontAwesome name="users" size={28} color={isDarkMode ? '#FFFFFF' : '#050505'} />
            <Text style={[styles.title, isDarkMode && styles.titleDark]}>Grupos</Text>
          </View>
          <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>Conecte-se com sua comunidade</Text>
        </View>

        {groups.map((group) => (
          <View key={group.id} style={[styles.card, isDarkMode && styles.cardDark]}>
            <View style={styles.groupIcon}>
              <FontAwesome name={group.icon} size={28} color="#1877F2" />
            </View>
            <View style={styles.groupInfo}>
              <Text style={[styles.groupName, isDarkMode && styles.groupNameDark]}>{group.name}</Text>
              <Text style={[styles.groupMembers, isDarkMode && styles.groupMembersDark]}>{group.members} membros</Text>
            </View>
          </View>
        ))}
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
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#050505',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#65676B',
  },
  subtitleDark: {
    color: '#A0A0A5',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#2C2C2E',
  },
  groupIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E7F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 4,
  },
  groupNameDark: {
    color: '#FFFFFF',
  },
  groupMembers: {
    fontSize: 14,
    color: '#65676B',
  },
  groupMembersDark: {
    color: '#A0A0A5',
  },
});

export default GroupsScreen;
