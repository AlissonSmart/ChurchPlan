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
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import theme from '../styles/theme';

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
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  
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
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <SafeAreaView style={styles.safeArea}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.text }]}>Criar Novo Evento</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <FontAwesome name="times" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Escolha um template para começar rapidamente ou crie do zero:
            </Text>
            
            <ScrollView style={styles.scrollView}>
              {/* Opção Criar do Zero */}
              <TouchableOpacity 
                onPress={onCreateFromScratch}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#5fccb3', '#58adf7']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={[styles.templateCard, { borderWidth: 0 }]}
                >
                  <View style={[styles.templateIconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                    <FontAwesome name="plus" size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.templateContent}>
                    <Text style={[styles.templateTitle, { color: '#FFFFFF' }]}>Criar do Zero</Text>
                    <Text style={[styles.templateDescription, { color: '#FFFFFF', opacity: 0.9 }]}>
                      Evento personalizado sem template
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Título Templates */}
              <Text style={[styles.templatesTitle, { color: colors.text }]}>Templates</Text>
              
              {/* Templates */}
              {templates.map((template) => (
                <TouchableOpacity 
                  key={template.id}
                  style={[styles.templateCard, { backgroundColor: colors.card, borderColor: colors.border }]} 
                  onPress={() => onUseTemplate(template.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.templateIconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <FontAwesome name={template.icon} size={20} color={colors.primary} />
                  </View>
                  <View style={styles.templateContent}>
                    <Text style={[styles.templateTitle, { color: colors.text }]}>{template.title}</Text>
                    <Text style={[styles.templateDescription, { color: colors.textSecondary }]}>
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
    borderRadius: 20,
    overflow: 'hidden',
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
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  createButtonWrapper: {
    marginBottom: 20,
  },
  createFromScratchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  createIconContainer: {
    marginRight: 8,
  },
  createTextContainer: {
  },
  createButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createButtonSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  templatesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 4,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
  },
  templateIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateContent: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  templateDescription: {
    fontSize: 14,
  },
});

export default AddEventModal;
