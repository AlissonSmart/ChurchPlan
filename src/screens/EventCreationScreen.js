import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  useColorScheme,
  FlatList,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ActionButton from 'react-native-action-button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import theme from '../styles/theme';
import StepEditorModal from '../components/StepEditorModal';
import StepItemEditorModal from '../components/StepItemEditorModal';

/**
 * Tela de Criação/Edição de Evento
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.navigation - Objeto de navegação
 * @param {Object} props.route - Objeto de rota com parâmetros
 * @returns {React.ReactNode}
 */
const EventCreationScreen = ({ navigation, route }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  const insets = useSafeAreaInsets();
  
  // Parâmetros da rota
  const { templateId, eventData } = route.params || {};
  
  // Estados
  const [eventTitle, setEventTitle] = useState('');
  const [activeTab, setActiveTab] = useState('steps');
  const [isStepEditorVisible, setIsStepEditorVisible] = useState(false);
  const [isStepItemEditorVisible, setIsStepItemEditorVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [currentStepItem, setCurrentStepItem] = useState(null);
  const [currentStepId, setCurrentStepId] = useState(null);
  const [steps, setSteps] = useState([
    {
      id: '1',
      title: 'Início',
      time: '19:00',
      items: [
        {
          id: '1-1',
          title: 'Video Teaser',
          duration: '3min',
          participants: ['João']
        }
      ]
    },
    {
      id: '2',
      title: 'Louvor',
      time: '19:03',
      items: [
        {
          id: '2-1',
          title: 'Se Aperfeiçoa Em Mim',
          subtitle: 'Ministério Zoe',
          duration: '5min',
          participants: ['João', 'Maria']
        },
        {
          id: '2-2',
          title: 'TUDO É PERDA',
          subtitle: 'Morada',
          duration: '5min',
          participants: ['João']
        },
        {
          id: '2-3',
          title: 'LINDO MOMENTO',
          subtitle: 'Ministério Zoe',
          duration: '5min',
          participants: ['Maria']
        },
        {
          id: '2-4',
          title: 'Vitorioso És / Victory is Yours',
          subtitle: 'Elevation Worship',
          duration: '7min',
          participants: ['João', 'Maria']
        }
      ]
    }
  ]);
  
  // Efeito para carregar dados do formulário/template
  useEffect(() => {
    // Se temos dados do formulário, usar esses dados
    if (eventData) {
      setEventTitle(eventData.name || '');
    }
    // Senão, se temos um template, usar dados do template
    else if (templateId) {
      // Aqui você carregaria os dados do template selecionado
      // Por enquanto, apenas definimos um título padrão baseado no templateId
      const templateTitles = {
        'culto-dominical': 'Culto Dominical',
        'culto-quarta': 'Culto de Quarta',
        'evento-especial': 'Evento Especial',
        'ensaio': 'Ensaio'
      };
      
      setEventTitle(templateTitles[templateId] || 'Novo Evento');
    }
  }, [templateId, eventData]);
  
  // Função para voltar para a tela anterior
  const handleGoBack = () => {
    // Se o evento tiver sido modificado, perguntar se deseja descartar as alterações
    if (eventTitle.trim() || steps.length > 0) {
      Alert.alert(
        'Descartar alterações?',
        'Se você sair agora, todas as alterações serão perdidas.',
        [
          { text: 'Continuar editando', style: 'cancel' },
          { 
            text: 'Descartar', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };
  
  // Função para abrir o modal de adição de etapa
  const handleAddStep = () => {
    setCurrentStep(null);
    setIsStepEditorVisible(true);
  };
  
  // Função para editar uma etapa
  const handleEditStep = (step) => {
    setCurrentStep(step);
    setIsStepEditorVisible(true);
  };
  
  // Função para salvar uma etapa
  const handleSaveStep = (stepData) => {
    if (currentStep) {
      // Editar etapa existente
      const updatedSteps = steps.map(step => 
        step.id === stepData.id ? stepData : step
      );
      setSteps(updatedSteps);
    } else {
      // Adicionar nova etapa
      setSteps([...steps, stepData]);
    }
  };
  
  // Função para excluir uma etapa
  const handleDeleteStep = (stepId) => {
    Alert.alert(
      'Excluir Etapa',
      'Tem certeza que deseja excluir esta etapa? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            const updatedSteps = steps.filter(step => step.id !== stepId);
            setSteps(updatedSteps);
          }
        }
      ]
    );
  };
  
  // Função para abrir o modal de adição de item
  const handleAddItemToStep = (stepId) => {
    setCurrentStepId(stepId);
    setCurrentStepItem(null);
    setIsStepItemEditorVisible(true);
  };
  
  // Função para editar um item
  const handleEditStepItem = (stepId, item) => {
    setCurrentStepId(stepId);
    setCurrentStepItem(item);
    setIsStepItemEditorVisible(true);
  };
  
  // Função para salvar um item
  const handleSaveStepItem = (stepId, itemData) => {
    const updatedSteps = steps.map(step => {
      if (step.id === stepId) {
        const existingItemIndex = step.items.findIndex(item => item.id === itemData.id);
        
        if (existingItemIndex >= 0) {
          // Atualizar item existente
          const updatedItems = [...step.items];
          updatedItems[existingItemIndex] = itemData;
          return { ...step, items: updatedItems };
        } else {
          // Adicionar novo item
          return { ...step, items: [...step.items, itemData] };
        }
      }
      return step;
    });
    
    setSteps(updatedSteps);
  };
  
  // Função para excluir um item
  const handleDeleteStepItem = (stepId, itemId) => {
    Alert.alert(
      'Excluir Item',
      'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            const updatedSteps = steps.map(step => {
              if (step.id === stepId) {
                return {
                  ...step,
                  items: step.items.filter(item => item.id !== itemId)
                };
              }
              return step;
            });
            setSteps(updatedSteps);
          }
        }
      ]
    );
  };
  
  // Função para renderizar um participante
  const renderParticipant = (name) => {
    return (
      <View key={name} style={styles.participantTag}>
        <Text style={styles.participantName}>{name}</Text>
      </View>
    );
  };
  
  // Função para renderizar um item de etapa
  const renderStepItem = ({ item, stepId, index }) => {
    // Determinar a cor do indicador com base no índice
    const indicatorColors = ['#FF9500', '#BB86FC', '#CF6679'];
    const indicatorColor = indicatorColors[index % indicatorColors.length];
    
    return (
      <TouchableOpacity 
        style={styles.stepItemContainer}
        onPress={() => handleEditStepItem(stepId, item)}
        activeOpacity={0.7}
      >
        <View style={styles.timeColumn}>
          <Text style={[styles.timeText, { color: colors.primary }]}>{item.time || ''}</Text>
        </View>
        <View style={styles.dotColumn}>
          <View style={styles.dot} />
        </View>
        <View style={styles.contentColumn}>
          <View style={styles.stepItemContent}>
            <View style={styles.stepItemHeader}>
              <Text style={[styles.stepItemTitle, { color: colors.text }]}>{item.title}</Text>
              {item.subtitle && (
                <Text style={[styles.stepItemSubtitle, { color: colors.textSecondary }]}>
                  - {item.subtitle}
                </Text>
              )}
              {item.duration && (
                <Text style={[styles.stepItemDuration, { color: colors.textSecondary }]}>
                  {item.duration}
                </Text>
              )}
            </View>
            {item.participants && item.participants.length > 0 && (
              <View style={styles.participantsContainer}>
                {item.participants.map(name => renderParticipant(name))}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Função para renderizar uma etapa
  const renderStep = (step, index) => {
    return (
      <View key={step.id} style={styles.stepContainer}>
        <View style={styles.stepHeader}>
          <TouchableOpacity 
            style={styles.stepTitleContainer}
            onPress={() => handleEditStep(step)}
            activeOpacity={0.7}
          >
            <View style={[styles.stepIndicator, { backgroundColor: '#4CD964' }]} />
            <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
          </TouchableOpacity>
          <View style={styles.stepActions}>
            <Text style={[styles.stepTime, { color: colors.primary }]}>{step.time}</Text>
            <TouchableOpacity 
              style={styles.deleteStepButton}
              onPress={() => handleDeleteStep(step.id)}
            >
              <FontAwesome name="trash-o" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
        
        {step.items.map((item, itemIndex) => (
          <View key={item.id} style={styles.stepItemWrapper}>
            {renderStepItem({ item, stepId: step.id, index: itemIndex })}
          </View>
        ))}
        
        <TouchableOpacity 
          style={styles.addItemButton}
          onPress={() => handleAddItemToStep(step.id)}
        >
          <FontAwesome name="plus" size={14} color={colors.primary} />
          <Text style={[styles.addItemText, { color: colors.primary }]}>
            Adicionar item
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header, 
        { backgroundColor: colors.card, paddingTop: insets.top }
      ]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <FontAwesome name="arrow-left" size={20} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>
            Voltar para eventos
          </Text>
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <FontAwesome name="download" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <FontAwesome name="trash" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Event Image/Banner */}
        <View style={[styles.bannerContainer, { backgroundColor: '#5E5CEC' }]}>
          <TouchableOpacity style={styles.addImageButton}>
            <FontAwesome name="camera" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Event Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.titleDisplay, { color: colors.text }]}>
            {eventTitle || "Novo Evento"}
          </Text>
        </View>
        
        {/* Tabs */}
        <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'steps' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('steps')}
          >
            <FontAwesome 
              name="list" 
              size={18} 
              color={activeTab === 'steps' ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'steps' ? colors.primary : colors.textSecondary }
              ]}
            >
              Etapas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'team' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('team')}
          >
            <FontAwesome 
              name="users" 
              size={18} 
              color={activeTab === 'team' ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'team' ? colors.primary : colors.textSecondary }
              ]}
            >
              Equipe
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'songs' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('songs')}
          >
            <FontAwesome 
              name="music" 
              size={18} 
              color={activeTab === 'songs' ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'songs' ? colors.primary : colors.textSecondary }
              ]}
            >
              Músicas
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'schedule' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('schedule')}
          >
            <FontAwesome 
              name="clock-o" 
              size={18} 
              color={activeTab === 'schedule' ? colors.primary : colors.textSecondary} 
            />
            <Text 
              style={[
                styles.tabText, 
                { color: activeTab === 'schedule' ? colors.primary : colors.textSecondary }
              ]}
            >
              Horários
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'steps' && (
            <View style={styles.stepsContainer}>
              {steps.map((step, index) => renderStep(step, index))}
              
              <TouchableOpacity 
                style={styles.addStepButton}
                onPress={handleAddStep}
              >
                <FontAwesome name="plus-circle" size={20} color={colors.primary} />
                <Text style={[styles.addStepText, { color: colors.primary }]}>
                  Adicionar etapa
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {activeTab === 'team' && (
            <View style={styles.teamContainer}>
              <Text style={{ color: colors.text }}>Conteúdo da aba Equipe</Text>
            </View>
          )}
          
          {activeTab === 'songs' && (
            <View style={styles.songsContainer}>
              <Text style={{ color: colors.text }}>Conteúdo da aba Músicas</Text>
            </View>
          )}
          
          {activeTab === 'schedule' && (
            <View style={styles.scheduleContainer}>
              <Text style={{ color: colors.text }}>Conteúdo da aba Horários</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <ActionButton
        buttonColor="transparent"
        renderButtonContent={() => (
          <LinearGradient 
            colors={['#5fccb3', '#58adf7']} 
            start={{x: 0, y: 0}} 
            end={{x: 1, y: 0}} 
            style={styles.fabGradient}
          >
            <FontAwesome name="plus" size={24} color="#FFFFFF" />
          </LinearGradient>
        )}
        position="right"
        spacing={15}
        offsetX={10}
        offsetY={10}
        buttonSize={56}
        hideShadow={true}
        useNativeFeedback={false}
      >
        <ActionButton.Item 
          buttonColor="transparent"
          title="Cabeçalho" 
          textStyle={styles.actionButtonItemText}
          textContainerStyle={styles.actionButtonItemTextContainer}
          onPress={() => {
            // Lógica para adicionar cabeçalho aqui
            Alert.alert('Adicionar Cabeçalho', 'Função a ser implementada');
          }}
          renderBtnContent={() => (
            <LinearGradient 
              colors={['#5fccb3', '#58adf7']} 
              start={{x: 0, y: 0}} 
              end={{x: 1, y: 0}} 
              style={styles.actionButtonItemGradient}
            >
              <FontAwesome name="header" size={20} color="#FFFFFF" />
            </LinearGradient>
          )}
        />
        
        <ActionButton.Item 
          buttonColor="transparent"
          title="Etapa" 
          textStyle={styles.actionButtonItemText}
          textContainerStyle={styles.actionButtonItemTextContainer}
          onPress={() => handleAddStep()}
          renderBtnContent={() => (
            <LinearGradient 
              colors={['#5fccb3', '#58adf7']} 
              start={{x: 0, y: 0}} 
              end={{x: 1, y: 0}} 
              style={styles.actionButtonItemGradient}
            >
              <FontAwesome name="list" size={20} color="#FFFFFF" />
            </LinearGradient>
          )}
        />
        
        <ActionButton.Item 
          buttonColor="transparent"
          title="Música" 
          textStyle={styles.actionButtonItemText}
          textContainerStyle={styles.actionButtonItemTextContainer}
          onPress={() => {
            // Lógica para adicionar música aqui
            Alert.alert('Adicionar Música', 'Função a ser implementada');
          }}
          renderBtnContent={() => (
            <LinearGradient 
              colors={['#5fccb3', '#58adf7']} 
              start={{x: 0, y: 0}} 
              end={{x: 1, y: 0}} 
              style={styles.actionButtonItemGradient}
            >
              <FontAwesome name="music" size={20} color="#FFFFFF" />
            </LinearGradient>
          )}
        />
      </ActionButton>
      
      {/* Step Editor Modal */}
      <StepEditorModal 
        visible={isStepEditorVisible}
        onClose={() => setIsStepEditorVisible(false)}
        onSave={handleSaveStep}
        step={currentStep}
      />
      
      {/* Step Item Editor Modal */}
      <StepItemEditorModal 
        visible={isStepItemEditorVisible}
        onClose={() => setIsStepItemEditorVisible(false)}
        onSave={handleSaveStepItem}
        item={currentStepItem}
        stepId={currentStepId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 20,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  bannerContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  titleDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#5E5CEC',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepsContainer: {
    flex: 1,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  songsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  scheduleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stepActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteStepButton: {
    padding: 8,
    marginLeft: 8,
  },
  stepTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 8,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  stepTime: {
    fontSize: 16,
    fontWeight: '500',
  },
  stepItemWrapper: {
    marginBottom: 4,
  },
  stepItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  timeColumn: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dotColumn: {
    width: 20,
    alignItems: 'center',
    paddingTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCCCCC',
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 8,
  },
  stepItemContent: {
    paddingVertical: 4,
  },
  stepItemHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  stepItemSubtitle: {
    fontSize: 14,
    marginRight: 4,
  },
  stepItemDuration: {
    fontSize: 14,
    marginLeft: 'auto',
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  participantTag: {
    backgroundColor: '#E4E6EB',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 6,
  },
  participantName: {
    fontSize: 12,
    color: '#1C1C1E',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 88,
  },
  addItemText: {
    marginLeft: 6,
    fontSize: 14,
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  addStepText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonItemGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonItemText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButtonItemTextContainer: {
    backgroundColor: '#58adf7',
    borderRadius: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});

export default EventCreationScreen;
