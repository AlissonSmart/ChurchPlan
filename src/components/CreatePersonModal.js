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
} from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useColorScheme } from 'react-native';
import theme from '../styles/theme';
import teamService from '../services/teamService';
import userService from '../services/userService';
import profileService from '../services/profileService';

const { height } = Dimensions.get('window');

const CreatePersonModal = ({ visible, onClose, onSave }) => {
  // Estados para os campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [teams, setTeams] = useState([]);
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animações
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Detectar tema do dispositivo
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  // Carregar equipes disponíveis
  useEffect(() => {
    if (visible) {
      loadTeams();
    }
  }, [visible]);

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

  // Carregar equipes
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

  // Fechar modal com animação
  const animatedClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.bezier(0.36, 0, 0.66, -0.56), // Easing.out(Easing.back(1.5))
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
    setSelectedTeams([]);
    setExpandedTeamId(null);
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
      const newPerson = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        is_admin: isAdmin,
        teams: selectedTeams
      };
      
      // Chamar a função onSave passada como prop
      await onSave(newPerson);
      
      // Limpar formulário e fechar modal com animação
      resetForm();
      animatedClose();
    } catch (error) {
      console.error('Erro ao salvar pessoa:', error);
    } finally {
      // Resetar o estado de salvamento após um tempo
      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
    }
  };

  // Renderizar item de equipe selecionada
  const renderSelectedTeamItem = (teamId, roleName) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return null;
    
    return (
      <View key={`${teamId}-${roleName}`} style={styles.selectedTeamItem}>
        <Text style={[styles.selectedTeamText, { color: colors.text }]}>
          {team.name} - {roleName}
        </Text>
        <TouchableOpacity 
          onPress={() => toggleTeamRole(teamId, roleName)}
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
      onBackButtonPress={animatedClose}
      onSwipeComplete={animatedClose}
      swipeDirection={['down']}
      swipeThreshold={20} // Reduzido para tornar o gesto mais sensível
      useNativeDriver={true}
      statusBarTranslucent
      avoidKeyboard={true}
      propagateSwipe={true}
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
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Nova Pessoa</Text>
            <TouchableOpacity 
              onPress={handleSave} 
              disabled={!name.trim() || !email.trim() || isSaving}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[
                styles.saveButton, 
                { color: isDarkMode ? '#0A84FF' : '#007AFF' },
                (!name.trim() || !email.trim() || isSaving) && styles.disabledButton
              ]}>
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Conteúdo */}
          <ScrollView 
            style={styles.formContainer}
            contentContainerStyle={styles.formContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Campo de administrador (toggle) */}
            <View style={styles.switchContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Administrador</Text>
              <Switch
                value={isAdmin}
                onValueChange={setIsAdmin}
                trackColor={{ false: '#767577', true: '#1ac8aa' }}
                thumbColor={isAdmin ? '#f4f3f4' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
              />
            </View>

            {/* Campo de nome completo */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nome Completo*</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                placeholder="Digite o nome completo"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                keyboardType="default"
                returnKeyType="next"
                blurOnSubmit={false}
                enablesReturnKeyAutomatically={true}
              />
            </View>

            {/* Campo de email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email*</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                placeholder="Digite o email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                blurOnSubmit={false}
                enablesReturnKeyAutomatically={true}
              />
            </View>

            {/* Campo de telefone */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Telefone</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                placeholder="Digite o telefone"
                placeholderTextColor={colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="done"
                blurOnSubmit={true}
                enablesReturnKeyAutomatically={true}
              />
            </View>

            {/* Equipes e funções selecionadas */}
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
                          { backgroundColor: colors.card, borderColor: colors.border }
                        ]}
                        onPress={() => toggleTeam(team.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.teamName, { color: colors.text }]}>{team.name}</Text>
                        <FontAwesome 
                          name={expandedTeamId === team.id ? "chevron-up" : "chevron-down"} 
                          size={16} 
                          color={colors.textSecondary} 
                        />
                      </TouchableOpacity>
                      
                      {expandedTeamId === team.id && (
                        <View style={styles.rolesContainer}>
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
  disabledButton: {
    opacity: 0.5,
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
    marginVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  roleItemSelected: {
    backgroundColor: '#1ac8aa',
  },
  roleName: {
    fontSize: 15,
  },
  noRolesText: {
    padding: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  loadingText: {
    padding: 20,
    textAlign: 'center',
  },
  noTeamsText: {
    padding: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  selectedTeamsContainer: {
    marginTop: 8,
  },
  selectedTeamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(26, 200, 170, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1ac8aa',
  },
  selectedTeamText: {
    fontSize: 15,
    flex: 1,
  },
});

export default CreatePersonModal;
