import React, { useState, useEffect } from 'react';
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
  Keyboard,
  StatusBar,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import GradientButton from './GradientButton';
import theme from '../styles/theme';

const { height } = Dimensions.get('window');

/**
 * Modal para criação de uma nova equipe
 * @param {boolean} visible - Controla a visibilidade do modal
 * @param {function} onClose - Função chamada ao fechar o modal
 * @param {function} onSave - Função chamada ao salvar a equipe
 * @returns {React.ReactNode}
 */
const CreateTeamModal = ({ visible, onClose, onSave }) => {
  const [teamName, setTeamName] = useState('');
  const [roles, setRoles] = useState(['']); // Iniciar com um campo vazio
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  
  // Animações
  const slideAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);
  
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
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
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

  // Estado para controlar qual botão de remover foi clicado recentemente
  const [removingIndex, setRemovingIndex] = useState(null);
  
  // Remover um campo de função
  const removeRole = (index) => {
    // Evitar cliques múltiplos no mesmo botão
    if (removingIndex === index) return;
    
    if (roles.length > 1) { // Manter pelo menos um campo
      console.log('Removendo função no índice:', index);
      setRemovingIndex(index);
      
      // Usar a forma funcional do setState
      setRoles(currentRoles => {
        const newRoles = [...currentRoles];
        newRoles.splice(index, 1);
        return newRoles;
      });
      
      // Resetar o índice após um tempo
      setTimeout(() => {
        setRemovingIndex(null);
      }, 500);
    }
  };

  // Limpar formulário
  const resetForm = () => {
    setTeamName('');
    setRoles(['']);
  };

  // Fechar modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Estado para controlar se os botões estão desabilitados (evita cliques múltiplos)
  const [isSaving, setIsSaving] = useState(false);

  // Salvar equipe
  const handleSave = () => {
    // Evitar múltiplos cliques
    if (isSaving) return;
    
    // Verificar se o nome da equipe foi preenchido
    if (!teamName.trim()) {
      return; // Não salvar se o nome estiver vazio
    }
    
    // Marcar como salvando para evitar cliques múltiplos
    setIsSaving(true);
    console.log('Salvando equipe...');
    
    // Filtrar funções vazias
    const filteredRoles = roles.filter(role => role.trim() !== '');
    
    // Criar objeto da equipe
    const newTeam = {
      name: teamName,
      roles: filteredRoles,
    };
    
    // Chamar a função onSave passada como prop
    onSave(newTeam);
    
    // Limpar formulário e fechar modal com animação
    resetForm();
    animatedClose();
    
    // Resetar o estado de salvamento após um tempo
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  // Transformar a animação em estilos
  const animatedStyles = {
    container: {
      opacity: fadeAnim,
      transform: [
        {
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [300, 0],
          }),
        },
      ],
    },
  };

  // Fechar o modal com animação
  const animatedClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
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
      swipeThreshold={30}
      useNativeDriver={true}
      statusBarTranslucent
      avoidKeyboard={true}
      propagateSwipe={true}
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
          <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Nova Equipe</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={!teamName.trim() || isSaving}
            activeOpacity={0.7} // Reduz a opacidade ao tocar, dando feedback visual
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Aumenta a área de toque
          >
            <Text style={[
              styles.saveButton, 
              { color: isDarkMode ? '#0A84FF' : '#007AFF' },
              (!teamName.trim() || isSaving) && styles.disabledButton
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
              returnKeyType="next"
              blurOnSubmit={false}
              enablesReturnKeyAutomatically={true}
            />
          </View>

          {/* Campos de funções */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Funções</Text>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Adicione as funções disponíveis para esta equipe</Text>
            
            {roles.map((role, index) => (
              <View key={index} style={styles.roleContainer}>
                <TextInput
                  style={[styles.roleInput, { backgroundColor: colors.input, color: colors.text }]}
                  placeholder="Digite a função (ex: Líder, Membro, etc)"
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
    minHeight: '50%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F2F2F7', // iOS background color
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#C7C7CC', // iOS light gray for drag handle
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
});

export default CreateTeamModal;
