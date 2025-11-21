import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ModalPadrao from './ModalPadrao';
import theme from '../styles/theme';
import supabase from '../services/supabase';

/**
 * Modal para adicionar membro à equipe do evento
 */
const AddTeamMemberModal = ({ visible, onClose, onAddMember, eventId, eventData }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('Membro');

  const roles = ['Líder', 'Vocal', 'Instrumento', 'Técnico', 'Membro'];

  // Carregar usuários do banco
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Buscar voluntários cadastrados
      const { data, error } = await supabase
        .from('volunteers')
        .select('id, user_id, first_name, last_name, email, phone, is_active')
        .eq('is_active', true)
        .order('first_name', { ascending: true });

      if (error) throw error;

      // Formatar dados com nome completo
      const formattedUsers = (data || []).map(user => ({
        ...user,
        name: `${user.first_name} ${user.last_name}`.trim()
      }));

      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os usuários');
    } finally {
      setLoading(false);
    }
  };

  // Carregar ao abrir modal
  useEffect(() => {
    if (visible) {
      loadUsers();
    }
  }, [visible]);

  // Filtrar usuários pela busca
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(query) ||
        (user.email && user.email.toLowerCase().includes(query))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleSelectUser = (user) => {
    // Adicionar membro à equipe
    const member = {
      id: user.id,
      user_id: user.user_id, // ID do usuário autenticado para enviar notificação
      name: user.name,
      email: user.email,
      role: selectedRole,
      status: 'pending' // pending, confirmed, declined
    };

    onAddMember(member);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedRole('Membro');
    onClose();
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.userItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleSelectUser(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.userAvatar, { backgroundColor: colors.primary + '20' }]}>
        <Text style={[styles.userInitials, { color: colors.primary }]}>
          {item.name.substring(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.email && (
          <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.email}
          </Text>
        )}
      </View>
      <FontAwesome name="plus-circle" size={24} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <ModalPadrao
      isVisible={visible}
      onClose={handleClose}
      title="Adicionar Membro"
      height="80%"
    >
      <View style={styles.container}>
        {/* Seleção de Função */}
        <View style={styles.rolesSection}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Função no Evento
          </Text>
          <View style={styles.rolesContainer}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleChip,
                  { borderColor: colors.border },
                  selectedRole === role && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setSelectedRole(role)}
              >
                <Text style={[
                  styles.roleText,
                  { color: colors.text },
                  selectedRole === role && { color: '#FFFFFF' }
                ]}>
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Campo de Busca */}
        <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
          <FontAwesome name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar por nome ou email..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FontAwesome name="times-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de Usuários */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando usuários...
            </Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="users" size={48} color={colors.textSecondary} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {searchQuery ? 'Nenhum usuário encontrado' : 'Nenhum voluntário cadastrado'}
            </Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
              {searchQuery ? 'Tente buscar com outros termos' : 'Cadastre voluntários primeiro'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ModalPadrao>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  rolesSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitials: {
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AddTeamMemberModal;
