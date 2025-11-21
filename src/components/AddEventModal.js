import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TouchableWithoutFeedback,
  useColorScheme
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

/**
 * Modal para adicionar um novo evento com opções de template
 * @param {Object} props - Propriedades do componente
 * @param {boolean} props.visible - Se o modal está visível
 * @param {Function} props.onClose - Função chamada ao fechar o modal
 * @param {Function} props.onCreateFromScratch - Função chamada ao criar do zero
 * @param {Function} props.onUseTemplate - Função chamada ao usar um template
 * @param {Array} props.templates - Lista de templates disponíveis
 * @returns {React.ReactNode}
 */
const AddEventModal = ({
  visible,
  onClose,
  onCreateFromScratch,
  onUseTemplate
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  
  // Templates predefinidos
  const templates = [
    {
      id: 'culto-dominical',
      title: 'Culto Dominical',
      description: 'Culto principal de domingo com banda completa',
      icon: 'building'
    },
    {
      id: 'culto-quarta',
      title: 'Culto de Quarta',
      description: 'Culto de meio de semana mais intimista',
      icon: 'users'
    },
    {
      id: 'evento-especial',
      title: 'Evento Especial',
      description: 'Batismos, casamentos, conferências',
      icon: 'star'
    },
    {
      id: 'ensaio',
      title: 'Ensaio',
      description: 'Ensaio da banda e equipe técnica',
      icon: 'music'
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.title}>Criar Novo Evento</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <FontAwesome name="times" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.subtitle}>
              Escolha um template para começar rapidamente ou crie do zero:
            </Text>
            
            <ScrollView style={styles.scrollView}>
              {/* Opção Criar do Zero */}
              <TouchableOpacity 
                style={styles.optionCard} 
                onPress={onCreateFromScratch}
              >
                <View style={styles.iconContainer}>
                  <FontAwesome name="plus" size={20} color="#1877F2" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Criar do Zero</Text>
                  <Text style={styles.optionDescription}>
                    Evento personalizado sem template
                  </Text>
                </View>
              </TouchableOpacity>
              
              {/* Templates */}
              {templates.map((template) => (
                <TouchableOpacity 
                  key={template.id}
                  style={styles.optionCard} 
                  onPress={() => onUseTemplate(template.id)}
                >
                  <View style={styles.iconContainer}>
                    <FontAwesome name={template.icon} size={20} color="#1877F2" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>{template.title}</Text>
                    <Text style={styles.optionDescription}>
                      {template.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Botão de fechar removido pois já temos os cards clicáveis */}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#8E8E93',
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9EFF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000000',
  },
  optionDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  useTemplateButton: {
    backgroundColor: '#E9EFF7',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  useTemplateButtonText: {
    color: '#1877F2',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default AddEventModal;
