import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Alert,
  Image,
  Linking
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ModalPadrao from './ModalPadrao';
import theme from '../styles/theme';
import supabase from '../services/supabase';

/**
 * Modal para adicionar música à biblioteca
 */
const AddSongModal = ({ visible, onClose, onSave, editingSong = null }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const [activeTab, setActiveTab] = useState('info'); // info, musical, lyrics
  const [saving, setSaving] = useState(false);

  // Aba Informações
  const [title, setTitle] = useState(editingSong?.title || '');
  const [artist, setArtist] = useState(editingSong?.artist || '');
  const [observation, setObservation] = useState(editingSong?.observation || '');
  const [category, setCategory] = useState(editingSong?.category || 'Louvor');
  const [youtubeUrl, setYoutubeUrl] = useState(editingSong?.youtube_url || '');

  // Aba Dados Musicais
  const [bpm, setBpm] = useState(editingSong?.bpm ? String(editingSong.bpm) : '');
  const [key, setKey] = useState(editingSong?.key || '');
  const [timeSignature, setTimeSignature] = useState(editingSong?.time_signature || '4/4');
  const [duration, setDuration] = useState(editingSong?.duration_minutes ? String(editingSong.duration_minutes) : '');

  // Aba Letra/Cifra
  const [lyrics, setLyrics] = useState(editingSong?.lyrics || '');

  // Categorias disponíveis
  const categories = ['Louvor', 'Adoração', 'Comunhão'];

  // Assinaturas disponíveis
  const timeSignatures = ['2/2', '2/4', '3/4', '4/4', '5/4', '6/4', '3/8', '6/8', '7/8', '9/8', '12/8'];

  // Tons disponíveis
  const musicalKeys = [
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
    'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bbm', 'Bm'
  ];

  // Extrair ID do YouTube da URL
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*$/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Normalizar URL do YouTube
  const normalizeYoutubeUrl = (url) => {
    if (!url) return null;
    return url.trim() || null;
  };

  // Atualizar campos quando editingSong mudar
  useEffect(() => {
    if (editingSong) {
      setTitle(editingSong.title || '');
      setArtist(editingSong.artist || '');
      setObservation(editingSong.observation || '');
      setCategory(editingSong.category || 'Louvor');
      setYoutubeUrl(editingSong.youtube_url || '');
      setBpm(editingSong.bpm ? String(editingSong.bpm) : '');
      setKey(editingSong.key || '');
      setTimeSignature(editingSong.time_signature || '4/4');
      setDuration(editingSong.duration_minutes ? String(editingSong.duration_minutes) : '');
      setLyrics(editingSong.lyrics || '');
    }
  }, [editingSong]);

  const handleSave = async () => {
    // Validação
    if (!title.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o título da música');
      return;
    }

    if (!artist.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o artista/banda');
      return;
    }

    try {
      setSaving(true);

      const songData = {
        title: title.trim(),
        artist: artist.trim(),
        bpm: bpm ? parseInt(bpm) : null,
        key: key || null,
        time_signature: timeSignature || null,
        duration_minutes: duration ? parseInt(duration) : null,
        lyrics_chords: lyrics.trim() || null,
        category: category,
        observation: observation.trim() || null,
        youtube_url: normalizeYoutubeUrl(youtubeUrl),
      };

      let data;
      let error;

      if (editingSong) {
        // Atualizar música existente
        const result = await supabase
          .from('songs')
          .update(songData)
          .eq('id', editingSong.id)
          .select()
          .single();
        
        data = result.data;
        error = result.error;

        if (!error) {
          Alert.alert('Sucesso', 'Música atualizada com sucesso!');
        }
      } else {
        // Criar nova música
        songData.created_at = new Date().toISOString();
        
        const result = await supabase
          .from('songs')
          .insert([songData])
          .select()
          .single();
        
        data = result.data;
        error = result.error;

        if (!error) {
          Alert.alert('Sucesso', 'Música adicionada com sucesso!');
        }
      }

      if (error) throw error;
      
      if (onSave) {
        onSave(data);
      }

      handleClose();
    } catch (error) {
      console.error('Erro ao salvar música:', error);
      Alert.alert('Erro', 'Não foi possível salvar a música');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setActiveTab('info');
    setTitle('');
    setArtist('');
    setObservation('');
    setCategory('Louvor');
    setYoutubeUrl('');
    setBpm('');
    setKey('');
    setTimeSignature('4/4');
    setDuration('');
    setLyrics('');
    onClose();
  };

  const leftButton = (
    <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
      <Text style={[styles.cancelText, { color: colors.primary }]}>Cancelar</Text>
    </TouchableOpacity>
  );

  const rightButton = (
    <TouchableOpacity 
      onPress={handleSave}
      disabled={saving}
      style={styles.headerButton}
    >
      <Text style={[styles.saveText, { color: colors.primary, opacity: saving ? 0.5 : 1 }]}>
        {saving ? 'Salvando...' : 'Salvar'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ModalPadrao
      isVisible={visible}
      onClose={handleClose}
      title={editingSong ? 'Editar Música' : 'Adicionar Música'}
      height="90%"
      leftButton={leftButton}
      rightButton={rightButton}
    >
      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'info' 
                ? { backgroundColor: colors.primary } 
                : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }
            ]}
            onPress={() => setActiveTab('info')}
          >
            <FontAwesome 
              name="info-circle" 
              size={16} 
              color={activeTab === 'info' ? '#FFFFFF' : colors.text} 
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'info' ? '#FFFFFF' : colors.text }
            ]}>
              Informações
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'musical' 
                ? { backgroundColor: colors.primary } 
                : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }
            ]}
            onPress={() => setActiveTab('musical')}
          >
            <FontAwesome 
              name="music" 
              size={16} 
              color={activeTab === 'musical' ? '#FFFFFF' : colors.text} 
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'musical' ? '#FFFFFF' : colors.text }
            ]}>
              Dados Musicais
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'lyrics' 
                ? { backgroundColor: colors.primary } 
                : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }
            ]}
            onPress={() => setActiveTab('lyrics')}
          >
            <FontAwesome 
              name="file-text-o" 
              size={16} 
              color={activeTab === 'lyrics' ? '#FFFFFF' : colors.text} 
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'lyrics' ? '#FFFFFF' : colors.text }
            ]}>
              Letra/Cifra
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo das Abas */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'info' && (
            <View style={styles.tabContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Informações da Música
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Dados básicos sobre a música
              </Text>

              {/* Título */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Título da Música <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  placeholder="Ex: Como Zaqueu, Reckless Love..."
                  placeholderTextColor={colors.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* Artista */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Artista/Banda <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  placeholder="Ex: Thalles Roberto, Hillsong..."
                  placeholderTextColor={colors.textSecondary}
                  value={artist}
                  onChangeText={setArtist}
                />
              </View>

              {/* Observação */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Observação</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  placeholder="Observações gerais sobre a música..."
                  placeholderTextColor={colors.textSecondary}
                  value={observation}
                  onChangeText={setObservation}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Categoria */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Categoria</Text>
                <View style={styles.categoriesContainer}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        { borderColor: colors.border },
                        category === cat && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[
                        styles.categoryText,
                        { color: colors.text },
                        category === cat && { color: '#FFFFFF' }
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Vídeo do YouTube */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Vídeo do YouTube</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  placeholder="https://www.youtube.com/watch?v=..."
                  placeholderTextColor={colors.textSecondary}
                  value={youtubeUrl}
                  onChangeText={setYoutubeUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                
                {/* Preview do vídeo */}
                {getYoutubeVideoId(youtubeUrl) && (
                  <View style={styles.videoPreviewContainer}>
                    <Text style={[styles.videoPreviewLabel, { color: colors.textSecondary }]}>
                      PREVIEW DO VÍDEO
                    </Text>
                    <TouchableOpacity
                      style={styles.thumbnailButton}
                      onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${getYoutubeVideoId(youtubeUrl)}`)}
                    >
                      <Image
                        style={styles.thumbnail}
                        source={{ uri: `https://img.youtube.com/vi/${getYoutubeVideoId(youtubeUrl)}/hqdefault.jpg` }}
                        resizeMode="cover"
                      />
                      <View style={styles.playOverlay}>
                        <FontAwesome name="play-circle" size={64} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                    <Text style={[styles.videoHint, { color: colors.textSecondary }]}>
                      Toque para assistir no YouTube
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {activeTab === 'musical' && (
            <View style={styles.tabContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Dados Musicais
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Informações técnicas da música
              </Text>

              {/* BPM */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>BPM</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  placeholder="Ex: 72, 120..."
                  placeholderTextColor={colors.textSecondary}
                  value={bpm}
                  onChangeText={setBpm}
                  keyboardType="numeric"
                />
              </View>

              {/* Assinatura */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Assinatura</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipsContainer}>
                    {timeSignatures.map((sig) => (
                      <TouchableOpacity
                        key={sig}
                        style={[
                          styles.chip,
                          { borderColor: colors.border },
                          timeSignature === sig && { backgroundColor: colors.primary, borderColor: colors.primary }
                        ]}
                        onPress={() => setTimeSignature(sig)}
                      >
                        <Text style={[
                          styles.chipText,
                          { color: colors.text },
                          timeSignature === sig && { color: '#FFFFFF' }
                        ]}>
                          {sig}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Tom */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Tom</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipsContainer}>
                    {musicalKeys.map((k) => (
                      <TouchableOpacity
                        key={k}
                        style={[
                          styles.chip,
                          { borderColor: colors.border },
                          key === k && { backgroundColor: colors.primary, borderColor: colors.primary }
                        ]}
                        onPress={() => setKey(k)}
                      >
                        <Text style={[
                          styles.chipText,
                          { color: colors.text },
                          key === k && { color: '#FFFFFF' }
                        ]}>
                          {k}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Duração */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Duração (minutos)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  placeholder="Ex: 4, 5, 6..."
                  placeholderTextColor={colors.textSecondary}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          {activeTab === 'lyrics' && (
            <View style={styles.tabContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Letra com Cifra
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Cole aqui a letra completa da música com cifras
              </Text>

              <View style={styles.fieldContainer}>
                <TextInput
                  style={[styles.lyricsArea, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  placeholder={"Exemplo:\nIntro: C Am F G\n\nC              Am\nPicao li Jesus Cristo é o Senhor\nF                    G\nEle me salvou com amor..."}
                  placeholderTextColor={colors.textSecondary}
                  value={lyrics}
                  onChangeText={setLyrics}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </ModalPadrao>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    minWidth: 70,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '400',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#E24C4C',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
  },
  lyricsArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Courier',
    minHeight: 300,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  videoPreviewContainer: {
    marginTop: 16,
  },
  videoPreviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  thumbnailButton: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  videoHint: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
});

export default AddSongModal;
