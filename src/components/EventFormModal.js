import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import theme from '../styles/theme';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';

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
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  
  // Referência para o input de nome
  const nameInputRef = useRef(null);
  
  // Opções para o lembrete
  const reminderOptions = [
    { label: 'Lembrar 1 dia antes', value: '1' },
    { label: 'Lembrar 2 dias antes', value: '2' },
    { label: 'Lembrar 3 dias antes', value: '3' },
    { label: 'Lembrar 5 dias antes', value: '5' },
    { label: 'Lembrar 7 dias antes', value: '7' },
  ];
  
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
  const showDatePicker = () => {
    Keyboard.dismiss();
    setDatePickerVisible(true);
  };
  
  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };
  
  const handleConfirmDate = (date) => {
    setEventDate(date);
    hideDatePicker();
  };
  
  // Funções para lidar com o picker de hora
  const showTimePicker = () => {
    Keyboard.dismiss();
    setTimePickerVisible(true);
  };
  
  const hideTimePicker = () => {
    setTimePickerVisible(false);
  };
  
  const handleConfirmTime = (time) => {
    setEventTime(time);
    hideTimePicker();
  };
  
  // Função para continuar para a próxima etapa
  const handleContinue = () => {
    // Validar se o nome do evento foi preenchido
    if (!eventName.trim()) {
      // Mostrar erro ou alerta
      return;
    }
    
    // Dados do evento
    const eventData = {
      name: eventName.trim(),
      date: eventDate,
      time: eventTime,
      reminderDays
    };
    
    onContinue(eventData);
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingContainer}
            >
              <View style={[styles.content, { backgroundColor: colors.card }]}>
                <View style={styles.handle} />
                
                <View style={styles.header}>
                  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={[styles.buttonText, { color: colors.textSecondary }]}>Cancelar</Text>
                  </TouchableOpacity>
                  <Text style={[styles.title, { color: colors.text }]}>
                    Novo Evento
                  </Text>
                  <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                    <Text style={[styles.continueButtonText, { color: colors.primary }]}>Continuar</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.scrollView}>
                  <View style={styles.form}>
                    {/* Nome do Evento */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: colors.text }]}>Nome do Evento</Text>
                      <TextInput
                        ref={nameInputRef}
                        style={[styles.input, { 
                          color: colors.text, 
                          backgroundColor: colors.inputBackground,
                          borderColor: colors.border
                        }]}
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
                        style={[styles.datePickerButton, { 
                          backgroundColor: colors.inputBackground,
                          borderColor: colors.border
                        }]}
                        onPress={showDatePicker}
                      >
                        <Text style={[styles.datePickerText, { color: colors.text }]}>
                          {formatDate(eventDate)}
                        </Text>
                        <FontAwesome name="calendar" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                    
                    {/* Horário de Início */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: colors.text }]}>Horário de Início</Text>
                      <TouchableOpacity 
                        style={[styles.datePickerButton, { 
                          backgroundColor: colors.inputBackground,
                          borderColor: colors.border
                        }]}
                        onPress={showTimePicker}
                      >
                        <Text style={[styles.datePickerText, { color: colors.text }]}>
                          {formatTime(eventTime)}
                        </Text>
                        <FontAwesome name="clock-o" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                    
                    {/* Lembrar Equipe */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: colors.text }]}>Lembrar Equipe</Text>
                      <View style={[styles.pickerContainer, { 
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.border
                      }]}>
                        <Picker
                          selectedValue={reminderDays}
                          onValueChange={(itemValue) => setReminderDays(itemValue)}
                          style={[styles.picker, { color: colors.text }]}
                          dropdownIconColor={colors.primary}
                        >
                          {reminderOptions.map((option) => (
                            <Picker.Item 
                              key={option.value} 
                              label={option.label} 
                              value={option.value} 
                              color={isDarkMode ? '#FFFFFF' : '#000000'}
                            />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </View>
                </ScrollView>
                
                {/* Date Picker Modal */}
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  onConfirm={handleConfirmDate}
                  onCancel={hideDatePicker}
                  date={eventDate}
                  locale="pt-BR"
                  confirmTextIOS="Confirmar"
                  cancelTextIOS="Cancelar"
                  headerTextIOS="Selecione a Data"
                />
                
                {/* Time Picker Modal */}
                <DateTimePickerModal
                  isVisible={isTimePickerVisible}
                  mode="time"
                  onConfirm={handleConfirmTime}
                  onCancel={hideTimePicker}
                  date={eventTime}
                  locale="pt-BR"
                  confirmTextIOS="Confirmar"
                  cancelTextIOS="Cancelar"
                  headerTextIOS="Selecione o Horário"
                />
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingContainer: {
    width: '100%',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: '90%',
  },
  handle: {
    width: 36,
    height: 5,
    backgroundColor: '#E4E6EB',
    borderRadius: 3,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  continueButton: {
    padding: 4,
  },
  buttonText: {
    fontSize: 17,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollView: {
    maxHeight: '80%',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  datePickerButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerText: {
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
  },
  picker: {
    height: 48,
  },
});

export default EventFormModal;
