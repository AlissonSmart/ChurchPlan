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
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import theme from '../styles/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import eventService from '../services/eventService';
import supabase from '../services/supabase';

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
  
  // Estado para controlar se estamos em ambiente web
  const isWeb = Platform.OS === 'web';
  
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
    setShowDatePicker(true);
  };
  
  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS !== 'web') {
      setShowDatePicker(Platform.OS === 'ios'); // No iOS, mantém aberto até clicar em "Done"
    }
    
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };
  
  const handleDateConfirm = (date) => {
    setShowDatePicker(false);
    setEventDate(date);
  };
  
  const handleDateCancel = () => {
    setShowDatePicker(false);
  };
  
  // Funções para lidar com o picker de hora
  const handleOpenTimePicker = () => {
    Keyboard.dismiss();
    setShowTimePicker(true);
  };
  
  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS !== 'web') {
      setShowTimePicker(Platform.OS === 'ios'); // No iOS, mantém aberto até clicar em "Done"
    }
    
    if (selectedTime) {
      setEventTime(selectedTime);
    }
  };
  
  const handleTimeConfirm = (time) => {
    setShowTimePicker(false);
    setEventTime(time);
  };
  
  const handleTimeCancel = () => {
    setShowTimePicker(false);
  };
  
  // Estado para controlar se os botões estão desabilitados (evita cliques múltiplos)
  const [isSaving, setIsSaving] = useState(false);
  
  // Função para salvar o evento
  const handleSaveEvent = async () => {
    // Validar se o nome do evento foi preenchido
    if (!eventName.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome do evento');
      return;
    }
    
    // Marcar como salvando para evitar cliques múltiplos
    setIsSaving(true);
    
    try {
      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado');
        setIsSaving(false);
        return;
      }

      // Formatar data (YYYY-MM-DD)
      const formattedDate = eventDate.toISOString().split('T')[0];
      
      // Formatar hora (HH:MM:SS)
      const hours = String(eventTime.getHours()).padStart(2, '0');
      const minutes = String(eventTime.getMinutes()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}:00`;

      // Criar evento no banco
      const newEvent = await eventService.createEvent({
        title: eventName.trim(),
        description: '',
        event_date: formattedDate,
        event_time: formattedTime,
        duration_minutes: 60,
        location: '',
        template_id: null,
        status: 'published',
        created_by: user.id
      });

      console.log('Evento criado:', newEvent);
      
      // Fechar modal e chamar onContinue com os dados
      const eventData = {
        name: eventName.trim(),
        date: eventDate,
        time: eventTime,
        reminderDays
      };
      
      onContinue(eventData);
      onClose();
      
      Alert.alert('Sucesso', 'Evento criado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      Alert.alert('Erro', 'Não foi possível salvar o evento');
    } finally {
      setIsSaving(false);
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
            onPress={handleSaveEvent} 
            disabled={!eventName.trim() || isSaving}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[
              styles.saveButton, 
              { color: isDarkMode ? '#0A84FF' : '#007AFF' },
              (!eventName.trim() || isSaving) && styles.disabledButton
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
            {showDatePicker && Platform.OS !== 'web' && (
              <DateTimePicker
                value={eventDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
            {showTimePicker && Platform.OS !== 'web' && (
              <DateTimePicker
                value={eventTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            )}
          </View>
          
          {/* Modal para DatePicker na Web */}
          <Modal
            isVisible={showDatePicker && Platform.OS === 'web'}
            onBackdropPress={handleDateCancel}
            backdropOpacity={0.5}
            style={styles.pickerModal}
          >
            <View style={[styles.pickerModalContent, { backgroundColor: isDarkMode ? '#333333' : '#FFFFFF' }]}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={handleDateCancel}>
                  <Text style={[styles.pickerHeaderButton, { color: colors.primary }]}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={[styles.pickerHeaderTitle, { color: colors.text }]}>Selecionar Data</Text>
                <TouchableOpacity onPress={() => handleDateConfirm(eventDate)}>
                  <Text style={[styles.pickerHeaderButton, { color: colors.primary }]}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.webPickerContainer}>
                <DateTimePicker
                  value={eventDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  style={styles.webPicker}
                />
              </View>
            </View>
          </Modal>
          
          {/* Modal para TimePicker na Web */}
          <Modal
            isVisible={showTimePicker && Platform.OS === 'web'}
            onBackdropPress={handleTimeCancel}
            backdropOpacity={0.5}
            style={styles.pickerModal}
          >
            <View style={[styles.pickerModalContent, { backgroundColor: isDarkMode ? '#333333' : '#FFFFFF' }]}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={handleTimeCancel}>
                  <Text style={[styles.pickerHeaderButton, { color: colors.primary }]}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={[styles.pickerHeaderTitle, { color: colors.text }]}>Selecionar Horário</Text>
                <TouchableOpacity onPress={() => handleTimeConfirm(eventTime)}>
                  <Text style={[styles.pickerHeaderButton, { color: colors.primary }]}>Confirmar</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.webPickerContainer}>
                <DateTimePicker
                  value={eventTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  style={styles.webPicker}
                />
              </View>
            </View>
          </Modal>
          
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
  webPickerContainer: {
    padding: 20,
    alignItems: 'center',
  },
  webPicker: {
    width: 300,
    height: 200,
  },
});

export default EventFormModal;
