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
              
              {/* Ministério de Louvor */}
              <View style={styles.teamSection}>
                <Text style={[styles.teamSectionTitle, { color: colors.text }]}>Ministério de Louvor</Text>
                
                <View style={styles.memberContainer}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>João</Text>
                    <Text style={styles.memberName}>Silva</Text>
                    <Text style={styles.memberRole}>Vocal</Text>
                  </View>
                  
                  <View style={styles.confirmBadge}>
                    <Text style={styles.badgeText}>Confirmado</Text>
                  </View>
                </View>
                
                <View style={styles.memberContainer}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>Maria</Text>
                    <Text style={styles.memberName}>Santos</Text>
                    <Text style={styles.memberRole}>Teclado</Text>
                  </View>
                  
                  <View style={styles.confirmBadge}>
                    <Text style={styles.badgeText}>Confirmado</Text>
                  </View>
                </View>
                
                <View style={styles.memberContainer}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>Pedro</Text>
                    <Text style={styles.memberName}>Costa</Text>
                    <Text style={styles.memberRole}>Guitarra</Text>
                  </View>
                  
                  <View style={styles.pendingBadge}>
                    <Text style={styles.badgeText}>Pendente</Text>
                  </View>
                </View>
                
                <View style={styles.memberContainer}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>Ana</Text>
                    <Text style={styles.memberName}>Lima</Text>
                    <Text style={styles.memberRole}>Bateria</Text>
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
                
                <View style={[styles.memberContainer, styles.highlightedMember]}>
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: '#FF9800' }]}>Carlos</Text>
                    <Text style={[styles.memberName, { color: '#FF9800' }]}>Mendes</Text>
                    <Text style={styles.memberRole}>Vocal</Text>
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
              <View style={styles.teamSection}>
                <Text style={[styles.teamSectionTitle, { color: colors.text }]}>Equipe Técnica</Text>
                
                <View style={styles.memberContainer}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>Roberto</Text>
                    <Text style={styles.memberName}>Silva</Text>
                    <Text style={styles.memberRole}>Som</Text>
                  </View>
                  
                  <View style={styles.confirmBadge}>
                    <Text style={styles.badgeText}>Confirmado</Text>
                  </View>
                </View>
                
                <View style={styles.memberContainer}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>Fernanda</Text>
                    <Text style={styles.memberName}>Costa</Text>
                    <Text style={styles.memberRole}>Video</Text>
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
              
              {/* Botão Adicionar Membro */}
              <TouchableOpacity style={styles.addButton}>
                <LinearGradient 
                  colors={['#5fccb3', '#58adf7']} 
                  start={{x: 0, y: 0}} 
                  end={{x: 1, y: 0}} 
                  style={styles.addButtonGradient}
                >
                  <FontAwesome name="plus" size={24} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Mensagem de bloqueados */}
              <TouchableOpacity style={styles.blockedMessage}>
                <FontAwesome name="ban" size={16} color="#F44336" />
                <Text style={styles.blockedMessageText}>Ver bloqueados para esta data (2)</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {activeTab === 'songs' && (
            <View style={styles.songsContainer}>
              {/* Barra de pesquisa e filtro */}
              <View style={styles.searchFilterContainer}>
                <View style={styles.searchBarContainer}>
                  <FontAwesome name="search" size={16} color="#8E8E93" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Pesquisar"
                    placeholderTextColor="#8E8E93"
                  />
                  <TouchableOpacity>
                    <FontAwesome name="times" size={16} color="#8E8E93" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.filterButton}>
                  <FontAwesome name="sliders" size={16} color="#000000" />
                  <Text style={styles.filterText}>Filtrar</Text>
                </TouchableOpacity>
              </View>
              
              {/* Abas de Músicas e Vídeos */}
              <View style={styles.mediaTabsContainer}>
                <TouchableOpacity 
                  style={[styles.mediaTab, styles.mediaTabActive]}
                >
                  <Text style={[styles.mediaTabText, styles.mediaTabTextActive]}>Músicas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaTab}>
                  <Text style={styles.mediaTabText}>Vídeos</Text>
                </TouchableOpacity>
              </View>
              
              {/* Lista de músicas */}
              <FlatList
                data={[
                  { id: '1', title: '1000 Graus', artist: 'Renascer Praise' },
                  { id: '2', title: '500 GRAUS', artist: 'Cassiane' },
                  { id: '3', title: '500 GRAUS', artist: 'Cassiane' },
                  { id: '4', title: 'A ALEGRIA ESTÁ NO CORAÇÃO', artist: 'Mateus Brito' },
                  { id: '5', title: 'ABBA', artist: 'Laura Souguellis' },
                  { id: '6', title: 'A bênção / The Blessing', artist: 'Gabriela Rocha / Elevation Worship & Kari Jobi' },
                  { id: '7', title: 'Abra a Sua Boca e Profetiza', artist: 'Marcus Salles' },
                  { id: '8', title: 'Abraça-em (Quero Ser Como Criança)', artist: 'David Quinlan' },
                ]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.songItem}>
                    <View style={styles.songIconContainer}>
                      <FontAwesome name="music" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.songInfo}>
                      <Text style={styles.songTitle}>{item.title}</Text>
                      <Text style={styles.songArtist}>{item.artist}</Text>
                    </View>
                    <View style={styles.songActions}>
                      <TouchableOpacity style={styles.songActionButton}>
                        <FontAwesome name="pencil" size={20} color="#000000" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.songActionButton}>
                        <FontAwesome name="trash" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                style={styles.songsList}
              />
              
              {/* Botão Adicionar Música */}
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
                    <TouchableOpacity onPress={() => setIsAddSongModalVisible(false)}>
                      <Text style={styles.modalBackButton}>Voltar para mídias</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsAddSongModalVisible(false)}>
                      <FontAwesome name="times" size={20} color="#000000" />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.modalScrollView}>
                    {/* Seção de vídeo do YouTube */}
                    <View style={styles.modalSection}>
                      <View style={styles.modalSectionHeader}>
                        <View style={[styles.modalSectionIcon, { backgroundColor: '#FF0000' }]}>
                          <FontAwesome name="youtube-play" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={styles.modalSectionTitle}>Adicionar Vídeo do YouTube</Text>
                      </View>
                      
                      <View style={styles.searchVideoContainer}>
                        <TextInput
                          style={styles.searchVideoInput}
                          placeholder="Pesquisar vídeo"
                          placeholderTextColor="#8E8E93"
                        />
                        <TouchableOpacity style={styles.searchVideoButton}>
                          <FontAwesome name="search" size={16} color="#000000" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {/* Seção de informações da música */}
                    <View style={styles.modalSection}>
                      <View style={styles.modalSectionHeader}>
                        <View style={[styles.modalSectionIcon, { backgroundColor: '#8A2BE2' }]}>
                          <FontAwesome name="file-text" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={styles.modalSectionTitle}>Informações - </Text>
                        <View style={styles.musicBadge}>
                          <Text style={styles.musicBadgeText}>Música</Text>
                        </View>
                      </View>
                      
                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Título</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder=""
                          placeholderTextColor="#8E8E93"
                        />
                      </View>
                      
                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Artista</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder=""
                          placeholderTextColor="#8E8E93"
                        />
                      </View>
                      
                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>URL</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder=""
                          placeholderTextColor="#8E8E93"
                        />
                      </View>
                      
                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Observações</Text>
                        <TextInput
                          style={[styles.formInput, styles.formTextarea]}
                          placeholder=""
                          placeholderTextColor="#8E8E93"
                          multiline
                          numberOfLines={4}
                        />
                      </View>
                    </View>
                    
                    {/* Seção de links externos */}
                    <View style={styles.modalSection}>
                      <View style={styles.modalSectionHeader}>
                        <View style={[styles.modalSectionIcon, { backgroundColor: '#E5E5EA' }]}>
                          <FontAwesome name="link" size={24} color="#000000" />
                        </View>
                        <Text style={styles.modalSectionTitle}>Links Externos</Text>
                      </View>
                      
                      <TouchableOpacity style={styles.addLinkButton}>
                        <Text style={styles.addLinkText}>Adicionar Link</Text>
                        <FontAwesome name="plus" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                    
                    {/* Seção de letra da música */}
                    <View style={styles.modalSection}>
                      <Text style={styles.formLabel}>Letra</Text>
                      <TextInput
                        style={[styles.formInput, styles.lyricsTextarea]}
                        placeholder=""
                        placeholderTextColor="#8E8E93"
                        multiline
                        numberOfLines={10}
                      />
                    </View>
                    
                    {/* Seção de arquivos */}
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Arquivos</Text>
                      <Text style={styles.noFilesText}>SEM ARQUIVOS</Text>
                      <TouchableOpacity style={styles.addFilesButton}>
                        <FontAwesome name="upload" size={16} color="#FFFFFF" />
                        <Text style={styles.addFilesText}>Adicionar arquivos à mídia</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {/* Botão de salvar */}
                    <TouchableOpacity 
                      style={styles.saveSongButton}
                      onPress={() => setIsAddSongModalVisible(false)}
                    >
                      <Text style={styles.saveSongButtonText}>Salvar Música</Text>
                      <FontAwesome name="save" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </Modal>
            </View>
          )}
          
          {activeTab === 'schedule' && (
            <View style={styles.scheduleContainer}>
              <Text style={{ color: colors.text }}>Conteúdo da aba Horários</Text>
              
              {/* Botão Adicionar Horário */}
              <TouchableOpacity style={styles.addButton}>
                <LinearGradient 
                  colors={['#5fccb3', '#58adf7']} 
                  start={{x: 0, y: 0}} 
                  end={{x: 1, y: 0}} 
                  style={styles.addButtonGradient}
                >
                  <FontAwesome name="plus" size={24} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Botão para adicionar etapa (apenas visível na aba Etapas) */}
      {activeTab === 'steps' && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddStep}
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
  },
  searchFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
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
  teamSection: {
    marginBottom: 20,
  },
  teamSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  memberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
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
    color: '#000000',
  },
  memberRole: {
    fontSize: 16,
    marginTop: 4,
    color: '#8E8E93',
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
});

export default EventCreationScreen;
