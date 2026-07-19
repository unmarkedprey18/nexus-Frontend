import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../services/api';
import { useTheme } from '../../store/useTheme';

// All sign language videos
const allSignLanguageVideos = [
  { id: '1', title: 'ASL Alphabet A to Z', channel: 'Bill Vicars', thumbnail: 'https://img.youtube.com/vi/tkMg8g8vVUo/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=tkMg8g8vVUo', duration: '8:24' },
  { id: '2', title: '25 ASL Signs You Need to Know', channel: 'Learn How to Sign', thumbnail: 'https://img.youtube.com/vi/ianCxd65jNY/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=ianCxd65jNY', duration: '6:12' },
  { id: '3', title: 'ASL Numbers 1 to 30', channel: 'Bill Vicars', thumbnail: 'https://img.youtube.com/vi/pYQHHQP0oFM/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=pYQHHQP0oFM', duration: '7:35' },
  { id: '4', title: '100 ASL Signs in 5 Minutes', channel: 'Learn How to Sign', thumbnail: 'https://img.youtube.com/vi/0FcwzMq4iWg/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=0FcwzMq4iWg', duration: '5:00' },
  { id: '5', title: 'Greetings in ASL', channel: 'Bill Vicars', thumbnail: 'https://img.youtube.com/vi/UmEDxhBFD1k/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=UmEDxhBFD1k', duration: '9:12' },
  { id: '6', title: 'Colors in ASL', channel: 'Learn How to Sign', thumbnail: 'https://img.youtube.com/vi/7elFS7HMvAI/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=7elFS7HMvAI', duration: '5:20' },
  { id: '7', title: 'Family Signs in ASL', channel: 'Bill Vicars', thumbnail: 'https://img.youtube.com/vi/Qn9CkMMBYo4/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=Qn9CkMMBYo4', duration: '8:50' },
  { id: '8', title: 'Feelings and Emotions in ASL', channel: 'Learn How to Sign', thumbnail: 'https://img.youtube.com/vi/SXNNwNkCmAo/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=SXNNwNkCmAo', duration: '10:55' },
  { id: '9', title: 'Food Signs in ASL', channel: 'Learn How to Sign', thumbnail: 'https://img.youtube.com/vi/L1oa2GGjzDM/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=L1oa2GGjzDM', duration: '13:45' },
  { id: '10', title: 'Animals in ASL', channel: 'Learn How to Sign', thumbnail: 'https://img.youtube.com/vi/7M2JEMBBPME/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=7M2JEMBBPME', duration: '11:20' },
  { id: '11', title: 'Medical Signs in ASL', channel: 'Learn How to Sign', thumbnail: 'https://img.youtube.com/vi/qkBMQkFBMPs/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=qkBMQkFBMPs', duration: '10:15' },
  { id: '12', title: 'Emergency Signs in ASL', channel: 'Bill Vicars', thumbnail: 'https://img.youtube.com/vi/1RVDmMkbSOI/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=1RVDmMkbSOI', duration: '6:48' },
  { id: '13', title: 'Time Signs in ASL', channel: 'Bill Vicars', thumbnail: 'https://img.youtube.com/vi/Z6Ga6v_PRHY/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=Z6Ga6v_PRHY', duration: '12:10' },
  { id: '14', title: 'School Signs in ASL', channel: 'Learn How to Sign', thumbnail: 'https://img.youtube.com/vi/cxoNfvGzJ9o/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=cxoNfvGzJ9o', duration: '9:30' },
  { id: '15', title: 'Body Parts in ASL', channel: 'Bill Vicars', thumbnail: 'https://img.youtube.com/vi/a9KeM7o25LY/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=a9KeM7o25LY', duration: '7:40' },
  { id: '16', title: 'Daily Life Signs in ASL', channel: 'Learn How to Sign', thumbnail: 'https://img.youtube.com/vi/v1desDduz5M/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=v1desDduz5M', duration: '12:30' },
];

