import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import TestLayout from '../layout/TestLayout';
import vocabularyService from '../services/vocabularyService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const VocabularyTestTake = () => {
  const { testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialSettings = location.state?.settings || JSON.parse(localStorage.getItem(`vocab_settings_${testId}`) || '{}');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);
  const [settings, setSettings] = useState(initialSettings);
  const [timeLeft, setTimeLeft] = useState(initialSettings.timePerQuestion || 30);
  const [isPaused, setIsPaused] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastAnswerResult, setLastAnswerResult] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch test info and vocabularies
        const [test, data] = await Promise.all([
          vocabularyService.getVocabularyTestById(testId),
          vocabularyService.getAllVocabulariesByTestId(testId)
        ]);

        setTestInfo(test);

        if (!data || !Array.isArray(data) || data.length === 0) {
          setError(`Không tìm thấy câu hỏi nào cho bài test ${testId}.`);
          return;
        }

        // Shuffle và lấy số lượng câu hỏi theo settings
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        const maxQuestions = Math.min(settings.totalQuestions || 10, data.length);
        const selectedItems = shuffled.slice(0, maxQuestions);

        // Tất cả các chế độ từ vựng đều là tự luận - không cần tạo choices
        const processedItems = selectedItems.map((item, idx) => {
          return {
            ...item,
            questionNumber: idx + 1
          };
        });

        setItems(processedItems);
        setAnswers(new Array(processedItems.length).fill(null));
        setTimeLeft(settings.timePerQuestion || 30);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Có lỗi xảy ra khi tải câu hỏi. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [testId, settings.totalQuestions]);

  // Timer effect
  useEffect(() => {
    if (loading || showAnswer || isPaused) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Hết thời gian, tự động submit
          handleSubmit('');
          return settings.timePerQuestion || 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [index, items, isPaused, showAnswer, loading]);

  const handleSubmit = (answer) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const current = items[index];
    const isCorrect = checkAnswer(current, answer, settings.mode);
    
    // Lưu câu trả lời
    const newAnswers = [...answers];
    newAnswers[index] = {
      question: current,
      userAnswer: answer,
      isCorrect,
      timeSpent: (settings.timePerQuestion || 30) - timeLeft
    };
    setAnswers(newAnswers);

    if (settings.showAnswerMode === 'after_each') {
      setLastAnswerResult({ isCorrect, correctAnswer: getCorrectAnswer(current) });
      setShowAnswer(true);
      setIsPaused(true);
    } else {
      // Chuyển câu tiếp theo ngay
      moveToNext();
    }
  };

  const checkAnswer = (item, answer, mode) => {
    const userAnswer = answer.toLowerCase().trim();
    
    if (mode === 'word_to_meaning') {
      // So sánh nghĩa tiếng Việt (không phân biệt hoa thường)
      return userAnswer === item.meaning.toLowerCase().trim();
    } else if (mode === 'meaning_to_word') {
      // So sánh từ tiếng Anh (không phân biệt hoa thường)
      return userAnswer === item?.word.toLowerCase().trim();
    } else if (mode === 'listen_and_type') {
      // So sánh từ tiếng Anh (không phân biệt hoa thường)
      return userAnswer === item?.word.toLowerCase().trim();
    }
    return false;
  };

  const getCorrectAnswer = (item) => {
    if (settings.mode === 'word_to_meaning') {
      return item.meaning;
    } else if (settings.mode === 'meaning_to_word') {
      return item?.word;
    } else if (settings.mode === 'listen_and_type') {
      return item?.word;
    }
    return '';
  };

  const playAudio = (text) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice based on settings
    if (settings.voiceMode === 'fixed' && settings.selectedVoice) {
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => 
        voice.name.includes(settings.selectedVoice) || 
        voice.voiceURI.includes(settings.selectedVoice)
      );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  };

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
    
    // Submit the answer
    handleSubmit(currentAnswer);
  };

  const moveToNext = () => {
    if (index < items.length - 1) {
      setIndex(prev => prev + 1);
      setCurrentAnswer('');
      setTimeLeft(settings.timePerQuestion || 30);
      setShowAnswer(false);
      setLastAnswerResult(null);
      setIsPaused(false);
    } else {
      // Kết thúc bài test
      navigate(`/vocabulary/test/${testId}/result`, { 
        state: { 
          answers, 
          settings,
          testInfo
        } 
      });
    }
  };

  const handleExit = () => {
    if (window.confirm('Bạn có chắc chắn muốn thoát? Kết quả sẽ không được lưu.')) {
      navigate(-1);
    }
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
      <div className="max-w-6xl mx-auto px-3 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Main Question Area - Left Column */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              {/* Question Type Indicator */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {settings.mode === 'word_to_meaning' && 'Đưa từ đoán nghĩa'}
                    {settings.mode === 'meaning_to_word' && 'Đưa nghĩa đoán từ'}
                    {settings.mode === 'listen_and_type' && 'Nghe và ghi từ'}
                  </span>
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  Câu {current.questionNumber}/{items.length}
                </span>
              </div>

              {/* Question Content */}
              <div className="text-center mb-4">
                {settings.mode === 'word_to_meaning' && (
                  <div>
                    <div className="flex items-center justify-center space-x-3 mb-3">
                      <h2 className="text-3xl font-bold text-gray-900">{current?.word}</h2>
                      <button
                        onClick={() => playAudio(current?.word)}
                        disabled={isPlaying}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full text-blue-600 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-gray-600 mb-3">Gõ nghĩa tiếng Việt của từ trên:</p>
                  </div>
                )}

                {settings.mode === 'meaning_to_word' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{current.meaning}</h2>
                    <p className="text-gray-600 mb-3">Gõ từ tiếng Anh phù hợp:</p>
                  </div>
                )}

                {settings.mode === 'listen_and_type' && (
                  <div>
                    <button
                      onClick={() => playAudio(current?.word)}
                      disabled={isPlaying}
                      className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 mb-3"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      {isPlaying ? 'Đang phát...' : 'Nghe từ'}
                    </button>
                    <p className="text-gray-600 mb-3">Nghe và gõ từ tiếng Anh:</p>
                  </div>
                )}
              </div>

              {/* Answer Area - Tất cả chế độ đều là tự luận */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !showAnswer && handleSubmit(currentAnswer)}
                  placeholder={
                    settings.mode === 'word_to_meaning' ? 'Gõ nghĩa tiếng Việt...' :
                    settings.mode === 'meaning_to_word' ? 'Gõ từ tiếng Anh...' :
                    'Gõ từ tiếng Anh bạn nghe được...'
                  }
                  className="w-full p-3 text-base border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  disabled={showAnswer}
                  autoFocus
                />
                
                {/* Listen Buttons */}
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => playAudio(
                      settings.mode === 'word_to_meaning' ? current?.word :
                      settings.mode === 'meaning_to_word' ? current?.word :
                      current?.word
                    )}
                    disabled={isPlaying}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    {isPlaying ? 'Đang phát...' : 'Nghe từ'}
                  </button>
                  <button
                    onClick={() => playAudio(current?.example_sentence)}
                    disabled={isPlaying}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6M9 16h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Nghe câu
                  </button>
                </div>

                <div className="flex space-x-3">
                  {settings.showAnswerMode === 'after_each' && !showAnswer && (
                    <button
                      onClick={handleCheckAnswer}
                      disabled={!currentAnswer.trim()}
                      className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                    >
                      Kiểm tra đáp án
                    </button>
                  )}
                  <button
                    onClick={() => handleSubmit(currentAnswer)}
                    disabled={showAnswer}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  >
                    {index === items.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo'}
                  </button>
                </div>
              </div>

              {/* Answer Result */}
              {showAnswer && lastAnswerResult && (
                <div className={`mt-6 p-4 rounded-lg border-2 ${
                  lastAnswerResult.isCorrect 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        lastAnswerResult.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {lastAnswerResult.isCorrect ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${
                          lastAnswerResult.isCorrect ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {lastAnswerResult.isCorrect ? 'Chính xác!' : 'Không chính xác'}
                        </p>
                        {!lastAnswerResult.isCorrect && (
                          <p className="text-sm text-red-700">
                            Đáp án đúng: <span className="font-medium">{lastAnswerResult.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={settings.mode === 'listen_and_type' ? handleContinueAfterCheck : moveToNext}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      {index === items.length - 1 ? 'Hoàn thành' : 'Tiếp tục'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Controls & Progress */}
          <div className="space-y-4">
            {/* Voice Settings */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Cài đặt giọng nói</h3>
              <div className="space-y-3">
                <select
                  value={settings.selectedVoice || ''}
                  onChange={(e) => {
                    const newSettings = { ...settings, selectedVoice: e.target.value };
                    setSettings(newSettings);
                    localStorage.setItem(`vocab_settings_${testId}`, JSON.stringify(newSettings));
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Giọng ngẫu nhiên</option>
                  <option value="en-US-1">🇺🇸 Emma (American)</option>
                  <option value="en-US-2">🇺🇸 James (American)</option>
                  <option value="en-GB-1">🇬🇧 Charlotte (British)</option>
                  <option value="en-GB-2">🇬🇧 Oliver (British)</option>
                  <option value="en-AU-1">🇦🇺 Sophie (Australian)</option>
                  <option value="en-AU-2">🇦🇺 William (Australian)</option>
                  <option value="en-CA-1">🇨🇦 Emily (Canadian)</option>
                  <option value="en-IN-1">🇮🇳 Priya (Indian)</option>
                </select>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Tiến độ</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2">
                  {items.map((_, idx) => (
                    <div
                      key={idx}
                      className={`aspect-square rounded flex items-center justify-center text-xs font-medium ${
                        idx < index ? 'bg-green-100 text-green-700' :
                        idx === index ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  Đã làm: {index}/{items.length} câu
                </div>
              </div>
            </div>

            {/* Submit Test Button */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Nộp bài</h3>
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn nộp bài? Các câu chưa trả lời sẽ được tính là sai.')) {
                    // Submit with current answers
                    const remainingAnswers = [...answers];
                    for (let i = index; i < items.length; i++) {
                      if (!remainingAnswers[i]) {
                        remainingAnswers[i] = {
                          question: items[i],
                          userAnswer: '',
                          isCorrect: false,
                          timeSpent: 0
                        };
                      }
                    }
                    navigate(`/vocabulary/test/${testId}/result`, { 
                      state: { 
                        answers: remainingAnswers, 
                        settings,
                        testInfo
                      } 
                    });
                  }
                }}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                🚀 Nộp bài ngay
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Bạn có thể nộp bài bất cứ lúc nào
              </p>
            </div>
          </div>
        </div>
      </div>
    </TestLayout>
  );
};

export default VocabularyTestTake;