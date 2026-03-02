import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Alert,
  Animated
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import StandardButton from '../components/StandardButton';
import CreateTeamModal from '../components/CreateTeamModal';
import CreatePersonModal from '../components/CreatePersonModal';
import EditPersonModal from '../components/EditPersonModal';
import EditTeamModal from '../components/EditTeamModal';
import TeamItem from '../components/TeamItem';
import SkeletonLoader from '../components/SkeletonLoader';
import userService from '../services/userService';
import teamService from '../services/teamService';
import profileService from '../services/profileService';
import authService from '../services/authService';
import supabase from '../services/supabase';
import theme from '../styles/theme';
import TabScreenWrapper from '../components/TabScreenWrapper';
import { HeaderContext } from '../contexts/HeaderContext';
import { useAuth } from '../contexts/AuthContext';


const TeamsScreen = ({ navigation }) => {
  // Estados unificados
  const [items, setItems] = useState([]); // Lista unificada de equipes e pessoas
  const [filteredItems, setFilteredItems] = useState([]);
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
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  
  // Tema
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  
  // Função para carregar todos os dados (equipes e pessoas)
  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Carregar equipes e pessoas em paralelo
      const [teamsData, usersData] = await Promise.all([
        teamService.getAllTeams(),
        userService.getAllUsers()
      ]);
      
      console.log('Equipes carregadas:', teamsData);
      console.log('Usuários carregados:', usersData);
      
      // Buscar funções e membros para cada equipe
      const teamsWithDetails = await Promise.all(
        teamsData.map(async (team) => {
          try {
            // Buscar funções da equipe (team_roles.name)
            let rolesData = [];
            try {
              const teamRoles = await teamService.getTeamRoles(team.id);
              rolesData = (teamRoles || []).map(role => ({
                id: role.id,
                name: role.name
              }));
            } catch (rolesError) {
              console.error(`Erro ao buscar funções da equipe ${team.name}:`, rolesError);
            }
            
            // Buscar subequipes
            let subteamsData = [];
            try {
              subteamsData = await teamService.listSubteams(team.id);
            } catch (subteamError) {
              console.error(`Erro ao buscar subequipes da equipe ${team.name}:`, subteamError);
            }

            // Buscar membros da equipe com seus perfis
            const { data: membersData, error: membersError } = await supabase
              .from('team_members')
              .select(`
                id,
                role,
                user_id,
                profile:profiles!team_members_user_id_fkey(id, name, email, phone, avatar_url, is_active)
              `)
              .eq('team_id', team.id);
            
            if (membersError) {
              console.error(`Erro ao buscar membros da equipe ${team.name}:`, membersError);
            }
            
            console.log(`Equipe ${team.name} - Membros raw:`, membersData);
            
            const processedMembers = membersData?.map(m => {
              if (!m.profile) {
                console.warn(`Membro sem profile na equipe ${team.name}:`, m);
                return null;
              }
              return {
                ...m.profile,
                role: m.role,
                member_id: m.id,
                user_id: m.user_id
              };
            }).filter(Boolean) || [];
            
            console.log(`Equipe ${team.name} - Membros processados:`, processedMembers);
            
            return {
              ...team,
              itemType: 'team',
              roles: rolesData || [],
              subteams: subteamsData || [],
              members: processedMembers
            };
          } catch (error) {
            console.error(`Erro ao carregar detalhes da equipe ${team.name}:`, error);
            return {
              ...team,
              itemType: 'team',
              roles: [],
              members: []
            };
          }
        })
      );
      
      // Criar lista unificada com tipo identificador
      const unifiedItems = [
        ...teamsWithDetails,
        ...usersData.map(user => ({ ...user, itemType: 'person' }))
      ];
      
      setItems(unifiedItems);
      setFilteredItems(unifiedItems);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
      setItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
      fadeAnim.setValue(0);
      translateAnim.setValue(8);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Carregar dados iniciais ao montar o componente
  useEffect(() => {
    loadAllData();
  }, []);

  // Função para buscar por nome (equipes e pessoas)
  const handleSearch = (text) => {
    setSearchText(text);
    
    console.log('handleSearch chamado com:', text);
    console.log('Total de items:', items.length);
    
    if (text.trim()) {
      const searchLower = text.toLowerCase();
      
      // Buscar equipes que correspondem ao termo
      const matchingTeams = items.filter(item => 
        item.itemType === 'team' && 
        item.name.toLowerCase().includes(searchLower)
      );
      console.log('Equipes que correspondem:', matchingTeams.length);
      
      // Buscar pessoas que correspondem ao termo
      const matchingPeople = items.filter(item => 
        item.itemType === 'person' && 
        item.name.toLowerCase().includes(searchLower)
      );
      console.log('Pessoas que correspondem:', matchingPeople.length);
      
      // Buscar equipes que contêm as pessoas encontradas
      const teamsWithMatchingMembers = items
        .filter(item => item.itemType === 'team')
        .map(team => {
          const matchingMembers = (team.members || []).filter(member => 
            member.name?.toLowerCase().includes(searchLower)
          );

          if (matchingMembers.length > 0) {
            console.log(`Equipe ${team.name} tem membro que corresponde à busca`);
            return {
              ...team,
              members: matchingMembers
            };
          }

          return null;
        })
        .filter(Boolean);
      console.log('Equipes com membros que correspondem:', teamsWithMatchingMembers.length);
      
      // Combinar resultados, removendo duplicatas de equipes
      const teamMap = new Map();
      matchingTeams.forEach(team => {
        teamMap.set(team.id, team);
      });

      teamsWithMatchingMembers.forEach(team => {
        if (!teamMap.has(team.id)) {
          teamMap.set(team.id, team);
          return;
        }

        // Se a equipe já veio pelo nome, mantém completa
        const existing = teamMap.get(team.id);
        if (existing?.name?.toLowerCase().includes(searchLower)) {
          return;
        }

        // Caso contrário, mesclar membros filtrados
        const memberIds = new Set((existing.members || []).map(member => member.id));
        const mergedMembers = [...(existing.members || [])];
        (team.members || []).forEach(member => {
          if (!memberIds.has(member.id)) {
            memberIds.add(member.id);
            mergedMembers.push(member);
          }
        });
        teamMap.set(team.id, {
          ...existing,
          members: mergedMembers
        });
      });

      const uniqueTeams = Array.from(teamMap.values());
      
      // Combinar equipes únicas com pessoas encontradas
      const filtered = [...uniqueTeams, ...matchingPeople];
      
      console.log('Total de resultados filtrados:', filtered.length);
      setFilteredItems(filtered);
    } else {
      // Limpar busca
      console.log('Limpando busca, mostrando todos os items');
      setFilteredItems(items);
    }
  };
  
  // Atualizar lista filtrada quando os dados originais mudarem
  useEffect(() => {
    if (!searchText) {
      setFilteredItems(items);
    }
  }, [items, searchText]);
  
  // Função para lidar com o clique em uma equipe
  const handleTeamPress = (team) => {
    handleEditTeam(team);
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
      
      // Recarregar todos os dados
      loadAllData();
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      
      // Mostrar o erro real do banco de dados
      let errorMessage = `Erro: ${error.message || 'Desconhecido'}`;
      
      // Adicionar detalhes do erro se disponíveis
      if (error.details) {
        errorMessage += `\n\nDetalhes: ${error.details}`;
      }
      
      // Adicionar código do erro se disponível
      if (error.code) {
        errorMessage += `\n\nCódigo: ${error.code}`;
      }
      
      Alert.alert('Erro ao criar equipe', errorMessage, [{ text: 'OK' }]);
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
      
      // Recarregar todos os dados
      loadAllData();
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
      
      // Recarregar todos os dados
      loadAllData();
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
      if (!user) {
        Alert.alert(
          'Erro de Autenticação', 
          'Você precisa estar autenticado para adicionar uma pessoa. Por favor, faça login novamente.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      setLoading(true);
      console.log('Adicionando ou reativando pessoa:', personData);
      
      const newPerson = await profileService.createOrReactivateProfile({
        name: personData.name,
        email: personData.email,
        phone: personData.phone,
        is_admin: personData.is_admin || false,
      });
    
      Alert.alert(
        'Sucesso', 
        `Pessoa ${personData.name} adicionada com sucesso! Ela receberá um convite para se cadastrar.`,
        [{ text: 'OK' }]
      );
      
      setIsCreatePersonModalVisible(false);
      loadAllData();
    } catch (error) {
      console.error('Erro ao adicionar pessoa:', error);
      
      Alert.alert(
        'Erro ao adicionar pessoa',
        error.message || 'Não foi possível salvar esta pessoa.'
      );
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
      
      // Recarregar todos os dados
      loadAllData();
    } catch (error) {
      console.error('Erro ao atualizar pessoa:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a pessoa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Função para desativar uma pessoa
  const handleDeletePerson = async (userId) => {
    try {
      // Verificar se o usuário está autenticado
      if (!user) {
        Alert.alert(
          'Erro de Autenticação', 
          'Você precisa estar autenticado para desativar uma pessoa. Por favor, faça login novamente.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Confirmar desativação
      Alert.alert(
        'Confirmar Desativação',
        'Tem certeza que deseja desativar esta pessoa? Ela não aparecerá mais nas listas, mas o histórico será mantido.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Desativar', 
            style: 'destructive',
            onPress: async () => {
              setLoading(true);
              console.log('Desativando pessoa:', userId);
              
              try {
                // Desativar a pessoa (soft delete)
                await profileService.deactivateProfile(userId);
                
                Alert.alert(
                  'Sucesso', 
                  'Pessoa desativada com sucesso! Ela não aparecerá mais nas listas.',
                  [{ text: 'OK' }]
                );
                
                // Fechar o modal após desativar com sucesso
                setIsEditPersonModalVisible(false);
                setSelectedPerson(null);
                
                // Recarregar todos os dados
                loadAllData();
              } catch (error) {
                console.error('Erro ao excluir pessoa:', error);
                Alert.alert('Erro', 'Não foi possível excluir a pessoa. Tente novamente.');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao processar exclusão de pessoa:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao processar a exclusão. Tente novamente.');
      setLoading(false);
    }
  };

  // Função para reativar uma pessoa
  const handleReactivatePerson = async (userId) => {
    try {
      if (!user) {
        Alert.alert(
          'Erro de Autenticação', 
          'Você precisa estar autenticado para reativar uma pessoa. Por favor, faça login novamente.',
          [{ text: 'OK' }]
        );
        return;
      }

      setLoading(true);
      console.log('Reativando pessoa:', userId);

      // Reativar a pessoa
      await profileService.reactivateProfile(userId);

      Alert.alert(
        'Sucesso', 
        'Pessoa reativada com sucesso! Ela aparecerá novamente nas listas.',
        [{ text: 'OK' }]
      );

      // Fechar o modal após reativar com sucesso
      setIsEditPersonModalVisible(false);
      setSelectedPerson(null);

      // Recarregar todos os dados
      loadAllData();
    } catch (error) {
      console.error('Erro ao reativar pessoa:', error);
      Alert.alert('Erro', 'Não foi possível reativar a pessoa. Tente novamente.');
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
            {userTeams.map((team, index) => {
              const teamItem = items.find(
                (item) => item.itemType === 'team' && item.id === team.team_id
              );
              const teamColor = getTeamColor(teamItem || { name: team.team_id });

              return (
                <Text 
                  key={`${team.team_id}-${index}`}
                  style={[
                    styles.roleText, 
                    { 
                      backgroundColor: team.role && team.role.toLowerCase().includes('líder') ? 
                        teamColor : teamColor,
                      color: '#FFFFFF'
                    }
                  ]}
                >
                  {team.role || 'Membro'}
                </Text>
              );
            })}
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
  
  const teamPalette = [
    
    '#5B6CFF', // azul
    '#2EC4B6', // teal

    '#6C63FF', // violeta
    '#26A69A', // teal médio

    '#7B61FF', // roxo moderno
    '#34C38F', // verde esmeralda

  ];

  const getTeamColor = (team) => {
    if (team?.color) return team.color;
    const seed = (team?.name || '')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return teamPalette[seed % teamPalette.length];
  };

  // Handler para abrir perfil da pessoa
  const handleMemberPress = (member) => {
    // Buscar a pessoa completa na lista de items
    const person = items.find(item => 
      item.itemType === 'person' && item.id === member.id
    );
    
    if (person) {
      setSelectedPerson(person);
      setIsEditPersonModalVisible(true);
    }
  };

  // Renderizar item de equipe como card com funções e membros
  const renderTeamItem = ({ item }) => {
    console.log('renderTeamItem chamado com:', item);
    
    const teamColor = getTeamColor(item);
    
    return (
      <View style={[styles.teamCard, { backgroundColor: colors.card }]}>
        {/* Header da equipe */}
        <TouchableOpacity 
          style={styles.teamCardHeader}
          onPress={() => handleTeamPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.teamCardTitleRow}>
            <View style={[styles.teamColorDot, { backgroundColor: teamColor }]} />
            <Text style={[styles.teamCardTitle, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.teamMemberCount, { color: colors.textSecondary }]}>
              ({item.members?.length || 0})
            </Text>
          </View>
          <TouchableOpacity onPress={(e) => {
            e.stopPropagation();
            handleEditTeam(item);
          }}>
            <FontAwesome name="pencil" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.teamCardContent}>
          {/* Funções da equipe */}
          {item.roles && item.roles.length > 0 && (
            <View style={styles.teamRolesSection}>
              <Text style={[styles.teamRolesLabel, { color: colors.textSecondary }]}>Funções:</Text>
              <View style={styles.teamRolesList}>
                {item.roles.map((role, index) => (
                  <View 
                    key={`${role.id}-${index}`}
                    style={[styles.teamRoleBadge, { borderColor: teamColor }]}
                  >
                    <Text style={[styles.teamRoleBadgeText, { color: teamColor }]}>
                      {role.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {item.subteams && item.subteams.length > 0 && (
            <View style={styles.teamSubteamsSection}>
              <Text style={[styles.teamSubteamsLabel, { color: colors.textSecondary }]}>Subequipes:</Text>
              <View style={styles.teamSubteamsList}>
                {item.subteams.map((subteam, index) => (
                  <View 
                    key={`${subteam.id}-${index}`} 
                    style={[styles.teamSubteamBadge, { borderColor: teamColor }]}
                  >
                    <Text style={[styles.teamSubteamBadgeText, { color: teamColor }]}>
                      {subteam.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Membros da equipe */}
          {item.members && item.members.length > 0 && (
            <View style={styles.teamMembersSection}>
              {item.members.map((member, index) => (
                <TouchableOpacity
                  key={`${member.id}-${index}`}
                  style={[
                    styles.teamMemberItem,
                    index < item.members.length - 1 && styles.teamMemberItemBorder,
                    { borderBottomColor: colors.border }
                  ]}
                  onPress={() => handleMemberPress(member)}
                  activeOpacity={0.7}
                >
                  {/* Avatar */}
                  <View style={[styles.memberAvatar, { backgroundColor: teamColor + '20' }]}
                  >
                    <Text style={[styles.memberInitial, { color: teamColor }]}>
                      {member.name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>

                  {/* Info do membro */}
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: colors.text }]}>
                      {member.name}
                    </Text>
                    {member.email && (
                      <Text style={[styles.memberEmail, { color: colors.textSecondary }]}>
                        {member.email}
                      </Text>
                    )}
                    {member.phone && (
                      <Text style={[styles.memberPhone, { color: colors.textSecondary }]}>
                        {member.phone}
                      </Text>
                    )}
                    
                    {/* Badges de função e status */}
                    <View style={styles.memberBadges}>
                      {member.role && (
                        <View style={[styles.memberRoleBadge, { backgroundColor: teamColor }]}>
                          <Text style={styles.memberRoleBadgeText}>{member.role}</Text>
                        </View>
                      )}
                      {member.is_active && (
                        <View style={styles.memberStatusBadge}>
                          <Text style={styles.memberStatusBadgeText}>Ativo</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Seta para a direita */}
                  <FontAwesome name="chevron-right" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  // Renderizar item unificado (equipe ou pessoa)
  const renderUnifiedItem = ({ item }) => {
    if (item.itemType === 'team') {
      return renderTeamItem({ item });
    } else {
      return renderUserItem({ item });
    }
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
          onReactivate={handleReactivatePerson}
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

        {/* Botões de ação lado a lado - estilo página Planejar */}
        <View style={styles.buttonsContainer}>
          <View style={styles.buttonRow}>
            <View style={[styles.buttonContainer, { paddingRight: 3 }]}>
              <StandardButton 
                title="Criar Equipe"
                icon="users"
                onPress={handleCreateTeam}
                style={styles.actionButton}
              />
            </View>
            
            <View style={[styles.buttonContainer, { paddingLeft: 3 }]}>
              <StandardButton 
                title="Add Pessoas"
                icon="user-plus"
                onPress={handleAddPerson}
                style={styles.actionButton}
                outlined={true}
              />
            </View>
          </View>
        </View>
        
        {/* Campo de busca */}
        <View style={[styles.searchContainer, { backgroundColor: colors.input }]}>
          <FontAwesome name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar equipe ou pessoa..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>

        {loading ? (
          <SkeletonLoader 
            type="user"
            count={6}
            style={styles.skeletonContainer}
          />
        ) : (
          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ translateY: translateAnim }] }}
          >
            {/* Lista unificada de equipes e pessoas */}
            <FlatList
              data={filteredItems}
              renderItem={renderUnifiedItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={styles.listHeader}>
                  <Text style={[styles.listHeaderText, { color: colors.textSecondary }]}>
                    {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'itens'}
                  </Text>
                </View>
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <FontAwesome name="users" size={50} color={colors.textSecondary} style={styles.emptyIcon} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Nenhum resultado encontrado
                  </Text>
                  <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
                    Equipes e pessoas aparecerão aqui
                  </Text>
                </View>
              }
            />
          </Animated.View>
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
  buttonsContainer: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
    width: '100%',
  },
  buttonContainer: {
    width: '50%',
    padding: 0,
  },
  actionButton: {
    width: '100%',
    maxHeight: 44,
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
  // Estilos para card de equipe
  teamCard: {
    borderRadius: theme.sizes.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  teamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  teamCardContent: {
    marginHorizontal: 2,
  },
  teamCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.xs,
  },
  teamCardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    marginRight: theme.spacing.xs,
  },
  teamMemberCount: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '400',
  },
  teamRolesSection: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  teamRolesLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '500',
    marginBottom: 4,
  },
  teamRolesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  teamSubteamsSection: {
    marginTop: 6,
    marginBottom: 6,
  },
  teamSubteamsLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '500',
    marginBottom: 4,
  },
  teamSubteamsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  teamSubteamBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 6,
  },
  teamSubteamBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '500',
  },
  teamRoleBadge: {
    borderWidth: 1,
    borderRadius: theme.sizes.borderRadius.round,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 6,
  },
  teamRoleBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '500',
  },
  teamMembersSection: {
    marginTop: theme.spacing.xs,
  },
  teamMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  teamMemberItemBorder: {
    borderBottomWidth: 1,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  memberInitial: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: theme.typography.fontSize.xs,
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: theme.typography.fontSize.xs,
    marginBottom: 4,
  },
  memberBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  memberRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.sizes.borderRadius.round,
  },
  memberRoleBadgeText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
  },
  memberStatusBadge: {
    backgroundColor: '#2EC4B6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.sizes.borderRadius.round,
  },
  memberStatusBadgeText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
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
    borderRadius: theme.sizes.borderRadius.round, // Cantos 100% arredondados
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
