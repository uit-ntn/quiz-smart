import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MultipleChoiceService from '../services/multipleChoiceService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

const MultipleChoiceTestSettings = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Settings state
  const [settings, setSettings] = useState({
    testMode: 'flexible',           // 'flexible' | 'question_timer'
    showTimer: true,
    checkMode: 'after_submit',      // 'after_each' | 'after_submit'
    showQuestionNumber: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    questionTimeLimit: null         // seconds
  });

  // helper: tính thời gian mỗi câu an toàn
  const getSafePerQuestionLimit = (t) => {
    const totalSecs = Number(t?.time_limit_minutes) * 60;
    const totalQ = Number(t?.total_questions);
    // nếu dữ liệu thiếu hoặc tổng câu = 0 → mặc định 60s
    if (!Number.isFinite(totalSecs) || !Number.isFinite(totalQ) || totalQ <= 0) return 60;
    const raw = Math.floor(totalSecs / totalQ);
    // tối thiểu 10s, tối đa 300s để tránh tràn slider
    return clamp(raw, 10, 300);
  };

  useEffect(() => {
    fetchTestDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      const testData = await MultipleChoiceService.getTestById(testId);
      setTest(testData);

      const defaultQuestionTime = getSafePerQuestionLimit(testData);
      setSettings((prev) => ({
        ...prev,
        questionTimeLimit: defaultQuestionTime
      }));

      setError(null);
    } catch (err) {
      setError('Không thể tải thông tin bài kiểm tra. Vui lòng thử lại sau.');
      console.error('Error fetching test details:', err);
    } finally {
      setLoading(false);
    }
  };

  // khi chuyển sang chế độ question_timer mà chưa có limit → set mặc định an toàn
  useEffect(() => {
    if (settings.testMode === 'question_timer' && test) {
      setSettings((prev) => ({
        ...prev,
        questionTimeLimit:
          Number.isFinite(prev.questionTimeLimit) && prev.questionTimeLimit
            ? clamp(prev.questionTimeLimit, 10, getSafePerQuestionLimit(test))
            : getSafePerQuestionLimit(test),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.testMode, test]);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStartTest = () => {
    // Lưu cài đặt
    try {
      localStorage.setItem(`test_settings_${testId}`, JSON.stringify(settings));
    } catch (e) {
      console.warn('Cannot access localStorage', e);
    }
    navigate(`/multiple-choice/test/${testId}/take`, { state: { settings } });
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải thông tin bài kiểm tra..." />;
  }

  if (error || !test) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ErrorMessage
          error={error || 'Không tìm thấy bài kiểm tra'}
          onRetry={error ? fetchTestDetails : null}
        />
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const maxPerQuestion = getSafePerQuestionLimit(test);
  const sliderValue =
    clamp(Number(settings.questionTimeLimit ?? maxPerQuestion), 10, maxPerQuestion);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Info Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-full flex-shrink-0">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{test.test_title}</h1>
                <p className="text-gray-600 mb-4">{test.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số câu hỏi</p>
                  <p className="font-semibold text-gray-900">{test.total_questions}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Thời gian</p>
                  <p className="font-semibold text-gray-900">{test.time_limit_minutes} phút</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Độ khó</p>
                  <p className="font-semibold text-gray-900 capitalize">{test.difficulty}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Cài đặt bài kiểm tra</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Test Mode */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Chế độ làm bài</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      id="flexibleMode"
                      name="testMode"
                      type="radio"
                      value="flexible"
                      checked={settings.testMode === 'flexible'}
                      onChange={(e) => handleSettingChange('testMode', e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="flexibleMode" className="block text-sm font-medium text-gray-700 mb-1">
                      Chế độ linh hoạt
                    </label>
                    <p className="text-sm text-gray-500">
                      Có thể chuyển qua lại giữa các câu hỏi, chỉ tính thời gian tổng cho toàn bài
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      id="questionTimerMode"
                      name="testMode"
                      type="radio"
                      value="question_timer"
                      checked={settings.testMode === 'question_timer'}
                      onChange={(e) => handleSettingChange('testMode', e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="questionTimerMode" className="block text-sm font-medium text-gray-700 mb-1">
                      Chế độ thời gian mỗi câu
                    </label>
                    <p className="text-sm text-gray-500">
                      Mỗi câu có thời gian giới hạn riêng, có thể kiểm tra đáp án ngay
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Time Limit (only for question_timer mode) */}
            {settings.testMode === 'question_timer' && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Thời gian mỗi câu hỏi</h3>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min={10}
                    max={maxPerQuestion}
                    value={sliderValue}
                    onChange={(e) =>
                      handleSettingChange('questionTimeLimit', clamp(parseInt(e.target.value, 10) || 10, 10, maxPerQuestion))
                    }
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-900 min-w-0">
                    {sliderValue} giây
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tối đa: {maxPerQuestion} giây/câu
                </p>
              </div>
            )}

            {/* Show Timer */}
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5 mt-1">
                <input
                  id="showTimer"
                  type="checkbox"
                  checked={settings.showTimer}
                  onChange={(e) => handleSettingChange('showTimer', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="showTimer" className="block text-sm font-medium text-gray-900 mb-1">
                  Hiển thị đồng hồ đếm ngược
                </label>
                <p className="text-sm text-gray-500">
                  Hiển thị thời gian còn lại trong quá trình làm bài
                </p>
              </div>
            </div>

            {/* Check Mode */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Chế độ kiểm tra đáp án</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      id="checkAfterEach"
                      name="checkMode"
                      type="radio"
                      value="after_each"
                      checked={settings.checkMode === 'after_each'}
                      onChange={(e) => handleSettingChange('checkMode', e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="checkAfterEach" className="block text-sm font-medium text-gray-700 mb-1">
                      Kiểm tra sau mỗi câu
                    </label>
                    <p className="text-sm text-gray-500">
                      Hiển thị kết quả ngay sau khi chọn đáp án mỗi câu
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-5 mt-1">
                    <input
                      id="checkAfterSubmit"
                      name="checkMode"
                      type="radio"
                      value="after_submit"
                      checked={settings.checkMode === 'after_submit'}
                      onChange={(e) => handleSettingChange('checkMode', e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="checkAfterSubmit" className="block text-sm font-medium text-gray-700 mb-1">
                      Kiểm tra sau khi nộp bài
                    </label>
                    <p className="text-sm text-gray-500">
                      Hiển thị kết quả sau khi hoàn thành và nộp bài
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Show Question Number */}
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5 mt-1">
                <input
                  id="showQuestionNumber"
                  type="checkbox"
                  checked={settings.showQuestionNumber}
                  onChange={(e) => handleSettingChange('showQuestionNumber', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="showQuestionNumber" className="block text-sm font-medium text-gray-900 mb-1">
                  Hiển thị số thứ tự câu hỏi
                </label>
                <p className="text-sm text-gray-500">
                  Hiển thị số thứ tự của mỗi câu hỏi (Câu 1/10, Câu 2/10...)
                </p>
              </div>
            </div>

            {/* Shuffle Questions */}
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5 mt-1">
                <input
                  id="shuffleQuestions"
                  type="checkbox"
                  checked={settings.shuffleQuestions}
                  onChange={(e) => handleSettingChange('shuffleQuestions', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="shuffleQuestions" className="block text-sm font-medium text-gray-900 mb-1">
                  Xáo trộn thứ tự câu hỏi
                </label>
                <p className="text-sm text-gray-500">
                  Các câu hỏi sẽ được hiển thị theo thứ tự ngẫu nhiên
                </p>
              </div>
            </div>

            {/* Shuffle Answers */}
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5 mt-1">
                <input
                  id="shuffleAnswers"
                  type="checkbox"
                  checked={settings.shuffleAnswers}
                  onChange={(e) => handleSettingChange('shuffleAnswers', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="shuffleAnswers" className="block text-sm font-medium text-gray-900 mb-1">
                  Xáo trộn thứ tự đáp án
                </label>
                <p className="text-sm text-gray-500">
                  Các đáp án sẽ được hiển thị theo thứ tự ngẫu nhiên
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
          <button
            onClick={handleStartTest}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Bắt đầu làm bài
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultipleChoiceTestSettings;
