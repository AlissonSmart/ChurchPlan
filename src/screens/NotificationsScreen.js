import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  useColorScheme, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import TabScreenWrapper from '../components/TabScreenWrapper';
import notificationService from '../services/notificationService';
import supabase from '../services/supabase';
import theme from '../styles/theme';

const NotificationsScreen = ({ navigation, route }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carregar notificações
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }

      const data = await notificationService.getUserNotifications(user.id);
      const formattedData = data.map(n => notificationService.formatNotificationForDisplay(n));
      setNotifications(formattedData);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      Alert.alert('Erro', 'Não foi possível carregar as notificações');
    } finally {
      setLoading(false);
    }
  };

  // Recarregar notificações (pull to refresh)
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  // Marcar notificação como lida
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Atualizar localmente
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  // Marcar todas como lidas
  const handleMarkAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      Alert.alert('Sucesso', 'Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      Alert.alert('Erro', 'Não foi possível marcar todas como lidas');
    }
  };

  // Abrir notificação
  const handleOpenNotification = async (notification) => {
    // Marcar como lida
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }

    // Navegar para o evento se houver
    if (notification.event_id) {
      navigation.navigate('EventCreation', {
        eventId: notification.event_id,
        isEditing: true
      });
    }
  };

  // Carregar ao montar
  useEffect(() => {
    loadNotifications();
  }, []);

  // Recarregar quando a tela receber foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotifications();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <TabScreenWrapper activeTab="CheckIn" navigation={navigation}>
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <FontAwesome name="bell" size={28} color={colors.text} />
              <Text style={[styles.title, { color: colors.text }]}>Notificações</Text>
            </View>
            {notifications.length > 0 && (
              <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
                <Text style={[styles.markAllText, { color: colors.primary }]}>
                  Marcar todas como lidas
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Carregando notificações...
              </Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome name="bell-slash-o" size={64} color={colors.textSecondary} style={styles.emptyIcon} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Nenhuma notificação
              </Text>
              <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
                Você não tem notificações no momento
              </Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  !notification.is_read && { backgroundColor: colors.primary + '10' }
                ]}
                onPress={() => handleOpenNotification(notification)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <FontAwesome name="calendar" size={24} color={colors.primary} />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>
                    {notification.title}
                  </Text>
                  <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                    {notification.message}
                  </Text>
                  {notification.event_date && (
                    <Text style={[styles.eventInfo, { color: colors.textSecondary }]}>
                      📅 {new Date(notification.event_date).toLocaleDateString('pt-BR')} às {notification.event_time?.substring(0, 5)}
                    </Text>
                  )}
                  <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                    {notification.timeAgo}
                  </Text>
                </View>
                {!notification.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
              </TouchableOpacity>
            ))
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
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  markAllButton: {
    paddingVertical: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
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
  eventInfo: {
    fontSize: 13,
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#050505',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#2C2C2E',
  },
  cardUnread: {
    backgroundColor: '#E7F3FF',
  },
  cardUnreadDark: {
    backgroundColor: '#0A3060',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerDark: {
    backgroundColor: '#3A3A3C',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 4,
  },
  notificationTitleDark: {
    color: '#FFFFFF',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#65676B',
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationMessageDark: {
    color: '#A0A0A5',
  },
  notificationTime: {
    fontSize: 13,
    color: '#8A8D91',
  },
  notificationTimeDark: {
    color: '#6E6E73',
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1877F2',
    marginLeft: 8,
    marginTop: 4,
  },
});

export default NotificationsScreen;
