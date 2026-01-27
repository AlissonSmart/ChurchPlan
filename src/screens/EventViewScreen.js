import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  useColorScheme,
  Animated,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { BlurView } from '@react-native-community/blur';
import theme from '../styles/theme';
import supabase from '../services/supabase';


const HEADER_MAX_HEIGHT = 200;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - 56;

// Helper to generate public URL for event cover image (same logic as EventCreationScreen)
const getEventCoverUrl = (imagePath, directUrl) => {
  if (directUrl) {
    return directUrl;
  }
  if (!imagePath) return null;
  try {
    const { data } = supabase.storage
      .from('event-images')
      .getPublicUrl(imagePath);
    return data?.publicUrl ?? null;
  } catch (error) {
    console.error('Erro ao gerar URL da capa do evento:', error);
    return null;
  }
};

const EventViewScreen = ({ route, navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const {
    eventId,
    eventTitle,
    eventName,
    eventDate,
    eventTime,
    location,
    bannerImageUrl,
  } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('steps');
  const [eventDetails, setEventDetails] = useState(null);
  const [steps, setSteps] = useState([]);
  const [stepItems, setStepItems] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [activeSongTab, setActiveSongTab] = useState('info');
  const [coverImageUrl, setCoverImageUrl] = useState(bannerImageUrl || null);

  const scrollY = React.useRef(new Animated.Value(0)).current;
  const skeletonOpacity = React.useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    navigation.setOptions({
      title: eventTitle || eventName || 'Detalhes do Evento',
    });

    loadEventData();
  }, [eventId, eventTitle, eventName, navigation]);

  // Animação do skeleton
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonOpacity, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading]);

  const loadEventData = async () => {
    try {
      setLoading(true);

      if (!eventId) {
        setLoading(false);
        return;
      }

      // Buscar dados do evento
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;
      setEventDetails(event);

      const coverUrl = getEventCoverUrl(
        event.cover_image_path,
        event.cover_image_url ||
          event.header_image_url ||
          event.banner_image_url ||
          event.image_url
      );
      setCoverImageUrl(coverUrl);

      // Buscar etapas (cabeçalhos)
      const { data: stepsData, error: stepsError } = await supabase
        .from('event_steps')
        .select('*')
        .eq('event_id', eventId)
        .order('step_order', { ascending: true });

      if (!stepsError && stepsData) {
        setSteps(stepsData);
        
        // Buscar itens de cada etapa
        const stepIds = stepsData.map(s => s.id);
        if (stepIds.length > 0) {
          const { data: itemsData, error: itemsError } = await supabase
            .from('step_items')
            .select('id, step_id, title, subtitle, item_time, item_order, duration_minutes, participants')
            .in('step_id', stepIds)
            .order('item_order', { ascending: true });

          if (!itemsError && itemsData) {
            // Organizar itens por step_id
            const itemsByStep = {};
            itemsData.forEach(item => {
              if (!itemsByStep[item.step_id]) {
                itemsByStep[item.step_id] = [];
              }
              itemsByStep[item.step_id].push(item);
            });
            setStepItems(itemsByStep);
          }
        }
      }

      // Buscar membros da equipe
      const { data: teamData, error: teamError } = await supabase
        .from('event_team')
        .select(`
          id,
          status,
          volunteer:profiles(id, name),
          role:roles(id, name)
        `)
        .eq('event_id', eventId);

      if (!teamError) {
        setTeamMembers(teamData || []);
      }

      // Buscar horários extras
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('extra_schedules')
        .select('*')
        .eq('event_id', eventId)
        .order('schedule_date', { ascending: true });

      if (!schedulesError) {
        setSchedules(schedulesData || []);
      }

      // Buscar músicas do evento
      const { data: songsData, error: songsError } = await supabase
        .from('event_songs')
        .select('id, song:songs(*)')
        .eq('event_id', eventId);
      if (!songsError) {
        setSongs(songsData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do evento:', error);
    } finally {
      setLoading(false);
    }
  };

  // Skeleton Component
  const SkeletonBox = ({ width, height, style }) => (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          borderRadius: 8,
          opacity: skeletonOpacity,
        },
        style,
      ]}
    />
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView>
          {/* Banner Skeleton */}
          <SkeletonBox width="100%" height={HEADER_MAX_HEIGHT} style={{ borderRadius: 0 }} />

          {/* Title Skeleton */}
          <View style={styles.titleContainer}>
            <SkeletonBox width="70%" height={28} style={{ marginBottom: 8 }} />
            <SkeletonBox width="50%" height={16} />
          </View>

          {/* Tabs Skeleton */}
          <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
            <View style={styles.tabButton}>
              <SkeletonBox width={80} height={20} />
            </View>
            <View style={styles.tabButton}>
              <SkeletonBox width={80} height={20} />
            </View>
            <View style={styles.tabButton}>
              <SkeletonBox width={80} height={20} />
            </View>
            <View style={styles.tabButton}>
              <SkeletonBox width={80} height={20} />
            </View>
          </View>

          {/* Content Skeleton */}
          <View style={styles.tabContent}>
            {/* Step Cards Skeleton */}
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.stepSection,
                  { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 16 },
                ]}
              >
                <View style={styles.stepHeader}>
                  <SkeletonBox width={32} height={32} style={{ borderRadius: 16, marginRight: 10 }} />
                  <SkeletonBox width="60%" height={18} />
                </View>
                <View style={{ padding: 12 }}>
                  <SkeletonBox width="100%" height={16} style={{ marginBottom: 8 }} />
                  <SkeletonBox width="80%" height={16} style={{ marginBottom: 8 }} />
                  <SkeletonBox width="90%" height={16} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  const event = eventDetails || {};
  const title = event.title || eventTitle || eventName;
  const date = event.event_date || eventDate;
  const time = (event.event_time || eventTime || '').substring(0, 5);
  const local = event.location || location || 'Local não informado';
  const banner =
    coverImageUrl ||
    event.header_image_url ||
    event.banner_image_url ||
    event.cover_image_url ||
    event.image_url ||
    event.bannerUrl ||
    event.imageUrl ||
    bannerImageUrl;

  const headerHeight = scrollY.interpolate({
    inputRange: [-HEADER_MAX_HEIGHT, 0],
    outputRange: [HEADER_MAX_HEIGHT * 2, HEADER_MAX_HEIGHT],
    extrapolate: 'clamp',
  });

  // Animação do header translúcido (aparece ao rolar)
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - 100, HEADER_MAX_HEIGHT - 50],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - 80, HEADER_MAX_HEIGHT - 40],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed Header com Blur - Estilo Apple */}
      <Animated.View
        style={[
          styles.fixedHeader,
          {
            opacity: headerOpacity,
          },
        ]}
        pointerEvents="box-none"
      >
        {Platform.OS === 'ios' ? (
          <BlurView
            style={styles.blurView}
            blurType={isDarkMode ? 'dark' : 'light'}
            blurAmount={10}
            reducedTransparencyFallbackColor={isDarkMode ? '#1a1a1a' : '#ffffff'}
          />
        ) : (
          <View
            style={[
              styles.blurView,
              {
                backgroundColor: isDarkMode
                  ? 'rgba(26, 26, 26, 0.9)'
                  : 'rgba(255, 255, 255, 0.9)',
              },
            ]}
          />
        )}
        
        {/* Título do Header */}
        <Animated.View
          style={[
            styles.headerTitleContainer,
            { opacity: headerTitleOpacity },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Botão Voltar Fixo */}
      <View style={styles.fixedBackContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.fixedBackButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <FeatherIcon name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >

        {/* Banner */}
        <Animated.View
          style={[
            styles.bannerContainer,
            {
              height: headerHeight,
            },
          ]}
        >
          {banner ? (
            <Animated.Image
              source={{ uri: banner }}
              style={[
                styles.banner,
                {
                  transform: [
                    {
                      translateY: scrollY.interpolate({
                        inputRange: [-HEADER_MAX_HEIGHT, 0, HEADER_SCROLL_DISTANCE],
                        outputRange: [-HEADER_MAX_HEIGHT / 2, 0, HEADER_SCROLL_DISTANCE * 0.5],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.bannerPlaceholder, { backgroundColor: colors.card }]}>
              <Icon name="calendar" size={40} color={colors.primary} />
            </View>
          )}
        </Animated.View>

        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={[styles.titleDisplay, { color: colors.text }]}>
            {title}
          </Text>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'steps' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('steps')}
          >
            <Icon
              name="list"
              size={18}
              color={activeTab === 'steps' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'steps' ? colors.primary : colors.textSecondary },
              ]}
            >
              Etapas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'team' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('team')}
          >
            <Icon
              name="users"
              size={18}
              color={activeTab === 'team' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'team' ? colors.primary : colors.textSecondary },
              ]}
            >
              Equipe
            </Text>
          </TouchableOpacity>

          {/* Músicas Tab */}
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'songs' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('songs')}
          >
            <Icon
              name="music"
              size={18}
              color={activeTab === 'songs' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'songs' ? colors.primary : colors.textSecondary },
              ]}
            >
              Músicas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'schedule' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('schedule')}
          >
            <Icon
              name="clock-o"
              size={18}
              color={activeTab === 'schedule' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'schedule' ? colors.primary : colors.textSecondary },
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
              {steps.length === 0 ? (
                <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
                  <Icon name="list" size={48} color={colors.textSecondary} style={{ opacity: 0.3, marginBottom: 16 }} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>Nenhuma etapa</Text>
                </View>
              ) : (
                steps.map((step) => {
                  const items = stepItems[step.id] || [];
                  return (
                    <View key={step.id} style={[styles.stepSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      {/* Cabeçalho da Etapa */}
                      <View style={styles.stepHeader}>
                        <View style={[styles.stepIconContainer, { backgroundColor: colors.primary + '20' }]}>
                          <Icon name="list" size={16} color={colors.primary} />
                        </View>
                        <Text style={[styles.stepHeaderTitle, { color: colors.text }]}>{step.title}</Text>
                      </View>

                      {/* Itens da Etapa */}
                      {items.length > 0 ? (
                        <View style={styles.stepItemsList}>
                          {items.map((item, index) => (
                            <View key={item.id} style={[styles.stepItemCard, { borderBottomColor: colors.border }]}>
                              {/* Linha principal: Horário + Título + Duração */}
                              <View style={styles.stepItemMainRow}>
                                {item.item_time && (
                                  <Text style={[styles.itemTime, { color: colors.primary }]}>
                                    {item.item_time.substring(0, 5)}
                                  </Text>
                                )}
                                <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
                                  {item.title}
                                </Text>
                                {item.duration_minutes > 0 && (
                                  <View style={styles.durationContainer}>
                                    <Icon name="clock-o" size={12} color={colors.textSecondary} />
                                    <Text style={[styles.itemDuration, { color: colors.textSecondary }]}>
                                      {item.duration_minutes} min
                                    </Text>
                                  </View>
                                )}
                              </View>

                              {/* Subtítulo */}
                              {item.subtitle && (
                                <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>
                                  {item.subtitle}
                                </Text>
                              )}

                              {/* Participantes */}
                              {item.participants && item.participants.length > 0 && (
                                <View style={styles.participantsRow}>
                                  <Icon name="user" size={12} color={colors.textSecondary} style={{ marginRight: 6 }} />
                                  <View style={styles.participantsList}>
                                    {item.participants.map((participant, idx) => (
                                      <View key={idx} style={[styles.participantTag, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                                        <Text style={[styles.participantText, { color: colors.primary }]}>
                                          {participant}
                                        </Text>
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={[styles.noItemsText, { color: colors.textSecondary }]}>
                          Nenhum item nesta etapa
                        </Text>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          )}

          {activeTab === 'team' && (
            <View style={styles.teamContainer}>
              {teamMembers.length === 0 ? (
                <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
                  <Icon name="users" size={48} color={colors.textSecondary} style={{ opacity: 0.3, marginBottom: 16 }} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>Nenhum membro</Text>
                </View>
              ) : (
                teamMembers.map((member) => (
                  <View key={member.id} style={[styles.memberCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: colors.text }]}>
                        {member.volunteer?.name || 'Sem nome'}
                      </Text>
                      <Text style={[styles.memberRole, { color: colors.textSecondary }]}>
                        {member.role?.name || 'Sem função'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        member.status === 'confirmed'
                          ? styles.statusConfirmed
                          : member.status === 'pending'
                          ? styles.statusPending
                          : styles.statusDeclined,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {member.status === 'confirmed'
                          ? 'Confirmado'
                          : member.status === 'pending'
                          ? 'Pendente'
                          : 'Recusado'}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Songs Tab Content */}
          {activeTab === 'songs' && (
            <View style={styles.songsContainer}>
              {songs.length === 0 ? (
                <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
                  <Icon name="music" size={48} color={colors.textSecondary} style={{ opacity: 0.3, marginBottom: 16 }} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>Nenhuma música</Text>
                </View>
              ) : (
                songs.map((item) => {
                  const song = item.song || item;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.songCard, { backgroundColor: colors.card }]}
                      onPress={() => {
                        setSelectedSong(song);
                        setActiveSongTab('info');
                      }}
                    >
                      <View style={styles.songInfo}>
                        <Text style={[styles.songTitle, { color: colors.text }]}>{song.title || 'Sem título'}</Text>
                        {!!song.artist && (
                          <Text style={[styles.songArtist, { color: colors.textSecondary }]}>{song.artist}</Text>
                        )}
                      </View>
                      <Icon name="chevron-right" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}

          {activeTab === 'schedule' && (
            <View style={styles.scheduleContainer}>
              {/* Evento Principal */}
              <View style={[styles.scheduleSection, { backgroundColor: colors.card }]}>
                <Text style={[styles.scheduleSectionTitle, { color: colors.text }]}>
                  Evento Principal
                </Text>
                
                <View style={styles.scheduleInfoRow}>
                  <Text style={[styles.scheduleLabel, { color: colors.textSecondary }]}>
                    Título:
                  </Text>
                  <Text style={[styles.scheduleValue, { color: colors.text }]}>
                    {title}
                  </Text>
                </View>

                <View style={styles.scheduleInfoRow}>
                  <Text style={[styles.scheduleLabel, { color: colors.textSecondary }]}>
                    Data:
                  </Text>
                  <Text style={[styles.scheduleValue, { color: colors.text }]}>
                    {date ? new Date(date).toLocaleDateString('pt-BR') : 'Não informada'}
                  </Text>
                </View>

                <View style={styles.scheduleInfoRow}>
                  <Text style={[styles.scheduleLabel, { color: colors.textSecondary }]}>
                    Horário:
                  </Text>
                  <Text style={[styles.scheduleValue, { color: colors.text }]}>
                    {time || 'Não informado'}
                  </Text>
                </View>

                {event.duration_minutes && (
                  <View style={styles.scheduleInfoRow}>
                    <Text style={[styles.scheduleLabel, { color: colors.textSecondary }]}>
                      Duração:
                    </Text>
                    <Text style={[styles.scheduleValue, { color: colors.text }]}>
                      {event.duration_minutes} minutos
                    </Text>
                  </View>
                )}

                <View style={styles.scheduleInfoRow}>
                  <Text style={[styles.scheduleLabel, { color: colors.textSecondary }]}>
                    Local:
                  </Text>
                  <Text style={[styles.scheduleValue, { color: colors.text }]}>
                    {local}
                  </Text>
                </View>

                {event.description && (
                  <View style={styles.scheduleDescriptionContainer}>
                    <Text style={[styles.scheduleLabel, { color: colors.textSecondary }]}>
                      Descrição:
                    </Text>
                    <Text style={[styles.scheduleDescription, { color: colors.text }]}>
                      {event.description}
                    </Text>
                  </View>
                )}

                {event.status && (
                  <View style={styles.scheduleInfoRow}>
                    <Text style={[styles.scheduleLabel, { color: colors.textSecondary }]}>
                      Status:
                    </Text>
                    <Text style={[styles.scheduleValue, { color: colors.text }]}>
                      {event.status === 'published' ? 'Publicado' : event.status === 'draft' ? 'Rascunho' : event.status}
                    </Text>
                  </View>
                )}
              </View>

              {/* Horários Extras */}
              {schedules.length > 0 && (
                <View style={[styles.scheduleSection, { backgroundColor: colors.card }]}>
                  <Text style={[styles.scheduleSectionTitle, { color: colors.text }]}>
                    Horários Extras
                  </Text>
                  {schedules.map((schedule) => (
                    <View key={schedule.id} style={styles.scheduleExtraCard}>
                      <Text style={[styles.scheduleExtraTitle, { color: colors.text }]}>
                        {schedule.title}
                      </Text>
                      <Text style={[styles.scheduleExtraDate, { color: colors.textSecondary }]}>
                        {new Date(schedule.schedule_date).toLocaleDateString('pt-BR')} às{' '}
                        {schedule.schedule_time.substring(0, 5)}
                      </Text>
                      {schedule.location && (
                        <View style={styles.scheduleExtraLocationRow}>
                          <Icon name="map-marker" size={14} color={colors.primary} />
                          <Text style={[styles.scheduleExtraLocation, { color: colors.textSecondary }]}>
                            {schedule.location}
                          </Text>
                        </View>
                      )}
                      {schedule.description && (
                        <Text style={[styles.scheduleExtraDescription, { color: colors.textSecondary }]}>
                          {schedule.description}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </Animated.ScrollView>
      {/* Song Details Modal */}
      {selectedSong && (
        <Modal
          visible={!!selectedSong}
          animationType="slide"
          onRequestClose={() => setSelectedSong(null)}
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.modalBackButton} onPress={() => setSelectedSong(null)}>
                <Icon name="chevron-left" size={18} color={colors.primary} />
                <Text style={[styles.modalBackText, { color: colors.primary }]}>Voltar</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
                {selectedSong.title || 'Música'}
              </Text>
            </View>

            <View style={styles.modalTabsRow}>
              <TouchableOpacity
                style={[styles.modalTabButton, activeSongTab === 'info' && styles.modalTabButtonActive]}
                onPress={() => setActiveSongTab('info')}
              >
                <Text style={[styles.modalTabText, activeSongTab === 'info' && styles.modalTabTextActive]}>Infos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalTabButton, activeSongTab === 'data' && styles.modalTabButtonActive]}
                onPress={() => setActiveSongTab('data')}
              >
                <Text style={[styles.modalTabText, activeSongTab === 'data' && styles.modalTabTextActive]}>Dados</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalTabButton, activeSongTab === 'chords' && styles.modalTabButtonActive]}
                onPress={() => setActiveSongTab('chords')}
              >
                <Text style={[styles.modalTabText, activeSongTab === 'chords' && styles.modalTabTextActive]}>Cifra</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalTabButton, activeSongTab === 'attachments' && styles.modalTabButtonActive]}
                onPress={() => setActiveSongTab('attachments')}
              >
                <Text style={[styles.modalTabText, activeSongTab === 'attachments' && styles.modalTabTextActive]}>Anexo</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
              {activeSongTab === 'info' && (
                <View>
                  <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Título da música</Text>
                  <Text style={[styles.modalValue, { color: colors.text }]}>{selectedSong.title || '-'}</Text>
                  <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Artista/Banda</Text>
                  <Text style={[styles.modalValue, { color: colors.text }]}>{selectedSong.artist || '-'}</Text>
                  {!!selectedSong.observation && (
                    <>
                      <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Observação</Text>
                      <Text style={[styles.modalValue, { color: colors.text }]}>{selectedSong.observation}</Text>
                    </>
                  )}
                  {!!selectedSong.category && (
                    <>
                      <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Categoria</Text>
                      <Text style={[styles.modalValue, { color: colors.text }]}>{selectedSong.category}</Text>
                    </>
                  )}
                </View>
              )}

              {activeSongTab === 'data' && (
                <View>
                  <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>BPM</Text>
                  <Text style={[styles.modalValue, { color: colors.text }]}>{selectedSong.bpm || '-'}</Text>
                  <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Assinatura</Text>
                  <Text style={[styles.modalValue, { color: colors.text }]}>{selectedSong.time_signature || '-'}</Text>
                  <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Tom</Text>
                  <Text style={[styles.modalValue, { color: colors.text }]}>{selectedSong.key || '-'}</Text>
                  <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Duração (minutos)</Text>
                  <Text style={[styles.modalValue, { color: colors.text }]}>{selectedSong.duration || '-'}</Text>
                </View>
              )}

              {activeSongTab === 'chords' && (
                <View>
                  <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Letra com cifra</Text>
                  <Text style={[styles.chordsText, { color: colors.text }]} selectable>
                    {selectedSong.lyrics_chords || 'Sem cifra cadastrada.'}
                  </Text>
                </View>
              )}

              {activeSongTab === 'attachments' && (
                <View>
                  <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Vídeo do YouTube</Text>
                  <Text style={[styles.modalValue, { color: colors.text }]}>{selectedSong.youtube_url || '-'}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  bannerContainer: {
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: HEADER_MAX_HEIGHT,
  },
  bannerPlaceholder: {
    width: '100%',
    height: HEADER_MAX_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  titleDisplay: {
    fontSize: 24,
    fontWeight: '800',
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
    paddingBottom: 20,
  },
  stepsContainer: {
    flex: 1,
  },
  stepSection: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  stepIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  stepItemsList: {
    padding: 8,
  },
  stepItemCard: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  stepItemMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 12,
    minWidth: 45,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemDuration: {
    fontSize: 12,
    marginLeft: 4,
  },
  itemSubtitle: {
    fontSize: 13,
    marginLeft: 57,
    marginBottom: 4,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 57,
    marginTop: 6,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  participantTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  participantText: {
    fontSize: 11,
    fontWeight: '600',
  },
  noItemsText: {
    fontSize: 13,
    fontStyle: 'italic',
    padding: 12,
    textAlign: 'center',
  },
  teamContainer: {
    flex: 1,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderBottomWidth: 1,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusConfirmed: {
    backgroundColor: '#22A06B',
  },
  statusPending: {
    backgroundColor: '#F59E0B',
  },
  statusDeclined: {
    backgroundColor: '#E24C4C',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleContainer: {
    flex: 1,
  },
  scheduleSection: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  scheduleSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  scheduleInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scheduleLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  scheduleDescriptionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  scheduleDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  scheduleExtraCard: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  scheduleExtraTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  scheduleExtraDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  scheduleExtraLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleExtraLocation: {
    fontSize: 12,
    marginLeft: 6,
  },
  scheduleExtraDescription: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 70,
    zIndex: 100,
    overflow: 'hidden',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerTitleContainer: {
    position: 'absolute',
    bottom: 12,
    left: 60,
    right: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  fixedBackContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    zIndex: 101,
  },
  fixedBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  songsContainer: {
    flex: 1,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  songInfo: {
    flex: 1,
    marginRight: 8,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  songArtist: {
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  modalBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  modalBackText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  modalTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  modalTabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  modalTabButtonActive: {
    backgroundColor: '#5E5CEC',
  },
  modalTabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalTabTextActive: {
    color: '#FFFFFF',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  modalBodyContent: {
    paddingBottom: 24,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 14,
  },
  chordsText: {
    fontSize: 12,
    lineHeight: 18,
    paddingVertical: 8,
  },
});

export default EventViewScreen;