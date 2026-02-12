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
  Alert,
  Modal,
  Image
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedRoleName, setSelectedRoleName] = useState(null);

  // Carregar usuários cadastrados no sistema
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Buscar usuários ativos cadastrados na tabela profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erro ao buscar profiles:', error);
        throw error;
      }

      console.log('Usuários carregados:', data);

      if (!data || data.length === 0) {
        const formattedUsers = [];
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
        return;
      }

      const profileIds = data.map((u) => u.id);

      // Mapa: profileId -> [roles...]
      let rolesByUser = {};

      const addRoleToUser = (profileId, roleId, roleName) => {
        if (!profileId || !roleId) return;
        if (!rolesByUser[profileId]) rolesByUser[profileId] = [];
        const alreadyExists = rolesByUser[profileId].some((r) => r.id === roleId);
        if (!alreadyExists) {
          rolesByUser[profileId].push({
            id: roleId,
            name: roleName || 'Função',
          });
        }
      };

      // As funções por pessoa vêm da tabela team_members (vínculo pessoa -> função)
      // Nesta tabela, a coluna é `user_id` + `role` (texto). Precisamos mapear para `roles.id`.
      try {
        const { data: teamMemberRows, error: tmErr } = await supabase
          .from('team_members')
          .select('user_id, role')
          .in('user_id', profileIds);

        if (tmErr) {
          console.error('Erro ao buscar team_members (roles):', tmErr);
        } else {
          const rawRoleNames = Array.from(
            new Set((teamMemberRows || []).map((r) => (r?.role || '').trim()).filter(Boolean))
          );

          // Busca todas as roles para mapear por nome (case-insensitive).
          // Existem nomes duplicados, então pegamos a primeira ocorrência por created_at.
          const { data: rolesRowsAll, error: rolesErr } = await supabase
            .from('roles')
            .select('id, name, created_at')
            .order('created_at', { ascending: true });

          if (rolesErr) {
            console.error('Erro ao buscar roles:', rolesErr);
          }

          const rolesMapByName = {};
          (rolesRowsAll || []).forEach((r) => {
            const key = (r?.name || '').toLowerCase().trim();
            if (!key) return;
            if (!rolesMapByName[key]) {
              rolesMapByName[key] = { id: r.id, name: r.name };
            }
          });

          (teamMemberRows || []).forEach((row) => {
            const profileId = row?.user_id;
            const roleText = (row?.role || '').trim();
            if (!profileId || !roleText) return;

            const key = roleText.toLowerCase().trim();
            const mapped = rolesMapByName[key];

            // Se não achar no catálogo, ainda assim exibe a função no modal.
            const roleId = mapped?.id || key;
            const roleName = mapped?.name || roleText;

            addRoleToUser(profileId, roleId, roleName);
          });

          console.log('Roles encontradas em team_members:', teamMemberRows);
        }
      } catch (rolesException) {
        console.error('Erro inesperado ao carregar funções (team_members):', rolesException);
      }

      console.log('Roles agrupadas por usuário:', rolesByUser, 'profileIds:', profileIds);

      // Normaliza e remove duplicados por NOME (evita repetir Guitarra/Teclado/Vocal etc.)
      Object.keys(rolesByUser).forEach((pid) => {
        const seen = new Set();
        rolesByUser[pid] = (rolesByUser[pid] || []).filter((r) => {
          const key = (r.name || '').toLowerCase().trim();
          if (!key) return false;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });

      // Formatar dados finais para o modal
      const formattedUsers = (data || []).map((user) => ({
        id: user.id,
        user_id: user.id,
        name: user.name || user.email?.split('@')[0] || 'Usuário',
        email: user.email,
        avatar_url: user.avatar_url,
        role: 'Membro',
        status: 'pending',
        roles: rolesByUser[user.id] || [],
      }));

      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      Alert.alert('Erro', `Não foi possível carregar os usuários: ${error.message}`);
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
    const userRoles = user.roles && user.roles.length > 0 ? user.roles : [];

    if (userRoles.length > 1) {
      Alert.alert(
        'Selecione a função',
        `Para qual função você quer convidar ${user.name}?`,
        [
          ...userRoles.map((role) => ({
            text: role.name,
            onPress: () => {
              setSelectedUser({ ...user });
              setSelectedRoleId(role.id);
              setSelectedRoleName(role.name);
            },
          })),
          { text: 'Cancelar', style: 'cancel' },
        ],
      );
    } else if (userRoles.length === 1) {
      setSelectedUser(user);
      setSelectedRoleId(userRoles[0].id);
      setSelectedRoleName(userRoles[0].name);
    } else {
      Alert.alert(
        'Nenhuma função cadastrada',
        `Cadastre primeiro uma função para ${user.name} na tela de Equipes antes de adicioná-lo a um evento.`,
      );
      setSelectedUser(null);
      setSelectedRoleId(null);
    }
  };

  const handleSelectRoleForUser = (user, role) => {
    setSelectedUser(user);
    setSelectedRoleId(role.id);
    setSelectedRoleName(role.name);
  };

  const handleAddMember = () => {
    if (!selectedUser) {
      Alert.alert('Atenção', 'Selecione um membro para convidar');
      return;
    }

    const memberToSend = {
      ...selectedUser,
      id: selectedUser?.id,
      user_id: selectedUser?.id,
      profile_id: selectedUser?.id,
      role_id: selectedRoleId,
      role: selectedRoleName || selectedUser?.role || 'Membro',
      selectedRoleId,
      selectedRoleName,
    };
    onAddMember(memberToSend);
    handleClose();
  };


  const handleClose = () => {
    setSearchQuery('');
    setSelectedUser(null);
    setSelectedRoleId(null);
    setSelectedRoleName(null);
    onClose();
  };

  const renderUserItem = ({ item }) => {
    const isSelected = selectedUser?.id === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.userItem,
          { backgroundColor: colors.card, borderColor: colors.border },
          isSelected && { borderColor: colors.primary, borderWidth: 2 }
        ]}
        onPress={() => handleSelectUser(item)}
        activeOpacity={0.7}
      >
        {item.avatar_url ? (
          <Image
            source={{ uri: item.avatar_url }}
            style={styles.userAvatar}
          />
        ) : (
          <View style={[styles.userAvatar, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.userInitials, { color: colors.primary }]}>
              {item.name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.roles && item.roles.length > 0 ? (
            <View style={styles.roleChipsContainer}>
              {item.roles.map((role) => {
                const isRoleSelected = selectedUser?.id === item.id && selectedRoleId === role.id;
                return (
                  <TouchableOpacity
                    key={role.id}
                    style={[
                      styles.roleChip,
                      { borderColor: colors.border },
                      isRoleSelected && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                    ]}
                    onPress={() => handleSelectRoleForUser(item, role)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        { color: isRoleSelected ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {role.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={[styles.userRole, { color: colors.textSecondary }]} numberOfLines={1}>
              Nenhuma função cadastrada
            </Text>
          )}
          {item.email && (
            <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.email}
            </Text>
          )}
        </View>
        {isSelected && (
          <FontAwesome name="check-circle" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Header customizado */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, { color: colors.primary }]}>Cancelar</Text>
            </TouchableOpacity>
            
            <Text style={[styles.headerTitle, { color: colors.text }]}>Convidar</Text>
            
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleAddMember}
              activeOpacity={0.7}
            >
              <Text style={[styles.addText, { color: colors.primary }]}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.container}>
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
          <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando membros...
            </Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="users" size={48} color={colors.textSecondary} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {searchQuery ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado na equipe'}
            </Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
              {searchQuery ? 'Tente buscar com outros termos' : 'Cadastre membros na equipe primeiro'}
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 70,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 4,
  },
  roleChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 4,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  selfInviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  selfInviteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  userRole: {
    fontSize: 14,
    fontWeight: '500',
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