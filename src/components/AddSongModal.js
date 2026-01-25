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
import DocumentPicker from 'react-native-document-picker';
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

  const [activeTab, setActiveTab] = useState('info'); // info, musical, lyrics, attachments
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

  // Aba Arquivo/Link
  const [links, setLinks] = useState([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [files, setFiles] = useState([]);
  const [newFileTitle, setNewFileTitle] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

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

  // Carregar anexos (links e arquivos)
  const loadAttachments = async (songId) => {
    try {
      const { data: linksData, error: linksError } = await supabase
        .from('song_links')
        .select('*')
        .eq('song_id', songId)
        .order('created_at', { ascending: true });

      if (linksError) throw linksError;

      const { data: filesData, error: filesError } = await supabase
        .from('song_files')
        .select('*')
        .eq('song_id', songId)
        .order('created_at', { ascending: true });

      if (filesError) throw filesError;

      setLinks(linksData || []);
      setFiles(filesData || []);
    } catch (err) {
      console.error('Erro ao carregar anexos:', err);
    }
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
      loadAttachments(editingSong.id);
    } else {
      setLinks([]);
      setFiles([]);
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

  // Handlers para Links
  const handleAddLink = async () => {
    if (!editingSong) {
      Alert.alert('Atenção', 'Salve a música antes de adicionar links.');
      return;
    }

    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      Alert.alert('Erro', 'Preencha título e URL.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('song_links')
        .insert([{
          song_id: editingSong.id,
          title: newLinkTitle.trim(),
          url: newLinkUrl.trim(),
        }])
        .select()
        .single();

      if (error) throw error;

      setLinks([...links, data]);
      setNewLinkTitle('');
      setNewLinkUrl('');
    } catch (err) {
      console.error('Erro ao salvar link:', err);
      Alert.alert('Erro', 'Não foi possível salvar o link.');
    }
  };

  const handleRemoveLink = async (id) => {
    try {
      const { error } = await supabase
        .from('song_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLinks(links.filter(l => l.id !== id));
    } catch (err) {
      console.error('Erro ao remover link:', err);
      Alert.alert('Erro', 'Não foi possível remover o link.');
    }
  };

  // Handlers para Arquivos
  const handlePickFile = async () => {
    if (!editingSong) {
      Alert.alert('Atenção', 'Salve a música antes de anexar arquivos.');
      return;
    }

    if (!newFileTitle.trim()) {
      Alert.alert('Erro', 'Digite um título para o arquivo.');
      return;
    }

    try {
      setUploadingFile(true);

      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.audio, DocumentPicker.types.pdf],
      });

      const path = `${editingSong.id}/${Date.now()}-${res.name}`;

      const file = {
        uri: res.uri,
        name: res.name,
        type: res.type || 'application/octet-stream',
      };

      const { error: uploadError } = await supabase
        .storage
        .from('song-files')
        .upload(path, file, {
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const fileType = res.type && res.type.includes('audio') ? 'audio' : 'pdf';

      const { data, error: insertError } = await supabase
        .from('song_files')
        .insert([{
          song_id: editingSong.id,
          title: newFileTitle.trim(),
          file_path: path,
          file_type: fileType,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      setFiles([...files, data]);
      setNewFileTitle('');
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('Erro ao enviar arquivo:', err);
        Alert.alert('Erro', 'Não foi possível enviar o arquivo.');
      }
    } finally {
      setUploadingFile(false);
    }
  };

  const handleOpenFile = async (file) => {
    try {
      const { data } = supabase
        .storage
        .from('song-files')
        .getPublicUrl(file.file_path);

      if (data?.publicUrl) {
        Linking.openURL(data.publicUrl);
      } else {
        Alert.alert('Erro', 'Arquivo não está público.');
      }
    } catch (err) {
      console.error('Erro ao abrir arquivo:', err);
      Alert.alert('Erro', 'Não foi possível abrir o arquivo.');
    }
  };

  const handleRemoveFile = async (id) => {
    try {
      const { error } = await supabase
        .from('song_files')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFiles(files.filter(f => f.id !== id));
    } catch (err) {
      console.error('Erro ao remover arquivo:', err);
      Alert.alert('Erro', 'Não foi possível remover o arquivo.');
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
    setLinks([]);
    setFiles([]);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setNewFileTitle('');
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
              Infos
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
              Dados
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
              Cifra
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'attachments'
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }
            ]}
            onPress={() => setActiveTab('attachments')}
          >
            <FontAwesome
              name="paperclip"
              size={16}
              color={activeTab === 'attachments' ? '#FFFFFF' : colors.text}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'attachments' ? '#FFFFFF' : colors.text }
              ]}
            >
              Anexo
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

          {activeTab === 'attachments' && (
            <View style={styles.tabContent}>
              {/* SEÇÃO PRINCIPAL: ENVIAR ARQUIVOS */}
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Enviar Arquivos
              </Text>

              {!editingSong ? (
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary, marginTop: 16 }]}>
                  Salve a música primeiro para anexar arquivos.
                </Text>
              ) : (
                <View style={styles.uploadBlock}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text, marginBottom: 8 }]}
                    placeholder="Título do arquivo"
                    placeholderTextColor={colors.textSecondary}
                    value={newFileTitle}
                    onChangeText={setNewFileTitle}
                  />
                  <TouchableOpacity
                    style={[
                      styles.uploadButton,
                      { backgroundColor: colors.primary, opacity: uploadingFile ? 0.5 : 1 }
                    ]}
                    onPress={uploadingFile ? undefined : handlePickFile}
                  >
                    <FontAwesome name="cloud-upload" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.uploadButtonText}>
                      {uploadingFile ? 'Enviando...' : 'Selecionar e Enviar Arquivo'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* SEÇÃO: ARQUIVOS E LINKS */}
              <View style={{ marginTop: 32 }}>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  Arquivos e Links
                </Text>

                {/* Arquivos */}
                {files.length > 0 && (
                  <View style={styles.fieldContainer}>
                    <Text style={[styles.label, { color: colors.text }]}>Arquivos</Text>
                    {files.map(file => (
                      <TouchableOpacity
                        key={file.id}
                        style={styles.attachmentRow}
                        onPress={() => handleOpenFile(file)}
                      >
                        <FontAwesome name="file" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                        <View style={styles.attachmentMain}>
                          <Text style={[styles.attachmentTitle, { color: colors.text }]} numberOfLines={1}>
                            {file.title}
                          </Text>
                          <Text style={[styles.attachmentSubtitle, { color: colors.textSecondary }]}>
                            {file.file_type.toUpperCase()}
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => handleRemoveFile(file.id)}>
                          <FontAwesome name="trash" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Links */}
                <View style={styles.fieldContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Links</Text>

                  {links.map(link => (
                    <TouchableOpacity
                      key={link.id}
                      style={styles.attachmentRow}
                      onPress={() => Linking.openURL(link.url)}
                    >
                      <FontAwesome name="link" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                      <View style={styles.attachmentMain}>
                        <Text style={[styles.attachmentTitle, { color: colors.text }]} numberOfLines={1}>
                          {link.title}
                        </Text>
                        <Text style={[styles.attachmentSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                          {link.url}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveLink(link.id)}>
                        <FontAwesome name="trash" size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}

                  <View style={styles.newAttachmentBlock}>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text, marginBottom: 8 }]}
                      placeholder="Título do link"
                      placeholderTextColor={colors.textSecondary}
                      value={newLinkTitle}
                      onChangeText={setNewLinkTitle}
                    />
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text, marginBottom: 8 }]}
                      placeholder="https://..."
                      placeholderTextColor={colors.textSecondary}
                      value={newLinkUrl}
                      onChangeText={setNewLinkUrl}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                    />
                    <TouchableOpacity
                      style={[styles.uploadButton, { backgroundColor: colors.primary }]}
                      onPress={handleAddLink}
                    >
                      <FontAwesome name="plus" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.uploadButtonText}>Adicionar Link</Text>
                    </TouchableOpacity>
                  </View>
                </View>
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
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  attachmentMain: {
    flex: 1,
  },
  attachmentTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  attachmentSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  newAttachmentBlock: {
    marginTop: 8,
  },
  attachmentButton: {
    marginTop: 4,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  attachmentButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadSectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  uploadBlock: {
    marginTop: 16,
    marginBottom: 24,
  },
  uploadButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default AddSongModal;
