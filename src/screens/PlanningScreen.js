import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import theme from '../styles/theme';
import StandardButton from '../components/StandardButton';
import TabScreenWrapper from '../components/TabScreenWrapper';
import AddEventModal from '../components/AddEventModal';
import EventFormModal from '../components/EventFormModal';
import EventCard from '../components/EventCard';
import { HeaderContext } from '../contexts/HeaderContext';
import eventService from '../services/eventService';

/**
 * Tela de Planejamento de Eventos
 * @param {Object} navigation - Objeto de navegação
 * @returns {React.ReactNode}
 */
const PlanningScreen = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  const { setShowLargeTitle } = useContext(HeaderContext);
  
  // Definir o título grande ao montar o componente
  useEffect(() => {
    setShowLargeTitle(true);
    return () => setShowLargeTitle(true);
  }, [setShowLargeTitle]);
  
  // Estado para armazenar os eventos
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para controlar a visibilidade dos modais
  const [isAddEventModalVisible, setIsAddEventModalVisible] = useState(false);
  const [isEventFormModalVisible, setIsEventFormModalVisible] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  // Carregar eventos do Supabase
  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await eventService.getAllEvents();
      const formattedEvents = eventsData.map(event => 
        eventService.formatEventForDisplay(event)
      );
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar os eventos. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Recarregar eventos (pull to refresh)
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  // Carregar eventos ao montar o componente
  useEffect(() => {
    loadEvents();
  }, []);

  // Recarregar eventos quando a tela receber foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEvents();
    });

    return unsubscribe;
  }, [navigation]);

  // Função para abrir o modal de adicionar evento
  const handleCreateEvent = () => {
    setIsAddEventModalVisible(true);
  };
  
  // Função para fechar o modal de adicionar evento
  const handleCloseAddEventModal = () => {
    setIsAddEventModalVisible(false);
  };
  
  // Função para criar um evento do zero
  const handleCreateFromScratch = () => {
    setIsAddEventModalVisible(false);
    // Mostrar o modal de formulário
    setSelectedTemplateId(null);
    setIsEventFormModalVisible(true);
  };
  
  // Função para usar um template
  const handleUseTemplate = (templateId) => {
    setIsAddEventModalVisible(false);
    // Mostrar o modal de formulário com o template selecionado
    setSelectedTemplateId(templateId);
    setIsEventFormModalVisible(true);
  };
  
  // Função para continuar após preencher o formulário
  const handleEventFormContinue = (eventData) => {
    setIsEventFormModalVisible(false);
    // Navegar para a tela de criação de evento com os dados do formulário
    navigation.navigate('EventCreation', { 
      templateId: selectedTemplateId,
      eventData
    });
  };

  // Função para editar um evento
  const handleEditEvent = async (eventId) => {
    try {
      // Buscar dados completos do evento
      const eventData = await eventService.getEventById(eventId);
      
      if (!eventData) {
        Alert.alert('Erro', 'Evento não encontrado');
        return;
      }

      // Navegar para a tela de edição com os dados do evento
      navigation.navigate('EventCreation', { 
        eventId: eventId,
        eventData: {
          name: eventData.title,
          date: new Date(eventData.event_date),
          time: new Date(`2000-01-01T${eventData.event_time}`),
          description: eventData.description,
          location: eventData.location,
          duration: eventData.duration_minutes,
        },
        isEditing: true
      });
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
      Alert.alert('Erro', 'Não foi possível carregar o evento');
    }
  };

  // Função para duplicar um evento
  const handleDuplicateEvent = (eventId) => {
    console.log('Duplicar evento:', eventId);
  };

  // Função para deletar um evento
  const handleDeleteEvent = async (eventId) => {
    Alert.alert(
      'Deletar Evento',
      'Tem certeza que deseja deletar este evento? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              const supabase = require('../services/supabase').default;
              const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', eventId);

              if (error) {
                Alert.alert('Erro', 'Não foi possível deletar o evento');
                return;
              }

              await loadEvents();
              Alert.alert('Sucesso', 'Evento deletado com sucesso');
            } catch (error) {
              console.error('Erro ao deletar evento:', error);
              Alert.alert('Erro', 'Não foi possível deletar o evento');
            }
          }
        }
      ]
    );
  };

  // Função para abrir a planilha de escalas
  const handleOpenSchedule = () => {
    console.log('Abrir planilha de escalas');
  };

  // Renderizar um item de evento
  const renderEventItem = ({ item }) => (
    <EventCard 
      event={item} 
      onEdit={handleEditEvent}
      onDuplicate={handleDuplicateEvent}
      onDelete={handleDeleteEvent}
    />
  );

  // Renderizar header da lista
  const renderListHeader = () => (
    <>
      {/* Modal de adicionar evento */}
      <AddEventModal 
        visible={isAddEventModalVisible}
        onClose={handleCloseAddEventModal}
        onCreateFromScratch={handleCreateFromScratch}
        onUseTemplate={handleUseTemplate}
      />
      
      {/* Modal de formulário de evento */}
      <EventFormModal
        visible={isEventFormModalVisible}
        onClose={() => setIsEventFormModalVisible(false)}
        onContinue={handleEventFormContinue}
        initialData={{}}
      />
    
      {/* Área de botões */}
      <View style={styles.buttonsContainer}>
        <View style={styles.buttonRow}>
          <View style={[styles.buttonContainer, { paddingRight: 3 }]}>
            <StandardButton 
              title="Adicionar Evento"
              icon="plus"
              onPress={handleCreateEvent}
              style={styles.actionButton}
            />
          </View>
          
          <View style={[styles.buttonContainer, { paddingLeft: 3 }]}>
            <StandardButton 
              title="Planilha de Escalas"
              icon="calendar-check-o"
              onPress={handleOpenSchedule}
              style={styles.actionButton}
              outlined={true}
            />
          </View>
        </View>
      </View>
      
      {/* Título da seção */}
      <View style={styles.sectionTitleContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Eventos Planejados</Text>
      </View>
    </>
  );

  // Renderizar loading ou lista vazia
  const renderListContent = () => {
    if (loading) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando eventos...
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <TabScreenWrapper activeTab="Planejar" navigation={navigation}>
      <FlatList
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content]}
        data={loading ? [] : events}
        renderItem={renderEventItem}
        keyExtractor={item => item.id}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <FontAwesome name="calendar-o" size={64} color={colors.textSecondary} style={styles.emptyIcon} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Nenhum evento cadastrado
              </Text>
              <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
                Toque em "Adicionar Evento" para criar seu primeiro evento
              </Text>
            </View>
          ) : null
        }
        scrollEnabled={!loading}
      />
      {renderListContent()}
    </TabScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingVertical: 20,
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
    width: '100%',
  },
  buttonContainer: {
    width: '50%', // Exatamente 50% da largura
    padding: 0,
  },
  actionButton: {
    width: '100%', // Ocupa 100% do container
    maxHeight: 44, // Garantir altura máxima igual para todos os botões
  },
  sectionTitleContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default PlanningScreen;
