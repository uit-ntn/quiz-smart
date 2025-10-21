import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VocabularyLayout from '../layout/VocabularyLayout';
import vocabularyService from '../services/vocabularyService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const modes = [
  { 
    key: 'meaning_to_word', 
    label: 'Đưa nghĩa đoán từ',
    description: 'Xem nghĩa tiếng Việt, chọn từ tiếng Anh phù hợp',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  { 
    key: 'word_to_meaning', 
    label: 'Đưa từ đoán nghĩa',
    description: 'Xem từ tiếng Anh, chọn nghĩa tiếng Việt phù hợp',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  { 
    key: 'listen_and_type', 
    label: 'Nghe và ghi từ',
    description: 'Nghe phát âm và gõ từ tiếng Anh',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    )
  }
];

const VocabularyTestSettings = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  const [settings, setSettings] = useState({ 
    mode: 'word_to_meaning', 
    timePerQuestion: 30, 
    totalQuestions: 10,
    showAnswerMode: 'after_each' // 'after_each' or 'after_all'
  });

  useEffect(() => {
    const fetchTestInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const test = await vocabularyService.getVocabularyTestById(testId);
        setTestInfo(test);
      } catch (err) {
        console.error('Error fetching test info:', err);
        setError('Không thể tải thông tin bài kiểm tra. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchTestInfo();
  }, [testId]);

  if (loading) return <LoadingSpinner message="Đang tải cài đặt bài kiểm tra..." />;
  if (error) return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;

  const handleStartTest = () => {
    console.log('Starting test with testId:', testId);
    console.log('Settings:', settings);
    
    // Lưu settings vào localStorage và chuyển đến trang làm bài
    try { 
      localStorage.setItem(`vocab_settings_${testId}`, JSON.stringify(settings)); 
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
    navigate(`/vocabulary/test/${testId}/take`, { state: { settings } });
  };

  const breadcrumbItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Từ vựng theo chủ đề', path: '/vocabulary/topics' },
    { label: testInfo?.test_title || 'Bài kiểm tra', path: '#' },
    { label: 'Cài đặt', path: '#' }
  ];

  return (
    <VocabularyLayout
      title="Cài đặt bài kiểm tra"
      description={testInfo?.test_title || 'Tùy chỉnh cài đặt cho bài kiểm tra từ vựng'}
      breadcrumbItems={breadcrumbItems}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Test Info Card */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200" />
          <div className="relative p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {testInfo?.test_title || 'Bài kiểm tra từ vựng'}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {testInfo?.total_questions || 0} từ vựng
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {testInfo?.main_topic} - {testInfo?.sub_topic}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Mode Selection */}
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-white border border-gray-200" />
              <div className="relative p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Chế độ</h3>
                    <p className="text-gray-600 text-sm">Chọn cách thức làm bài kiểm tra</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {modes.map(mode => (
                    <button
                      key={mode.key}
                      onClick={() => setSettings(s => ({ ...s, mode: mode.key }))}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        settings.mode === mode.key
                          ? 'border-slate-500 bg-slate-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                          settings.mode === mode.key ? 'bg-slate-100 text-slate-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {mode.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h4 className={`font-semibold ${
                              settings.mode === mode.key ? 'text-slate-900' : 'text-gray-900'
                            }`}>
                              {mode.label}
                            </h4>
                            {settings.mode === mode.key && (
                              <svg className="w-5 h-5 text-slate-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{mode.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Time Settings */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-white border border-gray-200" />
              <div className="relative p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Thời gian</h3>
                    <p className="text-gray-600 text-xs">Cho mỗi câu hỏi</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="range"
                      min={5}
                      max={300}
                      value={settings.timePerQuestion}
                      onChange={(e) => setSettings(s => ({ ...s, timePerQuestion: Number(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>5s</span>
                      <span>300s</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="inline-flex items-center px-4 py-2 bg-amber-50 text-amber-800 rounded-lg font-semibold">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {settings.timePerQuestion} giây
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Count */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-white border border-gray-200" />
              <div className="relative p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Số lượng câu</h3>
                    <p className="text-gray-600 text-xs">Tối đa {testInfo?.total_questions || 200}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="number"
                    min={1}
                    max={testInfo?.total_questions || 200}
                    value={settings.totalQuestions}
                    onChange={(e) => setSettings(s => ({ ...s, totalQuestions: Math.min(Number(e.target.value), testInfo?.total_questions || 200) }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  />
                  <div className="flex justify-center space-x-2">
                    {[5, 10, 20, 50].map(count => (
                      <button
                        key={count}
                        onClick={() => setSettings(s => ({ ...s, totalQuestions: Math.min(count, testInfo?.total_questions || 200) }))}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          settings.totalQuestions === count
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Show Answer Mode */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-white border border-gray-200" />
              <div className="relative p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Hiển thị đáp án</h3>
                    <p className="text-gray-600 text-xs">Cách thức xem kết quả</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setSettings(s => ({ ...s, showAnswerMode: 'after_each' }))}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                      settings.showAnswerMode === 'after_each'
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                        settings.showAnswerMode === 'after_each' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Hiện đáp án sau mỗi câu</h4>
                        <p className="text-sm text-gray-600">Xem kết quả ngay sau khi trả lời</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setSettings(s => ({ ...s, showAnswerMode: 'after_all' }))}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                      settings.showAnswerMode === 'after_all'
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                        settings.showAnswerMode === 'after_all' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Hiện đáp án cuối bài</h4>
                        <p className="text-sm text-gray-600">Xem tất cả kết quả sau khi hoàn thành</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200" />
          <div className="relative p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="text-sm text-gray-600">
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Thời gian dự kiến: <span className="font-semibold ml-1">{Math.ceil((settings.totalQuestions * settings.timePerQuestion) / 60)} phút</span>
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Quay lại
                </button>
                <button
                  onClick={handleStartTest}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Bắt đầu làm bài
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VocabularyLayout>
  );
};

export default VocabularyTestSettings;
