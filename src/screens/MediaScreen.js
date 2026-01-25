import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import TabScreenWrapper from '../components/TabScreenWrapper';
import AddSongModal from '../components/AddSongModal';
import theme from '../styles/theme';
import supabase from '../services/supabase';

/**
 * Tela de Mídia - Biblioteca musical e materiais
 */
const MediaScreen = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [isAddSongModalVisible, setIsAddSongModalVisible] = useState(false);
  const [editingSong, setEditingSong] = useState(null);

  const categories = ['Todas', 'Louvor', 'Adoração', 'Comunhão'];

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    withLyrics: 0,
    withChords: 0,
    withAudio: 0
  });

  // Carregar músicas
  const loadSongs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;

      setSongs(data || []);
      calculateStats(data || []);
      filterSongs(data || [], activeCategory, searchQuery);
    } catch (error) {
      console.error('Erro ao carregar músicas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as músicas');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas
  const calculateStats = (songsData) => {
    setStats({
      total: songsData.length,
      withLyrics: songsData.filter(s => s.lyrics).length,
      withChords: songsData.filter(s => s.lyrics && s.lyrics.includes('C') || s.lyrics?.includes('G')).length,
      withAudio: 0 // Placeholder
    });
  };

  // Filtrar músicas
  const filterSongs = (songsData, category, query) => {
    let filtered = songsData;

    // Filtrar por categoria
    if (category !== 'Todas') {
      filtered = filtered.filter(s => s.category === category);
    }

    // Filtrar por busca
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.artist && s.artist.toLowerCase().includes(q))
      );
    }

    setFilteredSongs(filtered);
  };

  // Atualizar filtros
  useEffect(() => {
    filterSongs(songs, activeCategory, searchQuery);
  }, [activeCategory, searchQuery, songs]);

  // Carregar ao montar
  useEffect(() => {
    loadSongs();
  }, []);

  // Recarregar quando receber foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSongs();
    });
    return unsubscribe;
  }, [navigation]);

  // Editar música
  const handleEditSong = (song) => {
    setEditingSong(song);
    setIsAddSongModalVisible(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setIsAddSongModalVisible(false);
    setEditingSong(null);
  };

  // Salvar música (criar ou atualizar)
  const handleSaveSong = (savedSong) => {
    loadSongs();
    handleCloseModal();
  };

  // Renderizar item de música
  const renderSongItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.songCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleEditSong(item)}
      activeOpacity={0.7}
    >
      <View style={styles.songHeader}>
        <View style={[styles.songIcon, { backgroundColor: colors.primary + '20' }]}>
          <FontAwesome name="music" size={18} color={colors.primary} />
        </View>
        <View style={styles.songInfo}>
          <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleEditSong(item)}>
          <FontAwesome name="pencil" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.songMeta}>
        <View style={styles.metaItem}>
          <FontAwesome name="music" size={12} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Tom: {item.key || '-'}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <FontAwesome name="tachometer" size={12} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Tempo: {item.bpm ? `${item.bpm} BPM` : '-'}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <FontAwesome name="clock-o" size={12} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            Duração: {item.duration_minutes ? `${item.duration_minutes}:30` : '-'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <TabScreenWrapper activeTab="Mídias" navigation={navigation}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleTextContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Mídias</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Biblioteca musical e materiais
            </Text>
          </View>
        </View>

        {/* Busca */}
        <View style={styles.searchSection}>
          <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <FontAwesome name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Buscar músicas, artistas..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <FontAwesome name="times-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categorias */}
        <View style={styles.categoriesSection}>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={item => item}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  { borderColor: colors.border },
                  activeCategory === item && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setActiveCategory(item)}
              >
                <Text style={[
                  styles.categoryText,
                  { color: colors.text },
                  activeCategory === item && { color: '#FFFFFF' }
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Estatísticas */}
        <View style={[styles.statsWrapper, { backgroundColor: colors.card }]}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.total}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Músicas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.withLyrics}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Com Letras</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.withChords}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Com Cifras</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.withAudio}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Com Áudio</Text>
            </View>
          </View>
        </View>

        {/* Lista de Músicas */}
        {loading ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando músicas...
            </Text>
          </View>
        ) : filteredSongs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="music" size={64} color={colors.textSecondary} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {searchQuery ? 'Nenhuma música encontrada' : 'Nenhuma música cadastrada'}
            </Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
              {searchQuery ? 'Tente buscar com outros termos' : 'Toque no botão + para adicionar'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredSongs}
            renderItem={renderSongItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Botão Adicionar */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => setIsAddSongModalVisible(true)}
        >
          <FontAwesome name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Modal Adicionar/Editar Música */}
        <AddSongModal
          visible={isAddSongModalVisible}
          onClose={handleCloseModal}
          onSave={handleSaveSong}
          editingSong={editingSong}
        />
      </View>
    </TabScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 24,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
    opacity: 0.7,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  categoriesSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsWrapper: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  songCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  songHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  songIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  songArtist: {
    fontSize: 15,
    opacity: 0.7,
  },
  songMeta: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
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
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default MediaScreen;
