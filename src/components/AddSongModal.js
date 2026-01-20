import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Alert
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ModalPadrao from './ModalPadrao';
import theme from '../styles/theme';
import supabase from '../services/supabase';

/**
 * Modal para adicionar música à biblioteca
 */
const AddSongModal = ({ visible, onClose, onSave }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

  const [activeTab, setActiveTab] = useState('info'); // info, musical, lyrics
  const [saving, setSaving] = useState(false);

  // Aba Informações
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [observation, setObservation] = useState('');
  const [category, setCategory] = useState('Louvor');

  // Aba Dados Musicais
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [duration, setDuration] = useState('');

  // Aba Letra/Cifra
  const [lyrics, setLyrics] = useState('');

  // Categorias disponíveis
  const categories = ['Louvor', 'Adoração', 'Comunhão', 'Evangelística'];

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
        key: key.trim() || null,
        duration_minutes: duration ? parseInt(duration) : null,
        lyrics: lyrics.trim() || null,
        category: category,
        observation: observation.trim() || null,
        created_at: new Date().toISOString()
      };

      // Salvar no banco de dados
      const { data, error } = await supabase
        .from('songs')
        .insert([songData])
        .select()
        .single();

      if (error) throw error;

      Alert.alert('Sucesso', 'Música adicionada com sucesso!');
      
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
    setBpm('');
    setKey('');
    setDuration('');
    setLyrics('');
    onClose();
  };

  return (
    <ModalPadrao
      isVisible={visible}
      onClose={handleClose}
      title="Adicionar Música"
      height="90%"
    >
      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'info' && { backgroundColor: colors.primary }
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
              activeTab === 'musical' && { backgroundColor: colors.primary }
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
              activeTab === 'lyrics' && { backgroundColor: colors.primary }
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

              <View style={styles.row}>
                {/* BPM */}
                <View style={[styles.fieldContainer, styles.halfWidth]}>
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

                {/* Tom */}
                <View style={[styles.fieldContainer, styles.halfWidth]}>
                  <Text style={[styles.label, { color: colors.text }]}>Tom</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    placeholder="Ex: C, G, D, F#..."
                    placeholderTextColor={colors.textSecondary}
                    value={key}
                    onChangeText={setKey}
                  />
                </View>
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

        {/* Botões de Ação */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
            onPress={handleClose}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={saving}
          >
            <FontAwesome name="save" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.saveButtonText}>
              {saving ? 'Salvando...' : 'Salvar Música'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ModalPadrao>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: '#F0F2F5',
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddSongModal;
