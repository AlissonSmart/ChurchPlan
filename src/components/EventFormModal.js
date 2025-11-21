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
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import theme from '../styles/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const { height } = Dimensions.get('window');

/**
 * Modal de formulário para criação de evento
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.visible - Se o modal está visível
 * @param {Function} props.onClose - Função chamada ao fechar o modal
 * @param {Function} props.onContinue - Função chamada ao continuar para a próxima etapa
 * @param {Object} props.initialData - Dados iniciais do evento (opcional)
 * @returns {React.ReactNode}
 */
const EventFormModal = ({ visible, onClose, onContinue, initialData = {} }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  
  // Estados para os campos do formulário
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState(new Date());
  const [reminderDays, setReminderDays] = useState('1');
  
  // Estados para os pickers de data e hora
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  
  // Referência para o input de nome
  const nameInputRef = useRef(null);
  
  // Opções para o lembrete
  const reminderOptions = [
    { label: '7 dias antes do culto', value: '7' },
    { label: '6 dias antes do culto', value: '6' },
    { label: '5 dias antes do culto', value: '5' },
    { label: '4 dias antes do culto', value: '4' },
    { label: '3 dias antes do culto', value: '3' },
    { label: '2 dias antes do culto', value: '2' },
    { label: '1 dia antes do culto', value: '1' },
    { label: 'No dia do culto', value: '0' },
  ];
  
  // Animações
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Monitorar o teclado
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {}
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {}
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
  
  // Efeito para inicializar os campos com os dados iniciais
  useEffect(() => {
    if (initialData) {
      setEventName(initialData.name || '');
      if (initialData.date) setEventDate(new Date(initialData.date));
      if (initialData.time) setEventTime(new Date(initialData.time));
      setReminderDays(initialData.reminderDays || '1');
    }
  }, [initialData]);
  
  // Efeito para focar no input de nome quando o modal abrir
  useEffect(() => {
    if (visible && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current.focus();
      }, 300);
    }
  }, [visible]);
  
  // Função para formatar a data
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // Função para formatar a hora
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  // Funções para lidar com o picker de data
  const handleOpenDatePicker = () => {
    Keyboard.dismiss();
    // No Android, o picker já aparece automaticamente
    if (Platform.OS === 'ios') {
      setShowDatePicker(true);
    } else {
      // No Android, precisamos mostrar o picker diretamente
      setShowDatePicker(true);
    }
  };
  
  const handleDateChange = (event, selectedDate) => {
    // No Android, o picker fecha automaticamente após a seleção
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };
  
  // Funções para lidar com o picker de hora
  const handleOpenTimePicker = () => {
    Keyboard.dismiss();
    // No Android, o picker já aparece automaticamente
    if (Platform.OS === 'ios') {
      setShowTimePicker(true);
    } else {
      // No Android, precisamos mostrar o picker diretamente
      setShowTimePicker(true);
    }
  };
  
  const handleTimeChange = (event, selectedTime) => {
    // No Android, o picker fecha automaticamente após a seleção
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      setEventTime(selectedTime);
    }
  };
  
  // Estado para controlar se os botões estão desabilitados (evita cliques múltiplos)
  const [isSaving, setIsSaving] = useState(false);
  
  // Função para continuar para a próxima etapa
  const handleContinue = () => {
    // Validar se o nome do evento foi preenchido
    if (!eventName.trim()) {
      // Mostrar erro ou alerta
      return;
    }
    
    // Marcar como salvando para evitar cliques múltiplos
    setIsSaving(true);
    
    // Dados do evento
    const eventData = {
      name: eventName.trim(),
      date: eventDate,
      time: eventTime,
      reminderDays
    };
    
    onContinue(eventData);
    
    // Resetar o estado de salvamento após um tempo
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
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
          <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Novo Evento</Text>
          <TouchableOpacity 
            onPress={handleContinue} 
            disabled={!eventName.trim() || isSaving}
            activeOpacity={0.7} // Reduz a opacidade ao tocar, dando feedback visual
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Aumenta a área de toque
          >
            <Text style={[
              styles.saveButton, 
              { color: isDarkMode ? '#0A84FF' : '#007AFF' },
              (!eventName.trim() || isSaving) && styles.disabledButton
            ]}>
              {isSaving ? 'Salvando...' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo */}
        <ScrollView 
          style={styles.formContainer}
          contentContainerStyle={styles.formContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Nome do Evento */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Nome do Evento</Text>
            <TextInput
              ref={nameInputRef}
              style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
              placeholder="Ex: Culto Dominical"
              placeholderTextColor={colors.textSecondary}
              value={eventName}
              onChangeText={setEventName}
              maxLength={100}
            />
          </View>
          
          {/* Data do Evento */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Data</Text>
            <TouchableOpacity 
              onPress={handleOpenDatePicker}
              activeOpacity={0.7}
            >
              <View style={[styles.input, { backgroundColor: colors.input }]}>
                <Text style={{ color: colors.text }}>{formatDate(eventDate)}</Text>
                <FontAwesome name="calendar" size={20} color={colors.primary} style={styles.inputIcon} />
              </View>
            </TouchableOpacity>
            {showDatePicker && Platform.OS === 'ios' && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={eventDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  locale="pt-BR"
                  style={styles.datePicker}
                />
                <View style={styles.datePickerButtonContainer}>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={[styles.datePickerButtonText, { color: colors.primary }]}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {showDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={eventDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
          
          {/* Horário de Início */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Horário de Início</Text>
            <TouchableOpacity 
              onPress={handleOpenTimePicker}
              activeOpacity={0.7}
            >
              <View style={[styles.input, { backgroundColor: colors.input }]}>
                <Text style={{ color: colors.text }}>{formatTime(eventTime)}</Text>
                <FontAwesome name="clock-o" size={20} color={colors.primary} style={styles.inputIcon} />
              </View>
            </TouchableOpacity>
            {showTimePicker && Platform.OS === 'ios' && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={eventTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  locale="pt-BR"
                  style={styles.datePicker}
                />
                <View style={styles.datePickerButtonContainer}>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => setShowTimePicker(false)}
                  >
                    <Text style={[styles.datePickerButtonText, { color: colors.primary }]}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {showTimePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={eventTime}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </View>
          
          {/* Lembrar Equipe */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Lembrar Equipe</Text>
            <TouchableOpacity 
              onPress={() => setShowReminderPicker(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.input, { backgroundColor: colors.input }]}>
                <Text style={{ color: colors.text }}>
                  {reminderOptions.find(option => option.value === reminderDays)?.label || '2 dias antes do culto'}
                </Text>
                <FontAwesome name="chevron-down" size={16} color={colors.primary} style={styles.inputIcon} />
              </View>
            </TouchableOpacity>
            
            {/* Modal para o Picker de Lembrete */}
            <Modal
              isVisible={showReminderPicker}
              onBackdropPress={() => setShowReminderPicker(false)}
              backdropOpacity={0.5}
              style={styles.pickerModal}
              animationIn="fadeIn"
              animationOut="fadeOut"
              useNativeDriver
            >
              <View style={[styles.pickerModalContent, { backgroundColor: isDarkMode ? '#333333' : '#FFFFFF' }]}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowReminderPicker(false)}>
                    <Text style={[styles.pickerHeaderButton, { color: colors.primary }]}>Fechar</Text>
                  </TouchableOpacity>
                  <Text style={[styles.pickerHeaderTitle, { color: colors.text }]}>Lembrar Equipe</Text>
                  <View style={{ width: 60 }} />
                </View>
                
                <ScrollView style={styles.pickerOptionsContainer}>
                  {reminderOptions.map((option) => (
                    <TouchableOpacity 
                      key={option.value}
                      style={[styles.pickerOption, reminderDays === option.value && styles.pickerOptionSelected]}
                      onPress={() => {
                        setReminderDays(option.value);
                        setShowReminderPicker(false);
                      }}
                    >
                      <Text style={[styles.pickerOptionText, { color: colors.text }]}>{option.label}</Text>
                      {reminderDays === option.value && (
                        <FontAwesome name="check" size={16} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Modal>
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
  input: {
    borderRadius: theme.sizes.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
  inputIcon: {
    marginLeft: theme.spacing.sm,
  },
  pickerContainer: {
    borderRadius: theme.sizes.borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    height: 48,
  },
  datePicker: {
    width: '100%',
    height: 200,
    backgroundColor: 'transparent',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  datePickerButtonContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    padding: 12,
    alignItems: 'center',
  },
  datePickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  datePickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerModal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: '80%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  pickerHeaderTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  pickerHeaderButton: {
    fontSize: 17,
    fontWeight: '400',
    padding: 4,
  },
  pickerOptionsContainer: {
    maxHeight: 300,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  pickerOptionText: {
    fontSize: 17,
  },
});

export default EventFormModal;
