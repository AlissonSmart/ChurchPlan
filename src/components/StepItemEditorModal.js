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
  ScrollView
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import theme from '../styles/theme';

/**
 * Modal para adicionar ou editar um item de etapa
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.visible - Se o modal está visível
 * @param {Function} props.onClose - Função chamada ao fechar o modal
 * @param {Function} props.onSave - Função chamada ao salvar o item
 * @param {Object} props.item - Item a ser editado (opcional)
 * @param {string} props.stepId - ID da etapa à qual o item pertence
 * @returns {React.ReactNode}
 */
const StepItemEditorModal = ({ visible, onClose, onSave, item, stepId }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [duration, setDuration] = useState('');
  const [time, setTime] = useState('');
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState('');
  
  const titleInputRef = useRef(null);

  // Função para extrair apenas HH:MM de um horário
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    // Se tiver formato HH:MM:SS, extrai apenas HH:MM
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  };

  // Função para validar e formatar horário (HH:MM)
  const handleTimeChange = (text) => {
    // Remove caracteres não numéricos
    const cleaned = text.replace(/[^\d]/g, '');
    
    // Limita a 4 dígitos (HHMM)
    if (cleaned.length > 4) {
      return;
    }
    
    // Formata como HH:MM
    let formatted = cleaned;
    if (cleaned.length >= 3) {
      formatted = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4);
    }
    
    setTime(formatted);
  };

  // Função para validar duração (apenas números)
  const handleDurationChange = (text) => {
    // Remove caracteres não numéricos
    const cleaned = text.replace(/[^\d]/g, '');
    setDuration(cleaned);
  };

  // Função para adicionar um participante
  const handleAddParticipant = () => {
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant('');
    }
  };
  
  // Função para remover um participante
  const handleRemoveParticipant = (index) => {
    const newParticipants = [...participants];
    newParticipants.splice(index, 1);
    setParticipants(newParticipants);
  };
  
  // Atualizar os campos quando o item mudar
  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setSubtitle(item.subtitle || '');
      setDuration(item.duration || '');
      setTime(formatTimeDisplay(item.time) || '');
      setParticipants(item.participants || []);
    } else {
      setTitle('');
      setSubtitle('');
      setDuration('');
      setTime('');
      setParticipants([]);
    }
  }, [item]);
  
  // Focar no input de título quando o modal abrir
  useEffect(() => {
    if (visible && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current.focus();
      }, 300);
    }
  }, [visible]);
  
  // Função para lidar com o salvamento
  const handleSave = () => {
    if (!title.trim()) {
      // Mostrar erro ou alerta
      return;
    }
    
    const itemData = {
      id: item ? item.id : `${stepId}-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim(),
      duration: duration.trim(),
      time: time.trim(),
      participants
    };
    
    onSave(stepId, itemData);
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <View style={styles.handle} />
          <View style={[styles.header, { 
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.05)',
            borderRadius: 12,
            marginHorizontal: 16,
            marginTop: 8,
          }]}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.buttonText, { color: colors.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              {item ? 'Editar Item' : 'Novo Item'}
            </Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={[styles.saveButtonText, { color: colors.primary }]}>Salvar</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Título</Text>
                <TextInput
                  ref={titleInputRef}
                  style={[styles.input, { 
                    color: colors.text, 
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border
                  }]}
                  placeholder="Ex: Vídeo de Abertura, Música, etc."
                  placeholderTextColor={colors.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Subtítulo (opcional)</Text>
                <TextInput
                  style={[styles.input, { 
                    color: colors.text, 
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border
                  }]}
                  placeholder="Ex: Nome do ministério, autor, etc."
                  placeholderTextColor={colors.textSecondary}
                  value={subtitle}
                  onChangeText={setSubtitle}
                  maxLength={100}
                />
              </View>
              
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Horário</Text>
                  <TextInput
                    style={[styles.input, { 
                      color: colors.text, 
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border
                    }]}
                    placeholder="Ex: 19:05"
                    placeholderTextColor={colors.textSecondary}
                    value={time}
                    onChangeText={handleTimeChange}
                    maxLength={5}
                    keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Duração (min)</Text>
                  <TextInput
                    style={[styles.input, { 
                      color: colors.text, 
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border
                    }]}
                    placeholder="Ex: 5"
                    placeholderTextColor={colors.textSecondary}
                    value={duration}
                    onChangeText={handleDurationChange}
                    maxLength={3}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Participantes</Text>
                <View style={styles.participantsInputContainer}>
                  <TextInput
                    style={[styles.participantInput, { 
                      color: colors.text, 
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.border
                    }]}
                    placeholder="Adicionar participante"
                    placeholderTextColor={colors.textSecondary}
                    value={newParticipant}
                    onChangeText={setNewParticipant}
                    maxLength={50}
                    onSubmitEditing={handleAddParticipant}
                    returnKeyType="done"
                  />
                  <TouchableOpacity 
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={handleAddParticipant}
                  >
                    <FontAwesome name="plus" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.participantsList}>
                  {participants.map((participant, index) => (
                    <View key={index} style={[styles.participantTag, { backgroundColor: colors.border }]}>
                      <Text style={[styles.participantName, { color: colors.text }]}>
                        {participant}
                      </Text>
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => handleRemoveParticipant(index)}
                      >
                        <FontAwesome name="times" size={12} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  saveButton: {
    padding: 4,
  },
  buttonText: {
    fontSize: 17,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollView: {
    maxHeight: '80%',
  },
  form: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  inputGroup: {
    marginBottom: 16,
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
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  participantsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  participantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  participantName: {
    fontSize: 14,
    marginRight: 4,
  },
  removeButton: {
    padding: 2,
  },
});

export default StepItemEditorModal;
