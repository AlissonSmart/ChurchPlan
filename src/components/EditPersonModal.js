import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Animated,
  Easing,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useColorScheme } from 'react-native';
import theme from '../styles/theme';
import teamService from '../services/teamService';
import userService from '../services/userService';
import profileService from '../services/profileService';

const { height } = Dimensions.get('window');

const EditPersonModal = ({ visible, onClose, onSave, onDelete, personData }) => {
  // Estados para os campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [authStatus, setAuthStatus] = useState('pending');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [teams, setTeams] = useState([]);
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Animações
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Detectar tema do dispositivo
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  // Carregar dados da pessoa quando o modal for aberto
  useEffect(() => {
    if (visible && personData) {
      setName(personData.name || '');
      setEmail(personData.email || '');
      setPhone(personData.phone || '');
      setIsAdmin(personData.is_admin || false);
      setAuthStatus(personData.auth_status || 'pending');
      setUserId(personData.id || null);
      
      // Carregar equipes da pessoa
      loadTeams();
      loadPersonTeams(personData.id);
    }
  }, [visible, personData]);

  // Animação ao abrir/fechar o modal
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.bezier(0.16, 1, 0.3, 1), // Easing.out(Easing.ease) - curva suave
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  // Estilos animados
  const animatedStyles = {
    container: {
      transform: [
        {
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [height, -20], // -20 faz o modal subir um pouco mais na tela
          }),
        },
      ],
      opacity: fadeAnim,
    },
  };

  // Carregar equipes disponíveis
  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const teamsData = await teamService.getAllTeams();
      
      // Para cada equipe, carregar as funções disponíveis
      const teamsWithRoles = await Promise.all(teamsData.map(async (team) => {
        const roles = await teamService.getTeamRoles(team.id);
        return {
          ...team,
          roles: roles || []
        };
      }));
      
      setTeams(teamsWithRoles);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar equipes da pessoa
  const loadPersonTeams = async (personId) => {
    try {
      if (!personId) return;
      
      const personTeams = await profileService.getUserTeams(personId);
      console.log('Equipes da pessoa:', personTeams);
      
      // Formatar as equipes para o formato usado pelo componente
      const formattedTeams = personTeams.map(team => ({
        teamId: team.id,
        role: team.role
      }));
      
      setSelectedTeams(formattedTeams);
    } catch (error) {
      console.error('Erro ao carregar equipes da pessoa:', error);
    }
  };

  // Fechar modal com animação
  const animatedClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.bezier(0.16, 1, 0.3, 1), // Curva suave para descer
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      resetForm();
      onClose();
    });
  };

  // Limpar formulário
  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setIsAdmin(false);
    setAuthStatus('pending');
    setSelectedTeams([]);
    setExpandedTeamId(null);
    setUserId(null);
  };

  // Expandir/colapsar equipe
  const toggleTeam = (teamId) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  // Adicionar/remover pessoa de uma equipe com uma função específica
  const toggleTeamRole = (teamId, roleName) => {
    setSelectedTeams(current => {
      // Verificar se já existe uma seleção para esta equipe
      const existingIndex = current.findIndex(item => item.teamId === teamId);
      
      if (existingIndex >= 0) {
        // Se a função já está selecionada, removê-la
        if (current[existingIndex].role === roleName) {
          return current.filter((_, index) => index !== existingIndex);
        } else {
          // Atualizar a função para esta equipe
          const updated = [...current];
          updated[existingIndex] = { teamId, role: roleName };
          return updated;
        }
      } else {
        // Adicionar nova seleção de equipe e função
        return [...current, { teamId, role: roleName }];
      }
    });
  };

  // Verificar se uma equipe e função específica estão selecionadas
  const isTeamRoleSelected = (teamId, roleName) => {
    return selectedTeams.some(item => item.teamId === teamId && item.role === roleName);
  };

  // Salvar pessoa
  const handleSave = async () => {
    // Validação básica
    if (!name.trim() || !email.trim()) {
      return; // Não salvar se campos obrigatórios estiverem vazios
    }
    
    // Evitar múltiplos cliques
    if (isSaving) return;
    
    setIsSaving(true);
    console.log('Salvando pessoa...');
    
    try {
      // Criar objeto da pessoa
      const updatedPerson = {
        id: userId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        is_admin: isAdmin,
        auth_status: authStatus,
        teams: selectedTeams
      };
      
      // Chamar a função onSave passada como prop
      await onSave(updatedPerson);
      
      // Limpar formulário e fechar modal com animação
      animatedClose();
    } catch (error) {
      console.error('Erro ao salvar pessoa:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  // Confirmar exclusão
  const confirmDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir ${name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: handleDelete
        }
      ]
    );
  };

  // Excluir pessoa
  const handleDelete = async () => {
    if (!userId) return;
    
    try {
      await onDelete(userId);
      animatedClose();
    } catch (error) {
      console.error('Erro ao excluir pessoa:', error);
      Alert.alert('Erro', 'Não foi possível excluir a pessoa.');
    }
  };

  // Renderizar um item de equipe selecionada
  const renderSelectedTeamItem = (teamId, role) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return null;
    
    return (
      <View key={`selected-${teamId}-${role}`} style={styles.selectedTeamItem}>
        <Text style={[styles.selectedTeamText, { color: colors.text }]}>
          {team.name} - {role}
        </Text>
        <TouchableOpacity 
          onPress={() => toggleTeamRole(teamId, role)}
          style={styles.removeSelectedTeam}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome name="times-circle" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      isVisible={visible}
      style={styles.modal}
      backdropOpacity={0.3}
      onBackdropPress={animatedClose}
      onBackButtonPress={() => {}} // Impedir fechamento pelo botão de retorno
      swipeDirection={null} // Desativar fechamento por gesto
      useNativeDriver={true}
      statusBarTranslucent
      avoidKeyboard={true}
      propagateSwipe={true} // Permite rolagem dentro do modal
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <Animated.View style={[styles.modalContainer, animatedStyles.container, { backgroundColor: colors.card }]}>
          {/* Indicador de arraste */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
          
          {/* Cabeçalho */}
          <View style={[styles.modalHeader, { 
            backgroundColor: isDarkMode ? theme.colors.dark.card : '#FFFFFF',
            borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E5EA'
          }]}>
            <TouchableOpacity 
              onPress={animatedClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.cancelButton, { color: isDarkMode ? '#0A84FF' : '#007AFF' }]}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Editar Pessoa</Text>
            <TouchableOpacity 
              onPress={handleSave} 
              disabled={!name.trim() || !email.trim() || isSaving}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text 
                style={[
                  styles.saveButton, 
                  { 
                    color: !name.trim() || !email.trim() || isSaving 
                      ? (isDarkMode ? '#666666' : '#999999') 
                      : (isDarkMode ? '#0A84FF' : '#007AFF')
                  }
                ]}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Formulário */}
          <ScrollView style={styles.formContainer}>
            <View style={styles.formContentContainer}>
              {/* Toggle de Administrador */}
              <View style={styles.switchContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Administrador</Text>
                <Switch
                  value={isAdmin}
                  onValueChange={setIsAdmin}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={isAdmin ? '#007AFF' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>

              {/* Toggle de Status de Ativação */}
              <View style={styles.switchContainer}>
                <View>
                  <Text style={[styles.label, { color: colors.text }]}>Status</Text>
                  <Text style={[styles.statusBadge, { 
                    backgroundColor: authStatus === 'active' ? '#34C759' : '#FF9500',
                    color: '#FFFFFF'
                  }]}>
                    {authStatus === 'active' ? 'Ativo' : 'Pendente'}
                  </Text>
                </View>
                <Switch
                  value={authStatus === 'active'}
                  onValueChange={(value) => setAuthStatus(value ? 'active' : 'pending')}
                  trackColor={{ false: '#FF9500', true: '#34C759' }}
                  thumbColor="#f4f3f4"
                  ios_backgroundColor="#3e3e3e"
                />
              </View>
              
              {/* Campo de Nome */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Nome completo</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                  placeholder="Digite o nome completo"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
              
              {/* Campo de Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                  placeholder="Digite o email"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              {/* Campo de Telefone */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Telefone</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                  placeholder="Digite o telefone"
                  placeholderTextColor={colors.textSecondary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
              
              {/* Equipes selecionadas */}
              {selectedTeams.length > 0 && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Equipes Selecionadas</Text>
                  <View style={styles.selectedTeamsContainer}>
                    {selectedTeams.map(item => renderSelectedTeamItem(item.teamId, item.role))}
                  </View>
                </View>
              )}

              {/* Lista de equipes com acordeon */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Selecione Equipes e Papéis</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Toque em uma equipe para ver os papéis disponíveis
                </Text>
                
                {isLoading ? (
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Carregando equipes...
                  </Text>
                ) : teams.length === 0 ? (
                  <Text style={[styles.noTeamsText, { color: colors.textSecondary }]}>
                    Nenhuma equipe disponível
                  </Text>
                ) : (
                  <View style={styles.teamsContainer}>
                    {teams.map(team => (
                      <View key={team.id} style={styles.teamAccordion}>
                        <TouchableOpacity
                          style={[
                            styles.teamHeader,
                            { 
                              backgroundColor: colors.input,
                              borderColor: isDarkMode ? '#333333' : '#E5E5EA'
                            }
                          ]}
                          onPress={() => toggleTeam(team.id)}
                        >
                          <Text style={[styles.teamName, { color: colors.text }]}>{team.name}</Text>
                          <FontAwesome 
                            name={expandedTeamId === team.id ? 'chevron-up' : 'chevron-down'} 
                            size={16} 
                            color={colors.textSecondary} 
                          />
                        </TouchableOpacity>
                        
                        {expandedTeamId === team.id && (
                          <View style={[
                            styles.rolesContainer,
                            { backgroundColor: isDarkMode ? '#2C2C2E' : '#F9F9F9' }
                          ]}>
                            {team.roles && team.roles.length > 0 ? (
                              team.roles.map(role => (
                                <TouchableOpacity 
                                  key={`${team.id}-${role.name}`}
                                  style={[
                                    styles.roleItem,
                                    isTeamRoleSelected(team.id, role.name) && styles.roleItemSelected
                                  ]}
                                  onPress={() => toggleTeamRole(team.id, role.name)}
                                >
                                  <Text style={[
                                    styles.roleName,
                                    { color: isTeamRoleSelected(team.id, role.name) ? '#FFFFFF' : colors.text }
                                  ]}>
                                    {role.name}
                                  </Text>
                                  {isTeamRoleSelected(team.id, role.name) && (
                                    <FontAwesome name="check" size={14} color="#FFFFFF" />
                                  )}
                                </TouchableOpacity>
                              ))
                            ) : (
                              <Text style={[styles.noRolesText, { color: colors.textSecondary }]}>
                                Nenhuma função disponível
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Botão de Excluir */}
              <TouchableOpacity
                style={[styles.deleteButton, { 
                  borderColor: '#FF3B30',
                  backgroundColor: isDarkMode ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 59, 48, 0.05)' 
                }]}
                onPress={confirmDelete}
                activeOpacity={0.7}
              >
                <FontAwesome name="trash-o" size={16} color="#FF3B30" style={{ marginRight: 8 }} />
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    minHeight: '70%', // Aumentado para ocupar mais espaço na tela
    borderTopLeftRadius: 20, // Raio aumentado para um visual mais moderno
    borderTopRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F2F2F7', // iOS background color
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#C7C7CC', // iOS light gray for drag handle
    opacity: 0.8,
    marginVertical: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  cancelButton: {
    fontSize: 17,
    fontWeight: '400',
    padding: 4,
  },
  saveButton: {
    fontSize: 17,
    fontWeight: '600',
    padding: 4,
  },
  formContainer: {
    flex: 1,
  },
  formContentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  teamsContainer: {
    marginTop: 8,
  },
  teamAccordion: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '500',
  },
  rolesContainer: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  roleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    marginBottom: 4,
  },
  roleItemSelected: {
    backgroundColor: theme.colors.primary,
  },
  roleName: {
    fontSize: 15,
  },
  noTeamsText: {
    textAlign: 'center',
    padding: 20,
  },
  noRolesText: {
    textAlign: 'center',
    padding: 10,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
  },
  selectedTeamsContainer: {
    marginTop: 8,
  },
  selectedTeamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,122,255,0.1)',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  selectedTeamText: {
    fontSize: 14,
    flex: 1,
  },
  removeSelectedTeam: {
    padding: 4,
  },
  deleteButton: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditPersonModal;
