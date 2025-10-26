import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import TestLayout from '../layout/TestLayout';
import vocabularyService from '../services/vocabularyService';
import testService from '../services/testService';
import testResultService from '../services/testResultService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const VocabularyTestTake = () => {
  const { testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialSettings =
    location.state?.settings ||
    JSON.parse(localStorage.getItem(`vocab_settings_${testId}`) || '{}');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState(initialSettings);
  const [timeLeft, setTimeLeft] = useState(initialSettings.timePerQuestion || 30);
  const [isPaused, setIsPaused] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastAnswerResult, setLastAnswerResult] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const timerRef = useRef(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };
    
    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Fetch test + câu hỏi
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching test data for testId:', testId);
        console.log('Settings:', settings);

        const [test, data] = await Promise.all([
          testService.getTestById(testId),
          vocabularyService.getAllVocabulariesByTestId(testId),
        ]);

        console.log('Test info:', test);
        console.log('Vocabulary data:', data);

        setTestInfo(test);

        if (!Array.isArray(data) || data.length === 0) {
          setError(`Không tìm thấy câu hỏi nào cho bài test ${testId}. Vui lòng kiểm tra lại.`);
          return;
        }

        const shuffled = [...data].sort(() => 0.5 - Math.random());
        const maxQ = Math.min(settings.totalQuestions || 10, data.length);
        const selected = shuffled.slice(0, maxQ).map((it, i) => ({
          ...it,
          questionNumber: i + 1,
        }));

        console.log('Selected questions:', selected);

        setItems(selected);
        setAnswers(new Array(selected.length).fill(null));
        setTimeLeft(settings.timePerQuestion || 30);
      } catch (e) {
        console.error('Error fetching test data:', e);
        setError(`Có lỗi xảy ra khi tải câu hỏi: ${e.message}. Vui lòng thử lại.`);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  const getCorrectAnswer = useCallback((item) => {
    if (settings.mode === 'word_to_meaning') return item.meaning;
    if (settings.mode === 'meaning_to_word') return item?.word;
    if (settings.mode === 'listen_and_type') return item?.word;
    return '';
  }, [settings.mode]);

  const checkAnswer = useCallback((item, answer, mode) => {
    const ua = (answer || '').toLowerCase().trim();
    if (mode === 'word_to_meaning') return ua === item.meaning.toLowerCase().trim();
    if (mode === 'meaning_to_word') return ua === item?.word.toLowerCase().trim();
    if (mode === 'listen_and_type') return ua === item?.word.toLowerCase().trim();
    return false;
  }, []);

  const moveToNext = useCallback(async () => {
    if (index < items.length - 1) {
      setIndex((i) => i + 1);
      setCurrentAnswer('');
      setTimeLeft(settings.timePerQuestion || 30);
      setShowAnswer(false);
      setLastAnswerResult(null);
      setIsPaused(false);
    } else {
      // Test completed, create draft result
      try {
        const totalQuestions = answers.length;
        const correctAnswers = answers.filter(answer => answer.isCorrect).length;
        const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

        const testResultData = {
          test_id: testId,
          test_type: 'vocabulary',
          answers: answers.map(answer => ({
            question_id: answer.question._id || answer.question.id,
            user_answer: answer.userAnswer,
            correct_answer: getCorrectAnswer(answer.question),
            is_correct: answer.isCorrect,
            question_text: answer.question.word,
            word: answer.question.word
          })),
          score: percentage,
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          time_taken: Math.floor(Date.now() / 1000) - Math.floor(new Date().getTime() / 1000), // Approximate time
          status: 'draft' // Create as draft initially
        };

        const draftResult = await testResultService.createTestResult(testResultData);
        
        navigate(`/vocabulary/test/${testId}/result`, {
          state: { 
            answers, 
            settings, 
            testInfo,
            draftResultId: draftResult._id || draftResult.id // Pass the draft result ID
          },
        });
      } catch (error) {
        console.error('Error creating draft result:', error);
        // Still navigate to result even if draft creation fails
        navigate(`/vocabulary/test/${testId}/result`, {
          state: { answers, settings, testInfo },
        });
      }
    }
  }, [index, items.length, settings.timePerQuestion, answers, testId, getCorrectAnswer, testInfo, navigate]);

  const handleSubmit = useCallback((answer) => {
    timerRef.current && clearInterval(timerRef.current);

    const current = items[index];
    const isCorrect = checkAnswer(current, answer, settings.mode);

    const next = [...answers];
    next[index] = {
      question: current,
      userAnswer: answer,
      isCorrect,
      timeSpent: (settings.timePerQuestion || 30) - timeLeft,
    };
    setAnswers(next);

    if (settings.showAnswerMode === 'after_each') {
      setLastAnswerResult({ isCorrect, correctAnswer: getCorrectAnswer(current) });
      setShowAnswer(true);
      setIsPaused(true);
    } else {
      moveToNext();
    }
  }, [items, index, answers, settings.mode, settings.timePerQuestion, settings.showAnswerMode, timeLeft, checkAnswer, getCorrectAnswer, moveToNext]);

  const handleCheckAnswer = () => {
    if (!currentAnswer.trim()) return;
    const current = items[index];
    const isCorrect = checkAnswer(current, currentAnswer, settings.mode);
    setLastAnswerResult({ isCorrect, correctAnswer: getCorrectAnswer(current) });
    setShowAnswer(true);
    setIsPaused(true);
  };

  const handleContinueAfterCheck = () => {
    setShowAnswer(false);
    setLastAnswerResult(null);
    setIsPaused(false);
    handleSubmit(currentAnswer);
  };

  // Đồng hồ đếm ngược
  useEffect(() => {
    if (loading || showAnswer || isPaused) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit('');
          return settings.timePerQuestion || 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [index, items, isPaused, showAnswer, loading, handleSubmit, settings.timePerQuestion]);

  const handleExit = () => {
    if (window.confirm('Bạn có chắc chắn muốn thoát? Kết quả sẽ không được lưu.')) {
      navigate(-1);
    }
  };

  const playAudio = (text) => {
    if (!text || isPlaying) return;
    setIsPlaying(true);
    
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; // Set default language
    
    // Configure voice based on settings
    if (settings.selectedVoice) {
      const voices = speechSynthesis.getVoices();
      let selectedVoice = null;
      
      // Map custom voice IDs to actual voices
      const voiceMap = {
        'en-US-1': voices.find(v => v.lang.startsWith('en-US') && v.name.toLowerCase().includes('female')),
        'en-US-2': voices.find(v => v.lang.startsWith('en-US') && v.name.toLowerCase().includes('male')),
        'en-GB-1': voices.find(v => v.lang.startsWith('en-GB') && v.name.toLowerCase().includes('female')),
        'en-GB-2': voices.find(v => v.lang.startsWith('en-GB') && v.name.toLowerCase().includes('male')),
        'en-AU-1': voices.find(v => v.lang.startsWith('en-AU') && v.name.toLowerCase().includes('female')),
        'en-AU-2': voices.find(v => v.lang.startsWith('en-AU') && v.name.toLowerCase().includes('male')),
        'en-CA-1': voices.find(v => v.lang.startsWith('en-CA') && v.name.toLowerCase().includes('female')),
        'en-IN-1': voices.find(v => v.lang.startsWith('en-IN') && v.name.toLowerCase().includes('female'))
      };
      
      selectedVoice = voiceMap[settings.selectedVoice];
      
      // Fallback: try to find by name or region
      if (!selectedVoice) {
        if (settings.selectedVoice.includes('US')) {
          selectedVoice = voices.find(v => v.lang.startsWith('en-US'));
        } else if (settings.selectedVoice.includes('GB')) {
          selectedVoice = voices.find(v => v.lang.startsWith('en-GB'));
        } else if (settings.selectedVoice.includes('AU')) {
          selectedVoice = voices.find(v => v.lang.startsWith('en-AU'));
        } else if (settings.selectedVoice.includes('CA')) {
          selectedVoice = voices.find(v => v.lang.startsWith('en-CA'));
        } else if (settings.selectedVoice.includes('IN')) {
          selectedVoice = voices.find(v => v.lang.startsWith('en-IN'));
        }
      }
      
      // Final fallback: any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith('en'));
      }
      
      if (selectedVoice) {
        u.voice = selectedVoice;
        u.lang = selectedVoice.lang;
        console.log('Using voice:', selectedVoice.name, selectedVoice.lang);
      }
    }
    
    u.rate = 0.8; // Slightly slower for better comprehension
    u.pitch = 1.0;
    u.volume = 1.0;
    
    u.onend = () => setIsPlaying(false);
    u.onerror = () => setIsPlaying(false);
    
    speechSynthesis.speak(u);
  };

  if (loading) return <LoadingSpinner message="Đang tải câu hỏi..." />;
  if (error) return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
  if (!items.length) return <ErrorMessage error="Không có câu hỏi nào." />;

  const current = items[index];

  return (
    <TestLayout
      testTitle={testInfo?.test_title || 'Bài test từ vựng'}
      currentQuestion={index}
      totalQuestions={items.length}
      timeLeft={timeLeft}
      timePerQuestion={settings.timePerQuestion || 30}
      onExit={handleExit}
    >
      {/* Container full-height: 2/3 : 1/3 */}
      <div className="mx-auto w-full max-w-7xl px-3 md:px-4 mt-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100svh-136px)]">
          {/* LEFT (2/3) */}
          <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex-1 overflow-auto">
              {/* Header nhỏ */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {settings.mode === 'word_to_meaning' && 'Đưa từ đoán nghĩa'}
                  {settings.mode === 'meaning_to_word' && 'Đưa nghĩa đoán từ'}
                  {settings.mode === 'listen_and_type' && 'Nghe và ghi từ'}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Câu {current.questionNumber}/{items.length}
                </span>
              </div>

              {/* Nội dung câu hỏi */}
              <div className="text-center mb-4">
                {settings.mode === 'word_to_meaning' && (
                  <div>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{current?.word}</h2>
                      <button
                        onClick={() => playAudio(current?.word)}
                        disabled={isPlaying}
                        className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-full text-blue-600 transition-colors disabled:opacity-50"
                        aria-label="Phát âm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm">Gõ nghĩa tiếng Việt của từ trên:</p>
                  </div>
                )}

                {settings.mode === 'meaning_to_word' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1.5">{current.meaning}</h2>
                    <p className="text-gray-600 text-sm">Gõ từ tiếng Anh phù hợp:</p>
                  </div>
                )}

                {settings.mode === 'listen_and_type' && (
                  <div>
                    <button
                      onClick={() => playAudio(current?.word)}
                      disabled={isPlaying}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm disabled:opacity-50 mb-2"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      {isPlaying ? 'Đang phát...' : 'Nghe từ'}
                    </button>
                    <p className="text-gray-600 text-sm">Nghe và gõ từ tiếng Anh:</p>
                  </div>
                )}
              </div>

              {/* Input + Actions */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !showAnswer && handleSubmit(currentAnswer)}
                  placeholder={
                    settings.mode === 'word_to_meaning'
                      ? 'Gõ nghĩa tiếng Việt...'
                      : settings.mode === 'meaning_to_word'
                        ? 'Gõ từ tiếng Anh...'
                        : 'Gõ từ tiếng Anh bạn nghe được...'
                  }
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                  disabled={showAnswer}
                  autoFocus
                />

                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => playAudio(current?.word)}
                    disabled={isPlaying}
                    className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    {isPlaying ? 'Đang phát...' : 'Nghe từ'}
                  </button>
                  <button
                    onClick={() => playAudio(current?.example_sentence)}
                    disabled={isPlaying}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6M9 16h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Nghe câu
                  </button>
                </div>

                <div className="flex gap-2">
                  {settings.showAnswerMode === 'after_each' && !showAnswer && (
                    <button
                      onClick={handleCheckAnswer}
                      disabled={!currentAnswer.trim()}
                      className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      Kiểm tra đáp án
                    </button>
                  )}
                  <button
                    onClick={() => handleSubmit(currentAnswer)}
                    disabled={showAnswer}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {index === items.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo'}
                  </button>
                </div>
              </div>

              {/* Kết quả sau khi check */}
              {showAnswer && lastAnswerResult && (
                <div
                  className={`mt-4 p-3 rounded-md border ${lastAnswerResult.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center ${lastAnswerResult.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}
                      >
                        {lastAnswerResult.isCorrect ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${lastAnswerResult.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                          {lastAnswerResult.isCorrect ? 'Chính xác!' : 'Không chính xác'}
                        </p>
                        {!lastAnswerResult.isCorrect && (
                          <p className="text-xs text-red-700">
                            Đáp án đúng: <span className="font-medium">{lastAnswerResult.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={settings.mode === 'listen_and_type' ? handleContinueAfterCheck : moveToNext}
                      className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                    >
                      {index === items.length - 1 ? 'Hoàn thành' : 'Tiếp tục'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT (1/3) */}
          <div className="lg:col-span-1 h-full">
            {/* Khung cột phải chia 2 hàng: vùng cuộn + thanh nộp cố định đáy */}
            <div className="h-full grid grid-rows-[1fr_auto]">
              {/* Scroll area */}
              <div className="overflow-y-auto pr-1 space-y-4">
                {/* Cài đặt giọng nói */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Cài đặt giọng nói</h3>
                  <select
                    value={settings.selectedVoice || ''}
                    onChange={(e) => {
                      const newSettings = { ...settings, selectedVoice: e.target.value };
                      setSettings(newSettings);
                      try {
                        localStorage.setItem(`vocab_settings_${testId}`, JSON.stringify(newSettings));
                      } catch (error) {
                        console.error('Error saving voice settings:', error);
                      }
                      
                      // Test the new voice immediately
                      if (current?.word && e.target.value) {
                        setTimeout(() => playAudio(current.word), 100);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Giọng mặc định</option>
                    <option value="en-US-1">🇺🇸 Nữ (American)</option>
                    <option value="en-US-2">🇺🇸 Nam (American)</option>
                    <option value="en-GB-1">🇬🇧 Nữ (British)</option>
                    <option value="en-GB-2">🇬🇧 Nam (British)</option>
                    <option value="en-AU-1">🇦🇺 Nữ (Australian)</option>
                    <option value="en-AU-2">🇦🇺 Nam (Australian)</option>
                    <option value="en-CA-1">🇨🇦 Nữ (Canadian)</option>
                    <option value="en-IN-1">🇮🇳 Nữ (Indian)</option>
                  </select>
                  {availableVoices.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {availableVoices.filter(v => v.lang.startsWith('en')).length} giọng tiếng Anh có sẵn
                    </p>
                  )}
                </div>

                {/* Tiến độ (mini, ô nhỏ) */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
                  <h3 className="font-semibold text-gray-900 mb-2 text-xs">Tiến độ</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-10 gap-1.5">
                      {items.map((_, idx) => {
                        const state =
                          idx < index
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : idx === index
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-gray-100 text-gray-500 border-gray-200';
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setIndex(idx)}
                            className={`w-7 h-7 rounded border ${state} flex items-center justify-center text-[10px]`}
                            aria-label={`Câu ${idx + 1}`}
                            title={`Câu ${idx + 1}`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-[11px] text-gray-600">Đã làm: {index}/{items.length} câu</div>
                  </div>
                </div>
              </div>

              {/* Footer submit cố định đáy cột phải */}
              <div className="bg-white border border-gray-200 p-3 rounded">
                <button
                  onClick={() => {
                    if (!window.confirm('Bạn có chắc chắn muốn nộp bài? Các câu chưa trả lời sẽ được tính là sai.')) return;
                    const remain = [...answers];
                    for (let i = index; i < items.length; i++) {
                      if (!remain[i]) {
                        remain[i] = { question: items[i], userAnswer: '', isCorrect: false, timeSpent: 0 };
                      }
                    }
                    navigate(`/vocabulary/test/${testId}/result`, {
                      state: { answers: remain, settings, testInfo },
                    });
                  }}
                  className="w-full px-4 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-semibold shadow-sm"
                >
                  🚀 Nộp bài ngay
                </button>
                <p className="text-[11px] text-gray-500 mt-2 text-center border-">Bạn có thể nộp bài bất cứ lúc nào</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TestLayout>
  );
};

export default VocabularyTestTake;
