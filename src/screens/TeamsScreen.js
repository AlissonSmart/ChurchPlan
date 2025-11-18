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
import CreatePersonModal from '../components/CreatePersonModal';
import EditPersonModal from '../components/EditPersonModal';
import EditTeamModal from '../components/EditTeamModal';
import SegmentedControl from '../components/SegmentedControl';
import TeamItem from '../components/TeamItem';
import SkeletonLoader from '../components/SkeletonLoader';
import userService from '../services/userService';
import teamService from '../services/teamService';
import profileService from '../services/profileService';
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
  const [isCreatePersonModalVisible, setIsCreatePersonModalVisible] = useState(false);
  const [isEditPersonModalVisible, setIsEditPersonModalVisible] = useState(false);
  const [isEditTeamModalVisible, setIsEditTeamModalVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
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
    Alert.alert('Equipe', `Você selecionou a equipe ${team.name}`);
  };
  
  // Função para abrir o modal de edição de equipe
  const handleEditTeam = (team) => {
    console.log('handleEditTeam chamado com:', team);
    // Verificar se o usuário está autenticado antes de abrir o modal
    if (!user) {
      Alert.alert(
        'Erro de Autenticação', 
        'Você precisa estar autenticado para editar uma equipe. Por favor, faça login novamente.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    console.log('Definindo selectedTeam e abrindo modal');
    setSelectedTeam(team);
    setTimeout(() => {
      console.log('Abrindo modal de edição após timeout');
      setIsEditTeamModalVisible(true);
    }, 100); // Pequeno timeout para garantir que selectedTeam foi definido
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
      
      // Recarregar a lista de equipes
      loadTeams();
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      
      // Mensagem de erro mais específica
      let errorMessage = 'Não foi possível criar a equipe. Tente novamente.';
    }
    finally {
      setLoading(false);
    }
  };
  
  // Função para atualizar uma equipe
  const handleUpdateTeam = async (teamData) => {
    try {
      // Verificar se o usuário está autenticado
      if (!user) {
        Alert.alert(
          'Erro de Autenticação', 
          'Você precisa estar autenticado para editar uma equipe. Por favor, faça login novamente.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      setLoading(true);
      console.log('Atualizando equipe:', teamData);
      
      // Atualizar a equipe no banco de dados
      await teamService.updateTeam(teamData);
      
      Alert.alert(
        'Sucesso', 
        `Equipe ${teamData.name} atualizada com sucesso!`,
        [{ text: 'OK' }]
      );
      
      // Fechar o modal após atualizar com sucesso
      setIsEditTeamModalVisible(false);
      setSelectedTeam(null);
      
      // Recarregar a lista de equipes
      loadTeams();
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a equipe. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Função para excluir uma equipe
  const handleDeleteTeam = async (teamId) => {
    try {
      // Verificar se o usuário está autenticado
      if (!user) {
        Alert.alert(
          'Erro de Autenticação', 
          'Você precisa estar autenticado para excluir uma equipe. Por favor, faça login novamente.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      setLoading(true);
      console.log('Excluindo equipe:', teamId);
      
      // Excluir a equipe do banco de dados
      await teamService.deleteTeam(teamId);
      
      Alert.alert(
        'Sucesso', 
        'Equipe excluída com sucesso!',
        [{ text: 'OK' }]
      );
      
      // Fechar o modal após excluir com sucesso
      setIsEditTeamModalVisible(false);
      setSelectedTeam(null);
      
      // Recarregar a lista de equipes
      loadTeams();
    } catch (error) {
      console.error('Erro ao excluir equipe:', error);
      Alert.alert('Erro', 'Não foi possível excluir a equipe. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPerson = () => {
    // Verificar se o usuário está autenticado antes de abrir o modal
    if (!user) {
      Alert.alert(
        'Erro de Autenticação', 
        'Você precisa estar autenticado para adicionar uma pessoa. Por favor, faça login novamente.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Se estiver autenticado, abrir o modal
    setIsCreatePersonModalVisible(true);
  };
  
  const handleSavePerson = async (personData) => {
    try {
      // Verificar novamente se o usuário está autenticado antes de salvar
      if (!user) {
        Alert.alert(
          'Erro de Autenticação', 
          'Você precisa estar autenticado para adicionar uma pessoa. Por favor, faça login novamente.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      setLoading(true);
      console.log('Adicionando nova pessoa:', personData);
      
      // Salvar a pessoa no banco de dados usando o profileService
      const newPerson = await profileService.createUser(personData);
      
      Alert.alert(
        'Sucesso', 
        `Pessoa ${personData.name} adicionada com sucesso!`,
        [{ text: 'OK' }]
      );
      
      // Fechar o modal após salvar com sucesso
      setIsCreatePersonModalVisible(false);
      
      // Recarregar a lista de usuários
      loadUsers();
    } catch (error) {
      console.error('Erro ao adicionar pessoa:', error);
      
      // Mensagem de erro mais específica
      let errorMessage = 'Não foi possível adicionar a pessoa. Tente novamente.';
      
      if (error.message && error.message.includes('autenticado')) {
        errorMessage = 'Erro de autenticação. Por favor, faça login novamente.';
      } else if (error.message && error.message.includes('email')) {
        errorMessage = 'Este email já está sendo usado por outro usuário.';
      }
      
      Alert.alert('Erro', errorMessage, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };
  
  // Função para atualizar uma pessoa existente
  const handleUpdatePerson = async (personData) => {
    try {
      // Verificar se o usuário está autenticado
      if (!user) {
        Alert.alert(
          'Erro de Autenticação', 
          'Você precisa estar autenticado para editar uma pessoa. Por favor, faça login novamente.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      setLoading(true);
      console.log('Atualizando pessoa:', personData);
      
      // Atualizar a pessoa no banco de dados
      await profileService.saveProfile(personData);
      
      Alert.alert(
        'Sucesso', 
        `Pessoa ${personData.name} atualizada com sucesso!`,
        [{ text: 'OK' }]
      );
      
      // Fechar o modal após salvar com sucesso
      setIsEditPersonModalVisible(false);
      setSelectedPerson(null);
      
      // Recarregar a lista de usuários
      loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar pessoa:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a pessoa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Função para excluir uma pessoa
  const handleDeletePerson = async (userId) => {
    try {
      // Verificar se o usuário está autenticado
      if (!user) {
        Alert.alert(
          'Erro de Autenticação', 
          'Você precisa estar autenticado para excluir uma pessoa. Por favor, faça login novamente.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      setLoading(true);
      console.log('Excluindo pessoa:', userId);
      
      // Excluir a pessoa do banco de dados
      await profileService.deleteProfile(userId);
      
      Alert.alert(
        'Sucesso', 
        'Pessoa excluída com sucesso!',
        [{ text: 'OK' }]
      );
      
      // Fechar o modal após excluir com sucesso
      setIsEditPersonModalVisible(false);
      setSelectedPerson(null);
      
      // Recarregar a lista de usuários
      loadUsers();
    } catch (error) {
      console.error('Erro ao excluir pessoa:', error);
      Alert.alert('Erro', 'Não foi possível excluir a pessoa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar item de usuário
  const renderUserItem = ({ item }) => {
    // Verificar se o item é válido
    if (!item || !item.name) {
      return null;
    }
    
    // Obter as funções do usuário
    const userTeams = item.teams || [];
    
    // Verificar se o usuário é administrador
    const isAdmin = item.is_admin === true;
    
    // Função para lidar com o clique no ícone de edição
    const handleEditPress = () => {
      setSelectedPerson(item);
      setIsEditPersonModalVisible(true);
    };
    
    return (
      <TouchableOpacity 
        style={[styles.userItem, { backgroundColor: colors.card }]}
        onPress={() => handleEditPress()} // Agora abre diretamente o modal de edição ao tocar no item
      >
        <View style={styles.userAvatar}>
          <Text style={styles.userInitial}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.userNameContainer}>
            <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
            {isAdmin && (
              <View style={styles.adminBadge}>
                <FontAwesome name="shield" size={10} color="#FFFFFF" style={styles.adminIcon} />
                <Text style={styles.adminText}>Admin</Text>
              </View>
            )}
          </View>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {item.email}
          </Text>
          
          {/* Mostrar as funções do usuário */}
          <View style={styles.roleContainer}>
            {userTeams.map((team, index) => (
              <Text 
                key={`${team.team_id}-${index}`}
                style={[
                  styles.roleText, 
                  { 
                    backgroundColor: team.role && team.role.toLowerCase().includes('líder') ? 
                      theme.colors.primary : theme.colors.secondary,
                    color: '#FFFFFF'
                  }
                ]}
              >
                {team.role || 'Membro'}
              </Text>
            ))}
            {userTeams.length === 0 && (
              <Text style={[styles.noRoleText, { color: colors.textSecondary }]}>Sem função</Text>
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
    console.log('renderTeamItem chamado com:', item);
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
        
        {/* Modal para adicionar nova pessoa */}
        <CreatePersonModal
          visible={isCreatePersonModalVisible}
          onClose={() => setIsCreatePersonModalVisible(false)}
          onSave={handleSavePerson}
        />
        
        {/* Modal para editar pessoa */}
        <EditPersonModal
          visible={isEditPersonModalVisible}
          onClose={() => {
            setIsEditPersonModalVisible(false);
            setSelectedPerson(null);
          }}
          onSave={handleUpdatePerson}
          onDelete={handleDeletePerson}
          personData={selectedPerson}
        />
        
        {/* Modal para editar equipe */}
        <EditTeamModal
          visible={isEditTeamModalVisible}
          onClose={() => {
            setIsEditTeamModalVisible(false);
            setSelectedTeam(null);
          }}
          onSave={handleUpdateTeam}
          onDelete={handleDeleteTeam}
          teamData={selectedTeam}
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
          <SkeletonLoader 
            type={activeSegment === 'people' ? 'user' : 'team'}
            count={6}
            style={styles.skeletonContainer}
          />
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
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
    marginRight: 8,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF', // Azul no estilo iOS
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 2,
    marginLeft: 4,
  },
  adminIcon: {
    marginRight: 3,
  },
  adminText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: '700',
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
    marginTop: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleText: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: '700', // Mais negrito para compensar o tamanho menor
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 1, // Reduzir o padding vertical
    borderRadius: theme.sizes.borderRadius.round, // Cantos 100% arredondados
    overflow: 'hidden',
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
    marginRight: 3, // Espaçamento menor entre os badges
    marginBottom: 3, // Espaçamento menor entre linhas
  },
  noRoleText: {
    fontSize: theme.typography.fontSize.xs,
    fontStyle: 'italic',
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
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: theme.spacing.sm,
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
