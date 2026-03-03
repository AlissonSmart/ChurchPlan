import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Animated } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import theme from '../styles/theme';

/**
 * Componente de card de evento
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.event - Dados do evento
 * @param {Function} props.onEdit - Função chamada ao editar o evento
 * @param {Function} props.onDuplicate - Função chamada ao duplicar o evento
 * @param {Function} props.onDelete - Função chamada ao deletar o evento
 * @returns {React.ReactNode}
 */
const EventCard = ({ event, onEdit, onDuplicate, onDelete }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  const cardBackground = isDarkMode ? colors.card : '#FFFFFF';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateAnim]);
  
  return (
    <Animated.View
      style={[
        styles.eventCard,
        { backgroundColor: cardBackground, opacity: fadeAnim, transform: [{ translateY: translateAnim }] }
      ]}
    >
      <TouchableOpacity
        style={styles.eventHeader}
        onPress={() => onEdit(event.id)}
        activeOpacity={0.7}
      >
        <View style={styles.eventIconContainer}>
          <FontAwesome name="calendar" size={22} color="#00A6A6" />
        </View>
        <View style={styles.eventInfo}>
          <Text style={[styles.eventName, { color: colors.text }]}>{event.name}</Text>
          <View style={styles.eventDateRow}>
            <FontAwesome name="calendar-o" size={14} color={colors.textSecondary} style={styles.smallIcon} />
            <Text style={[styles.eventDate, { color: colors.textSecondary }]}>{event.dayOfWeek} {event.date}</Text>
            <FontAwesome name="clock-o" size={14} color={colors.textSecondary} style={[styles.smallIcon, styles.clockIcon]} />
            <Text style={[styles.eventTime, { color: colors.textSecondary }]}>{event.time}</Text>
          </View>
        </View>
        <View style={styles.eventStatus}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{event.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.eventActions}>
        <TouchableOpacity 
          style={[
            styles.actionButton,
            { backgroundColor: 'rgba(101, 103, 107, 0.12)' }
          ]}
          onPress={() => onDuplicate(event.id)}
        >
          <FontAwesome name="copy" size={15} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>Duplicar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.actionButton,
            { backgroundColor: 'rgba(24, 119, 242, 0.12)' }
          ]}
          onPress={() => onEdit(event.id)}
        >
          <FontAwesome name="pencil" size={15} color="#1877F2" />
          <Text style={[styles.actionText, { color: "#1877F2" }]}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.actionButton,
            { backgroundColor: 'rgba(255, 59, 48, 0.12)' }
          ]}
          onPress={() => onDelete(event.id)}
        >
          <FontAwesome name="trash" size={15} color="#FF3B30" />
          <Text style={[styles.actionText, { color: "#FF3B30" }]}>Deletar</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 166, 166, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: theme.typography.fontSize.sm,
  },
  eventTime: {
    fontSize: theme.typography.fontSize.sm,
  },
  smallIcon: {
    marginRight: 6,
  },
  clockIcon: {
    marginLeft: 16,
  },
  eventStatus: {
    marginLeft: 8,
  },
  statusBadge: {
    backgroundColor: '#FFB800',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
  },
  eventStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 12,
  },
  statItem: {
    flex:1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 0,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '400',
  },
});

export default EventCard;
