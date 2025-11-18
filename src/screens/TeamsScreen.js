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
import CreateTeamModal from '../components/CreateTeamModal';
import SegmentedControl from '../components/SegmentedControl';
import TeamItem from '../components/TeamItem';
import userService from '../services/userService';
import teamService from '../services/teamService';
import theme from '../styles/theme';
import TabScreenWrapper from '../components/TabScreenWrapper';
import { HeaderContext } from '../contexts/HeaderContext';
import { useAuth } from '../contexts/AuthContext';


const TeamsScreen = ({ navigation }) => {
  // Estados para usuários
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Estados para equipes
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  
  // Estados compartilhados
  const [activeSegment, setActiveSegment] = useState('people'); // 'people' ou 'teams'
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isCreateTeamModalVisible, setIsCreateTeamModalVisible] = useState(false);
  
  // Contextos
  const { setShowLargeTitle } = useContext(HeaderContext);
  const { user } = useAuth(); // Obter o usuário autenticado do contexto
  
  // Tema
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  
  // Segmentos disponíveis
  const segments = [
    { key: 'people', label: 'Pessoas' },
    { key: 'teams', label: 'Equipes' },
  ];

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

  // Função para carregar equipes do Supabase
  const loadTeams = async () => {
    try {
      setLoading(true);
      const teamsData = await teamService.getAllTeams();
      console.log('Equipes carregadas:', teamsData);
      setTeams(teamsData);
      setFilteredTeams(teamsData);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de equipes.');
      setTeams([]);
      setFilteredTeams([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais com base no segmento ativo
  useEffect(() => {
    if (activeSegment === 'people') {
      loadUsers();
    } else {
      loadTeams();
    }
  }, [activeSegment]);
  
  // Carregar dados iniciais ao montar o componente
  useEffect(() => {
    loadTeams(); // Carregar equipes por padrão
  }, []);

  // Função para buscar por nome (equipes ou pessoas)
  const handleSearch = async (text) => {
    setSearchText(text);
    
    if (text.trim()) {
      try {
        // Busca no Supabase se o texto tiver pelo menos 2 caracteres
        if (text.trim().length >= 2) {
          setLoading(true);
          
          if (activeSegment === 'people') {
            // Buscar pessoas
            const searchResults = await userService.searchUsersByName(text);
            console.log('Resultados da busca de pessoas:', searchResults);
            setFilteredUsers(searchResults);
          } else {
            // Buscar equipes
            const searchResults = await teamService.searchTeamsByName(text);
            console.log('Resultados da busca de equipes:', searchResults);
            setFilteredTeams(searchResults);
          }
          
          setLoading(false);
        } else {
          // Filtro local para buscas com menos de 2 caracteres
          if (activeSegment === 'people') {
            const filtered = users.filter(user => 
              user.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredUsers(filtered);
          } else {
            const filtered = teams.filter(team => 
              team.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredTeams(filtered);
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar ${activeSegment === 'people' ? 'usuários' : 'equipes'}:`, error);
        // Manter os dados atuais em caso de erro
        if (activeSegment === 'people') {
          setFilteredUsers(users);
        } else {
          setFilteredTeams(teams);
        }
        setLoading(false);
      }
    } else {
      // Limpar busca
      if (activeSegment === 'people') {
        setFilteredUsers(users);
      } else {
        setFilteredTeams(teams);
      }
    }
  };
  
  // Atualizar listas filtradas quando os dados originais mudarem
  useEffect(() => {
    if (!searchText) {
      setFilteredUsers(users);
      setFilteredTeams(teams);
    }
  }, [users, teams, searchText]);
  
  // Função para lidar com a mudança de segmento
  const handleSegmentChange = (segmentKey) => {
    setActiveSegment(segmentKey);
    setSearchText(''); // Limpar a busca ao mudar de segmento
  };
  
  // Função para lidar com o clique em uma equipe
  const handleTeamPress = (team) => {
    Alert.alert(
      'Detalhes da Equipe',
      `Nome: ${team.name}\nMembros: ${team.members_count}\nFunções: ${team.roles_count}`,
      [{ text: 'OK' }]
    );
  };
  
  // Função para editar uma equipe
  const handleEditTeam = (team) => {
    Alert.alert('Editar', `Editar equipe ${team.name}`);
  };

  const handleCreateTeam = () => {
    // Verificar se o usuário está autenticado antes de abrir o modal
    if (!user) {
      Alert.alert(
        'Erro de Autenticação', 
        'Você precisa estar autenticado para criar uma equipe. Por favor, faça login novamente.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Se estiver autenticado, abrir o modal
    setIsCreateTeamModalVisible(true);
  };

  const handleSaveTeam = async (team) => {
    try {
      // Verificar novamente se o usuário está autenticado antes de salvar
      if (!user) {
        Alert.alert(
          'Erro de Autenticação', 
          'Você precisa estar autenticado para criar uma equipe. Por favor, faça login novamente.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      setLoading(true);
      console.log('Criando nova equipe:', team);
      console.log('Usuário autenticado:', user.id);
      
      // Salvar a equipe no banco de dados usando o serviço
      const newTeam = await teamService.createTeam(team);
      
      Alert.alert(
        'Sucesso', 
        `Equipe ${team.name} criada com sucesso!`,
        [{ text: 'OK' }]
      );
      
      // Fechar o modal após salvar com sucesso
      setIsCreateTeamModalVisible(false);
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      
      // Mensagem de erro mais específica
      let errorMessage = 'Não foi possível criar a equipe. Tente novamente.';
      
      if (error.message && error.message.includes('autenticado')) {
        errorMessage = 'Erro de autenticação. Por favor, faça login novamente.';
      }
      
      Alert.alert('Erro', errorMessage, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPerson = () => {
    Alert.alert('Adicionar Pessoa', 'Funcionalidade de adicionar pessoa será implementada.');
  };

  // Renderizar item de usuário
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
    
    // Função para lidar com o clique no ícone de edição
    const handleEditPress = () => {
      Alert.alert('Editar', `Editar usuário ${item.name}`);
    };
    
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
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {item.email}
          </Text>
          <View style={styles.roleContainer}>
            {userRole && (
              <Text style={[
                styles.roleText, 
                { 
                  backgroundColor: roleColor,
                  color: '#FFFFFF'
                }
              ]}>
                {userRole}
              </Text>
            )}
          </View>
          {item.church_name && (
            <Text style={[styles.churchName, { color: colors.textSecondary }]}>{item.church_name}</Text>
          )}
        </View>
        <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
          <FontAwesome name="pencil" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };
  
  // Renderizar item de equipe
  const renderTeamItem = ({ item }) => {
    return (
      <TeamItem 
        team={item} 
        onPress={handleTeamPress} 
        onEdit={handleEditTeam} 
        colors={colors} 
      />
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
        {/* Modal para criar nova equipe */}
        <CreateTeamModal 
          visible={isCreateTeamModalVisible}
          onClose={() => setIsCreateTeamModalVisible(false)}
          onSave={handleSaveTeam}
        />

        {/* Controle de segmentos */}
        <SegmentedControl
          segments={segments}
          selectedKey={activeSegment}
          onSelect={handleSegmentChange}
          style={styles.segmentedControl}
        />

        {/* Botões de ação */}
        {activeSegment === 'people' ? (
          <OutlineGradientButton
            title="Adicionar Pessoa"
            onPress={handleAddPerson}
            style={styles.fullWidthButton}
            colors={[theme.colors.secondary, '#007AFF']} // Azul para pessoas
            icon="user-plus"
          />
        ) : (
          <OutlineGradientButton
            title="Criar Equipe"
            onPress={handleCreateTeam}
            style={styles.fullWidthButton}
            colors={[theme.colors.gradient.start, '#1ac8aa']} // Verde água para equipes
            icon="users"
          />
        )}
        
        {/* Campo de busca */}
        <View style={[styles.searchContainer, { backgroundColor: colors.input }]}>
          <FontAwesome name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={`Buscar ${activeSegment === 'people' ? 'pessoa' : 'equipe'}...`}
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={activeSegment === 'people' ? '#007AFF' : '#1ac8aa'} />
          </View>
        ) : activeSegment === 'people' ? (
          // Lista de pessoas
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                <View style={styles.listHeader}>
                  <Text style={[styles.listHeaderText, { color: colors.textSecondary }]}>
                    {filteredUsers.length} {filteredUsers.length === 1 ? 'pessoa' : 'pessoas'}
                  </Text>
                </View>
              </>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <FontAwesome name="users" size={50} color={colors.textSecondary} style={styles.emptyIcon} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Nenhuma pessoa encontrada
                </Text>
                <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
                  Os usuários cadastrados no sistema aparecerão aqui
                </Text>
              </View>
            }
          />
        ) : (
          // Lista de equipes
          <FlatList
            data={filteredTeams}
            renderItem={renderTeamItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <>
                <View style={styles.listHeader}>
                  <Text style={[styles.listHeaderText, { color: colors.textSecondary }]}>
                    {filteredTeams.length} {filteredTeams.length === 1 ? 'equipe' : 'equipes'}
                  </Text>
                </View>
              </>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <FontAwesome name="users" size={50} color={colors.textSecondary} style={styles.emptyIcon} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Nenhuma equipe encontrada
                </Text>
                <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
                  As equipes criadas aparecerão aqui
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
  segmentedControl: {
    marginBottom: theme.spacing.md,
  },
  fullWidthButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
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
  editButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userEmail: {
    fontSize: theme.typography.fontSize.sm,
  },
  roleContainer: {
    marginTop: 4,
  },
  roleText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '500',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.sizes.borderRadius.sm,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
  },
  churchName: {
    fontSize: theme.typography.fontSize.xs,
    marginTop: 4,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 50,
  },
  emptyIcon: {
    marginBottom: theme.spacing.md,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  emptySubText: {
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default TeamsScreen;
