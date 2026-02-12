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
  Dimensions,
  ActivityIndicator,
  Animated,
  PanResponder
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const HEADER_MAX_HEIGHT = 240;
const HEADER_MIN_HEIGHT = 180;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import theme from '../styles/theme';
import StepEditorModal from '../components/StepEditorModal';
import StepItemEditorModal from '../components/StepItemEditorModal';
import AddTeamMemberModal from '../components/AddTeamMemberModal';
import eventService from '../services/eventService';
import notificationService from '../services/notificationService';
import supabase from '../services/supabase';

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
  const { templateId, eventData, eventId, isEditing } = route.params || {};
  
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
  const [teamMembers, setTeamMembers] = useState([]);
  const [technicalTeam, setTechnicalTeam] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  // Estados para foto de capa
  const [coverImagePath, setCoverImagePath] = useState(eventData?.cover_image_path || null);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  
  // Animated value para parallax
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header cresce quando puxa pra baixo, mas não encolhe quando rola pra cima
  const headerHeight = scrollY.interpolate({
    inputRange: [-HEADER_MAX_HEIGHT, 0],
    outputRange: [HEADER_MAX_HEIGHT * 2, HEADER_MAX_HEIGHT],
    extrapolate: 'clamp',
  });
  
  const [steps, setSteps] = useState([]);
  
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const clean = timeStr.trim();
    if (!clean) return null;

    const parts = clean.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10) || 0;
      if (Number.isNaN(hours) || hours < 0) return null;
      return hours * 60 + minutes;
    }

    if (clean.length === 4 && !Number.isNaN(parseInt(clean, 10))) {
      const hours = parseInt(clean.slice(0, 2), 10);
      const minutes = parseInt(clean.slice(2), 10);
      return hours * 60 + minutes;
    }

    return null;
  };

  const minutesToTimeStr = (totalMinutes) => {
    if (totalMinutes == null || Number.isNaN(totalMinutes)) return '00:00';
    let m = Math.max(0, Math.floor(totalMinutes));
    const hours = Math.floor(m / 60) % 24;
    const minutes = m % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const recalcItemTimes = (stepsArray) => {
    if (!stepsArray || !stepsArray.length) return stepsArray;

    let currentTimeMinutes = 0;

    if (eventData?.time instanceof Date) {
      currentTimeMinutes = eventData.time.getHours() * 60 + eventData.time.getMinutes();
    } else if (typeof eventData?.time === 'string') {
      const parsed = parseTimeToMinutes(eventData.time);
      if (parsed !== null) currentTimeMinutes = parsed;
    }

    const newSteps = stepsArray.map(step => {
      const newItems = (step.items || []).map(item => {
        const explicit = item.hasExplicitTime && item.time;
        let updatedItem = { ...item };

        if (explicit) {
          const parsed = parseTimeToMinutes(item.time);
          if (parsed !== null) {
            currentTimeMinutes = parsed;
          } else if (!updatedItem.time) {
            updatedItem.time = minutesToTimeStr(currentTimeMinutes);
          }
        } else {
          updatedItem.time = minutesToTimeStr(currentTimeMinutes);
        }

        const dur =
          updatedItem.duration !== undefined &&
          updatedItem.duration !== null &&
          updatedItem.duration !== ''
            ? parseInt(updatedItem.duration, 10)
            : 0;

        if (!Number.isNaN(dur) && dur > 0) {
          currentTimeMinutes += dur;
        }

        return updatedItem;
      });

      return { ...step, items: newItems };
    });

    return newSteps;
  };
  
  // Lista de músicas vinda do banco
  const [songs, setSongs] = useState([]);
  const [songSearch, setSongSearch] = useState('');
  // Carregar lista de músicas do banco
  useEffect(() => {
    const loadSongs = async () => {
      try {
        const { data, error } = await supabase
          .from('songs')
          .select('id, title, artist, category, duration_minutes')
          .order('title', { ascending: true });

        if (error) {
          console.error('Erro ao carregar músicas:', error);
          return;
        }

        const mapped = (data || []).map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artist || '',
          time: '',
          duration: song.duration_minutes !== null && song.duration_minutes !== undefined
            ? String(song.duration_minutes)
            : '',
          tags: song.category ? [song.category] : []
        }));

        setSongs(mapped);
      } catch (err) {
        console.error('Erro inesperado ao carregar músicas:', err);
      }
    };

    loadSongs();
  }, []);
  const filteredSongs = songs.filter((song) => {
    if (!songSearch.trim()) return true;
    const q = songSearch.trim().toLowerCase();
    return (
      (song.title || '').toLowerCase().includes(q) ||
      (song.artist || '').toLowerCase().includes(q) ||
      (song.tags || []).some(tag => (tag || '').toLowerCase().includes(q))
    );
  });
  
  // Carregar membros da equipe do evento
  const loadEventTeam = async () => {
    if (!eventId) {
      setTeamMembers([]);
      setTechnicalTeam([]);
      return;
    }

    try {
      setLoadingTeam(true);

      const { data, error } = await supabase
        .from('event_team')
        .select(`
          id,
          status,
          invitation_sent_at,
          response_at,
          is_highlighted,
          volunteer_id,
          role_id
        `)
        .eq('event_id', eventId);

      if (error) throw error;

      const volunteerIds = [...new Set((data || []).map(m => m.volunteer_id).filter(Boolean))];
      const roleIds = [...new Set((data || []).map(m => m.role_id).filter(Boolean))];

      let volunteers = [];
      let profiles = [];
      let roles = [];

      if (volunteerIds.length) {
        const { data: volunteersData } = await supabase
          .from('volunteers')
          .select('id, profile_id')
          .in('id', volunteerIds);
        volunteers = volunteersData || [];
      }

      const profileIds = [...new Set(volunteers.map(v => v.profile_id).filter(Boolean))];

      if (profileIds.length) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name, email, avatar_url')
          .in('id', profileIds);
        profiles = profilesData || [];
      }

      if (roleIds.length) {
        const { data: rolesData } = await supabase
          .from('roles')
          .select('id, name')
          .in('id', roleIds);
        roles = rolesData || [];
      }

      const volunteerMap = (volunteers || []).reduce((acc, v) => {
        acc[v.id] = v;
        return acc;
      }, {});

      const profileMap = (profiles || []).reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});

      const roleMap = (roles || []).reduce((acc, r) => {
        acc[r.id] = r;
        return acc;
      }, {});

      const formattedMembers = (data || []).map(member => {
        const volunteer = member.volunteer_id ? volunteerMap[member.volunteer_id] : null;
        const profile = volunteer?.profile_id ? profileMap[volunteer.profile_id] : null;
        const role = member.role_id ? roleMap[member.role_id] : null;

        return {
          id: member.id,
          volunteer_id: member.volunteer_id,
          profile_id: volunteer?.profile_id || null,
          name: profile?.name || 'Usuário',
          email: profile?.email || '',
          avatar_url: profile?.avatar_url || null,
          role: role?.name || 'Sem função',
          status: member.status || 'not_sent',
          highlighted: member.is_highlighted || false,
        };
      });

      setTeamMembers(formattedMembers);
      setTechnicalTeam([]);
    } catch (error) {
      console.error('Erro ao carregar equipe:', error);
    } finally {
      setLoadingTeam(false);
    }
  };

  // Efeito para carregar dados do formulário/template
  useEffect(() => {
    // Se temos dados do formulário, usar esses dados
    if (eventData) {
      setEventTitle(eventData.name || '');
      setCoverImagePath(eventData.cover_image_path || null);
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

  // Carregar dados completos do evento quando eventId mudar
  useEffect(() => {
    const loadEventData = async () => {
      if (eventId && isEditing) {
        try {
          const eventDetails = await eventService.getEventById(eventId);
          if (eventDetails) {
            setEventTitle(eventDetails.title || '');
            setCoverImagePath(eventDetails.cover_image_path || null);
          }
        } catch (error) {
          console.error('Erro ao carregar dados do evento:', error);
        }
      }
    };

    loadEventData();
    loadEventTeam();
  }, [eventId, isEditing]);

  // Carregar etapas e itens do evento
  useEffect(() => {
    const loadEventStructure = async () => {
      if (!eventId) {
        setSteps([]);
        return;
      }

      try {
        const { data: stepsData, error: stepsError } = await supabase
          .from('event_steps')
          .select('id, title, step_order')
          .eq('event_id', eventId)
          .order('step_order', { ascending: true });

        if (stepsError) throw stepsError;

        if (!stepsData || stepsData.length === 0) {
          setSteps([]);
          return;
        }

        const stepIds = stepsData.map(s => s.id);

        const { data: itemsData, error: itemsError } = await supabase
          .from('step_items')
          .select('id, step_id, title, subtitle, item_time, item_order, duration_minutes, participants')
          .in('step_id', stepIds)
          .order('item_order', { ascending: true });

        if (itemsError) throw itemsError;

        const itemsByStep = {};
        (itemsData || []).forEach(item => {
          if (!itemsByStep[item.step_id]) itemsByStep[item.step_id] = [];
          itemsByStep[item.step_id].push({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            duration: item.duration_minutes !== null && item.duration_minutes !== undefined
              ? String(item.duration_minutes)
              : '',
            time: item.item_time || '',
            participants: item.participants || [],
            hasExplicitTime: !!item.item_time,
          });
        });

        const formattedSteps = stepsData.map(step => ({
          id: step.id,
          title: step.title,
          time: '',
          items: itemsByStep[step.id] || [],
        }));

        setSteps(recalcItemTimes(formattedSteps));
      } catch (err) {
        console.error('Erro ao carregar etapas do evento:', err);
      }
    };

    loadEventStructure();
  }, [eventId]);
  
  // Função para salvar o evento
  const handleSaveEvent = async () => {
    try {
      // Verificar se tem dados do evento
      if (!eventData || !eventData.name || !eventData.date || !eventData.time) {
        Alert.alert('Erro', 'Dados do evento incompletos');
        return;
      }

      // Buscar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }

      // Converter Date para string no formato correto
      const eventDate = eventData.date instanceof Date ? eventData.date : new Date(eventData.date);
      const eventTime = eventData.time instanceof Date ? eventData.time : new Date(eventData.time);
      
      // Formatar data (YYYY-MM-DD)
      const formattedDate = eventDate.toISOString().split('T')[0];
      
      // Formatar hora (HH:MM:SS)
      const hours = String(eventTime.getHours()).padStart(2, '0');
      const minutes = String(eventTime.getMinutes()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}:00`;

      const eventPayload = {
        title: eventData.name,
        description: eventData.description || '',
        event_date: formattedDate,
        event_time: formattedTime,
        duration_minutes: eventData.duration || 60,
        location: eventData.location || '',
        template_id: templateId || null,
        status: 'published',
        cover_image_path: coverImagePath || null,
      };

      let result;
      if (isEditing && eventId) {
        // Atualizar evento existente
        result = await eventService.updateEvent(eventId, eventPayload);
        console.log('Evento atualizado:', result);
        Alert.alert('Sucesso', 'Evento atualizado com sucesso!');
      } else {
        // Criar novo evento
        result = await eventService.createEvent({
          ...eventPayload,
          created_by: user.id
        });
        console.log('Evento criado:', result);
        Alert.alert('Sucesso', 'Evento salvo com sucesso!');
      }

      return result;
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      Alert.alert('Erro', 'Não foi possível salvar o evento');
      return null;
    }
  };

  // Função para escolher origem da foto (galeria ou câmera)
  const handleSelectCoverSource = () => {
    if (!eventId && !eventData?.id) {
      Alert.alert('Atenção', 'Salve o evento antes de adicionar a foto de capa.');
      return;
    }

    Alert.alert(
      'Foto do evento',
      'Escolha de onde pegar a imagem',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galeria', onPress: () => pickCoverImage('library') },
        { text: 'Câmera', onPress: () => pickCoverImage('camera') },
      ],
    );
  };

  // Função que abre fototeca/câmera e faz upload pro Supabase
  const pickCoverImage = async (source) => {
    try {
      // Segurança: se o native module não estiver ligado, evita crash e mostra alerta claro
      if (!launchCamera || !launchImageLibrary) {
        Alert.alert(
          'Erro de configuração',
          'O módulo de imagem não está configurado no iOS.\n\nRode no projeto:\n- yarn add react-native-image-picker\n- cd ios && pod install\n- Recompile o app (npx react-native run-ios).'
        );
        return;
      }

      setUploadingCover(true);

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      };

      const result =
        source === 'camera'
          ? await launchCamera(options)
          : await launchImageLibrary(options);

      if (result.didCancel || !result.assets || !result.assets.length) {
        return;
      }

      const asset = result.assets[0];
      const currentEventId = eventId || eventData?.id;

      // Determinar extensão e contentType corretos
      const uri = asset.uri;
      const uriParts = uri.split('.');
      const ext = uriParts[uriParts.length - 1].toLowerCase();
      const fileExt = ['jpg', 'jpeg', 'png'].includes(ext) ? ext : 'jpg';
      const contentType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

      const fileName = `${Date.now()}-${currentEventId}.${fileExt}`;
      const path = `${currentEventId}/${fileName}`;

      // Converter URI local em ArrayBuffer (binário)
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const { error: uploadError } = await supabase
        .storage
        .from('event-images')
        .upload(path, arrayBuffer, {
          contentType,
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Atualizar o evento no banco com o novo caminho da foto
      if (eventId) {
        const { error: updateError } = await supabase
          .from('events')
          .update({ cover_image_path: path })
          .eq('id', eventId);

        if (updateError) throw updateError;
      }

      setCoverImagePath(path);
      Alert.alert('Sucesso', 'Foto de capa atualizada!');
    } catch (err) {
      console.error('Erro ao enviar foto de capa:', err);
      Alert.alert('Erro', 'Não foi possível enviar a foto de capa.');
    } finally {
      setUploadingCover(false);
    }
  };

  // Função para obter URL pública da foto de capa
  const getEventCoverUrl = (path) => {
    if (!path) return null;

    // Se já for uma URL completa, apenas retorna
    if (typeof path === 'string' && path.startsWith('http')) {
      return path;
    }

    const { data } = supabase
      .storage
      .from('event-images')
      .getPublicUrl(path);

    return data?.publicUrl || null;
  };

  // Função para voltar para a tela anterior
  const handleGoBack = () => {
    // Voltar sem salvar (usuário deve clicar em Salvar explicitamente)
    navigation.goBack();
  };

  // Função para adicionar membro à equipe
  const handleAddTeamMember = async (member) => {
    try {
      console.log('[ADD_MEMBER] Membro recebido:', member);

      // Verificar se a pessoa já está na equipe (comparar por profile_id e volunteer_id quando existir)
      const incomingProfileId = member.profile_id || member.id || null;
      const incomingVolunteerId = member.volunteer_id || null;

      if (
        teamMembers.some(m =>
          (incomingProfileId && m.profile_id === incomingProfileId) ||
          (incomingVolunteerId && m.volunteer_id === incomingVolunteerId)
        )
      ) {
        Alert.alert('Atenção', 'Essa pessoa já está na equipe desse evento.');
        return;
      }

      // Se o evento já foi salvo, adicionar ao banco de dados e enviar convite
      if (eventId && eventData && member.id) {
        const roleId = member.role_id || member.selectedRoleId;

        if (!roleId) {
          Alert.alert('Erro', 'Nenhuma função selecionada para este membro.');
          return;
        }

        // O banco exige profile_id NOT NULL em event_team
        const profileId = member.profile_id || member.id || null;
        const volunteerId = member.volunteer_id || null;

        if (!profileId) {
          Alert.alert('Erro', 'Não foi possível identificar o profile_id deste membro.');
          return;
        }

        const { error: insertError } = await supabase
          .from('event_team')
          .insert([{
            event_id: eventId,
            profile_id: profileId,
            volunteer_id: volunteerId,
            role_id: roleId,
            status: 'pending',
          }]);

        if (insertError) {
          const msg = insertError?.message || 'Não foi possível adicionar o membro à equipe';
          console.error('[ADD_MEMBER] Erro ao adicionar membro:', insertError);
          try {
            console.error('[ADD_MEMBER] Detalhes do erro:', JSON.stringify(insertError, null, 2));
          } catch (e) {}
          Alert.alert('Erro', msg);
          return;
        }

        console.log('[ADD_MEMBER] Membro adicionado com sucesso em event_team');

        if (member.user_id) {
          await sendEventInvitation(member.user_id, member.name, volunteerId || profileId, roleId);
          Alert.alert('Sucesso', `Convite enviado para ${member.name}!`);
        } else {
          Alert.alert(
            'Membro Adicionado',
            `${member.name} foi adicionado à equipe, mas não possui conta no sistema. O convite não será enviado.`
          );
        }

        // Recarregar lista de membros
        await loadEventTeam();
      } else if (!member.user_id) {
        Alert.alert(
          'Membro Adicionado',
          `${member.name} foi adicionado à equipe, mas não possui conta no sistema. O convite não será enviado.`
        );
      } else {
        Alert.alert(
          'Atenção',
          'Salve o evento primeiro para poder convidar membros.'
        );
      }
    } catch (error) {
      const msg = error?.message || 'Não foi possível adicionar o membro';
      console.error('[ADD_MEMBER] Erro ao adicionar membro (catch):', error);
      try {
        console.error('[ADD_MEMBER] Detalhes do erro (catch):', JSON.stringify(error, null, 2));
      } catch (e) {}
      Alert.alert('Erro', msg);
    }
  };

  const handleChangeTeamMemberStatus = (member) => {
    if (!member?.id) return;

    Alert.alert(
      'Status do convite',
      'Selecione o novo status:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Não Enviado',
          onPress: async () => {
            await eventService.updateTeamMemberStatus(member.id, 'not_sent');
            await loadEventTeam();
          },
        },
        {
          text: 'Pendente',
          onPress: async () => {
            await eventService.updateTeamMemberStatus(member.id, 'pending');
            await loadEventTeam();
          },
        },
        {
          text: 'Confirmado',
          onPress: async () => {
            await eventService.updateTeamMemberStatus(member.id, 'confirmed');
            await loadEventTeam();
          },
        },
        {
          text: 'Recusado',
          style: 'destructive',
          onPress: async () => {
            await eventService.updateTeamMemberStatus(member.id, 'declined');
            await loadEventTeam();
          },
        },
      ]
    );
  };

  // Função para enviar convite ao adicionar membro à equipe
  const sendEventInvitation = async (userId, memberName, volunteerId, roleId) => {
    try {
      if (!eventId || !eventData) {
        console.log('Evento ainda não foi salvo, convite será enviado após salvar');
        return;
      }

      // Formatar data e hora
      const eventDate = eventData.date instanceof Date ? eventData.date : new Date(eventData.date);
      const eventTime = eventData.time instanceof Date ? eventData.time : new Date(eventData.time);
      const formattedDate = eventDate.toISOString().split('T')[0];
      const hours = String(eventTime.getHours()).padStart(2, '0');
      const minutes = String(eventTime.getMinutes()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}:00`;

      // Criar notificação de convite
      const notification = await notificationService.createEventInvitation(
        userId,
        eventId,
        eventData.name,
        formattedDate,
        formattedTime
      );

      // Atualizar status em event_team
      if (volunteerId && roleId) {
        const { error: updateError } = await supabase
          .from('event_team')
          .update({
            status: 'pending',
            invitation_sent_at: new Date().toISOString()
          })
          .eq('event_id', eventId)
          .eq('volunteer_id', volunteerId)
          .eq('role_id', roleId);

        if (updateError) {
          console.error('Erro ao atualizar status em event_team:', updateError);
        }
      }

      console.log(`Convite enviado para ${memberName}`);
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      Alert.alert('Erro', 'Não foi possível enviar o convite');
      return;
    }
  };

  // Função para remover membro da equipe
  const handleRemoveTeamMember = async (memberId) => {
    Alert.alert(
      'Remover Membro',
      'Deseja remover este membro da equipe?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              // Deletar do banco de dados
              const { error } = await supabase
                .from('event_team')
                .delete()
                .eq('id', memberId);

              if (error) {
                console.error('Erro ao remover membro:', error);
                Alert.alert('Erro', 'Não foi possível remover o membro');
                return;
              }

              // Remover do estado local após sucesso no banco
              setTeamMembers(prev => prev.filter(m => m.id !== memberId));
            } catch (error) {
              console.error('Erro ao remover membro:', error);
              Alert.alert('Erro', 'Não foi possível remover o membro');
            }
          }
        }
      ]
    );
  };

  // Função para deletar evento
  const handleDeleteEvent = () => {
    console.log('handleDeleteEvent chamado, eventId:', eventId);
    
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
              console.log('Deletando evento:', eventId);
              
              if (!eventId) {
                Alert.alert('Erro', 'Evento não foi salvo ainda');
                return;
              }

              const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', eventId);

              console.log('Resultado delete:', { error });

              if (error) {
                console.error('Erro ao deletar evento:', error);
                Alert.alert('Erro', 'Não foi possível deletar o evento');
                return;
              }

              Alert.alert('Sucesso', 'Evento deletado com sucesso', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Erro ao deletar evento:', error);
              Alert.alert('Erro', 'Não foi possível deletar o evento');
            }
          }
        }
      ]
    );
  };
  
  // Sincronizar ordem das etapas com o banco
  const syncStepsOrderWithDb = async (updatedSteps) => {
    if (!eventId) return;

    try {
      const updates = updatedSteps.map((step, index) =>
        supabase
          .from('event_steps')
          .update({ step_order: index })
          .eq('id', step.id)
      );

      await Promise.all(updates);
    } catch (error) {
      console.error('Erro ao sincronizar ordem das etapas:', error);
    }
  };

  // Sincronizar ordem dos itens com o banco
  const syncItemsOrderWithDb = async (updatedSteps) => {
    if (!eventId) return;

    try {
      const updates = [];
      updatedSteps.forEach(step => {
        (step.items || []).forEach((item, index) => {
          if (!item.id) return;
          updates.push(
            supabase
              .from('step_items')
              .update({
                item_order: index,
                step_id: step.id,
              })
              .eq('id', item.id)
          );
        });
      });

      if (updates.length) {
        await Promise.all(updates);
      }
    } catch (error) {
      console.error('Erro ao sincronizar ordem dos itens:', error);
    }
  };

  // Função para mover item (para cima/baixo e entre cabeçalhos)
  const moveStepItem = (stepId, itemIndex, direction) => {
    let updatedSteps = null;

    setSteps(prevSteps => {
      const stepsCopy = prevSteps.map(step => ({
        ...step,
        items: [...(step.items || [])],
      }));

      const stepIndex = stepsCopy.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return prevSteps;

      const currentStep = stepsCopy[stepIndex];
      const items = currentStep.items;
      if (!items || items.length === 0) return prevSteps;

      let changed = false;

      if (direction === 'up') {
        if (itemIndex > 0) {
          [items[itemIndex - 1], items[itemIndex]] =
            [items[itemIndex], items[itemIndex - 1]];
          changed = true;
        } else if (itemIndex === 0 && stepIndex > 0) {
          // sobe para o cabeçalho anterior
          const [moved] = items.splice(itemIndex, 1);
          stepsCopy[stepIndex - 1].items = [
            ...(stepsCopy[stepIndex - 1].items || []),
            moved,
          ];
          changed = true;
        }
      } else if (direction === 'down') {
        if (itemIndex < items.length - 1) {
          [items[itemIndex + 1], items[itemIndex]] =
            [items[itemIndex], items[itemIndex + 1]];
          changed = true;
        } else if (itemIndex === items.length - 1 && stepIndex < stepsCopy.length - 1) {
          // desce para o próximo cabeçalho
          const [moved] = items.splice(itemIndex, 1);
          const nextItems = stepsCopy[stepIndex + 1].items || [];
          stepsCopy[stepIndex + 1].items = [moved, ...nextItems];
          changed = true;
        }
      }

      if (!changed) return prevSteps;

      updatedSteps = recalcItemTimes(stepsCopy);
      return updatedSteps;
    });

    if (updatedSteps) {
      syncItemsOrderWithDb(updatedSteps);
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
  
  // Função para salvar uma etapa (com persistência no banco)
  const handleSaveStep = async (stepData) => {
    if (currentStep) {
      const updatedSteps = steps.map(step =>
        step.id === stepData.id
          ? { ...step, ...stepData }
          : step
      );
      setSteps(recalcItemTimes(updatedSteps));

      if (eventId) {
        try {
          await supabase
            .from('event_steps')
            .update({
              title: stepData.title,
            })
            .eq('id', stepData.id);
        } catch (error) {
          console.error('Erro ao atualizar etapa:', error);
        }
      }
    } else {
      const stepOrder = steps.length;

      let newStep = {
        ...stepData,
        items: [],
        step_order: stepOrder,
      };

      if (eventId) {
        try {
          const { data, error } = await supabase
            .from('event_steps')
            .insert([
              {
                event_id: eventId,
                title: newStep.title,
                step_order: stepOrder,
              },
            ])
            .select()
            .single();

          if (!error && data) {
            newStep = { ...newStep, id: data.id };
          } else if (error) {
            console.error('Erro ao inserir etapa:', error);
          }
        } catch (error) {
          console.error('Erro ao inserir etapa:', error);
        }
      }

      setSteps(recalcItemTimes([...steps, newStep]));
    }
  };
  
  // Função para excluir uma etapa (com persistência no banco)
  const handleDeleteStep = (stepId) => {
    Alert.alert(
      'Excluir Etapa',
      'Tem certeza que deseja excluir esta etapa? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (eventId) {
                await supabase
                  .from('event_steps')
                  .delete()
                  .eq('id', stepId);
                await supabase
                  .from('step_items')
                  .delete()
                  .eq('step_id', stepId);
              }
            } catch (error) {
              console.error('Erro ao excluir etapa no banco:', error);
            }

            const updatedSteps = steps.filter(step => step.id !== stepId);
            setSteps(recalcItemTimes(updatedSteps));

            if (eventId) {
              syncStepsOrderWithDb(updatedSteps);
            }
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
  
  // Função para salvar um item (com persistência no banco)
  const handleSaveStepItem = async (stepId, itemData) => {
    const durationMinutes =
      itemData.duration !== undefined &&
      itemData.duration !== null &&
      itemData.duration !== ''
        ? parseInt(itemData.duration, 10)
        : null;
    
    const itemTime =
      itemData.time !== undefined &&
      itemData.time !== null &&
      itemData.time !== ''
        ? itemData.time
        : null;
    
    let dbItemId = itemData.id;

    const targetStep = steps.find(step => step.id === stepId);
    const existingItemIndex = targetStep ? targetStep.items.findIndex(item => item.id === itemData.id) : -1;

    if (eventId) {
      try {
        if (existingItemIndex >= 0 && dbItemId) {
          await supabase
            .from('step_items')
            .update({
              title: itemData.title,
              subtitle: itemData.subtitle,
              duration_minutes: durationMinutes,
              item_time: itemTime,
              item_order: existingItemIndex,
              participants: itemData.participants || [],
            })
            .eq('id', dbItemId);
        } else {
          const orderIndex = targetStep ? targetStep.items.length : 0;
          const { data, error } = await supabase
            .from('step_items')
            .insert([{
              step_id: stepId,
              title: itemData.title,
              subtitle: itemData.subtitle,
              duration_minutes: durationMinutes,
              item_time: itemTime,
              item_order: orderIndex,
              participants: itemData.participants || [],
            }])
            .select()
            .single();

          if (!error && data) {
            dbItemId = data.id;
          } else if (error) {
            console.error('Erro ao inserir item de etapa:', error);
          }
        }
      } catch (error) {
        console.error('Erro ao salvar item de etapa no banco:', error);
      }
    }

    const updatedSteps = steps.map(step => {
      if (step.id === stepId) {
        const existingIndex = step.items.findIndex(item => item.id === itemData.id);

        if (existingIndex >= 0) {
          const updatedItems = [...step.items];
          updatedItems[existingIndex] = {
            ...itemData,
            id: dbItemId || itemData.id,
            hasExplicitTime: !!itemData.time,
          };
          return { ...step, items: updatedItems };
        } else {
          return {
            ...step,
            items: [
              ...step.items,
              {
                ...itemData,
                id: dbItemId || itemData.id,
                hasExplicitTime: !!itemData.time,
              },
            ],
          };
        }
      }
      return step;
    });

    setSteps(recalcItemTimes(updatedSteps));
  };
  
  // Função para adicionar música do modal
  const handleAddSongFromModal = (song) => {
    if (!steps.length) {
      Alert.alert('Crie uma etapa', 'Você precisa ter pelo menos uma etapa para adicionar músicas.');
      return;
    }

    const targetStepId = steps[steps.length - 1].id;

    const newItem = {
      id: `${targetStepId}-${Date.now()}`,
      title: song.title,
      subtitle: song.artist,
      duration: song.duration,
      participants: [],
      time: '',
      hasExplicitTime: false,
    };

    handleSaveStepItem(targetStepId, newItem);
    setIsAddSongModalVisible(false);
  };

  // Função para excluir um item (com persistência no banco)
  const handleDeleteStepItem = (stepId, itemId) => {
    Alert.alert(
      'Excluir Item',
      'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (eventId) {
                await supabase
                  .from('step_items')
                  .delete()
                  .eq('id', itemId);
              }
            } catch (error) {
              console.error('Erro ao excluir item no banco:', error);
            }

            const updatedSteps = steps.map(step => {
              if (step.id === stepId) {
                return {
                  ...step,
                  items: step.items.filter(item => item.id !== itemId),
                };
              }
              return step;
            });
            setSteps(recalcItemTimes(updatedSteps));
          }
        }
      ]
    );
  };
  
  // Função para renderizar um participante
  const renderParticipant = (name) => {
    return (
      <View style={styles.participantTag}>
        <Text style={styles.participantName}>{name}</Text>
      </View>
    );
  };

  // Helper para reordenar itens de etapa após drag & drop
  const handleReorderItems = (stepId, newItems) => {
    setSteps(prevSteps => {
      const updatedSteps = prevSteps.map(step =>
        step.id === stepId ? { ...step, items: newItems } : step
      );
      syncItemsOrderWithDb(updatedSteps);
      return recalcItemTimes(updatedSteps);
    });
  };

  // Função para formatar horário (remover segundos)
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  };

  // Função para renderizar um item de etapa (para DraggableFlatList)
  const renderStepItem = ({ item, stepId, drag, isActive }) => {
    return (
      <TouchableOpacity 
        style={[
          styles.stepItemContainer,
          isActive && styles.stepItemContainerDragged
        ]}
        onPress={() => handleEditStepItem(stepId, item)}
        onLongPress={drag}
        delayLongPress={200}
        activeOpacity={0.9}
      >
        <View style={styles.contentColumn}>
          <View style={styles.stepItemContent}>
            <View style={styles.stepItemHeader}>
              <Text style={[styles.timeText, { color: colors.primary, marginRight: 12 }]}>
                {formatTimeDisplay(item.time)}
              </Text>
              <Text style={[styles.stepItemTitle, { color: colors.text, flex: 1 }]}>
                {item.title}
              </Text>
              {item.duration && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
                  <FontAwesome name="clock-o" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[styles.stepItemDuration, { color: colors.textSecondary }]}>
                    {item.duration} min
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.deleteStepItemButton}
                onPress={() => handleDeleteStepItem(stepId, item.id)}
              >
                <FontAwesome name="trash-o" size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>
            {item.subtitle && (
              <Text style={[styles.stepItemSubtitle, { color: colors.textSecondary, marginLeft: 50 }]}>
                {item.subtitle}
              </Text>
            )}
            {item.participants && item.participants.length > 0 && (
              <View style={[styles.participantsContainer, { marginLeft: 50 }]}>
                {item.participants.map((name, idx) => (
                  <View key={`${item.id}-participant-${idx}`} style={styles.participantTag}>
                    <Text style={styles.participantName}>{name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Função para mover etapa para cima
  const moveStepUp = (index) => {
    if (index === 0) return;
    const newSteps = [...steps];
    [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
    setSteps(newSteps);
    syncStepsOrderWithDb(newSteps);
  };

  // Função para mover etapa para baixo
  const moveStepDown = (index) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    setSteps(newSteps);
    syncStepsOrderWithDb(newSteps);
  };

  // Função para renderizar uma etapa
  const renderStep = (step, index) => {
    return (
      <View key={step.id} style={[styles.stepContainer, {
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.05)',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
      }]}>
        <View style={[styles.stepHeaderWrapper, {
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(99, 102, 241, 0.1)',
        }]}>
          <View style={styles.stepHeader}>
            <View style={styles.reorderButtons}>
              <TouchableOpacity 
                onPress={() => moveStepUp(index)}
                disabled={index === 0}
                style={[styles.reorderButton, index === 0 && styles.reorderButtonDisabled]}
              >
                <FontAwesome 
                  name="chevron-up" 
                  size={14} 
                  color={index === 0 ? colors.textSecondary : colors.primary} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => moveStepDown(index)}
                disabled={index === steps.length - 1}
                style={[styles.reorderButton, index === steps.length - 1 && styles.reorderButtonDisabled]}
              >
                <FontAwesome 
                  name="chevron-down" 
                  size={14} 
                  color={index === steps.length - 1 ? colors.textSecondary : colors.primary} 
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.stepTitleContainer}
              onPress={() => handleEditStep(step)}
              activeOpacity={0.7}
            >
              <View style={[styles.stepIndicator, { backgroundColor: '#4CD964' }]} />
              <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
            </TouchableOpacity>
            <View style={styles.stepActions}>
              <TouchableOpacity 
                style={styles.deleteStepButton}
                onPress={() => handleDeleteStep(step.id)}
              >
                <FontAwesome name="trash-o" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
          <DraggableFlatList
            data={step.items}
            keyExtractor={(item) => item.id}
            renderItem={({ item, drag, isActive }) => (
              <View style={styles.stepItemWrapper}>
                {renderStepItem({
                  item,
                  stepId: step.id,
                  drag,
                  isActive,
                })}
              </View>
            )}
            onDragEnd={({ data }) => handleReorderItems(step.id, data)}
            scrollEnabled={false}
          />
          
          <TouchableOpacity 
            style={styles.addItemButton}
            onPress={() => handleAddItemToStep(step.id)}
          >
            <FontAwesome name="plus" size={14} color={colors.primary} />
            <Text style={[styles.addItemText, { color: colors.primary }]}>
              Adicionar etapa
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
          <FontAwesome name="chevron-left" size={18} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>
            {isEditing ? 'Editar Evento' : 'Voltar para eventos'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleDeleteEvent}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome name="trash" size={22} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Parallax Header Height and Animation */}
      <Animated.ScrollView
        style={styles.container}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Event Image/Banner */}
        <Animated.View
          style={[
            styles.bannerContainer,
            {
              backgroundColor: coverImagePath ? 'transparent' : '#5E5CEC',
              height: headerHeight,
            },
          ]}
        >
          {coverImagePath ? (
            <Animated.Image
              source={{ uri: getEventCoverUrl(coverImagePath) }}
              style={[
                styles.bannerImage,
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
          ) : null}
          <Animated.View
            style={{
              opacity: scrollY.interpolate({
                inputRange: [0, 100],
                outputRange: [1, 0.3],
                extrapolate: 'clamp',
              }),
            }}
          >
            <TouchableOpacity 
              style={[
                styles.addImageButton,
                uploadingCover && { opacity: 0.6 }
              ]}
              onPress={uploadingCover ? undefined : handleSelectCoverSource}
            >
              <FontAwesome name={coverImagePath ? "pencil" : "camera"} size={24} color="#FFFFFF" />
              {uploadingCover && (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
        
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
                  Adicionar cabeçalho
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {activeTab === 'team' && (
            <View style={styles.teamContainer}>
              <View style={[styles.teamContent, { backgroundColor: colors.background }]}>
                {teamMembers.length === 0 ? (
                  <View
                    style={[
                      styles.emptyTeamContainer,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        borderWidth: isDarkMode ? 1 : 0,
                      },
                    ]}
                  >
                    <FontAwesome name="users" size={48} color={colors.textSecondary} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <Text style={[styles.emptyTeamText, { color: colors.text }]}>Nenhum membro adicionado</Text>
                    <Text style={[styles.emptyTeamSubText, { color: colors.textSecondary }]}>Toque no botão + para adicionar membros à equipe</Text>
                  </View>
                ) : (
                  <View style={[styles.teamSection, { backgroundColor: colors.card }]}>
                    <Text style={[styles.teamSectionTitle, { color: colors.text }]}>Membros da Equipe ({teamMembers.length})</Text>
                  
                    {teamMembers.map((member) => {
                      console.log('Renderizando membro:', { name: member.name, role: member.role });
                      return (
                        <View key={member.id} style={[styles.memberContainer, { borderBottomColor: colors.border }]}>
                          {member.avatar_url ? (
                            <Image
                              source={{ uri: member.avatar_url }}
                              style={styles.memberAvatar}
                            />
                          ) : (
                            <View style={[styles.memberAvatar, { backgroundColor: colors.primary + '20' }]}>
                              <Text style={[styles.memberInitials, { color: colors.primary }]}>
                                {member.name.substring(0, 2).toUpperCase()}
                              </Text>
                            </View>
                          )}
                          
                          <View style={styles.memberInfo}>
                            <Text style={[styles.memberName, { color: colors.text }]} numberOfLines={1}>{member.name || 'Sem nome'}</Text>
                            <Text style={[styles.memberRole, { color: colors.textSecondary }]} numberOfLines={1}>{member.role || 'Sem função'}</Text>
                          </View>
                          
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <TouchableOpacity
                              onPress={() => handleChangeTeamMemberStatus(member)}
                              activeOpacity={0.7}
                            >
                              <View style={[
                                member.status === 'confirmed' ? styles.confirmBadge :
                                member.status === 'pending' ? styles.pendingBadge :
                                member.status === 'declined' ? styles.declinedBadge :
                                styles.notSentBadge
                              ]}>
                                <Text style={styles.badgeText}>
                                  {member.status === 'confirmed' ? 'Confirmado' :
                                   member.status === 'pending' ? 'Pendente' :
                                   member.status === 'declined' ? 'Recusado' :
                                   'Não Enviado'}
                                </Text>
                              </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleRemoveTeamMember(member.id)}>
                              <FontAwesome name="trash-o" size={18} color={colors.danger} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          )}
          
          {activeTab === 'songs' && (
            <View style={[styles.songsContainer, { backgroundColor: colors.background }]}>
              {/* Título da seção */}
              <Text style={[styles.songsSectionTitle, { color: colors.text }]}>Músicas do Cronograma ({songs.length})</Text>
              
              {/* Lista de músicas do cronograma */}
              <FlatList
                data={songs}
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
      </Animated.ScrollView>
      
      {/* Botões flutuantes para a aba Etapas */}
      {activeTab === 'steps' && (
        <View style={styles.fabContainer}>
          {/* Sub-botões (aparecem quando FAB está aberto) */}
          {isFabOpen && (
            <>
              {/* Botão para adicionar cabeçalho */}
              <TouchableOpacity 
                style={[styles.subButton, { bottom: 135 }]}
                onPress={() => {
                  handleAddStep();
                  setIsFabOpen(false);
                }}
              >
                <View style={[styles.subButtonContainer, { backgroundColor: '#6366F1' }]}>
                  <Text style={styles.subButtonLabel}>Cabeçalho</Text>
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
              <FontAwesome name={isFabOpen ? "close" : "plus"} size={24} color="#FFFFFF" />
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
      
      {/* Modal para adicionar membro à equipe */}
      <AddTeamMemberModal
        visible={isAddTeamMemberModalVisible}
        onClose={() => setIsAddTeamMemberModalVisible(false)}
        onAddMember={handleAddTeamMember}
        eventId={eventId}
        eventData={eventData}
        existingMembers={teamMembers}
      />
      
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
                value={songSearch}
                onChangeText={setSongSearch}
              />
            </View>
          </View>
          
          {/* Lista de músicas disponíveis */}
          <FlatList
            data={filteredSongs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.songModalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.7}
                onPress={() => handleAddSongFromModal(item)}
              >
                <View style={styles.songModalContent}>
                  <View style={styles.songModalHeader}>
                    <View style={[styles.songModalIcon, { backgroundColor: colors.primary + '20' }]}>
                      <FontAwesome name="music" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.songModalInfo}>
                      <Text style={[styles.songModalTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={[styles.songModalArtist, { color: colors.textSecondary }]} numberOfLines={1}>
                        {item.artist}
                      </Text>
                    </View>
                    <TouchableOpacity>
                      <FontAwesome name="pencil" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.songModalMeta}>
                    <View style={styles.songModalMetaItem}>
                      <FontAwesome name="music" size={12} color={colors.textSecondary} />
                      <Text style={[styles.songModalMetaText, { color: colors.textSecondary }]}>
                        Tom: -
                      </Text>
                    </View>
                    <View style={styles.songModalMetaItem}>
                      <FontAwesome name="tachometer" size={12} color={colors.textSecondary} />
                      <Text style={[styles.songModalMetaText, { color: colors.textSecondary }]}>
                        Tempo: -
                      </Text>
                    </View>
                    <View style={styles.songModalMetaItem}>
                      <FontAwesome name="clock-o" size={12} color={colors.textSecondary} />
                      <Text style={[styles.songModalMetaText, { color: colors.textSecondary }]}>
                        Duração: {item.duration || '-'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
            style={styles.songSearchList}
            contentContainerStyle={styles.songSearchListContent}
          />
        </View>
      </Modal>
      </View>
    </GestureHandlerRootView>
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 17,
    fontWeight: '400',
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
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  addImageButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
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
  emptyTeamContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  emptyTeamText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyTeamSubText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
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
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalBackButton: {
    fontSize: 16,
    color: '#000000',
  },
  modalScrollView: {
    maxHeight: '70%',
    marginTop: 8,
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
  stepHeaderWrapper: {
    overflow: 'hidden',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  reorderButtons: {
    flexDirection: 'column',
    marginRight: 8,
    gap: 2,
  },
  reorderButton: {
    padding: 4,
    borderRadius: 4,
  },
  reorderButtonDisabled: {
    opacity: 0.3,
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
    flex: 1,
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  stepItemContainerDragged: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    opacity: 0.7,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  stepItemDropZone: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#6366F1',
    paddingVertical: 12,
    marginVertical: 4,
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
    width: '100%',
  },
  stepItemContent: {
    paddingVertical: 4,
  },
  stepItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepItemHeaderLeft: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    flex: 1,
  },
  stepItemRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  stepItemReorderButtons: {
    flexDirection: 'column',
    marginLeft: 8,
  },
  reorderItemButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderItemButtonDisabled: {
    opacity: 0.4,
  },
  deleteStepItemButton: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  addItemText: {
    marginLeft: 6,
    fontSize: 14,
  },
  addStepButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#5E5CEC',
    marginVertical: 24,
  },
  addStepText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
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
    zIndex: 997,
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
    backgroundColor: 'transparent',
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
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInitials: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  memberRole: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '400',
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
  declinedBadge: {
    backgroundColor: '#F44336',
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
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    zIndex: 998,
    elevation: 8,
  },
  subButton: {
    position: 'absolute',
    right: 0,
  },
  subButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 8,
  },
  subButtonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  songModalCard: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  songModalContent: {
    padding: 12,
  },
  songModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  songModalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  songModalInfo: {
    flex: 1,
  },
  songModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  songModalArtist: {
    fontSize: 14,
  },
  songModalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  songModalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  songModalMetaText: {
    fontSize: 12,
  },
});

export default EventCreationScreen;