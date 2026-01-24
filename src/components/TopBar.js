import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, useColorScheme, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Avatar from './Avatar';
import notificationService from '../services/notificationService';
import supabase from '../services/supabase';
import theme from '../styles/theme';

const TopBar = ({ activeTab, onTabChange, navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userNotifications = await notificationService.getUserNotifications(user.id);
        const eventNotifications = (userNotifications || []).filter(n => n.type === 'event_invitation');
        setNotifications(eventNotifications);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const handleNotificationPress = (notification) => {
    setShowNotifications(false);
    navigation.navigate('Agenda');
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const tabs = [
    { id: 'Agenda', icon: 'calendar', label: 'Agenda' },
    { id: 'Planejar', icon: 'tasks', label: 'Planejar' },
    { id: 'Equipes', icon: 'users', label: 'Equipes' },
    { id: 'CheckIn', icon: 'map-marker', label: 'Check-in' },
    { id: 'Midia', icon: 'play-circle', label: 'Mídia' },
  ];

  // Encontrar a tab ativa para mostrar o título correto
  const activeTabData = tabs.find(tab => tab.id === activeTab) || tabs[0];
  
  return (
    <>
      <View style={[
        styles.container, 
        isDarkMode && styles.containerDark,
        { paddingTop: insets.top }
      ]}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, isDarkMode && styles.titleDark]}>{activeTabData.label}</Text>
        </View>
        <View style={styles.rightSection}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowNotifications(true)}
            accessibilityLabel="Notificações"
            accessibilityHint="Mostra notificações de eventos"
          >
            {notifications.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{notifications.length}</Text>
              </View>
            )}
            <FontAwesome name="bell" size={22} color="#1877F2" />
          </TouchableOpacity>
          <Avatar 
            initial="A" 
            onPress={handleProfilePress} 
            size={36} 
          />
        </View>
      </View>

      {/* Modal de Notificações */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowNotifications(false)}
        >
          <View style={[styles.notificationModal, { backgroundColor: colors.card }]}>
            <View style={styles.notificationHeader}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>Notificações</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <FontAwesome name="times" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <FontAwesome name="bell-slash-o" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.text }]}>Nenhuma notificação</Text>
              </View>
            ) : (
              <ScrollView style={styles.notificationList}>
                {notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[styles.notificationItem, { borderBottomColor: colors.border }]}
                    onPress={() => handleNotificationPress(notification)}
                  >
                    <View style={[styles.notificationIcon, { backgroundColor: colors.primary + '20' }]}>
                      <FontAwesome name="calendar" size={16} color={colors.primary} />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={[styles.notificationEventName, { color: colors.text }]}>
                        {notification.event_name}
                      </Text>
                      <Text style={[styles.notificationDate, { color: colors.textSecondary }]}>
                        {new Date(notification.event_date).toLocaleDateString('pt-BR')} às {notification.event_time?.substring(0, 5)}
                      </Text>
                    </View>
                    {!notification.is_read && (
                      <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
    backgroundColor: 'rgba(255,255,255,0.92)',
    zIndex: 1000,
    paddingTop: 0,
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backdropFilter: 'saturate(180%) blur(16px)',
        WebkitBackdropFilter: 'saturate(180%) blur(16px)',
      },
      default: {
        // native: deixamos sem sombra para manter estilo iOS glass quando usar Blur nativo futuramente
      },
    }),
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
    marginVertical: 8,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: 'rgba(28,28,30,0.92)',
    borderBottomColor: '#38383A',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(228,230,235,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  icon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FA383E',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  notificationModal: {
    marginHorizontal: 16,
    borderRadius: 12,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  notificationList: {
    maxHeight: 320,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationEventName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  emptyNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
});

export default TopBar;
