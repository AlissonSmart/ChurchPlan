import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import theme from '../styles/theme';

/**
 * Componente de card de evento
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.event - Dados do evento
 * @param {Function} props.onEdit - Função chamada ao editar o evento
 * @param {Function} props.onDuplicate - Função chamada ao duplicar o evento
 * @param {Function} props.onSaveTemplate - Função chamada ao salvar o evento como template
 * @returns {React.ReactNode}
 */
const EventCard = ({ event, onEdit, onDuplicate, onSaveTemplate }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  
  return (
    <View style={[styles.eventCard, { backgroundColor: colors.card }]}>
      <View style={styles.eventHeader}>
        <View style={styles.eventIconContainer}>
          <FontAwesome name="church" size={24} color="#00C6AE" />
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
      </View>
      
      <View style={styles.eventStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{event.songsCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>músicas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>{event.membersCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>membros</Text>
        </View>
      </View>
      
      <View style={styles.eventActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onDuplicate(event.id)}
        >
          <FontAwesome name="copy" size={16} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>Duplicar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onSaveTemplate(event.id)}
        >
          <FontAwesome name="save" size={16} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>Salvar Template</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => onEdit(event.id)}
        >
          <FontAwesome name="pencil" size={16} color="#1877F2" />
          <Text style={[styles.actionText, { color: "#1877F2" }]}>Editar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 198, 174, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 14,
  },
  eventTime: {
    fontSize: 14,
  },
  smallIcon: {
    marginRight: 4,
  },
  clockIcon: {
    marginLeft: 12,
  },
  eventStatus: {
    marginLeft: 8,
  },
  statusBadge: {
    backgroundColor: '#FFB800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
    flex: 1,
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
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
  },
});

export default EventCard;