// Shuffle array helper
const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Supported languages
const languages = [
  { code: 'en', name: '🇺🇸 English' },
  { code: 'es', name: '🇪🇸 Spanish' },
  { code: 'fr', name: '🇫🇷 French' },
  { code: 'de', name: '🇩🇪 German' },
  { code: 'it', name: '🇮🇹 Italian' },
  { code: 'pt', name: '🇧🇷 Portuguese' },
  { code: 'zh', name: '🇨🇳 Chinese' },
  { code: 'ja', name: '🇯🇵 Japanese' },
  { code: 'ko', name: '🇰🇷 Korean' },
  { code: 'ar', name: '🇸🇦 Arabic' },
  { code: 'ru', name: '🇷🇺 Russian' },
];

export default function TranslateScreen() {
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [signAnimation, setSignAnimation] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'live' | 'record'>('live');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'translate' | 'sign' | 'speech' | 'videos'>('translate');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [videos, setVideos] = useState<any[]>([]);
  const [refreshingVideos, setRefreshingVideos] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { colors } = useTheme();

  // Load available videos when videos tab is opened
  useEffect(() => {
    if (activeTab === 'videos' && videos.length === 0) {
      loadAvailableVideos();
    }
  }, [activeTab]);

  // Check if thumbnail loads successfully — means video is available
  const checkVideoAvailability = async (videoList: any[]) => {
    const available: any[] = [];
    const checks = videoList.map(async (video) => {
      try {
        const response = await fetch(video.thumbnail, { method: 'HEAD' });
        if (response.ok) {
          available.push(video);
        }
      } catch (err) {
        // Skip unavailable videos
      }
    });
    await Promise.all(checks);
    return available;
  };

  const loadAvailableVideos = async () => {
    try {
      setLoadingVideos(true);
      const shuffled = shuffleArray(allSignLanguageVideos);
      const available = await checkVideoAvailability(shuffled);
      setVideos(available.slice(0, 8));
    } catch (err) {
      // Show all if check fails
      setVideos(shuffleArray(allSignLanguageVideos).slice(0, 8));
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleRefreshVideos = async () => {
    try {
      setRefreshingVideos(true);
      const shuffled = shuffleArray(allSignLanguageVideos);
      const available = await checkVideoAvailability(shuffled);
      setVideos(available.slice(0, 8));
    } catch (err) {
      setVideos(shuffleArray(allSignLanguageVideos).slice(0, 8));
    } finally {
      setRefreshingVideos(false);
    }
  };

  // Open YouTube video in browser
  const handleOpenVideo = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  // Text to Text Translation
  const handleTranslateText = async () => {
    if (!text.trim()) { Alert.alert('Oops', 'Please type some text first!'); return; }
    try {
      setLoading(true);
      const response = await api.post('/translate/text-to-text', { text, sourceLanguage: selectedLang, targetLanguage: targetLang });
      const data = response.data?.data || response.data;
      setTranslatedText(data?.translatedText || '');
      setShowResults(true);
    } catch (err: any) {
      Alert.alert('Translation failed', err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  // Text to Sign Language
  const handleTextToSign = async () => {
    if (!text.trim()) { Alert.alert('Oops', 'Please type some text first!'); return; }
    try {
      setLoading(true);
      const response = await api.post('/translate/text-to-sign', { text, language: 'ASL' });
      const data = response.data?.data || response.data;
      setSignAnimation(data?.signAnimation || 'No sign data available');
      setShowResults(true);
    } catch (err: any) {
      Alert.alert('Sign translation failed', err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  // Text to Speech
  const handleTextToSpeech = async () => {
    if (!text.trim()) { Alert.alert('Oops', 'Please type some text first!'); return; }
    if (isSpeaking) { Speech.stop(); setIsSpeaking(false); return; }
    try {
      setLoading(true);
      const response = await api.post('/translate/text-to-speech', { text, language: targetLang });
      const data = response.data?.data || response.data;
      if (data?.audioUrl) {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, allowsRecordingIOS: false });
        const sound = new Audio.Sound();
        await sound.loadAsync({ uri: `https://nexus-3rk7.onrender.com${data.audioUrl}` });
        await sound.setVolumeAsync(1.0);
        await sound.playAsync();
        setIsSpeaking(true);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) setIsSpeaking(false);
        });
      } else {
        setIsSpeaking(true);
        Speech.speak(text, { language: targetLang, volume: 1.0, onDone: () => setIsSpeaking(false), onError: () => setIsSpeaking(false) });
      }
    } catch (err) {
      setIsSpeaking(true);
      Speech.speak(text, { language: targetLang, volume: 1.0, onDone: () => setIsSpeaking(false), onError: () => setIsSpeaking(false) });
    } finally { setLoading(false); }
  };

  // Speech to Text
  const handleStartRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) { Alert.alert('Permission needed', 'Please allow microphone access.'); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) { Alert.alert('Error', 'Could not start recording'); }
  };

  const handleStopRecording = async () => {
    if (!recording) return;
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setLoading(true);
      const formData = new FormData();
      formData.append('file', { uri, type: 'audio/m4a', name: 'recording.m4a' } as any);
      formData.append('language', selectedLang);
      const response = await api.post('/translate/speech-to-text', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const data = response.data?.data || response.data;
      setTranscribedText(data?.transcribedText || '');
      setText(data?.transcribedText || '');
    } catch (err: any) {
      Alert.alert('Transcription failed', err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const handleOpenCamera = async (mode: 'live' | 'record') => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) { Alert.alert('Permission needed', 'Please allow camera access.'); return; }
    }
    setCameraMode(mode);
    setCameraOpen(true);
  };

  const handleClear = () => {
    setText(''); setTranslatedText(''); setSignAnimation('');
    setTranscribedText(''); setShowResults(false);
    Speech.stop(); setIsSpeaking(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Translate</Text>
        <Text style={styles.headerSubtitle}>Powered by Groq AI + Edge TTS 🤟</Text>
      </View>

      {/* Tab selector */}
      <View style={[styles.tabRow, { backgroundColor: colors.card }]}>
        {[
          { key: 'translate', icon: '🌍', label: 'Translate' },
          { key: 'sign', icon: '🤟', label: 'Sign' },
          { key: 'speech', icon: '🎤', label: 'Speech' },
          { key: 'videos', icon: '📺', label: 'Videos' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => { setActiveTab(tab.key as any); setShowResults(false); }}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── TRANSLATE TAB ── */}
      {activeTab === 'translate' && (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>From:</Text>
          <TouchableOpacity
            style={[styles.langButton, { borderColor: colors.border }]}
            onPress={() => { setShowLangPicker(!showLangPicker); setShowTargetPicker(false); }}
          >
            <Ionicons name="language-outline" size={18} color="#534AB7" />
            <Text style={[styles.langButtonText, { color: colors.text }]}>
              {languages.find(l => l.code === selectedLang)?.name || '🇺🇸 English'}
            </Text>
            <Ionicons name={showLangPicker ? 'chevron-up' : 'chevron-down'} size={16} color="#999" />
          </TouchableOpacity>
          {showLangPicker && (
            <View style={[styles.langList, { backgroundColor: colors.background, borderColor: colors.border }]}>
              {languages.map((lang) => (
                <TouchableOpacity key={lang.code} style={[styles.langItem, { borderBottomColor: colors.border }]}
                  onPress={() => { setSelectedLang(lang.code); setShowLangPicker(false); }}>
                  <Text style={[styles.langItemText, { color: colors.text }]}>{lang.name}</Text>
                  {selectedLang === lang.code && <Ionicons name="checkmark-circle" size={18} color="#534AB7" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 12 }]}>To:</Text>
          <TouchableOpacity
            style={[styles.langButton, { borderColor: colors.border }]}
            onPress={() => { setShowTargetPicker(!showTargetPicker); setShowLangPicker(false); }}
          >
            <Ionicons name="language-outline" size={18} color="#1D9E75" />
            <Text style={[styles.langButtonText, { color: colors.text }]}>
              {languages.find(l => l.code === targetLang)?.name || '🇪🇸 Spanish'}
            </Text>
            <Ionicons name={showTargetPicker ? 'chevron-up' : 'chevron-down'} size={16} color="#999" />
          </TouchableOpacity>
          {showTargetPicker && (
            <View style={[styles.langList, { backgroundColor: colors.background, borderColor: colors.border }]}>
              {languages.map((lang) => (
                <TouchableOpacity key={lang.code} style={[styles.langItem, { borderBottomColor: colors.border }]}
                  onPress={() => { setTargetLang(lang.code); setShowTargetPicker(false); }}>
                  <Text style={[styles.langItemText, { color: colors.text }]}>{lang.name}</Text>
                  {targetLang === lang.code && <Ionicons name="checkmark-circle" size={18} color="#1D9E75" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, marginTop: 12 }]}
            placeholder="Type text to translate..."
            placeholderTextColor="#999"
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.clearButton, { borderColor: colors.border, backgroundColor: colors.background }]} onPress={handleClear}>
              <Ionicons name="close-circle-outline" size={18} color="#666" />
              <Text style={[styles.clearButtonText, { color: colors.subtitle }]}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.speakButton, { backgroundColor: isSpeaking ? '#E24B4A' : '#1D9E75' }]} onPress={handleTextToSpeech} disabled={loading}>
              <Ionicons name={isSpeaking ? 'stop-outline' : 'volume-high-outline'} size={18} color="#fff" />
              <Text style={styles.speakButtonText}>{isSpeaking ? 'Stop' : 'Speak'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.translateButton} onPress={handleTranslateText} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : (
                <><Ionicons name="swap-horizontal-outline" size={18} color="#fff" /><Text style={styles.translateButtonText}>Translate</Text></>
              )}
            </TouchableOpacity>
          </View>

          {showResults && translatedText !== '' && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Translation:</Text>
              <Text style={styles.resultText}>{translatedText}</Text>
              <TouchableOpacity style={styles.speakResultButton} onPress={() => Speech.speak(translatedText, { language: targetLang, volume: 1.0 })}>
                <Ionicons name="volume-high-outline" size={16} color="#fff" />
                <Text style={styles.speakResultText}>Speak</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ── SIGN TAB ── */}
      {activeTab === 'sign' && (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Text to Sign Language (ASL):</Text>
          <View style={styles.cameraButtonRow}>
            <TouchableOpacity style={[styles.cameraButton, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => handleOpenCamera('record')}>
              <View style={styles.cameraIconCircle}><Ionicons name="videocam-outline" size={24} color="#534AB7" /></View>
              <Text style={[styles.cameraButtonTitle, { color: colors.text }]}>Record Video</Text>
              <Text style={[styles.cameraButtonSubtitle, { color: colors.subtitle }]}>Record signing</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cameraButton, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => handleOpenCamera('live')}>
              <View style={styles.cameraIconCircle}><Ionicons name="camera-outline" size={24} color="#534AB7" /></View>
              <Text style={[styles.cameraButtonTitle, { color: colors.text }]}>Live Camera</Text>
              <Text style={[styles.cameraButtonSubtitle, { color: colors.subtitle }]}>Live translate</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, marginTop: 12 }]}
            placeholder="Type text to convert to sign language..."
            placeholderTextColor="#999"
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={3}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.clearButton, { borderColor: colors.border, backgroundColor: colors.background }]} onPress={handleClear}>
              <Ionicons name="close-circle-outline" size={18} color="#666" />
              <Text style={[styles.clearButtonText, { color: colors.subtitle }]}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.translateButton} onPress={handleTextToSign} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : (
                <><Ionicons name="hand-left-outline" size={18} color="#fff" /><Text style={styles.translateButtonText}>Get Signs</Text></>
              )}
            </TouchableOpacity>
          </View>
          {showResults && signAnimation !== '' && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Sign Language Result:</Text>
              <Text style={styles.resultText}>{signAnimation}</Text>
            </View>
          )}
        </View>
      )}

      {/* ── SPEECH TAB ── */}
      {activeTab === 'speech' && (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Speech to Text:</Text>
          <Text style={[styles.speechHint, { color: colors.subtitle }]}>
            Tap the mic to record, then stop to transcribe using Groq Whisper AI
          </Text>
          <TouchableOpacity style={[styles.langButton, { borderColor: colors.border, marginBottom: 16 }]} onPress={() => setShowLangPicker(!showLangPicker)}>
            <Ionicons name="language-outline" size={18} color="#534AB7" />
            <Text style={[styles.langButtonText, { color: colors.text }]}>
              {languages.find(l => l.code === selectedLang)?.name || '🇺🇸 English'}
            </Text>
            <Ionicons name={showLangPicker ? 'chevron-up' : 'chevron-down'} size={16} color="#999" />
          </TouchableOpacity>
          {showLangPicker && (
            <View style={[styles.langList, { backgroundColor: colors.background, borderColor: colors.border }]}>
              {languages.map((lang) => (
                <TouchableOpacity key={lang.code} style={[styles.langItem, { borderBottomColor: colors.border }]}
                  onPress={() => { setSelectedLang(lang.code); setShowLangPicker(false); }}>
                  <Text style={[styles.langItemText, { color: colors.text }]}>{lang.name}</Text>
                  {selectedLang === lang.code && <Ionicons name="checkmark-circle" size={18} color="#534AB7" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity
            style={[styles.bigMicButton, { backgroundColor: isRecording ? '#E24B4A' : '#534AB7' }]}
            onPress={isRecording ? handleStopRecording : handleStartRecording}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" size="large" /> : <Ionicons name={isRecording ? 'stop' : 'mic'} size={40} color="#fff" />}
          </TouchableOpacity>
          <Text style={[styles.micLabel, { color: colors.subtitle }]}>
            {loading ? 'Transcribing...' : isRecording ? 'Recording... tap to stop' : 'Tap to start recording'}
          </Text>
          {transcribedText !== '' && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Transcribed Text:</Text>
              <Text style={styles.resultText}>{transcribedText}</Text>
              <TouchableOpacity style={styles.speakResultButton} onPress={() => Speech.speak(transcribedText, { language: selectedLang, volume: 1.0 })}>
                <Ionicons name="volume-high-outline" size={16} color="#fff" />
                <Text style={styles.speakResultText}>Speak</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ── VIDEOS TAB ── */}
      {activeTab === 'videos' && (
        <View style={styles.videosSection}>
          <View style={styles.videosHeader}>
            <View>
              <Text style={[styles.videosSectionTitle, { color: colors.text }]}>Sign Language Videos 📺</Text>
              <Text style={[styles.videosSectionSubtitle, { color: colors.subtitle }]}>
                Only showing videos available in your region
              </Text>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefreshVideos}
              disabled={refreshingVideos || loadingVideos}
            >
              {refreshingVideos || loadingVideos ? (
                <ActivityIndicator size="small" color="#534AB7" />
              ) : (
                <Ionicons name="refresh-outline" size={22} color="#534AB7" />
              )}
            </TouchableOpacity>
          </View>

          {/* Loading state */}
          {loadingVideos && (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#534AB7" />
              <Text style={[styles.loadingText, { color: colors.subtitle }]}>
                Checking available videos...
              </Text>
            </View>
          )}

          {/* Refreshing state */}
          {refreshingVideos && !loadingVideos && (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#534AB7" />
              <Text style={[styles.loadingText, { color: colors.subtitle }]}>
                Loading new videos...
              </Text>
            </View>
          )}

          {/* Video cards — only available ones */}
          {!loadingVideos && !refreshingVideos && videos.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={[styles.videoCard, { backgroundColor: colors.card }]}
              onPress={() => handleOpenVideo(video.url)}
            >
              <View style={styles.thumbnailContainer}>
                <Image
                  source={{ uri: video.thumbnail }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <View style={styles.playOverlay}>
                  <Ionicons name="play-circle" size={44} color="#fff" />
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{video.duration}</Text>
                </View>
              </View>
              <View style={styles.videoInfo}>
                <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
                  {video.title}
                </Text>
                <View style={styles.videoMeta}>
                  <Ionicons name="logo-youtube" size={14} color="#E24B4A" />
                  <Text style={[styles.videoChannel, { color: colors.subtitle }]}>{video.channel}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Empty state */}
          {!loadingVideos && !refreshingVideos && videos.length === 0 && (
            <View style={styles.centered}>
              <Ionicons name="videocam-off-outline" size={48} color="#ccc" />
              <Text style={[styles.emptyText, { color: colors.subtitle }]}>
                No videos available in your region
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRefreshVideos}>
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loadingVideos && !refreshingVideos && videos.length > 0 && (
            <View style={[styles.noteBox, { backgroundColor: colors.card }]}>
              <Ionicons name="information-circle-outline" size={18} color="#534AB7" />
              <Text style={[styles.noteText, { color: colors.subtitle }]}>
                Tap refresh to load different videos. Only videos available in your region are shown.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Camera Modal */}
      <Modal visible={cameraOpen} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} facing="back" ref={cameraRef} />
          <View style={styles.cameraOverlay}>
            <TouchableOpacity style={styles.closeCamera} onPress={() => { setCameraOpen(false); setIsRecording(false); }}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <View style={styles.modeBadge}>
              <Text style={styles.modeBadgeText}>{cameraMode === 'live' ? '🔴 Live Mode' : '🎥 Record Mode'}</Text>
            </View>
            <Text style={styles.cameraInstruction}>Point camera at person signing</Text>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordingActive]}
              onPress={() => { if (isRecording) { setIsRecording(false); setCameraOpen(false); } else { setIsRecording(true); } }}
            >
              <Ionicons name={isRecording ? 'stop' : 'radio-button-on'} size={28} color="#fff" />
              <Text style={styles.recordButtonText}>{isRecording ? 'Stop' : 'Record'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { backgroundColor: '#534AB7', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 },
  headerSubtitle: { fontSize: 14, color: '#d0ccff' },
  tabRow: {
    flexDirection: 'row', margin: 16, borderRadius: 12, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#534AB7' },
  tabIcon: { fontSize: 16 },
  tabLabel: { fontSize: 10, color: '#999', marginTop: 2, fontWeight: '500' },
  activeTabLabel: { color: '#fff' },
  card: {
    margin: 16, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 32,
  },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 10 },
  langButton: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, padding: 12 },
  langButtonText: { flex: 1, fontSize: 14, fontWeight: '500' },
  langList: { marginTop: 6, borderRadius: 10, borderWidth: 1, overflow: 'hidden', marginBottom: 8 },
  langItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1 },
  langItemText: { fontSize: 14 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 15, minHeight: 90, textAlignVertical: 'top' },
  buttonRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  clearButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
  clearButtonText: { fontSize: 13, fontWeight: '500' },
  speakButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10 },
  speakButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  translateButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, backgroundColor: '#534AB7' },
  translateButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  resultBox: { marginTop: 16, backgroundColor: '#f0fdf4', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#bbf7d0' },
  resultLabel: { fontSize: 12, fontWeight: '700', color: '#166534', marginBottom: 8 },
  resultText: { fontSize: 15, fontWeight: '500', marginBottom: 10, lineHeight: 22, color: '#1a1a1a' },
  speakResultButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1D9E75', padding: 8, borderRadius: 8, alignSelf: 'flex-start' },
  speakResultText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  cameraButtonRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  cameraButton: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1 },
  cameraIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ede9ff', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  cameraButtonTitle: { fontSize: 12, fontWeight: '700', marginBottom: 2, textAlign: 'center' },
  cameraButtonSubtitle: { fontSize: 11, textAlign: 'center' },
  speechHint: { fontSize: 13, marginBottom: 16, lineHeight: 20 },
  bigMicButton: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginVertical: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  micLabel: { textAlign: 'center', fontSize: 14, marginBottom: 16 },
  videosSection: { padding: 16, paddingBottom: 32 },
  videosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  videosSectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  videosSectionSubtitle: { fontSize: 12, lineHeight: 18 },
  refreshButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ede9ff', justifyContent: 'center', alignItems: 'center' },
  videoCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  thumbnailContainer: { position: 'relative', width: '100%', height: 180 },
  thumbnail: { width: '100%', height: '100%' },
  playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  durationBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  durationText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  videoInfo: { padding: 12 },
  videoTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6, lineHeight: 20 },
  videoMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  videoChannel: { fontSize: 12 },
  noteBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 12, padding: 14, marginTop: 8 },
  noteText: { flex: 1, fontSize: 13, lineHeight: 20 },
  centered: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
  emptyText: { fontSize: 15, textAlign: 'center' },
  retryButton: { backgroundColor: '#534AB7', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 30, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  closeCamera: { position: 'absolute', top: -400, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  modeBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  modeBadgeText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  cameraInstruction: { color: '#fff', fontSize: 14, marginBottom: 20, textAlign: 'center' },
  recordButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#534AB7', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 30 },
  recordingActive: { backgroundColor: '#E24B4A' },
  recordButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});