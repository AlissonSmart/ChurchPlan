import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Alert
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import GradientButton from '../components/GradientButton';
import { OutlineGradientButton } from '../components/GradientButton';
import userService from '../services/userService';
import theme from '../styles/theme';
import TabScreenWrapper from '../components/TabScreenWrapper';
import { HeaderContext } from '../contexts/HeaderContext';


const TeamsScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const { setShowLargeTitle } = useContext(HeaderContext);
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  // Função para carregar usuários do Supabase
  const loadUsers = async () => {
    try {
      setLoading(true);
      const userData = await userService.getAllUsers();
      console.log('Usuários carregados:', userData);
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de usuários.');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Função para buscar usuários por nome
  const handleSearch = async (text) => {
    setSearchText(text);
    
    if (text.trim()) {
      try {
        // Busca no Supabase se o texto tiver pelo menos 2 caracteres
        if (text.trim().length >= 2) {
          setLoading(true);
          const searchResults = await userService.searchUsersByName(text);
          console.log('Resultados da busca:', searchResults);
          setFilteredUsers(searchResults);
          setLoading(false);
        } else {
          // Filtro local para buscas com menos de 2 caracteres
          const filtered = users.filter(user => 
            user.name.toLowerCase().includes(text.toLowerCase())
          );
          setFilteredUsers(filtered);
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        // Manter os usuários atuais em caso de erro
        setFilteredUsers(users);
        setLoading(false);
      }
    } else {
      setFilteredUsers(users);
    }
  };
  
  // Atualizar lista filtrada quando users mudar
  useEffect(() => {
    if (!searchText) {
      setFilteredUsers(users);
    }
  }, [users]);

  const handleCreateTeam = () => {
    Alert.alert('Criar Equipe', 'Funcionalidade de criar equipe será implementada.');
  };

  const handleAddPerson = () => {
    Alert.alert('Adicionar Pessoa', 'Funcionalidade de adicionar pessoa será implementada.');
  };

  const renderUserItem = ({ item }) => {
    // Verificar se o item é válido
    if (!item || !item.name) {
      return null;
    }
    
    // Determinar o papel do usuário com valor padrão
    const userRole = item.role || 'membro';
    
    // Determinar a cor do papel com base no valor
    const roleColor = userRole.toLowerCase().includes('líder') || 
                     userRole.toLowerCase().includes('admin') ? 
                     theme.colors.primary : theme.colors.secondary;
    
    return (
      <TouchableOpacity 
        style={[styles.userItem, { backgroundColor: colors.card }]}
        onPress={() => Alert.alert('Usuário', `Você selecionou ${item.name}`)}
      >
        <View style={styles.userAvatar}>
          <Text style={styles.userInitial}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
          {item.church_name && (
            <Text style={[styles.churchName, { color: colors.textSecondary }]}>{item.church_name}</Text>
          )}
        </View>
        <View style={styles.userRole}>
          <Text style={[
            styles.roleText, 
            { 
              backgroundColor: roleColor,
              color: '#FFFFFF'
            }
          ]}>
            {userRole}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Definir o título grande ao montar o componente
  useEffect(() => {
    setShowLargeTitle(true);
    return () => setShowLargeTitle(true);
  }, [setShowLargeTitle]);

  return (
    <TabScreenWrapper activeTab="Equipes" navigation={navigation}>
      <View style={[styles.container, { 
        backgroundColor: colors.background,
      }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <View style={styles.buttonContainer}>
                <GradientButton
                  title="Criar Equipe"
                  onPress={handleCreateTeam}
                  style={styles.createTeamButton}
                  colors={[theme.colors.gradient.start, theme.colors.gradient.end]}
                  icon="users"
                />
                <OutlineGradientButton
                  title="Adicionar Pessoa"
                  onPress={handleAddPerson}
                  style={styles.addPersonButton}
                  colors={[theme.colors.secondary, theme.colors.gradient.start]}
                  icon="user-plus"
                />
              </View>

              <View style={[styles.searchContainer, { backgroundColor: colors.input }]}>
                <FontAwesome name="search" size={18} color={colors.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Buscar pessoa..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchText}
                  onChangeText={handleSearch}
                />
              </View>

              <View style={styles.listHeader}>
                <Text style={[styles.listHeaderText, { color: colors.textSecondary }]}>
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'pessoa' : 'pessoas'}
                </Text>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Nenhuma pessoa encontrada
              </Text>
            </View>
          }
        />
      )}
    </View>
    </TabScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  createTeamButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  addPersonButton: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.sizes.borderRadius.round,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  listHeaderText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.sizes.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  userName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: theme.typography.fontSize.sm,
    marginTop: 2,
  },
  churchName: {
    fontSize: theme.typography.fontSize.xs,
    marginTop: 2,
    fontStyle: 'italic',
  },
  userRole: {
    marginLeft: theme.spacing.sm,
  },
  roleText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '500',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.sizes.borderRadius.sm,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
  },
});

export default TeamsScreen;
