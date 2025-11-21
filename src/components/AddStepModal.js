import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Platform
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import ModalPadrao from './ModalPadrao';
import theme from '../styles/theme';

/**
 * Modal para adicionar etapa ao cronograma
 */
const AddStepModal = ({ visible, onClose, onSave }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const [time, setTime] = useState(new Date());
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Por favor, preencha o nome da etapa');
      return;
    }

    const stepData = {
      time: time.toTimeString().substring(0, 5), // HH:MM
      name: name.trim(),
      duration: duration ? parseInt(duration) : null,
      description: description.trim(),
      isHeader: false
    };

    onSave(stepData);
    handleClose();
  };

  const handleClose = () => {
    setTime(new Date());
    setName('');
    setDuration('');
    setDescription('');
    onClose();
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  return (
    <ModalPadrao
      isVisible={visible}
      onClose={handleClose}
      title="Adicionar Etapa"
      height="auto"
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Horário */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            Horário <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.timeInput, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
            onPress={() => setShowTimePicker(true)}
          >
            <FontAwesome name="clock-o" size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <Text style={[styles.timeText, { color: colors.text }]}>
              {time.toTimeString().substring(0, 5)}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Nome da Etapa */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            Nome da Etapa <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
            placeholder="Ex: Oração, Oferta, Pregação..."
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Duração */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Duração (minutos)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
            placeholder="5, 10, 15..."
            placeholderTextColor={colors.textSecondary}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
        </View>

        {/* Descrição */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Descrição da Etapa</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
            placeholder="Detalhes sobre esta etapa do culto..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Botão Adicionar */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Adicionar ao Cronograma</Text>
        </TouchableOpacity>
      </ScrollView>
    </ModalPadrao>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#E24C4C',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  timeText: {
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  saveButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddStepModal;
