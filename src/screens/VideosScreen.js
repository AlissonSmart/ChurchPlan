import React from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import TabScreenWrapper from '../components/TabScreenWrapper';

const VideosScreen = ({ navigation, route }) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <TabScreenWrapper activeTab="Planejar" navigation={navigation}>
      <ScrollView style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.content}>
        <View style={[styles.card, isDarkMode && styles.cardDark]}>
          <View style={styles.titleContainer}>
            <FontAwesome name="play" size={24} color={isDarkMode ? '#FFFFFF' : '#050505'} />
            <Text style={[styles.title, isDarkMode && styles.titleDark]}>Vídeos</Text>
          </View>
          <Text style={[styles.description, isDarkMode && styles.descriptionDark]}>
            Assista aos cultos e eventos gravados da sua igreja.
          </Text>
        </View>

        <View style={[styles.card, isDarkMode && styles.cardDark]}>
          <View style={[styles.videoPlaceholder, isDarkMode && styles.videoPlaceholderDark]}>
            <FontAwesome name="play" size={48} color="#1877F2" />
          </View>
          <Text style={[styles.videoTitle, isDarkMode && styles.videoTitleDark]}>Ultimo Culto - Domingo</Text>
          <Text style={[styles.videoInfo, isDarkMode && styles.videoInfoDark]}>2 dias atrás • 1.2k visualizações</Text>
        </View>

        <View style={[styles.card, isDarkMode && styles.cardDark]}>
          <View style={[styles.videoPlaceholder, isDarkMode && styles.videoPlaceholderDark]}>
            <FontAwesome name="play" size={48} color="#1877F2" />
          </View>
          <Text style={[styles.videoTitle, isDarkMode && styles.videoTitleDark]}>Louvor e Adoração</Text>
          <Text style={[styles.videoInfo, isDarkMode && styles.videoInfoDark]}>5 dias atrás • 856 visualizações</Text>
        </View>
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
  cardDark: {
    backgroundColor: '#2C2C2E',
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
  titleDark: {
    color: '#FFFFFF',
  },
  description: {
    fontSize: 16,
    color: '#65676B',
    lineHeight: 22,
  },
  descriptionDark: {
    color: '#A0A0A5',
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
  videoPlaceholderDark: {
    backgroundColor: '#3A3A3C',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#050505',
    marginBottom: 4,
  },
  videoTitleDark: {
    color: '#FFFFFF',
  },
  videoInfo: {
    fontSize: 14,
    color: '#65676B',
  },
  videoInfoDark: {
    color: '#A0A0A5',
  },
});

export default VideosScreen;
