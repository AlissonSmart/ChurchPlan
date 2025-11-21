import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  ScrollView
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import theme from '../styles/theme';
import FloatingActionButton from '../components/FloatingActionButton';
import EventCard from '../components/EventCard';
import StandardButton from '../components/StandardButton';
import TabScreenWrapper from '../components/TabScreenWrapper';
import { HeaderContext } from '../contexts/HeaderContext';

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
  const [events, setEvents] = useState([
    {
      id: '1',
      name: 'Culto Dominical',
      date: '06/09',
      dayOfWeek: 'sáb.',
      time: '19:00',
      status: 'Planejado',
      songsCount: 2,
      membersCount: 4
    },
    {
      id: '2',
      name: 'Culto de Quarta',
      date: '09/09',
      dayOfWeek: 'ter.',
      time: '20:00',
      status: 'Planejado',
      songsCount: 1,
      membersCount: 2
    }
  ]);
  

  // Função para criar um novo evento
  const handleCreateEvent = () => {
    // Navegar para a tela de criação de evento
    // navigation.navigate('EventCreationSelection');
    console.log('Criar novo evento');
  };

  // Função para editar um evento
  const handleEditEvent = (eventId) => {
    // Navegar para a tela de detalhes do evento
    // navigation.navigate('EventDetails', { eventId });
    console.log('Editar evento:', eventId);
  };

  // Função para duplicar um evento
  const handleDuplicateEvent = (eventId) => {
    console.log('Duplicar evento:', eventId);
  };

  // Função para salvar um evento como template
  const handleSaveAsTemplate = (eventId) => {
    console.log('Salvar como template:', eventId);
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
      onSaveTemplate={handleSaveAsTemplate}
    />
  );

  return (
    <TabScreenWrapper activeTab="Planejar" navigation={navigation}>
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.content}>
        
        {/* Área de botões */}
        <View style={styles.buttonRow}>
          <StandardButton 
            title="Planilha de Escalas"
            icon="calendar-check-o"
            onPress={handleOpenSchedule}
            style={styles.actionButton}
          />
          
          <StandardButton 
            title="Adicionar Evento"
            icon="plus"
            onPress={handleCreateEvent}
            style={styles.actionButton}
            outlined={true}
          />
        </View>
        
        {/* Título da seção */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Eventos Planejados</Text>
        
        
        {/* Lista de eventos */}
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome name="calendar" size={50} color={colors.textSecondary} style={styles.emptyIcon} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Nenhum evento encontrado
              </Text>
              <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
                Os eventos criados aparecerão aqui
              </Text>
            </View>
          }
        />
        
        </View>
      </ScrollView>
    </TabScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
    width: '100%',
  },
  actionButton: {
    width: '48.5%', // Exatamente 50% menos a metade da margem (3%)
    maxHeight: 44, // Garantir altura máxima igual para todos os botões
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PlanningScreen;
