import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { HeaderContext } from '../contexts/HeaderContext';

const HomeScreen = () => {
  const [activeSegment, setActiveSegment] = useState('agenda');
  const isDarkMode = useColorScheme() === 'dark';
  const { setShowLargeTitle } = useContext(HeaderContext);
  const lastLargeTitleState = useRef(true);

  useEffect(() => {
    setShowLargeTitle(true);
    lastLargeTitleState.current = true;

    return () => {
      setShowLargeTitle(true);
    };
  }, [setShowLargeTitle]);

  const handleScroll = useCallback((event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShowLargeTitle = offsetY <= 10;

    if (lastLargeTitleState.current !== shouldShowLargeTitle) {
      lastLargeTitleState.current = shouldShowLargeTitle;
      setShowLargeTitle(shouldShowLargeTitle);
    }
  }, [setShowLargeTitle]);

  return (
    <ScrollView
      style={[styles.container, isDarkMode && styles.containerDark]}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      contentInsetAdjustmentBehavior="automatic"
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
            {/* Agenda (4 eventos de exemplo) */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Sua Agenda</Text>
            </View>
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

        {[
          {
            id: '1',
            title: 'Culto Dominical',
            date: '07/09/2024',
            time: '19:00',
            role: 'Guitarra',
            status: 'Confirmado',
            statusType: 'success',
          },
          {
            id: '2',
            title: 'Ensaio Geral',
            date: '05/09/2024',
            time: '19:30',
            role: 'Guitarra',
            status: 'Pendente',
            statusType: 'warning',
          },
          {
            id: '3',
            title: 'Culto de Quarta',
            date: '10/09/2024',
            time: '20:00',
            role: 'Backing Vocal',
            status: 'Confirmado',
            statusType: 'success',
          },
          {
            id: '4',
            title: 'Ensaio de Dança',
            date: '12/09/2024',
            time: '18:30',
            role: 'Dança',
            status: 'Pendente',
            statusType: 'warning',
          },
        ].map((ev) => activeSegment === 'agenda' && (
          <View key={ev.id} style={[styles.eventCard, isDarkMode && styles.eventCardDark]}>
            <View style={styles.eventHeader}>
              <View style={styles.eventIconCircle}>
                <Icon name="music" size={18} color="#22A06B" />
              </View>
              <Text style={[styles.eventTitle, isDarkMode && styles.eventTitleDark]}>{ev.title}</Text>
              <View style={[styles.statusPill, ev.statusType === 'success' ? styles.statusSuccess : styles.statusWarning]}>
                <Icon name={ev.statusType === 'success' ? 'check' : 'exclamation'} size={12} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.statusText}>{ev.status}</Text>
              </View>
            </View>

            <View style={styles.eventMetaRow}>
              <Icon name="calendar" size={14} color="#1877F2" style={{ marginRight: 6 }} />
              <Text style={[styles.eventMetaText, isDarkMode && styles.eventMetaTextDark]}>{ev.date} às {ev.time}</Text>
            </View>
            <View style={styles.eventMetaRow}>
              <Icon name="user" size={14} color="#22A06B" style={{ marginRight: 6 }} />
              <Text style={[styles.eventMetaText, isDarkMode && styles.eventMetaTextDark]}>{ev.role}</Text>
            </View>

            <View style={styles.buttonRow}>
              <View style={[styles.actionButton, styles.acceptButton]}>
                <Icon name="check" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonText}>Aceitar</Text>
              </View>
              <View style={[styles.actionButton, styles.declineButton]}>
                <Icon name="close" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonText}>Recusar</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
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
