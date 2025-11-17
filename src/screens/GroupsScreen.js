import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const GroupsScreen = () => {
  const groups = [
    { id: 1, name: 'Jovens', members: 45, icon: 'music' },
    { id: 2, name: 'Louvor', members: 12, icon: 'music' },
    { id: 3, name: 'Crianças', members: 28, icon: 'child' },
    { id: 4, name: 'Intercessão', members: 18, icon: 'hands-o' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <FontAwesome name="users" size={28} color="#050505" />
            <Text style={styles.title}>Grupos</Text>
          </View>
          <Text style={styles.subtitle}>Conecte-se com sua comunidade</Text>
        </View>

        {groups.map((group) => (
          <View key={group.id} style={styles.card}>
            <View style={styles.groupIcon}>
              <FontAwesome name={group.icon} size={28} color="#1877F2" />
            </View>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupMembers}>{group.members} membros</Text>
            </View>
          </View>
        ))}
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
  subtitle: {
    fontSize: 16,
    color: '#65676B',
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
  groupMembers: {
    fontSize: 14,
    color: '#65676B',
  },
});

export default GroupsScreen;
