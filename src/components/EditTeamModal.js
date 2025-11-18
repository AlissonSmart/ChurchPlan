import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Dimensions,
  Animated,
  Easing,
  Keyboard,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import GradientButton from './GradientButton';
import theme from '../styles/theme';

const { height } = Dimensions.get('window');

/**
 * Modal para edição de uma equipe existente
 * @param {boolean} visible - Controla a visibilidade do modal
 * @param {function} onClose - Função chamada ao fechar o modal
 * @param {function} onSave - Função chamada ao salvar a equipe
 * @param {function} onDelete - Função chamada ao excluir a equipe
 * @param {Object} teamData - Dados da equipe a ser editada
 * @returns {React.ReactNode}
 */
const EditTeamModal = ({ visible, onClose, onSave, onDelete, teamData }) => {
  const [teamName, setTeamName] = useState('');
  const [roles, setRoles] = useState(['']); // Iniciar com um campo vazio
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [removingIndex, setRemovingIndex] = useState(null);
  const [teamId, setTeamId] = useState(null);
  
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  
  // Animações
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Carregar dados da equipe quando o modal for aberto
  useEffect(() => {
    console.log('Modal visibilidade:', visible, 'teamData:', teamData);
    if (visible && teamData) {
      console.log('Carregando dados da equipe:', teamData.name, teamData.id);
      setTeamName(teamData.name || '');
      setTeamId(teamData.id || null);
      
      // Carregar funções da equipe
      loadTeamRoles();
    }
  }, [visible, teamData]);
  
  // Carregar funções da equipe
  const loadTeamRoles = async () => {
    if (!teamData || !teamData.id) return;
    
    try {
      // Importar dinamicamente para evitar dependência circular
      const teamService = require('../services/teamService').default;
      const rolesData = await teamService.getTeamRoles(teamData.id);
      
      if (rolesData && rolesData.length > 0) {
        const roleNames = rolesData.map(role => role.name);
        setRoles(roleNames);
      } else {
        setRoles(['']);
      }
    } catch (error) {
      console.error('Erro ao carregar funções da equipe:', error);
      setRoles(['']);
    }
  };
  
  // Monitorar o teclado
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardOpen(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardOpen(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Animar entrada e saída
  useEffect(() => {
    console.log('Animação useEffect - visible:', visible);
    if (visible) {
      console.log('Iniciando animação de entrada');
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
      ]).start(({ finished }) => {
        console.log('Animação de entrada finalizada:', finished);
      });
    } else {
      console.log('Resetando valores de animação');
      slideAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  // Estado para controlar se o botão de adicionar função está desabilitado
  const [isAddingRole, setIsAddingRole] = useState(false);
  
  // Adicionar um novo campo de função
  const addRoleField = () => {
    // Evitar cliques múltiplos
    if (isAddingRole) return;
    
    setIsAddingRole(true);
    console.log('Adicionando novo campo de função');
    
    // Usar a forma funcional do setState para garantir que estamos trabalhando com o estado mais recente
    setRoles(currentRoles => [...currentRoles, '']);
    
    // Resetar o estado após um tempo
    setTimeout(() => {
      setIsAddingRole(false);
    }, 300);
  };

  // Atualizar o valor de uma função específica
  const updateRole = (text, index) => {
    const newRoles = [...roles];
    newRoles[index] = text;
    setRoles(newRoles);
  };

  // Remover um campo de função
  const removeRole = (index) => {
    // Evitar cliques múltiplos
    if (removingIndex !== null) return;
    
    setRemovingIndex(index);
    console.log('Removendo função no índice:', index);
    
    // Usar a forma funcional do setState para garantir que estamos trabalhando com o estado mais recente
    setTimeout(() => {
      setRoles(currentRoles => currentRoles.filter((_, i) => i !== index));
      setRemovingIndex(null);
    }, 300);
  };

  // Resetar o formulário
  const resetForm = () => {
    setTeamName('');
    setRoles(['']);
    setTeamId(null);
  };

  // Fechar o modal
  const handleClose = () => {
    animatedClose();
  };

  // Salvar a equipe
  const handleSave = async () => {
    // Validação básica
    if (!teamName.trim() || roles.some(role => !role.trim())) {
      Alert.alert('Erro', 'Por favor, preencha o nome da equipe e todas as funções.');
      return;
    }
    
    // Evitar múltiplos cliques
    if (isSaving) return;
    
    setIsSaving(true);
    console.log('Salvando equipe...');
    
    try {
      // Criar objeto da equipe
      const updatedTeam = {
        id: teamId,
        name: teamName.trim(),
        roles: roles.filter(role => role.trim()).map(role => ({ name: role.trim() }))
      };
      
      // Chamar a função onSave passada como prop
      await onSave(updatedTeam);
      
      // Fechar o modal com animação
      animatedClose();
    } catch (error) {
      console.error('Erro ao salvar equipe:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações na equipe.');
    }
    
    // Resetar o estado de salvamento após um tempo
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  // Confirmar exclusão
  const confirmDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir a equipe ${teamName}?`,
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

  // Excluir equipe
  const handleDelete = async () => {
    if (!teamId) return;
    
    try {
      await onDelete(teamId);
      animatedClose();
    } catch (error) {
      console.error('Erro ao excluir equipe:', error);
      Alert.alert('Erro', 'Não foi possível excluir a equipe.');
    }
  };

  // Transformar a animação em estilos
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

  // Fechar o modal com animação
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
            activeOpacity={0.7} // Reduz a opacidade ao tocar, dando feedback visual
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Aumenta a área de toque
          >
            <Text style={[styles.cancelButton, { color: isDarkMode ? '#0A84FF' : '#007AFF' }]}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Editar Equipe</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={!teamName.trim() || roles.some(role => !role.trim()) || isSaving}
            activeOpacity={0.7} // Reduz a opacidade ao tocar, dando feedback visual
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Aumenta a área de toque
          >
            <Text 
              style={[
                styles.saveButton, 
                { 
                  color: !teamName.trim() || roles.some(role => !role.trim()) || isSaving 
                    ? (isDarkMode ? '#666666' : '#999999') 
                    : (isDarkMode ? '#0A84FF' : '#007AFF')
                }
              ]}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.formContainer}>
          <View style={styles.formContentContainer}>
            {/* Campo de nome da equipe */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nome da Equipe</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                placeholder="Digite o nome da equipe"
                placeholderTextColor={colors.textSecondary}
                value={teamName}
                onChangeText={setTeamName}
                autoCapitalize="words"
                keyboardType="default"
                returnKeyType="done"
                blurOnSubmit={true}
                enablesReturnKeyAutomatically={true}
              />
            </View>
            
            {/* Campos de funções */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Funções</Text>
              <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                Adicione as funções disponíveis nesta equipe
              </Text>
              
              {roles.map((role, index) => (
                <View key={index} style={styles.roleContainer}>
                  <TextInput
                    style={[styles.roleInput, { backgroundColor: colors.input, color: colors.text }]}
                    placeholder={`Função ${index + 1}`}
                    placeholderTextColor={colors.textSecondary}
                    value={role}
                    onChangeText={(text) => updateRole(text, index)}
                    autoCapitalize="words"
                    keyboardType="default"
                    returnKeyType="done"
                    blurOnSubmit={true}
                    enablesReturnKeyAutomatically={true}
                  />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeRole(index)}
                    activeOpacity={0.7} // Reduz a opacidade ao tocar, dando feedback visual
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Aumenta a área de toque
                    disabled={removingIndex !== null} // Desabilitar todos os botões enquanto um estiver sendo removido
                  >
                    <FontAwesome 
                      name="minus-circle" 
                      size={22} 
                      color={removingIndex === index ? '#999999' : '#FF3B30'} 
                    />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Botão para adicionar mais funções */}
              <TouchableOpacity 
                style={[styles.addButton, { borderColor: theme.colors.primary }, isAddingRole && styles.disabledButton]}
                onPress={addRoleField}
                activeOpacity={0.7} // Reduz a opacidade ao tocar, dando feedback visual
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Aumenta a área de toque
                disabled={isAddingRole} // Desabilitar o botão enquanto estiver adicionando
              >
                <FontAwesome name="plus" size={16} color={isAddingRole ? '#999999' : theme.colors.primary} />
                <Text style={[styles.addButtonText, { color: isAddingRole ? '#999999' : theme.colors.primary }]}>
                  {isAddingRole ? 'Adicionando...' : 'Adicionar Função'}
                </Text>
              </TouchableOpacity>
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
              <Text style={styles.deleteButtonText}>Excluir Equipe</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
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
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  subLabel: {
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  input: {
    borderRadius: theme.sizes.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  roleInput: {
    flex: 1,
    borderRadius: theme.sizes.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  removeButton: {
    padding: 10,
    marginLeft: theme.spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 50, // Completamente arredondado (100%)
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    alignSelf: 'center', // Centralizar horizontalmente
  },
  addButtonText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
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

export default EditTeamModal;
