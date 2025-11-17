import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const VideosScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.titleContainer}>
            <FontAwesome name="play" size={24} color="#050505" />
            <Text style={styles.title}>Vídeos</Text>
          </View>
          <Text style={styles.description}>
            Assista aos cultos e eventos gravados da sua igreja.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.videoPlaceholder}>
            <FontAwesome name="play" size={48} color="#1877F2" />
          </View>
          <Text style={styles.videoTitle}>Ultimo Culto - Domingo</Text>
          <Text style={styles.videoInfo}>2 dias atrás • 1.2k visualizações</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.videoPlaceholder}>
            <FontAwesome name="play" size={48} color="#1877F2" />
          </View>
          <Text style={styles.videoTitle}>Louvor e Adoração</Text>
          <Text style={styles.videoInfo}>5 dias atrás • 856 visualizações</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#050505',
  },
  description: {
    fontSize: 16,
    color: '#65676B',
    lineHeight: 22,
  },
  videoPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#E4E6EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 4,
  },
  videoInfo: {
    fontSize: 14,
    color: '#65676B',
  },
});

export default VideosScreen;
