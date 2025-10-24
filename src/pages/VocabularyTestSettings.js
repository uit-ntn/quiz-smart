import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VocabularyLayout from '../layout/VocabularyLayout';
import vocabularyService from '../services/vocabularyService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import VocabularyPreviewModal from '../components/VocabularyPreviewModal';

const VocabularyTestSettings = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  const [vocabularyCount, setVocabularyCount] = useState(0);
  const [vocabularies, setVocabularies] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    mode: 'word_to_meaning',
    totalQuestions: 10,
    timePerQuestion: 30,
    showAnswerMode: 'at_end',
    voiceMode: 'random',
    selectedVoice: ''
  });

  // Voice options
  const voices = [
    { id: 'en-US-1', name: 'Emma', country: 'United States', accent: 'American', gender: 'Female', flag: '🇺🇸' },
    { id: 'en-US-2', name: 'James', country: 'United States', accent: 'American', gender: 'Male', flag: '🇺🇸' },
    { id: 'en-GB-1', name: 'Charlotte', country: 'United Kingdom', accent: 'British', gender: 'Female', flag: '🇬🇧' },
    { id: 'en-GB-2', name: 'Oliver', country: 'United Kingdom', accent: 'British', gender: 'Male', flag: '🇬🇧' },
    { id: 'en-AU-1', name: 'Sophie', country: 'Australia', accent: 'Australian', gender: 'Female', flag: '🇦🇺' },
    { id: 'en-AU-2', name: 'William', country: 'Australia', accent: 'Australian', gender: 'Male', flag: '🇦🇺' },
    { id: 'en-CA-1', name: 'Emily', country: 'Canada', accent: 'Canadian', gender: 'Female', flag: '🇨🇦' },
    { id: 'en-IN-1', name: 'Priya', country: 'India', accent: 'Indian', gender: 'Female', flag: '🇮🇳' },
  ];

  useEffect(() => {
    const fetchTestInfo = async () => {
      try {
        setLoading(true);
        const [test, vocabularies] = await Promise.all([
          vocabularyService.getVocabularyTestById(testId),
          vocabularyService.getAllVocabulariesByTestId(testId)
        ]);
        
        setTestInfo(test);
        setVocabularies(vocabularies || []);
        setVocabularyCount(vocabularies.length || 0);
        
        // Load saved settings
        const savedSettings = localStorage.getItem(`vocab_settings_${testId}`);
        if (savedSettings) {
          setSettings({ ...settings, ...JSON.parse(savedSettings) });
        }
      } catch (err) {
        setError('Không thể tải thông tin bài test.');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchTestInfo();
    }
  }, [testId]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(`vocab_settings_${testId}`, JSON.stringify(newSettings));
  };

  const handleStartTest = () => {
    if (settings.totalQuestions > vocabularyCount) {
      alert(`Chỉ có ${vocabularyCount} từ vựng. Vui lòng chọn số câu hỏi nhỏ hơn hoặc bằng ${vocabularyCount}.`);
      return;
    }

    // Show preview modal first
    setShowPreviewModal(true);
  };

  const handlePreviewAndStart = () => {
    localStorage.setItem(`vocab_settings_${testId}`, JSON.stringify(settings));
    navigate(`/vocabulary/test/${testId}/take`, { state: { settings } });
  };

  const handlePlayAudio = (text) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice based on settings
    if (settings.voiceMode === 'fixed' && settings.selectedVoice) {
      const availableVoices = speechSynthesis.getVoices();
      const voice = voices.find(v => v.id === settings.selectedVoice);
      if (voice) {
        const matchedVoice = availableVoices.find(v => 
          v.lang.includes(settings.selectedVoice.substring(0, 5)) || 
          v.name.toLowerCase().includes(voice.accent.toLowerCase())
        );
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }
    }
    
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  };

  const playVoicePreview = (voiceId) => {
    const voice = voices.find(v => v.id === voiceId);
    if (voice) {
      const utterance = new SpeechSynthesisUtterance(`Hello, I am ${voice.name} from ${voice.country}`);
      
      // Try to set voice based on accent
      const availableVoices = speechSynthesis.getVoices();
      const matchedVoice = availableVoices.find(v => 
        v.lang.includes(voiceId.substring(0, 5)) || 
        v.name.toLowerCase().includes(voice.accent.toLowerCase())
      );
      
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải cấu hình..." />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <VocabularyLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Cấu hình bài test</h1>
              <p className="text-gray-600">
                <span className="font-medium">{testInfo?.test_title}</span> • {vocabularyCount} từ vựng
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Quay lại
            </button>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Test Mode */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Chế độ bài test</h3>
            </div>
            <div className="space-y-3">
              {[
                { value: 'word_to_meaning', label: 'Từ → Nghĩa', desc: 'Hiển thị từ tiếng Anh, gõ nghĩa tiếng Việt' },
                { value: 'meaning_to_word', label: 'Nghĩa → Từ', desc: 'Hiển thị nghĩa tiếng Việt, gõ từ tiếng Anh' },
                { value: 'listen_and_type', label: 'Nghe và ghi từ', desc: 'Nghe âm thanh và gõ từ tiếng Anh' }
              ].map((mode) => (
                <label key={mode.value} className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value={mode.value}
                    checked={settings.mode === mode.value}
                    onChange={(e) => handleSettingChange('mode', e.target.value)}
                    className="mt-1 mr-3 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{mode.label}</div>
                    <div className="text-sm text-gray-500">{mode.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Question Settings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Số lượng câu hỏi</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng số câu hỏi: {settings.totalQuestions}
                </label>
                <input
                  type="range"
                  min="5"
                  max={Math.min(vocabularyCount, 50)}
                  value={settings.totalQuestions}
                  onChange={(e) => handleSettingChange('totalQuestions', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>{Math.min(vocabularyCount, 50)}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian mỗi câu: {settings.timePerQuestion}s
                </label>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={settings.timePerQuestion}
                  onChange={(e) => handleSettingChange('timePerQuestion', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10s</span>
                  <span>120s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Answer Display */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Hiển thị đáp án</h3>
            </div>
            <div className="space-y-3">
              {[
                { value: 'at_end', label: 'Cuối bài test', desc: 'Xem đáp án sau khi hoàn thành tất cả câu hỏi' },
                { value: 'after_each', label: 'Sau mỗi câu', desc: 'Xem đáp án ngay sau khi trả lời từng câu' }
              ].map((mode) => (
                <label key={mode.value} className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="showAnswerMode"
                    value={mode.value}
                    checked={settings.showAnswerMode === mode.value}
                    onChange={(e) => handleSettingChange('showAnswerMode', e.target.value)}
                    className="mt-1 mr-3 text-purple-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{mode.label}</div>
                    <div className="text-sm text-gray-500">{mode.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Voice Settings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cài đặt giọng nói</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="voiceMode"
                    value="random"
                    checked={settings.voiceMode === 'random'}
                    onChange={(e) => handleSettingChange('voiceMode', e.target.value)}
                    className="mt-1 mr-3 text-orange-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Giọng ngẫu nhiên</div>
                    <div className="text-sm text-gray-500">Hệ thống sẽ chọn giọng khác nhau cho mỗi từ</div>
                  </div>
                </label>
                
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="voiceMode"
                    value="fixed"
                    checked={settings.voiceMode === 'fixed'}
                    onChange={(e) => handleSettingChange('voiceMode', e.target.value)}
                    className="mt-1 mr-3 text-orange-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Giọng cố định</div>
                    <div className="text-sm text-gray-500">Chọn một giọng để sử dụng cho toàn bộ bài test</div>
                  </div>
                </label>
              </div>

              {/* Voice Selection */}
              {settings.voiceMode === 'fixed' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Chọn giọng nói:</h4>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                    {voices.map((voice) => (
                      <div
                        key={voice.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          settings.selectedVoice === voice.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSettingChange('selectedVoice', voice.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{voice.flag}</span>
                            <div>
                              <div className="font-medium text-gray-900">{voice.name}</div>
                              <div className="text-sm text-gray-500">
                                {voice.accent} • {voice.gender}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playVoicePreview(voice.id);
                            }}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary & Start */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Sẵn sàng bắt đầu?</h3>
              <div className="flex items-center space-x-6 text-sm opacity-90">
                <span>📝 {settings.totalQuestions} câu hỏi</span>
                <span>⏱️ {settings.timePerQuestion}s/câu</span>
                <span>🎯 {settings.mode === 'word_to_meaning' ? 'Từ → Nghĩa' : 
                           settings.mode === 'meaning_to_word' ? 'Nghĩa → Từ' : 'Nghe & Viết'}</span>
                <span>🔊 {settings.voiceMode === 'random' ? 'Giọng ngẫu nhiên' : 
                           voices.find(v => v.id === settings.selectedVoice)?.name || 'Giọng cố định'}</span>
              </div>
            </div>
            <button
              onClick={handleStartTest}
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
            >
              Bắt đầu bài test →
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <VocabularyPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        items={vocabularies}
        isPlaying={isPlaying}
        onPlayAudio={handlePlayAudio}
        onStartTest={handlePreviewAndStart}
        testTitle={testInfo?.test_title}
      />
    </VocabularyLayout>
  );
};

export default VocabularyTestSettings;