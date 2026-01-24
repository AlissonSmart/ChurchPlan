import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  useColorScheme,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { HeaderContext } from '../contexts/HeaderContext';
import TabScreenWrapper from '../components/TabScreenWrapper';
import notificationService from '../services/notificationService';
import eventService from '../services/eventService';
import supabase from '../services/supabase';
import theme from '../styles/theme';

const HomeScreen = ({ navigation, route }) => {
  const [activeSegment, setActiveSegment] = useState('agenda');
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  const { setShowLargeTitle } = useContext(HeaderContext);
  const lastLargeTitleState = useRef(true);

  // Estados para convites/eventos
  const [allAgendaItems, setAllAgendaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setShowLargeTitle(true);
    lastLargeTitleState.current = true;

    return () => {
      setShowLargeTitle(true);
    };
  }, [setShowLargeTitle]);

  // Carregar AGENDA (event_team com profile_id)
  const loadAgenda = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('[AGENDA] Erro de autenticação:', authError);
        setAllAgendaItems([]);
        setLoading(false);
        return;
      }

      console.log('[AGENDA] User ID:', user.id);

      // 1) Buscar profile pelo user_id
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('[AGENDA] Profile encontrado por user_id:', profile);

      if (!profile) {
        // 2) Se não achou, tentar achar pelo email (perfil pendente criado pelo admin)
        const { data: profileByEmail, error: emailError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();

        console.log('[AGENDA] Profile encontrado por email:', profileByEmail);

        profile = profileByEmail;

        // 3) Se achou pelo email mas sem user_id, ATUALIZAR (não inserir)
        if (profile && !profile.user_id) {
          console.log('[AGENDA] Atualizando profile existente com user_id:', user.id);
          
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
              user_id: user.id,
              auth_status: 'active',
              is_active: true,
            })
            .eq('id', profile.id)
            .select()
            .single();

          if (!updateError) {
            profile = updatedProfile;
            console.log('[AGENDA] Profile atualizado com ID:', profile.id);
          } else {
            console.log('[AGENDA] Erro ao atualizar profile:', updateError);
          }
        }
      }

      // 4) Se ainda não existir profile nenhum, criar um novo
      if (!profile) {
        console.log('[AGENDA] Criando profile automaticamente para user:', user.id);

        const displayName =
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          (user.email ? user.email.split('@')[0] : 'Usuário');

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            name: displayName,
            email: user.email,
            user_id: user.id,
            auth_status: 'active',
            is_active: true,
          })
          .select()
          .single();

        if (!insertError) {
          profile = newProfile;
          console.log('[AGENDA] Profile criado com ID:', profile.id);
        } else {
          console.log('[AGENDA] Erro ao criar profile:', insertError);
          setAllAgendaItems([]);
          setLoading(false);
          return;
        }
      }

      const profileId = profile.id;
      console.log('[AGENDA] Profile ID final:', profileId);

      // Buscar eventos da agenda via event_team.profile_id
      const { data: eventTeamRows, error: eventTeamError } = await supabase
        .from('event_team')
        .select(`
          id,
          status,
          event:events(id, title, event_date, event_time, location)
        `)
        .eq('profile_id', profileId)
        .in('status', ['pending', 'accepted', 'confirmed']);

      if (eventTeamError) {
        console.error('[AGENDA] Erro ao buscar agenda:', eventTeamError);
        setAllAgendaItems([]);
        setLoading(false);
        return;
      }

      console.log('[AGENDA] Event_team rows:', eventTeamRows || []);
      console.log('[AGENDA] Total de registros em event_team:', eventTeamRows?.length || 0);

      // Formatar para exibição (filtro já aplicado na query)
      const formattedItems = (eventTeamRows || [])
        .filter(row => row.event) // Garantir que o evento existe
        .map(row => ({
          id: row.event.id,
          eventTeamId: row.id,
          eventName: row.event.title,
          eventDate: row.event.event_date,
          eventTime: row.event.event_time,
          location: row.event.location,
          teamStatus: row.status,
          isRead: true,
        }));

      console.log('[AGENDA] Items formatados:', formattedItems);

      setAllAgendaItems(formattedItems);
    } catch (error) {
      console.error('[AGENDA] Erro ao carregar agenda:', error);
      setAllAgendaItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvitationResponse = async (invitation, status) => {
    try {
      if (!invitation?.eventTeamId) {
        Alert.alert('Erro', 'Convite não encontrado');
        return;
      }

      // UPDATE direto em event_team.id
      const { error: updateError } = await supabase
        .from('event_team')
        .update({ status: status === 'declined' ? 'declined' : 'confirmed' })
        .eq('id', invitation.eventTeamId);

      if (updateError) throw updateError;

      await loadAgenda();
      Alert.alert('Sucesso', status === 'declined' ? 'Convite recusado' : 'Convite confirmado');
    } catch (error) {
      console.error('Erro ao responder convite:', error);
      Alert.alert('Erro', 'Não foi possível responder ao convite');
    }
  };

  // Recarregar agenda (pull to refresh)
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAgenda();
    setRefreshing(false);
  };

  // Abrir evento do convite
  const handleOpenInvitation = async (invitation) => {
    try {
      // Marcar notificação como lida
      if (!invitation.isRead) {
        await notificationService.markAsRead(invitation.id);
      }

      // Navegar para o evento
      navigation.navigate('EventCreation', {
        eventId: invitation.eventId,
        isEditing: true
      });
    } catch (error) {
      console.error('Erro ao abrir convite:', error);
      Alert.alert('Erro', 'Não foi possível abrir o evento');
    }
  };

  // Carregar ao montar
  useEffect(() => {
    loadAgenda();
  }, []);

  // Recarregar quando a tela receber foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAgenda();
    });
    return unsubscribe;
  }, [navigation]);

  const handleScroll = useCallback((event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShowLargeTitle = offsetY <= 10;

    if (lastLargeTitleState.current !== shouldShowLargeTitle) {
      lastLargeTitleState.current = shouldShowLargeTitle;
      setShowLargeTitle(shouldShowLargeTitle);
    }
  }, [setShowLargeTitle]);

  return (
    <TabScreenWrapper activeTab="Agenda" navigation={navigation}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
      <View style={styles.content}>
        {/* Segment Control */}
        <View style={[styles.segmentContainer, isDarkMode && styles.segmentContainerDark]}>
          <TouchableOpacity 
            style={[styles.segmentButton, activeSegment === 'agenda' && styles.segmentActive, isDarkMode && styles.segmentButtonDark, activeSegment === 'agenda' && isDarkMode && styles.segmentActiveDark]}
            onPress={() => setActiveSegment('agenda')}
          >
            <Text style={[styles.segmentText, activeSegment === 'agenda' && styles.segmentTextActive, isDarkMode && styles.segmentTextDark, activeSegment === 'agenda' && isDarkMode && styles.segmentTextActiveDark]}>Agenda</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segmentButton, activeSegment === 'bloqueios' && styles.segmentActive, isDarkMode && styles.segmentButtonDark, activeSegment === 'bloqueios' && isDarkMode && styles.segmentActiveDark]}
            onPress={() => setActiveSegment('bloqueios')}
          >
            <Text style={[styles.segmentText, activeSegment === 'bloqueios' && styles.segmentTextActive, isDarkMode && styles.segmentTextDark, activeSegment === 'bloqueios' && isDarkMode && styles.segmentTextActiveDark]}>Bloqueios</Text>
          </TouchableOpacity>
        </View>
        {activeSegment === 'agenda' ? (
          <>
            {/* Agenda - Convites e Eventos */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Agenda</Text>
            </View>

            {loading ? (
              <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Carregando agenda...
                </Text>
              </View>
            ) : allAgendaItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="calendar-o" size={48} color={colors.textSecondary} style={styles.emptyIcon} />
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  Nenhum evento
                </Text>
                <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
                  Você não tem eventos na agenda no momento
                </Text>
              </View>
            ) : (
              allAgendaItems.map((invitation) => (
                <TouchableOpacity
                  key={invitation.id}
                  style={[
                    styles.eventCard, 
                    { backgroundColor: colors.card, borderColor: colors.border },
                    !invitation.isRead && { backgroundColor: colors.primary + '10' }
                  ]}
                  onPress={() => handleOpenInvitation(invitation)}
                  activeOpacity={0.7}
                >
                  <View style={styles.eventHeader}>
                    <View style={[styles.eventIconCircle, { backgroundColor: colors.primary + '20' }]}>
                      <Icon name="calendar" size={18} color={colors.primary} />
                    </View>
                    <Text style={[styles.eventTitle, { color: colors.text }]}>
                      {invitation.eventName}
                    </Text>
                    {(() => {
                      const statusType = invitation.teamStatus === 'confirmed'
                        ? 'success'
                        : invitation.teamStatus === 'declined'
                          ? 'danger'
                          : 'warning';

                      const statusText = !invitation.isRead
                        ? 'NOVO'
                        : invitation.teamStatus === 'confirmed'
                          ? 'Confirmado'
                          : invitation.teamStatus === 'declined'
                            ? 'Recusado'
                            : 'Pendente';

                      return (
                        <View
                          style={[
                            styles.statusPill,
                            !invitation.isRead
                              ? { backgroundColor: colors.primary }
                              : statusType === 'success'
                                ? styles.statusSuccess
                                : statusType === 'danger'
                                  ? styles.statusDanger
                                  : styles.statusWarning,
                          ]}
                        >
                          {!invitation.isRead ? (
                            <Icon name="bolt" size={12} color="#FFFFFF" style={{ marginRight: 6 }} />
                          ) : (
                            <Icon
                              name={statusType === 'success' ? 'check' : statusType === 'danger' ? 'close' : 'exclamation'}
                              size={12}
                              color="#FFFFFF"
                              style={{ marginRight: 6 }}
                            />
                          )}
                          <Text style={styles.statusText}>{statusText}</Text>
                        </View>
                      );
                    })()}
                  </View>
                  <View style={styles.eventMetaRow}>
                    <Icon name="calendar" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.eventMetaText, { color: colors.textSecondary }]}>
                      {new Date(invitation.eventDate).toLocaleDateString('pt-BR')} às {invitation.eventTime?.substring(0, 5)}
                    </Text>
                  </View>
                  <View style={styles.eventMetaRow}>
                    <Icon
                      name={invitation.roleName ? 'user' : 'envelope'}
                      size={14}
                      color={colors.primary}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.eventMetaText, { color: colors.textSecondary }]}>
                      {invitation.roleName ? invitation.roleName : 'Você foi convidado para este evento'}
                    </Text>
                  </View>

                  {invitation.teamStatus === 'pending' && (
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleInvitationResponse(invitation, 'confirmed')}
                        activeOpacity={0.8}
                      >
                        <Icon name="check" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.actionButtonText}>Aceitar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.declineButton]}
                        onPress={() => handleInvitationResponse(invitation, 'declined')}
                        activeOpacity={0.8}
                      >
                        <Icon name="close" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.actionButtonText}>Recusar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </>
        ) : (
          <>
            {/* Bloqueios */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Seus Bloqueios</Text>
            </View>
            <View style={[styles.eventCard, isDarkMode && styles.eventCardDark]}>
              <View style={styles.eventHeader}>
                <View style={[styles.eventIconCircle, { backgroundColor: '#FFEBEB' }]}>
                  <Icon name="ban" size={18} color="#E24C4C" />
                </View>
                <Text style={[styles.eventTitle, isDarkMode && styles.eventTitleDark]}>Domingo - Indisponível</Text>
              </View>
              <View style={styles.eventMetaRow}>
                <Icon name="calendar" size={14} color="#E24C4C" style={{ marginRight: 6 }} />
                <Text style={[styles.eventMetaText, { color: '#E24C4C' }, isDarkMode && styles.eventMetaTextDark]}>10/09/2024 - Dia todo</Text>
              </View>
              <View style={styles.eventMetaRow}>
                <Icon name="sticky-note" size={14} color="#E24C4C" style={{ marginRight: 6 }} />
                <Text style={[styles.eventMetaText, { color: '#E24C4C' }, isDarkMode && styles.eventMetaTextDark]}>Viagem familiar</Text>
              </View>
            </View>
            <View style={[styles.eventCard, isDarkMode && styles.eventCardDark]}>
              <View style={styles.eventHeader}>
                <View style={[styles.eventIconCircle, { backgroundColor: '#FFEBEB' }]}>
                  <Icon name="ban" size={18} color="#E24C4C" />
                </View>
                <Text style={[styles.eventTitle, isDarkMode && styles.eventTitleDark]}>Quarta - Indisponível</Text>
              </View>
              <View style={styles.eventMetaRow}>
                <Icon name="calendar" size={14} color="#E24C4C" style={{ marginRight: 6 }} />
                <Text style={[styles.eventMetaText, { color: '#E24C4C' }, isDarkMode && styles.eventMetaTextDark]}>20/09/2024 - Noite</Text>
              </View>
              <View style={styles.eventMetaRow}>
                <Icon name="sticky-note" size={14} color="#E24C4C" style={{ marginRight: 6 }} />
                <Text style={[styles.eventMetaText, { color: '#E24C4C' }, isDarkMode && styles.eventMetaTextDark]}>Compromisso de trabalho</Text>
              </View>
            </View>
          </>
        )}

      </View>
    </ScrollView>
    </TabScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E4E6EB',
    borderRadius: 8,
    marginBottom: 16,
    padding: 2,
  },
  segmentContainerDark: {
    backgroundColor: '#38383A',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentButtonDark: {
    backgroundColor: 'transparent',
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentActiveDark: {
    backgroundColor: '#2C2C2E',
  },
  segmentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#65676B',
  },
  segmentTextDark: {
    color: '#A0A0A5',
  },
  segmentTextActive: {
    color: '#1877F2',
    fontWeight: '700',
  },
  segmentTextActiveDark: {
    color: '#1877F2',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#2C2C2E',
  },
  cardImage: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#050505',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  description: {
    fontSize: 16,
    color: '#65676B',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Inter',
  },
  descriptionDark: {
    color: '#A0A0A5',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#050505',
    fontFamily: 'Inter',
  },
  cardText: {
    fontSize: 15,
    color: '#65676B',
    fontFamily: 'Inter',
  },
  eventItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
  },
  eventDate: {
    fontSize: 13,
    color: '#65676B',
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  eventName: {
    fontSize: 16,
    color: '#050505',
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  sectionHeader: {
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F1B2A',
    fontFamily: 'Inter',
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
    elevation: 2,
  },
  eventCardDark: {
    backgroundColor: '#2C2C2E',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  eventTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1E21',
    fontFamily: 'Inter',
  },
  eventTitleDark: {
    color: '#FFFFFF',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
  },
  statusSuccess: { backgroundColor: '#22A06B' },
  statusWarning: { backgroundColor: '#F59E0B' },
  statusDanger: { backgroundColor: '#E24C4C' },
  statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', fontFamily: 'Inter' },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventMetaText: {
    fontSize: 14,
    color: '#1877F2',
    fontFamily: 'Inter',
  },
  eventMetaTextDark: {
    opacity: 0.9,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  acceptButton: { backgroundColor: '#22A06B' },
  declineButton: { backgroundColor: '#E24C4C' },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});

export default HomeScreen;
