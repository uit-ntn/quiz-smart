import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import VocabularyLayout from '../layout/VocabularyLayout';
import vocabularyService from '../services/vocabularyService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const VocabularyTestTake = () => {
  const { testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const settings = location.state?.settings || JSON.parse(localStorage.getItem(`vocab_settings_${testId}`) || '{}');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(settings.timePerQuestion || 30);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching vocabularies for testId:', testId);
        console.log('Settings:', settings);

        // Sử dụng vocabularyService để gọi API đúng cách
        const data = await vocabularyService.getAllVocabulariesByTestId(testId);

        console.log('Received data:', data);

        if (!data || !Array.isArray(data) || data.length === 0) {
          setError(`Không tìm thấy câu hỏi nào cho bài test ${testId}. Vui lòng kiểm tra lại test ID.`);
          return;
        }

        // Shuffle và lấy số lượng câu hỏi theo settings
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        const maxQuestions = Math.min(settings.totalQuestions || 10, data.length);
        const selectedItems = shuffled.slice(0, maxQuestions);

        console.log(`Selected ${selectedItems.length} questions from ${data.length} available`);
        setItems(selectedItems);
      } catch (e) {
        console.error('Error fetching questions:', e);
        setError(`Có lỗi xảy ra khi tải câu hỏi: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchQuestions();
    } else {
      setError('Test ID không hợp lệ');
      setLoading(false);
    }
  }, [testId, settings.totalQuestions]);

  useEffect(() => {
    if (!items.length || isPaused) return;

    setTimeLeft(settings.timePerQuestion || 30);
    setCurrentAnswer('');

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleSubmit(currentAnswer);
          return settings.timePerQuestion || 30;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, items, isPaused]);

  const handleSubmit = (answer) => {
    const newAnswer = {
      item: items[index],
      answer: answer || currentAnswer,
      correct: checkAnswer(items[index], answer || currentAnswer, settings.mode),
      timeSpent: (settings.timePerQuestion || 30) - timeLeft
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (index + 1 >= items.length) {
      // Kết thúc bài test
      try {
        localStorage.setItem(`vocab_result_${testId}`, JSON.stringify({
          answers: updatedAnswers,
          settings,
          completedAt: new Date().toISOString()
        }));
      } catch (e) {
        console.error('Failed to save results:', e);
      }
      navigate(`/vocabulary/test/${testId}/review`);
      return;
    }
    setIndex(i => i + 1);
  };

  const checkAnswer = (item, answer, mode) => {
    if (!item || !answer) return false;
    const userAnswer = answer.trim().toLowerCase();

    if (mode === 'meaning_to_word') {
      return (item.word || '').toLowerCase() === userAnswer;
    }
    if (mode === 'word_to_meaning') {
      const meaning = (item.meaning || '').toLowerCase();
      return meaning.includes(userAnswer) || userAnswer.length > 3 && meaning.includes(userAnswer);
    }
    if (mode === 'listen_and_type') {
      return (item.word || '').toLowerCase() === userAnswer;
    }
    return false;
  };

  const playAudio = (text, isExample = false) => {
    if (isPlaying) return;

    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = isExample ? 0.8 : 0.9;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentAnswer.trim()) {
      handleSubmit(currentAnswer);
    }
  };

  if (loading) return <LoadingSpinner message="Đang chuẩn bị câu hỏi..." />;
  if (error) return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
  if (!items.length) return (
    <VocabularyLayout title="Bài kiểm tra từ vựng" breadcrumbItems={[{ label: 'Từ vựng', path: '/vocabulary' }, { label: 'Bài kiểm tra' }]}>
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có câu hỏi</h3>
        <p className="text-gray-600">Không tìm thấy câu hỏi nào cho bài kiểm tra này.</p>
      </div>
    </VocabularyLayout>
  );

  const current = items[index];
  const progress = ((index + 1) / items.length) * 100;
  const timeProgress = (timeLeft / (settings.timePerQuestion || 30)) * 100;

  const breadcrumbItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Từ vựng', path: '/vocabulary/topics' },
    { label: 'Làm bài kiểm tra', path: '#' }
  ];

  return (
    <VocabularyLayout
      title="Bài kiểm tra từ vựng"
      description={`Câu ${index + 1} / ${items.length}`}
      breadcrumbItems={breadcrumbItems}
      maxWidth="7xl"
      showBackground={false}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-screen max-h-screen overflow-hidden">
        {/* Left Panel - Progress & Controls */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full">
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Câu {index + 1} / {items.length}
                  </h2>
                  <p className="text-gray-600 text-xs">
                    {settings.mode === 'meaning_to_word' && 'Đưa nghĩa đoán từ'}
                    {settings.mode === 'word_to_meaning' && 'Đưa từ đoán nghĩa'}
                    {settings.mode === 'listen_and_type' && 'Nghe và ghi từ'}
                  </p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Tiến độ</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-slate-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Thời gian</span>
                    <span className={`font-medium ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                      {timeLeft}s
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                      style={{ width: `${timeProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="space-y-2">
                <button
                  onClick={pauseTimer}
                  className={`w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isPaused
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                >
                  {isPaused ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Tiếp tục
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Tạm dừng
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Bạn có chắc muốn thoát? Tiến độ sẽ không được lưu.')) {
                      navigate(-1);
                    }
                  }}
                  className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Thoát
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Question */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
            <div className="p-6 flex-1 flex items-center justify-center">
              {settings.mode === 'meaning_to_word' && (
                <div className="text-center space-y-6 w-full max-w-2xl">
                  <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-600 mb-4">Nghĩa của từ</h3>
                    <p className="text-3xl font-bold text-gray-900 mb-6">{current.meaning}</p>
                    {current.example_sentence && (
                      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-400 mb-6">
                        <p className="text-gray-700 italic">"{current.example_sentence}"</p>
                      </div>
                    )}
                  </div>
                  <div className="max-w-md mx-auto">
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-6 py-4 text-xl text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Gõ từ tiếng Anh..."
                      disabled={isPaused}
                    />
                    <div className="flex space-x-3 mt-4">
                      <button
                        onClick={() => handleSubmit('')}
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 text-sm"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Bỏ qua
                      </button>
                      <button
                        onClick={() => handleSubmit(currentAnswer)}
                        disabled={!currentAnswer.trim() || isPaused}
                        className="flex-1 flex items-center justify-center px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Trả lời
                      </button>
                    </div>
                  </div>
                </div>
              )}              {settings.mode === 'word_to_meaning' && (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Từ tiếng Anh</h3>
                    <div className="flex items-center justify-center space-x-3 mb-3">
                      <p className="text-2xl font-bold text-gray-900">{current.word}</p>
                      <button
                        onClick={() => playAudio(current.word)}
                        disabled={isPlaying}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.797l-4.146-3.32a1 1 0 00-.632-.227H2a1 1 0 01-1-1V7a1 1 0 011-1h1.605a1 1 0 00.632-.227l4.146-3.32a1 1 0 011.6.623zM14 7a3 3 0 013 3v0a3 3 0 01-3 3" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    {current.example_sentence && (
                      <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-green-400">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-700 text-sm italic flex-1">"{current.example_sentence}"</p>
                          <button
                            onClick={() => playAudio(current.example_sentence, true)}
                            disabled={isPlaying}
                            className="ml-2 p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.797l-4.146-3.32a1 1 0 00-.632-.227H2a1 1 0 01-1-1V7a1 1 0 011-1h1.605a1 1 0 00.632-.227l4.146-3.32a1 1 0 011.6.623zM14 7a3 3 0 013 3v0a3 3 0 01-3 3" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="max-w-sm mx-auto">
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-3 text-lg text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Gõ nghĩa tiếng Việt..."
                      disabled={isPaused}
                    />
                  </div>
                </div>
              )}

              {settings.mode === 'listen_and_type' && (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-3">Nghe và ghi từ</h3>
                    <div className="bg-purple-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700 mb-3">Nghĩa: <span className="font-semibold">{current.meaning}</span></p>
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={() => playAudio(current.word)}
                          disabled={isPlaying}
                          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.797l-4.146-3.32a1 1 0 00-.632-.227H2a1 1 0 01-1-1V7a1 1 0 011-1h1.605a1 1 0 00.632-.227l4.146-3.32a1 1 0 011.6.623zM14 7a3 3 0 013 3v0a3 3 0 01-3 3" clipRule="evenodd" />
                          </svg>
                          {isPlaying ? 'Đang phát...' : 'Nghe từ'}
                        </button>
                        {current.example_sentence && (
                          <button
                            onClick={() => playAudio(current.example_sentence, true)}
                            disabled={isPlaying}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.797l-4.146-3.32a1 1 0 00-.632-.227H2a1 1 0 01-1-1V7a1 1 0 011-1h1.605a1 1 0 00.632-.227l4.146-3.32a1 1 0 011.6.623zM14 7a3 3 0 013 3v0a3 3 0 01-3 3" clipRule="evenodd" />
                            </svg>
                            Nghe câu ví dụ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="max-w-sm mx-auto">
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-3 text-lg text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="Gõ từ tiếng Anh..."
                      disabled={isPaused}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compact Action Buttons */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    if (window.confirm('Bạn có chắc muốn thoát? Tiến độ sẽ không được lưu.')) {
                      navigate(-1);
                    }
                  }}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 text-sm"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Thoát
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleSubmit('')}
                    className="flex items-center px-4 py-2 border border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 text-sm"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Bỏ qua
                  </button>
                  <button
                    onClick={() => handleSubmit(currentAnswer)}
                    disabled={!currentAnswer.trim() || isPaused}
                    className="flex items-center px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Trả lời
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VocabularyLayout>
  );
};

export default VocabularyTestTake;
