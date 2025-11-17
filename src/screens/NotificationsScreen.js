import React from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import TabScreenWrapper from '../components/TabScreenWrapper';

const NotificationsScreen = ({ navigation, route }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const notifications = [
    {
      id: 1,
      icon: 'calendar',
      title: 'Novo evento adicionado',
      message: 'Culto de Celebração - Domingo às 19h',
      time: '2h atrás',
      unread: true,
    },
    {
      id: 2,
      icon: 'comment',
      title: 'Nova mensagem no grupo Jovens',
      message: 'João comentou: "Confirmado para o encontro!"',
      time: '5h atrás',
      unread: true,
    },
    {
      id: 3,
      icon: 'music',
      title: 'Escala de louvor atualizada',
      message: 'Confira sua posição para o próximo domingo',
      time: '1 dia atrás',
      unread: false,
    },
  ];

  return (
    <TabScreenWrapper activeTab="CheckIn" navigation={navigation}>
      <ScrollView style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <FontAwesome name="bell" size={28} color={isDarkMode ? '#FFFFFF' : '#050505'} />
            <Text style={[styles.title, isDarkMode && styles.titleDark]}>Notificações</Text>
          </View>
        </View>

        {notifications.map((notification) => (
          <View
            key={notification.id}
            style={[
              styles.card,
              notification.unread && styles.cardUnread,
              isDarkMode && styles.cardDark,
              notification.unread && isDarkMode && styles.cardUnreadDark,
            ]}
          >
            <View style={[styles.iconContainer, isDarkMode && styles.iconContainerDark]}>
              <FontAwesome name={notification.icon} size={24} color="#1877F2" />
            </View>
            <View style={styles.notificationContent}>
              <Text style={[styles.notificationTitle, isDarkMode && styles.notificationTitleDark]}>
                {notification.title}
              </Text>
              <Text style={[styles.notificationMessage, isDarkMode && styles.notificationMessageDark]}>
                {notification.message}
              </Text>
              <Text style={[styles.notificationTime, isDarkMode && styles.notificationTimeDark]}>
                {notification.time}
              </Text>
            </View>
            {notification.unread && <View style={styles.unreadDot} />}
          </View>
        ))}
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
