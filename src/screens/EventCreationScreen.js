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
  Alert,
  Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
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
  const [isAddSongModalVisible, setIsAddSongModalVisible] = useState(false);
  const [isAddScheduleModalVisible, setIsAddScheduleModalVisible] = useState(false);
  const [isAddTeamMemberModalVisible, setIsAddTeamMemberModalVisible] = useState(false);
  const [isAddHeaderModalVisible, setIsAddHeaderModalVisible] = useState(false);
  const [activeHeaderTab, setActiveHeaderTab] = useState('details');
  const [isFabOpen, setIsFabOpen] = useState(false);
  // Estados para a aba Equipe
  const [teamMembers, setTeamMembers] = useState([
    {
      id: '1',
      name: 'João Silva',
      role: 'Vocal',
      status: 'confirmed'
    },
    {
      id: '2',
      name: 'Maria Santos',
      role: 'Teclado',
      status: 'confirmed'
    },
    {
      id: '3',
      name: 'Pedro Costa',
      role: 'Guitarra',
      status: 'pending'
    },
    {
      id: '4',
      name: 'Ana Lima',
      role: 'Bateria',
      status: 'not_sent'
    },
    {
      id: '5',
      name: 'Carlos Mendes',
      role: 'Vocal',
      status: 'not_sent',
      highlighted: true
    }
  ]);
  
  const [technicalTeam, setTechnicalTeam] = useState([
    {
      id: '6',
      name: 'Roberto Silva',
      role: 'Som',
      status: 'confirmed'
    },
    {
      id: '7',
      name: 'Fernanda Costa',
      role: 'Video',
      status: 'confirmed'
    },
    {
      id: '8',
      name: 'Paulo Santos',
      role: 'Iluminação',
      status: 'not_sent',
      highlighted: true
    }
  ]);
  
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
  
  // Função para abrir o modal de adição de cabeçalho
  const handleAddHeader = () => {
    setIsAddHeaderModalVisible(true);
    setActiveHeaderTab('details');
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
      
      <ScrollView style={styles.container}>
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
              {/* Campo de busca */}
              <View style={styles.searchContainer}>
                <View style={[styles.searchInputContainer, { backgroundColor: colors.inputBackground }]}>
                  <FontAwesome name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Buscar por equipe ou nome..."
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <TouchableOpacity style={[styles.sendButton, { backgroundColor: '#00C853' }]}>
                  <Text style={styles.sendButtonText}>Enviar</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.teamContent}>
                {/* Ministério de Louvor */}
                <View style={[styles.teamSection, { backgroundColor: colors.card }]}>
                  <Text style={[styles.teamSectionTitle, { color: colors.text }]}>Ministério de Louvor</Text>
                  
                  <View style={[styles.memberContainer, { borderBottomColor: colors.border }]}>
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: colors.text }]}>João</Text>
                      <Text style={[styles.memberName, { color: colors.text }]}>Silva</Text>
                      <Text style={[styles.memberRole, { color: colors.textSecondary }]}>Vocal</Text>
                    </View>
                    
                    <View style={styles.confirmBadge}>
                      <Text style={styles.badgeText}>Confirmado</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.memberContainer, { borderBottomColor: colors.border }]}>
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: colors.text }]}>Maria</Text>
                      <Text style={[styles.memberName, { color: colors.text }]}>Santos</Text>
                      <Text style={[styles.memberRole, { color: colors.textSecondary }]}>Teclado</Text>
                    </View>
                    
                    <View style={styles.confirmBadge}>
                      <Text style={styles.badgeText}>Confirmado</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.memberContainer, { borderBottomColor: colors.border }]}>
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: colors.text }]}>Pedro</Text>
                      <Text style={[styles.memberName, { color: colors.text }]}>Costa</Text>
                      <Text style={[styles.memberRole, { color: colors.textSecondary }]}>Guitarra</Text>
                    </View>
                    
                    <View style={styles.pendingBadge}>
                      <Text style={styles.badgeText}>Pendente</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.memberContainer, { borderBottomColor: colors.border }]}>
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: colors.text }]}>Ana</Text>
                      <Text style={[styles.memberName, { color: colors.text }]}>Lima</Text>
                      <Text style={[styles.memberRole, { color: colors.textSecondary }]}>Bateria</Text>
                    </View>
                    
                    <View style={styles.notSentContainer}>
                      <View style={styles.notSentBadge}>
                        <Text style={styles.notSentText}>Não Enviado</Text>
                      </View>
                      <TouchableOpacity>
                        <FontAwesome name="chevron-right" size={16} color="#00C853" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={[styles.memberContainer, styles.highlightedMember, { borderBottomColor: colors.border }]}>
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: '#FF9800' }]}>Carlos</Text>
                      <Text style={[styles.memberName, { color: '#FF9800' }]}>Mendes</Text>
                      <Text style={[styles.memberRole, { color: colors.textSecondary }]}>Vocal</Text>
                    </View>
                    
                    <View style={styles.notSentContainer}>
                      <View style={styles.notSentBadge}>
                        <Text style={styles.notSentText}>Não Enviado</Text>
                      </View>
                      <TouchableOpacity>
                        <FontAwesome name="chevron-right" size={16} color="#00C853" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                
                {/* Equipe Técnica */}
                <View style={[styles.teamSection, { backgroundColor: colors.card }]}>
                  <Text style={[styles.teamSectionTitle, { color: colors.text }]}>Equipe Técnica</Text>
                  
                  <View style={[styles.memberContainer, { borderBottomColor: colors.border }]}>
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: colors.text }]}>Roberto</Text>
                      <Text style={[styles.memberName, { color: colors.text }]}>Silva</Text>
                      <Text style={[styles.memberRole, { color: colors.textSecondary }]}>Som</Text>
                    </View>
                    
                    <View style={styles.confirmBadge}>
                      <Text style={styles.badgeText}>Confirmado</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.memberContainer, { borderBottomColor: colors.border }]}>
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: colors.text }]}>Fernanda</Text>
                      <Text style={[styles.memberName, { color: colors.text }]}>Costa</Text>
                      <Text style={[styles.memberRole, { color: colors.textSecondary }]}>Video</Text>
                    </View>
                    
                    <View style={styles.confirmBadge}>
                      <Text style={styles.badgeText}>Confirmado</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.memberContainer, styles.highlightedMember]}>
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: '#FF9800' }]}>Paulo</Text>
                      <Text style={[styles.memberName, { color: '#FF9800' }]}>Santos</Text>
                      <Text style={styles.memberRole}>Iluminação</Text>
                    </View>
                    
                    <View style={styles.notSentContainer}>
                      <View style={styles.notSentBadge}>
                        <Text style={styles.notSentText}>Não Enviado</Text>
                      </View>
                      <TouchableOpacity>
                        <FontAwesome name="exclamation-circle" size={16} color="#FF9800" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                
                {/* Mensagem de bloqueados */}
                <TouchableOpacity style={styles.blockedMessage}>
                  <FontAwesome name="ban" size={16} color="#F44336" />
                  <Text style={styles.blockedMessageText}>Ver bloqueados para esta data (2)</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {activeTab === 'songs' && (
            <View style={[styles.songsContainer, { backgroundColor: colors.background }]}>
              {/* Título da seção */}
              <Text style={[styles.songsSectionTitle, { color: colors.text }]}>Músicas do Cronograma (4)</Text>
              
              {/* Lista de músicas do cronograma */}
              <FlatList
                data={[
                  { id: '1', title: 'Se Aperfeiçoa Em Mim', artist: 'Ministério Zoe', time: '19:03', duration: '5min', tags: ['Vocal', 'Violão'] },
                  { id: '2', title: 'TUDO É PERDA', artist: 'Morada', time: '19:08', duration: '5min', tags: ['Vocal'] },
                  { id: '3', title: 'LINDO MOMENTO', artist: 'Ministério Zoe', time: '19:13', duration: '5min', tags: ['Vocal'] },
                  { id: '4', title: 'Vitorioso És / Victory is Yours', artist: 'Elevation Worship', time: '19:18', duration: '7min', tags: ['Vocal', 'Piano'] },
                ]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={[styles.songProgramItem, { borderBottomColor: colors.border }]}>
                    <View style={styles.songProgramIconContainer}>
                      <FontAwesome name="music" size={24} color="#FFD700" />
                    </View>
                    <View style={styles.songProgramInfo}>
                      <Text style={[styles.songProgramTitle, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[styles.songProgramArtist, { color: colors.textSecondary }]}>por {item.artist}</Text>
                      <Text style={[styles.songProgramTime, { color: colors.textSecondary }]}>{item.time} • {item.duration}</Text>
                      <View style={styles.songProgramTags}>
                        {item.tags.map((tag, index) => (
                          <View key={index} style={[styles.songProgramTag, { backgroundColor: colors.inputBackground }]}>
                            <Text style={[styles.songProgramTagText, { color: colors.text }]}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <View style={styles.songProgramActions}>
                      <View style={[styles.songProgramStatus, { backgroundColor: '#FF9500' }]}>
                        <Text style={styles.songProgramStatusText}>OK</Text>
                      </View>
                      <TouchableOpacity>
                        <FontAwesome name="chevron-right" size={16} color="#8E8E93" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                style={styles.songsProgramList}
                contentContainerStyle={styles.songsProgramListContent}
              />
            </View>
          )}
          
          {activeTab === 'schedule' && (
            <View style={styles.scheduleContainer}>
              {/* Evento Principal */}
              <View style={[styles.scheduleSection, { backgroundColor: colors.card }]}>
                <Text style={[styles.scheduleSectionTitle, { color: colors.text }]}>Evento Principal</Text>
                <View style={styles.scheduleMainInfo}>
                  <View style={styles.scheduleInfoRow}>
                    <Text style={[styles.scheduleInfoLabel, { color: colors.textSecondary }]}>Data:</Text>
                    <Text style={[styles.scheduleInfoValue, { color: colors.text }]}>2025-09-07</Text>
                  </View>
                  <View style={styles.scheduleInfoRow}>
                    <Text style={[styles.scheduleInfoLabel, { color: colors.textSecondary }]}>Horário:</Text>
                    <Text style={[styles.scheduleInfoValue, { color: colors.text }]}>19:00</Text>
                  </View>
                  <View style={styles.scheduleInfoRow}>
                    <Text style={[styles.scheduleInfoLabel, { color: colors.textSecondary }]}>Duração:</Text>
                    <Text style={[styles.scheduleInfoValue, { color: colors.text }]}>35min</Text>
                  </View>
                </View>
              </View>
              
              {/* Horários Extras */}
              <View style={[styles.scheduleSection, { backgroundColor: colors.card }]}>
                <Text style={[styles.scheduleSectionTitle, { color: colors.text }]}>Horários Extras</Text>
                
                {/* Card de Horário Extra - Ensaio Geral */}
                <View style={[styles.scheduleExtraCard, { backgroundColor: colors.card }]}>
                  <View style={styles.scheduleExtraContent}>
                    <Text style={[styles.scheduleExtraTitle, { color: colors.text }]}>Ensaio Geral</Text>
                    <View style={styles.scheduleExtraInfo}>
                      <Text style={[styles.scheduleExtraDate, { color: colors.textSecondary }]}>05/09/2024 às 19:30</Text>
                      <View style={styles.scheduleExtraLocationRow}>
                        <FontAwesome name="map-marker" size={16} color="#FF3B30" style={styles.locationIcon} />
                        <Text style={[styles.scheduleExtraLocation, { color: colors.textSecondary }]}>Santuário Principal</Text>
                      </View>
                      <Text style={[styles.scheduleExtraDescription, { color: colors.textSecondary }]}>Ensaio com toda a banda e equipe técnica</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.deleteScheduleButton}>
                    <FontAwesome name="trash" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
                
                {/* Card de Horário Extra - Chegada da Equipe */}
                <View style={[styles.scheduleExtraCard, { backgroundColor: colors.card }]}>
                  <View style={styles.scheduleExtraContent}>
                    <Text style={[styles.scheduleExtraTitle, { color: colors.text }]}>Chegada da Equipe</Text>
                    <View style={styles.scheduleExtraInfo}>
                      <Text style={[styles.scheduleExtraDate, { color: colors.textSecondary }]}>07/09/2024 às 18:00</Text>
                      <View style={styles.scheduleExtraLocationRow}>
                        <FontAwesome name="map-marker" size={16} color="#FF3B30" style={styles.locationIcon} />
                        <Text style={[styles.scheduleExtraLocation, { color: colors.textSecondary }]}>Entrada dos Fundos</Text>
                      </View>
                      <Text style={[styles.scheduleExtraDescription, { color: colors.textSecondary }]}>Chegada dos voluntários para preparação</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.deleteScheduleButton}>
                    <FontAwesome name="trash" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Botões flutuantes para a aba Etapas */}
      {activeTab === 'steps' && (
        <View style={styles.fabContainer}>
          {/* Sub-botões (aparecem quando FAB está aberto) */}
          {isFabOpen && (
            <>
              {/* Botão para adicionar cabeçalho */}
              <TouchableOpacity 
                style={[styles.subButton, { bottom: 220 }]}
                onPress={() => {
                  handleAddHeader();
                  setIsFabOpen(false);
                }}
              >
                <View style={[styles.subButtonContainer, { backgroundColor: '#5fccb3' }]}>
                  <Text style={styles.subButtonLabel}>Cabeçalho</Text>
                  <FontAwesome name="star" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              
              {/* Botão para adicionar etapa */}
              <TouchableOpacity 
                style={[styles.subButton, { bottom: 150 }]}
                onPress={() => {
                  handleAddStep();
                  setIsFabOpen(false);
                }}
              >
                <View style={[styles.subButtonContainer, { backgroundColor: '#6366F1' }]}>
                  <Text style={styles.subButtonLabel}>Etapa</Text>
                  <FontAwesome name="list" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              
              {/* Botão para adicionar música */}
              <TouchableOpacity 
                style={[styles.subButton, { bottom: 80 }]}
                onPress={() => {
                  setIsAddSongModalVisible(true);
                  setIsFabOpen(false);
                }}
              >
                <View style={[styles.subButtonContainer, { backgroundColor: '#FF9500' }]}>
                  <Text style={styles.subButtonLabel}>Música</Text>
                  <FontAwesome name="music" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </>
          )}
          
          {/* Botão principal do FAB */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsFabOpen(!isFabOpen)}
          >
            <LinearGradient 
              colors={['#5fccb3', '#58adf7']} 
              start={{x: 0, y: 0}} 
              end={{x: 1, y: 0}} 
              style={styles.addButtonGradient}
            >
              <FontAwesome name={isFabOpen ? "times" : "plus"} size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Botão para adicionar membro à equipe */}
      {activeTab === 'team' && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsAddTeamMemberModalVisible(true)}
        >
          <LinearGradient 
            colors={['#5fccb3', '#58adf7']} 
            start={{x: 0, y: 0}} 
            end={{x: 1, y: 0}} 
            style={styles.addButtonGradient}
          >
            <FontAwesome name="plus" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      {/* Botão para adicionar música */}
      {activeTab === 'songs' && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsAddSongModalVisible(true)}
        >
          <LinearGradient 
            colors={['#5fccb3', '#58adf7']} 
            start={{x: 0, y: 0}} 
            end={{x: 1, y: 0}} 
            style={styles.addButtonGradient}
          >
            <FontAwesome name="plus" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      {/* Botão para adicionar horário extra */}
      {activeTab === 'schedule' && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsAddScheduleModalVisible(true)}
        >
          <LinearGradient 
            colors={['#5fccb3', '#58adf7']} 
            start={{x: 0, y: 0}} 
            end={{x: 1, y: 0}} 
            style={styles.addButtonGradient}
          >
            <FontAwesome name="plus" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      
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
      
      {/* Modal para adicionar horário extra */}
      <Modal
        isVisible={isAddScheduleModalVisible}
        onBackdropPress={() => setIsAddScheduleModalVisible(false)}
        style={styles.modal}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background, height: 'auto' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Horário Extra</Text>
            <TouchableOpacity onPress={() => setIsAddScheduleModalVisible(false)}>
              <FontAwesome name="times" size={20} color="#000000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nome do Evento *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ex: Ensaio Geral, Chegada da Equipe..."
                placeholderTextColor="#8E8E93"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Data</Text>
              <TextInput
                style={styles.formInput}
                placeholder="07/09/2024"
                placeholderTextColor="#8E8E93"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Horário *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="19:30"
                placeholderTextColor="#8E8E93"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Local</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Santuário Principal, Sala de Ensaio..."
                placeholderTextColor="#8E8E93"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descrição</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                placeholder="Detalhes sobre este horário..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={4}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.addScheduleButton}
              onPress={() => setIsAddScheduleModalVisible(false)}
            >
              <Text style={styles.addScheduleButtonText}>Adicionar Horário</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
      
      {/* Modal para adicionar voluntário à equipe */}
      <Modal
        isVisible={isAddTeamMemberModalVisible}
        onBackdropPress={() => setIsAddTeamMemberModalVisible(false)}
        style={styles.modal}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background, height: 'auto' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Voluntário</Text>
            <TouchableOpacity onPress={() => setIsAddTeamMemberModalVisible(false)}>
              <FontAwesome name="times" size={20} color="#000000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.teamMemberSearchContainer}>
            <View style={styles.teamMemberSearchInputContainer}>
              <FontAwesome name="search" size={16} color="#8E8E93" style={styles.searchIcon} />
              <TextInput
                style={styles.teamMemberSearchInput}
                placeholder="Buscar voluntários..."
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            {/* Ministério de Louvor */}
            <Text style={styles.teamMemberSectionTitle}>Ministério de Louvor</Text>
            
            {/* João Silva */}
            <View style={styles.teamMemberSelectItem}>
              <View style={styles.teamMemberSelectInfo}>
                <Text style={styles.teamMemberSelectName}>João Silva</Text>
                <Text style={styles.teamMemberSelectRole}>Vocal</Text>
              </View>
              <TouchableOpacity style={styles.teamMemberAddButton}>
                <FontAwesome name="plus-circle" size={24} color="#00C853" />
              </TouchableOpacity>
            </View>
            
            {/* Maria Santos */}
            <View style={styles.teamMemberSelectItem}>
              <View style={styles.teamMemberSelectInfo}>
                <Text style={styles.teamMemberSelectName}>Maria Santos</Text>
                <Text style={styles.teamMemberSelectRole}>Teclado</Text>
              </View>
              <TouchableOpacity style={styles.teamMemberAddButton}>
                <FontAwesome name="plus-circle" size={24} color="#00C853" />
              </TouchableOpacity>
            </View>
            
            {/* Pedro Costa */}
            <View style={styles.teamMemberSelectItem}>
              <View style={styles.teamMemberSelectInfo}>
                <Text style={styles.teamMemberSelectName}>Pedro Costa</Text>
                <Text style={styles.teamMemberSelectRole}>Guitarra</Text>
              </View>
              <TouchableOpacity style={styles.teamMemberAddButton}>
                <FontAwesome name="plus-circle" size={24} color="#00C853" />
              </TouchableOpacity>
            </View>
            
            {/* Carlos Mendes - Indisponível */}
            <View style={styles.teamMemberUnavailableItem}>
              <View style={styles.teamMemberSelectInfo}>
                <Text style={styles.teamMemberSelectName}>Carlos Mendes</Text>
                <Text style={styles.teamMemberSelectRole}>Vocal</Text>
                <Text style={styles.teamMemberUnavailableReason}>Motivo: Viagem de trabalho</Text>
              </View>
              <TouchableOpacity style={styles.teamMemberBlockedButton}>
                <FontAwesome name="ban" size={24} color="#F44336" />
              </TouchableOpacity>
            </View>
            
            {/* Roberto Silva */}
            <View style={styles.teamMemberSelectItem}>
              <View style={styles.teamMemberSelectInfo}>
                <Text style={styles.teamMemberSelectName}>Roberto Silva</Text>
                <Text style={styles.teamMemberSelectRole}>Baixo</Text>
              </View>
              <TouchableOpacity style={styles.teamMemberAddButton}>
                <FontAwesome name="plus-circle" size={24} color="#00C853" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
      
      {/* Modal para adicionar cabeçalho */}
      <Modal
        isVisible={isAddHeaderModalVisible}
        onBackdropPress={() => setIsAddHeaderModalVisible(false)}
        style={styles.modal}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background, height: 'auto' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Cabeçalho</Text>
            <TouchableOpacity onPress={() => setIsAddHeaderModalVisible(false)}>
              <FontAwesome name="times" size={20} color="#000000" />
            </TouchableOpacity>
          </View>
          
          {/* Abas do modal */}
          <View style={styles.headerModalTabs}>
            <TouchableOpacity 
              style={[styles.headerModalTab, activeHeaderTab === 'details' && styles.headerModalTabActive]}
              onPress={() => setActiveHeaderTab('details')}
            >
              <FontAwesome name="pencil" size={16} color={activeHeaderTab === 'details' ? '#6C5CE7' : '#8E8E93'} />
              <Text style={[styles.headerModalTabText, activeHeaderTab === 'details' && styles.headerModalTabTextActive]}>Detalhes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.headerModalTab, activeHeaderTab === 'people' && styles.headerModalTabActive]}
              onPress={() => setActiveHeaderTab('people')}
            >
              <FontAwesome name="users" size={16} color={activeHeaderTab === 'people' ? '#6C5CE7' : '#8E8E93'} />
              <Text style={[styles.headerModalTabText, activeHeaderTab === 'people' && styles.headerModalTabTextActive]}>Pessoas</Text>
            </TouchableOpacity>
          </View>
          
          {activeHeaderTab === 'details' && (
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Horário *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="19:00"
                  placeholderTextColor="#8E8E93"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Título do Cabeçalho *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Ex: Abertura, Louvor, Ministração..."
                  placeholderTextColor="#8E8E93"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Observações</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextarea]}
                  placeholder="Informações adicionais..."
                  placeholderTextColor="#8E8E93"
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.addHeaderButton}
                onPress={() => setIsAddHeaderModalVisible(false)}
              >
                <Text style={styles.addHeaderButtonText}>Adicionar ao Cronograma</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
          
          {activeHeaderTab === 'people' && (
            <ScrollView style={styles.modalScrollView}>
              <Text style={styles.headerPeopleText}>Conteúdo da aba Pessoas</Text>
            </ScrollView>
          )}
        </View>
      </Modal>
      
      {/* Modal para adicionar música */}
      <Modal
        isVisible={isAddSongModalVisible}
        onBackdropPress={() => setIsAddSongModalVisible(false)}
        style={styles.modal}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver
      >
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Adicionar Música</Text>
            <TouchableOpacity onPress={() => setIsAddSongModalVisible(false)}>
              <FontAwesome name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {/* Barra de pesquisa */}
          <View style={styles.songSearchContainer}>
            <View style={[styles.songSearchInputContainer, { backgroundColor: colors.inputBackground }]}>
              <FontAwesome name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={[styles.songSearchInput, { color: colors.text }]}
                placeholder="Pesquisar músicas..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
          
          {/* Lista de músicas disponíveis */}
          <FlatList
            data={[
              { id: '1', title: 'Se Aperfeiçoa Em Mim', artist: 'Ministério Zoe', tags: ['Vocal', 'Violão'] },
              { id: '2', title: 'TUDO É PERDA', artist: 'Morada', tags: ['Vocal'] },
              { id: '3', title: 'LINDO MOMENTO', artist: 'Ministério Zoe', tags: ['Vocal'] },
              { id: '4', title: 'Vitorioso És / Victory is Yours', artist: 'Elevation Worship', tags: ['Vocal', 'Piano'] },
              { id: '5', title: '1000 Graus', artist: 'Renascer Praise', tags: ['Vocal'] },
              { id: '6', title: '500 GRAUS', artist: 'Cassiane', tags: ['Vocal'] },
              { id: '7', title: 'A ALEGRIA ESTÁ NO CORAÇÃO', artist: 'Mateus Brito', tags: ['Vocal'] },
              { id: '8', title: 'ABBA', artist: 'Laura Souguellis', tags: ['Vocal'] },
            ]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.songSearchItem, { borderBottomColor: colors.border }]}>
                <View style={styles.songSearchIconContainer}>
                  <FontAwesome name="music" size={24} color="#8A2BE2" />
                </View>
                <View style={styles.songSearchInfo}>
                  <Text style={[styles.songSearchTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.songSearchArtist, { color: colors.textSecondary }]}>{item.artist}</Text>
                  <View style={styles.songSearchTags}>
                    {item.tags.map((tag, index) => (
                      <View key={index} style={[styles.songSearchTag, { backgroundColor: colors.inputBackground }]}>
                        <Text style={[styles.songSearchTagText, { color: colors.text }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <TouchableOpacity style={styles.songSearchAddButton}>
                  <FontAwesome name="plus-circle" size={24} color="#00C853" />
                </TouchableOpacity>
              </View>
            )}
            style={styles.songSearchList}
            contentContainerStyle={styles.songSearchListContent}
          />
        </View>
      </Modal>
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
  },
  songsContainer: {
    flex: 1,
  },
  songsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
  },
  songsProgramList: {
    flex: 1,
  },
  songsProgramListContent: {
    paddingBottom: 80,
  },
  songProgramItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  songProgramIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9C4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  songProgramInfo: {
    flex: 1,
  },
  songProgramTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  songProgramArtist: {
    fontSize: 14,
    marginBottom: 4,
  },
  songProgramTime: {
    fontSize: 14,
    marginBottom: 8,
  },
  songProgramTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  songProgramTag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    marginBottom: 4,
  },
  songProgramTagText: {
    fontSize: 12,
  },
  songProgramActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  songProgramStatus: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  songProgramStatusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    height: 40,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  mediaTabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  mediaTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  mediaTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#8A2BE2',
  },
  mediaTabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  mediaTabTextActive: {
    color: '#8A2BE2',
  },
  songsList: {
    flex: 1,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  songIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 14,
    color: '#8E8E93',
  },
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songActionButton: {
    padding: 8,
    marginLeft: 8,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: Dimensions.get('window').height * 0.9,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalBackButton: {
    fontSize: 16,
    color: '#000000',
  },
  modalScrollView: {
    flex: 1,
  },
  modalSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalSectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  musicBadge: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  musicBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  searchVideoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  searchVideoInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000000',
  },
  searchVideoButton: {
    padding: 12,
    backgroundColor: '#F2F2F7',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000000',
  },
  formTextarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  lyricsTextarea: {
    height: 200,
    textAlignVertical: 'top',
  },
  addLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8A2BE2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  addLinkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  noFilesText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginVertical: 16,
  },
  addFilesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8A2BE2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  addFilesText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  saveSongButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 16,
    marginBottom: 32,
  },
  saveSongButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
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
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
    zIndex: 999,
  },
  addButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Estilos para a aba Equipe
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  sendButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  teamContent: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  teamSection: {
    marginBottom: 20,
  },
  teamSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  memberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  highlightedMember: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 24,
  },
  memberRole: {
    fontSize: 16,
    marginTop: 4,
  },
  confirmBadge: {
    backgroundColor: '#00C853',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  notSentBadge: {
    backgroundColor: '#9E9E9E',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  notSentText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  notSentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  blockedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    paddingVertical: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  blockedMessageText: {
    color: '#F44336',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  // Estilos para a aba Horários
  scheduleContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scheduleSection: {
    marginBottom: 16,
    paddingVertical: 16,
  },
  scheduleSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scheduleMainInfo: {
    paddingHorizontal: 16,
  },
  scheduleInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  scheduleInfoLabel: {
    fontSize: 16,
    width: 80,
  },
  scheduleInfoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  scheduleExtraCard: {
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduleExtraContent: {
    flex: 1,
    marginRight: 8,
  },
  scheduleExtraTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  scheduleExtraInfo: {
    marginTop: 4,
  },
  scheduleExtraDate: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
  },
  scheduleExtraLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    marginRight: 6,
  },
  scheduleExtraLocation: {
    fontSize: 14,
    color: '#8E8E93',
  },
  scheduleExtraDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  deleteScheduleButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  addScheduleButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: 16,
  },
  addScheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos para o modal de adicionar voluntário
  teamMemberSearchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  teamMemberSearchInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    height: 40,
  },
  teamMemberSearchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000000',
    marginLeft: 8,
  },
  teamMemberSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  teamMemberSelectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  teamMemberSelectInfo: {
    flex: 1,
  },
  teamMemberSelectName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  teamMemberSelectRole: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  teamMemberAddButton: {
    padding: 8,
  },
  teamMemberUnavailableItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFF9C4',
  },
  teamMemberUnavailableReason: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 4,
  },
  teamMemberBlockedButton: {
    padding: 8,
  },
  // Estilos para o modal de adicionar cabeçalho
  headerModalTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerModalTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  headerModalTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6C5CE7',
  },
  headerModalTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 8,
  },
  headerModalTabTextActive: {
    color: '#6C5CE7',
  },
  headerPeopleText: {
    padding: 16,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  addHeaderButton: {
    backgroundColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: 16,
  },
  addHeaderButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos para a pesquisa de músicas no modal
  songSearchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  songSearchInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    height: 40,
  },
  songSearchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000000',
    marginLeft: 8,
  },
  songSearchList: {
    flex: 1,
  },
  songSearchListContent: {
    paddingBottom: 20,
  },
  songSearchItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  songSearchIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0E6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  songSearchInfo: {
    flex: 1,
  },
  songSearchTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  songSearchArtist: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  songSearchTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  songSearchTag: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    marginBottom: 4,
  },
  songSearchTagText: {
    fontSize: 12,
    color: '#000000',
  },
  songSearchAddButton: {
    padding: 8,
    justifyContent: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 999,
  },
  subButton: {
    position: 'absolute',
    right: 24,
    zIndex: 998,
  },
  subButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#8E8E93',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  subButtonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default EventCreationScreen;
