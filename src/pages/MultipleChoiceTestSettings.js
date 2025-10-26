
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import testService from '../services/testService';
import MultipleChoiceService from '../services/multipleChoiceService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import MultipleChoiceLayout from '../layout/MultipleChoiceLayout';

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

const MultipleChoiceTestSettings = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [settings, setSettings] = useState({
    testMode: 'flexible',        // 'flexible' | 'question_timer'
    showTimer: true,
    checkMode: 'after_submit',   // 'after_each' | 'after_submit'
    showQuestionNumber: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    questionTimeLimit: null      // seconds
  });

  const getSafePerQuestionLimit = (t) => {
    const totalSecs = Number(t?.time_limit_minutes) * 60;
    const totalQ = Number(t?.total_questions);
    if (!Number.isFinite(totalSecs) || !Number.isFinite(totalQ) || totalQ <= 0) return 60;
    return clamp(Math.floor(totalSecs / totalQ), 10, 300);
  };

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        setLoading(true);
        // Sử dụng testService để lấy test metadata
        const response = await testService.getTestById(testId);
        console.log('Fetched test details:', response);
        // Backend trả về { message, test } hoặc trực tiếp test object
        const testData = response.test || response;
        setTest(testData);
        setSettings((prev) => ({
          ...prev,
          questionTimeLimit: getSafePerQuestionLimit(testData)
        }));
        setError(null);
      } catch (err) {
        console.error('Error fetching test details:', err);
        setError('Không thể tải thông tin bài kiểm tra. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    if (testId) {
      fetchTestDetails();
    }
  }, [testId]);

  useEffect(() => {
    if (settings.testMode === 'question_timer' && test) {
      const safe = getSafePerQuestionLimit(test);
      setSettings((prev) => ({
        ...prev,
        questionTimeLimit:
          Number.isFinite(prev.questionTimeLimit) && prev.questionTimeLimit
            ? clamp(prev.questionTimeLimit, 10, safe)
            : safe
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.testMode, test]);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleStartTest = () => {
    try {
      localStorage.setItem(`test_settings_${testId}`, JSON.stringify(settings));
    } catch (e) {
      console.warn('Cannot access localStorage', e);
    }
    navigate(`/multiple-choice/test/${testId}/take`, { state: { settings } });
  };

  if (loading) return <LoadingSpinner message="Đang tải thông tin bài kiểm tra..." />;

  if (error || !test) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-xl mx-auto px-4">
          <div className="rounded-xl border border-red-200 bg-white shadow-sm">
            <div className="p-5">
              <ErrorMessage error={error || 'Không tìm thấy bài kiểm tra'} onRetry={error ? () => window.location.reload() : null} />
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxPerQuestion = getSafePerQuestionLimit(test);
  const sliderValue = clamp(Number(settings.questionTimeLimit ?? maxPerQuestion), 10, maxPerQuestion);

  const title = test?.test_title || [test?.main_topic, test?.sub_topic].filter(Boolean).join(' - ') || 'Bài kiểm tra';

  const breadcrumbItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Trắc nghiệm theo chủ đề', path: '/multiple-choice' },
    { label: test?.main_topic || 'Chủ đề', path: `/multiple-choice/${test?.main_topic}` },
    { label: test?.sub_topic || 'Phân mục', path: `/multiple-choice/${test?.main_topic}/${test?.sub_topic}` },
    { label: 'Cài đặt bài kiểm tra', path: '#' },
  ];

  return (
    <MultipleChoiceLayout
      title="Cài đặt bài kiểm tra"
      description="Tùy chỉnh các thiết lập trước khi bắt đầu làm bài"
      breadcrumbItems={breadcrumbItems}
    >
      <div className="max-w-5xl mx-auto">
        {/* Shell */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="grid md:grid-cols-5">
            {/* Left: meta */}
            <aside className="md:col-span-2 p-5 border-b md:border-b-0 md:border-r border-slate-200 bg-white">
              {/* Header mini với icon */}
              <div className="flex items-start gap-3 mb-4 text-black text-capitalize font-semibold text-center">
                {test?.test_title}
              </div>
              {/* Thông tin mô tả dạng definition list */}
              <dl className="space-y-2 text-sm mb-6">
                <div className="flex gap-2">
                  <dt className="min-w-[92px] text-slate-500">Chủ đề chính</dt>
                  <dd className="text-slate-900">{test?.main_topic}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="min-w-[92px] text-slate-500">Phân mục</dt>
                  <dd className="text-slate-900">{test?.sub_topic}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="min-w-[92px] text-slate-500">Mô tả</dt>
                  <dd className="text-slate-900 leading-6">{test?.description}</dd>
                </div>
              </dl>

              {/* Thẻ số liệu gọn – có icon + màu subtle */}
              <div className="flex flex-col gap-2.5">
                {/* Câu hỏi */}
                <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 bg-white hover:bg-slate-50 transition">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 3" />
                      </svg>
                    </span>
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">Câu hỏi</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{test.total_questions}</p>
                </div>

                {/* Thời gian */}
                <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 bg-white hover:bg-slate-50 transition">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 3" />
                      </svg>
                    </span>
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">Thời gian</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{test.time_limit_minutes} phút</p>
                </div>

                {/* Độ khó */}
                <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 bg-white hover:bg-slate-50 transition">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-amber-50 text-amber-600 border border-amber-100">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">Độ khó</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 capitalize">{test.difficulty}</p>
                </div>
              </div>


              {/* Nút gọn – nhỏ, chuyên nghiệp */}
              <div className="mt-5 hidden md:flex gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Quay lại
                </button>
                <button
                  onClick={handleStartTest}
                  className="inline-flex items-center px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Bắt đầu
                </button>
              </div>
            </aside>


            {/* Right: settings */}
            <section className="md:col-span-3 p-4">
              {/* Test mode */}
              <div>
                <h2 className="text-sm font-semibold text-slate-900 mb-2">Chế độ làm bài</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label
                    htmlFor="mode-flex"
                    className={`cursor-pointer rounded-lg border p-3 text-sm transition ${settings.testMode === 'flexible' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        id="mode-flex"
                        name="testMode"
                        type="radio"
                        value="flexible"
                        checked={settings.testMode === 'flexible'}
                        onChange={(e) => handleSettingChange('testMode', e.target.value)}
                        className="mt-0.5 w-4 h-4 accent-indigo-600"
                      />
                      <div>
                        <p className="font-medium text-slate-900">Chế độ linh hoạt</p>
                        <p className="text-xs text-slate-600 mt-0.5">Di chuyển giữa các câu, tính thời gian toàn bài.</p>
                      </div>
                    </div>
                  </label>

                  <label
                    htmlFor="mode-qtimer"
                    className={`cursor-pointer rounded-lg border p-3 text-sm transition ${settings.testMode === 'question_timer' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        id="mode-qtimer"
                        name="testMode"
                        type="radio"
                        value="question_timer"
                        checked={settings.testMode === 'question_timer'}
                        onChange={(e) => handleSettingChange('testMode', e.target.value)}
                        className="mt-0.5 w-4 h-4 accent-indigo-600"
                      />
                      <div>
                        <p className="font-medium text-slate-900">Thời gian mỗi câu</p>
                        <p className="text-xs text-slate-600 mt-0.5">Mỗi câu có giới hạn riêng, xem đáp án ngay.</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Per-question time */}
              {settings.testMode === 'question_timer' && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Thời gian mỗi câu</h3>
                  <div className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={10}
                        max={maxPerQuestion}
                        value={sliderValue}
                        onChange={(e) =>
                          handleSettingChange(
                            'questionTimeLimit',
                            clamp(parseInt(e.target.value, 10) || 10, 10, maxPerQuestion)
                          )
                        }
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="min-w-[64px] px-3 py-1 rounded-md bg-indigo-600 text-white text-sm text-center">
                        {sliderValue}s
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">Tối đa: {maxPerQuestion} giây/câu</p>
                  </div>
                </div>
              )}

              {/* Toggles */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Tùy chọn hiển thị</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'showTimer',
                      label: 'Hiển thị đồng hồ đếm ngược',
                      desc: 'Hiển thị thời gian còn lại khi làm bài.',
                      key: 'showTimer'
                    },
                    {
                      id: 'showQuestionNumber',
                      label: 'Hiển thị số thứ tự câu hỏi',
                      desc: 'Ví dụ: Câu 1/10, Câu 2/10…',
                      key: 'showQuestionNumber'
                    },
                    {
                      id: 'shuffleQuestions',
                      label: 'Xáo trộn thứ tự câu hỏi',
                      desc: 'Hiển thị câu hỏi theo thứ tự ngẫu nhiên.',
                      key: 'shuffleQuestions'
                    },
                    {
                      id: 'shuffleAnswers',
                      label: 'Xáo trộn thứ tự đáp án',
                      desc: 'Các đáp án sẽ được ngẫu nhiên hoá.',
                      key: 'shuffleAnswers'
                    }
                  ].map((item) => (
                    <div key={item.id} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                      <input
                        id={item.id}
                        type="checkbox"
                        checked={settings[item.key]}
                        onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-indigo-600 rounded border-slate-300"
                      />
                      <div>
                        <label htmlFor={item.id} className="block text-sm font-medium text-slate-900">
                          {item.label}
                        </label>
                        <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Check mode */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Chế độ kiểm tra đáp án</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label
                    htmlFor="checkAfterEach"
                    className={`cursor-pointer rounded-lg border p-3 text-sm transition ${settings.checkMode === 'after_each' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        id="checkAfterEach"
                        name="checkMode"
                        type="radio"
                        value="after_each"
                        checked={settings.checkMode === 'after_each'}
                        onChange={(e) => handleSettingChange('checkMode', e.target.value)}
                        className="mt-0.5 w-4 h-4 accent-emerald-600"
                      />
                      <div>
                        <p className="font-medium text-slate-900">Sau mỗi câu</p>
                        <p className="text-xs text-slate-600 mt-0.5">Hiển thị kết quả ngay sau khi chọn.</p>
                      </div>
                    </div>
                  </label>

                  <label
                    htmlFor="checkAfterSubmit"
                    className={`cursor-pointer rounded-lg border p-3 text-sm transition ${settings.checkMode === 'after_submit' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        id="checkAfterSubmit"
                        name="checkMode"
                        type="radio"
                        value="after_submit"
                        checked={settings.checkMode === 'after_submit'}
                        onChange={(e) => handleSettingChange('checkMode', e.target.value)}
                        className="mt-0.5 w-4 h-4 accent-emerald-600"
                      />
                      <div>
                        <p className="font-medium text-slate-900">Sau khi nộp bài</p>
                        <p className="text-xs text-slate-600 mt-0.5">Chỉ hiển thị kết quả khi hoàn thành.</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Bottom actions (mobile) */}
              <div className="mt-5 flex md:hidden gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm flex-shrink-0"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Quay lại
                </button>
                <button
                  onClick={handleStartTest}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Bắt đầu
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MultipleChoiceLayout>
  );
};

export default MultipleChoiceTestSettings;
