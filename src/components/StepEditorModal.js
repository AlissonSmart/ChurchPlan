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
  useColorScheme
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import theme from '../styles/theme';

/**
 * Modal para adicionar ou editar uma etapa
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.visible - Se o modal está visível
 * @param {Function} props.onClose - Função chamada ao fechar o modal
 * @param {Function} props.onSave - Função chamada ao salvar a etapa
 * @param {Object} props.step - Etapa a ser editada (opcional)
 * @returns {React.ReactNode}
 */
const StepEditorModal = ({ visible, onClose, onSave, step }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  
  const titleInputRef = useRef(null);
  
  // Atualizar os campos quando o step mudar
  useEffect(() => {
    if (step) {
      setTitle(step.title || '');
      setTime(step.time || '');
    } else {
      setTitle('');
      setTime('');
    }
  }, [step]);
  
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
    
    const stepData = {
      id: step ? step.id : Date.now().toString(),
      title: title.trim(),
      time: time.trim(),
      items: step ? step.items || [] : []
    };
    
    onSave(stepData);
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
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.buttonText, { color: colors.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              {step ? 'Editar Etapa' : 'Nova Etapa'}
            </Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={[styles.saveButtonText, { color: colors.primary }]}>Salvar</Text>
            </TouchableOpacity>
          </View>
          
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
                placeholder="Ex: Louvor, Pregação, Oferta..."
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                maxLength={50}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Horário</Text>
              <TextInput
                style={[styles.input, { 
                  color: colors.text, 
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border
                }]}
                placeholder="Ex: 19:00"
                placeholderTextColor={colors.textSecondary}
                value={time}
                onChangeText={setTime}
                maxLength={5}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
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
  form: {
    padding: 16,
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
});

export default StepEditorModal;
