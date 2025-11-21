import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  ActivityIndicator
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ModalPadrao from './ModalPadrao';
import theme from '../styles/theme';
import supabase from '../services/supabase';

/**
 * Modal para selecionar música da biblioteca
 */
const SelectSongModal = ({ visible, onClose, onSelect }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Carregar músicas do banco
  const loadSongs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;

      setSongs(data || []);
      setFilteredSongs(data || []);
    } catch (error) {
      console.error('Erro ao carregar músicas:', error);
      alert('Erro ao carregar músicas');
    } finally {
      setLoading(false);
    }
  };

  // Carregar músicas ao abrir modal
  useEffect(() => {
    if (visible) {
      loadSongs();
    }
  }, [visible]);

  // Filtrar músicas pela busca
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSongs(songs);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = songs.filter(song =>
        song.title.toLowerCase().includes(query) ||
        (song.artist && song.artist.toLowerCase().includes(query))
      );
      setFilteredSongs(filtered);
    }
  }, [searchQuery, songs]);

  const handleSelectSong = (song) => {
    onSelect(song);
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const renderSongItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.songItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleSelectSong(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.songIcon, { backgroundColor: colors.primary + '20' }]}>
        <FontAwesome name="music" size={20} color={colors.primary} />
      </View>
      <View style={styles.songInfo}>
        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.artist && (
          <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.artist}
          </Text>
        )}
      </View>
      <FontAwesome name="chevron-right" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ModalPadrao
      isVisible={visible}
      onClose={handleClose}
      title="Selecionar Música"
      height="80%"
    >
      <View style={styles.container}>
        {/* Subtítulo */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Escolha uma música da biblioteca de mídia:
        </Text>

        {/* Campo de Busca */}
        <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
          <FontAwesome name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar música ou artista..."
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

        {/* Lista de Músicas */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Carregando músicas...
            </Text>
          </View>
        ) : filteredSongs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="music" size={48} color={colors.textSecondary} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              {searchQuery ? 'Nenhuma música encontrada' : 'Nenhuma música cadastrada'}
            </Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
              {searchQuery ? 'Tente buscar com outros termos' : 'Adicione músicas à biblioteca'}
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
      </View>
    </ModalPadrao>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  songIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SelectSongModal;
