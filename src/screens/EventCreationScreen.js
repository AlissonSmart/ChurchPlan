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
  Animated
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
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
          profile_id,
          role_id
        `)
        .eq('event_id', eventId);

      if (error) throw error;

      // Buscar profiles e roles separadamente
      const profileIds = [...new Set(data.map(m => m.profile_id).filter(Boolean))];
      const roleIds = [...new Set(data.map(m => m.role_id).filter(Boolean))];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .in('id', profileIds);

      const { data: roles } = await supabase
        .from('roles')
        .select('id, name')
        .in('id', roleIds);

      const profileMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
      const roleMap = (roles || []).reduce((acc, r) => ({ ...acc, [r.id]: r }), {});

      const formattedMembers = (data || []).map(member => {
        const profile = profileMap[member.profile_id];
        const role = roleMap[member.role_id];
        
        return {
          id: member.id,
          profile_id: member.profile_id,
          name: profile?.name || 'Usuário',
          email: profile?.email || '',
          avatar_url: profile?.avatar_url || null,
          role: role?.name || 'Sem função',
          status: member.status || 'not_sent',
          highlighted: member.is_highlighted || false
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

  // Carregar equipe quando eventId mudar
  useEffect(() => {
    loadEventTeam();
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

  // Função para voltar para a tela anterior
  const handleGoBack = () => {
    // Voltar sem salvar (usuário deve clicar em Salvar explicitamente)
    navigation.goBack();
  };

  // Função para adicionar membro à equipe
  const handleAddTeamMember = async (member) => {
    try {
      console.log('[ADD_MEMBER] Membro recebido:', member);
      
      // Verificar se a pessoa já está na equipe (comparar por profile_id)
      if (teamMembers.some(m => m.profile_id === member.id)) {
        Alert.alert('Atenção', 'Essa pessoa já está na equipe desse evento.');
        return;
      }

      // Se o evento já foi salvo, adicionar ao banco de dados e enviar convite
      if (eventId && eventData && member.id) {
        // Resolver role automaticamente
        let roleId = member.role_id || null;

        if (!roleId) {
          const normalizedRole = (member?.role || '').trim();

          const roleMap = {
            'Membro': 'Vocal',
            'Member': 'Vocal'
          };

          const resolvedRoleName = roleMap[normalizedRole] || normalizedRole;

          const { data: rolesData, error: roleError } = await supabase
            .from('roles')
            .select('id')
            .ilike('name', resolvedRoleName)
            .order('created_at', { ascending: true })
            .limit(1);

          if (roleError) {
            console.error('Erro ao buscar role:', roleError);
            Alert.alert('Erro', 'Não foi possível buscar a função');
            return;
          }

          if (!rolesData || rolesData.length === 0) {
            console.error('Erro ao buscar role: nenhum resultado para', resolvedRoleName);

            const { data: fallbackRoleData, error: fallbackRoleError } = await supabase
              .from('roles')
              .select('id')
              .ilike('name', 'Vocal')
              .order('created_at', { ascending: true })
              .limit(1);

            if (fallbackRoleError) {
              console.error('Erro ao buscar role fallback:', fallbackRoleError);
              Alert.alert('Erro', 'Não foi possível buscar uma função padrão');
              return;
            }

            if (!fallbackRoleData || fallbackRoleData.length === 0) {
              const { data: anyRoleData, error: anyRoleError } = await supabase
                .from('roles')
                .select('id')
                .order('created_at', { ascending: true })
                .limit(1);

              if (anyRoleError || !anyRoleData || anyRoleData.length === 0) {
                console.error('Nenhuma role disponível para fallback:', anyRoleError);
                Alert.alert('Erro', 'Nenhuma função cadastrada no sistema');
                return;
              }

              roleId = anyRoleData[0].id;
            } else {
              roleId = fallbackRoleData[0].id;
            }

            // Role resolvida via fallback
          } else {
            const roleData = rolesData[0];
            roleId = roleData.id;
          }
        }

        const profileId = member.id; // member.id já é o profiles.id do AddTeamMemberModal
        console.log('[ADD_MEMBER] Profile ID:', profileId);

        // Buscar user atual para invitedBy
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log('[ADD_MEMBER] User autenticado (invitedBy):', user?.id);

        // Inserir em event_team usando profile_id (OBRIGATÓRIO)
        const { error: insertError } = await supabase
          .from('event_team')
          .insert([{
            event_id: eventId,
            profile_id: profileId,
            role_id: roleId,
            status: 'pending',
            user_id: user?.id || null
          }]);

        if (insertError) {
          console.error('[ADD_MEMBER] Erro ao adicionar membro:', insertError);
          Alert.alert('Erro', 'Não foi possível adicionar o membro à equipe');
          return;
        }

        console.log('[ADD_MEMBER] Membro adicionado com sucesso em event_team');

        // Enviar convite (notificação)
        await sendEventInvitation(member.id, member.name, profileId, roleId);

        // Recarregar lista de membros
        await loadEventTeam();

        Alert.alert('Sucesso', `Convite enviado para ${member.name}!`);
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
      console.error('Erro ao adicionar membro:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o membro');
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
  const sendEventInvitation = async (userId, memberName, profileId, roleId) => {
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
      if (profileId && roleId) {
        const { error: updateError } = await supabase
          .from('event_team')
          .update({
            status: 'pending',
            invitation_sent_at: new Date().toISOString()
          })
          .eq('event_id', eventId)
          .eq('user_id', profileId)
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
  
  // Função para mover etapa para cima
  const moveStepUp = (index) => {
    if (index === 0) return;
    const newSteps = [...steps];
    [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
    setSteps(newSteps);
  };

  // Função para mover etapa para baixo
  const moveStepDown = (index) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    setSteps(newSteps);
  };

  // Função para renderizar uma etapa
  const renderStep = (step, index) => {
    return (
      <View key={step.id} style={styles.stepContainer}>
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
                style={[styles.subButton, { bottom: 190 }]}
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
                style={[styles.subButton, { bottom: 135 }]}
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
});

export default EventCreationScreen;