import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import testService from '../services/testService';
import vocabularyService from '../services/vocabularyService';

const CreateVocabularyTestModal = ({ show, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Steps: 'vocabulary' -> 'test-info' -> 'review' -> 'creating' -> 'success'
  const [currentStep, setCurrentStep] = useState('vocabulary');
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  // Step 1
  const [vocabularyText, setVocabularyText] = useState('');
  const [parsedVocabularies, setParsedVocabularies] = useState([]);

  // Step 2
  const [testInfo, setTestInfo] = useState({
    test_title: '',
    description: '',
    main_topic: '',
    sub_topic: '',
    difficulty: 'easy',
    time_limit_minutes: 10,
  });

  // Refs
  const overlayRef = useRef(null);
  const cardRef = useRef(null);
  const redirectTimerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  // Close + reset state
  const handleClose = () => {
    setCurrentStep('vocabulary');
    setVocabularyText('');
    setParsedVocabularies([]);
    setTestInfo({
      test_title: '',
      description: '',
      main_topic: '',
      sub_topic: '',
      difficulty: 'easy',
      time_limit_minutes: 10,
    });
    setErrMsg('');
    setLoading(false);
    onClose?.();
  };

  // ESC to close
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, loading]);

  // Click outside to close
  const onOverlayClick = (e) => {
    if (loading) return;
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      handleClose();
    }
  };

  // Parse “word:meaning:example with : allowed”
  const parseVocabularyText = (text) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const vocabularies = [];
    const errors = [];

    lines.forEach((line, idx) => {
      const parts = line.split(':').map((s) => s.trim());
      if (parts.length < 2) {
        errors.push(`Dòng ${idx + 1}: Định dạng không đúng (cần ít nhất word:meaning)`);
        return;
      }
      const [word, meaning, ...rest] = parts;
      if (!word || !meaning) {
        errors.push(`Dòng ${idx + 1}: Từ vựng và nghĩa không được để trống`);
        return;
      }
      const example_sentence = (rest.join(':') || `Example sentence with ${word}.`).trim();
      vocabularies.push({ word, meaning, example_sentence });
    });

    return { vocabularies, errors };
  };

  const handleContinueToTestInfo = () => {
    if (!vocabularyText.trim()) {
      setErrMsg('Vui lòng nhập danh sách từ vựng');
      return;
    }
    const { vocabularies, errors } = parseVocabularyText(vocabularyText);
    if (errors.length) {
      setErrMsg(errors.join('\n'));
      return;
    }
    if (!vocabularies.length) {
      setErrMsg('Không tìm thấy từ vựng hợp lệ nào');
      return;
    }
    setParsedVocabularies(vocabularies);
    setErrMsg('');
    setCurrentStep('test-info');
  };

  const handleBackToVocabulary = () => {
    setCurrentStep('vocabulary');
    setErrMsg('');
  };

  const handleTestInfoChange = (field, value) => {
    setTestInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinueToReview = () => {
    if (!testInfo.test_title.trim()) {
      setErrMsg('Vui lòng nhập tiêu đề bài test');
      return;
    }
    if (!testInfo.main_topic.trim()) {
      setErrMsg('Vui lòng nhập chủ đề chính');
      return;
    }
    if (!testInfo.sub_topic.trim()) {
      setErrMsg('Vui lòng nhập phân mục');
      return;
    }
    setErrMsg('');
    setCurrentStep('review');
  };

  const handleBackToTestInfo = () => {
    setCurrentStep('test-info');
    setErrMsg('');
  };

  const totalSteps = 3;
  const progressPct = useMemo(() => {
    if (currentStep === 'vocabulary') return 100 / totalSteps * 1; // 33.33…
    if (currentStep === 'test-info') return 100 / totalSteps * 2;
    if (currentStep === 'review') return 100;
    return 100;
  }, [currentStep]);

  const handleCreateTest = async () => {
    setLoading(true);
    setErrMsg('');
    setCurrentStep('creating');
    try {
      const testData = {
        ...testInfo,
        test_type: 'vocabulary',
        total_questions: parsedVocabularies.length,
        status: 'active',
        // owner_id: user?._id, // bật nếu backend cần
      };

      const createdTest = await testService.createTest(testData);

      const vocabularyPromises = parsedVocabularies.map((vocab) =>
        vocabularyService.createVocabulary({
          ...vocab,
          test_id: createdTest._id,
          main_topic: testInfo.main_topic,
          sub_topic: testInfo.sub_topic,
          difficulty: testInfo.difficulty,
        })
      );

      // Nếu muốn “best-effort” thay vì fail cả cụm, dùng allSettled:
      const results = await Promise.allSettled(vocabularyPromises);
      const rejected = results.filter((r) => r.status === 'rejected');
      if (rejected.length) {
        // vẫn cho pass nhưng báo số từ lỗi
        setErrMsg(`Một số từ vựng tạo không thành công: ${rejected.length}/${parsedVocabularies.length}`);
      }

      setCurrentStep('success');

      redirectTimerRef.current = setTimeout(() => {
        navigate(`/vocabulary/test/${createdTest._id}/settings`);
        if (mountedRef.current) onClose?.();
      }, 1400);
    } catch (err) {
      console.error('Error creating vocabulary test:', err);
      setErrMsg(err?.message || 'Có lỗi xảy ra khi tạo bài test');
      setCurrentStep('review');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  if (!show) return null;

  // Render bằng Portal để đè lên toàn bộ layout
  return createPortal(
    <div
      ref={overlayRef}
      onMouseDown={onOverlayClick}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-2"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={cardRef}
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full h-[90vh] overflow-hidden border border-gray-200 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentStep === 'vocabulary' && 'Nhập Danh Sách Từ Vựng'}
                {currentStep === 'test-info' && 'Thông Tin Bài Test'}
                {currentStep === 'review' && 'Xem Lại Thông Tin'}
                {currentStep === 'creating' && 'Đang Tạo Bài Test'}
                {currentStep === 'success' && 'Hoàn Thành!'}
              </h2>
              <p className="text-sm text-gray-600">
                {currentStep === 'vocabulary' && 'Bước 1 của 3 - Chuẩn bị từ vựng'}
                {currentStep === 'test-info' && 'Bước 2 của 3 - Cấu hình bài test'}
                {currentStep === 'review' && 'Bước 3 của 3 - Kiểm tra thông tin'}
                {currentStep === 'creating' && 'Đang xử lý...'}
                {currentStep === 'success' && 'Bài test đã được tạo thành công'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Đóng"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress */}
        {(currentStep === 'vocabulary' || currentStep === 'test-info' || currentStep === 'review') && (
          <div className="px-6 py-3 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700">
                {currentStep === 'vocabulary' ? '1/3' : currentStep === 'test-info' ? '2/3' : '3/3'}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Step 1 */}
            {currentStep === 'vocabulary' && (
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Định dạng nhập liệu</h3>
                      <p className="text-sm text-gray-700 mb-3">
                        Mỗi từ vựng một dòng, định dạng: <code className="bg-gray-200 px-2 py-1 rounded text-xs">từ:nghĩa:câu ví dụ</code>
                      </p>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-800 mb-2">Ví dụ:</p>
                        <pre className="text-xs text-gray-800 font-mono">
{`aisle:lối đi giữa các hàng ghế/kệ:Passengers are walking down the aisle.
schedule:lịch trình:Please check your schedule before the meeting.
colleague:đồng nghiệp:I discussed the project with my colleague.`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-900">
                      Danh sách từ vựng *
                    </label>
                    <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                      {vocabularyText.split(/\r?\n/).filter((l) => l.trim()).length} từ vựng
                    </span>
                  </div>
                  <textarea
                    value={vocabularyText}
                    onChange={(e) => setVocabularyText(e.target.value)}
                    placeholder="Nhập từ vựng theo định dạng: từ:nghĩa:câu ví dụ"
                    rows={16}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono text-sm bg-black text-white placeholder-gray-400 resize-none"
                  />
                </div>

                {!!errMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-red-800 whitespace-pre-line">{errMsg}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 'test-info' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Thông Tin Bài Test</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Đã phân tích <span className="font-medium text-blue-700">{parsedVocabularies.length} từ vựng</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-800 mb-2">Tiêu đề bài test *</label>
                    <input
                      type="text"
                      value={testInfo.test_title}
                      onChange={(e) => handleTestInfoChange('test_title', e.target.value)}
                      placeholder="VD: My Custom Vocabulary Test"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-black text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Chủ đề chính *</label>
                    <input
                      type="text"
                      value={testInfo.main_topic}
                      onChange={(e) => handleTestInfoChange('main_topic', e.target.value)}
                      placeholder="VD: TOEIC, IELTS, Business English"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-black text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Phân mục *</label>
                    <input
                      type="text"
                      value={testInfo.sub_topic}
                      onChange={(e) => handleTestInfoChange('sub_topic', e.target.value)}
                      placeholder="VD: Part 1, Daily Conversation"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-black text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Độ khó</label>
                    <select
                      value={testInfo.difficulty}
                      onChange={(e) => handleTestInfoChange('difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-black text-white"
                    >
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Thời gian (phút)</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={testInfo.time_limit_minutes}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const parsed = parseInt(raw, 10);
                        const isNum = Number.isFinite(parsed);
                        const clamped = isNum ? Math.max(1, Math.min(120, parsed)) : '';
                        handleTestInfoChange('time_limit_minutes', clamped === '' ? 10 : clamped);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-black text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Mô tả</label>
                  <textarea
                    value={testInfo.description}
                    onChange={(e) => handleTestInfoChange('description', e.target.value)}
                    placeholder="Mô tả ngắn về bài test này..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-black text-white placeholder-gray-400 resize-none"
                  />
                </div>

                {!!errMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800">{errMsg}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 'review' && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Thông tin bài test
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 uppercase">Tiêu đề</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{testInfo.test_title}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 uppercase">Chủ đề</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{testInfo.main_topic} - {testInfo.sub_topic}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 uppercase">Độ khó</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">
                        {testInfo.difficulty === 'easy' ? 'Dễ' : testInfo.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 uppercase">Thời gian</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{testInfo.time_limit_minutes} phút</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 uppercase">Số từ vựng</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{parsedVocabularies.length} từ</p>
                    </div>
                    {testInfo.description && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200 md:col-span-2 lg:col-span-1">
                        <p className="text-xs font-medium text-gray-600 uppercase">Mô tả</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{testInfo.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vocabulary Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 bg-gray-800">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Danh sách từ vựng ({parsedVocabularies.length} từ)
                    </h3>
                  </div>
                  <div className="overflow-x-auto" style={{ maxHeight: 400 }}>
                    <table className="w-full">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-16">STT</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-1/4">Từ vựng</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-1/4">Nghĩa</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Câu ví dụ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {parsedVocabularies.map((vocab, index) => (
                          <tr key={`${vocab.word}-${index}`} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">{vocab.word}</td>
                            <td className="px-4 py-3 text-sm text-gray-800">{vocab.meaning}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 italic">{vocab.example_sentence}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {!!errMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-red-800 whitespace-pre-line">{errMsg}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4 */}
            {currentStep === 'creating' && (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Đang tạo bài test...</h3>
                <p className="text-sm text-gray-700">
                  Đang tạo bài test và {parsedVocabularies.length} từ vựng
                </p>
              </div>
            )}

            {/* Step 5 */}
            {currentStep === 'success' && (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tạo thành công!</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Bài test "{testInfo.test_title}" đã được tạo với {parsedVocabularies.length} từ vựng
                </p>
                <p className="text-xs text-gray-500">Đang chuyển hướng đến trang cài đặt bài test...</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {(currentStep === 'vocabulary' || currentStep === 'test-info' || currentStep === 'review') && (
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white">
              <div className="flex space-x-3">
                {currentStep === 'test-info' && (
                  <button
                    type="button"
                    onClick={handleBackToVocabulary}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50"
                  >
                    Quay lại
                  </button>
                )}
                {currentStep === 'review' && (
                  <button
                    type="button"
                    onClick={handleBackToTestInfo}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50"
                  >
                    Quay lại
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50"
                >
                  Hủy
                </button>

                {currentStep === 'vocabulary' && (
                  <button
                    type="button"
                    onClick={handleContinueToTestInfo}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50"
                  >
                    Tiếp tục
                  </button>
                )}

                {currentStep === 'test-info' && (
                  <button
                    type="button"
                    onClick={handleContinueToReview}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50"
                  >
                    Xem lại
                  </button>
                )}

                {currentStep === 'review' && (
                  <button
                    type="button"
                    onClick={handleCreateTest}
                    disabled={loading}
                    className="px-6 py-2 text-sm font-semibold text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50"
                  >
                    {loading ? 'Đang tạo...' : 'Tạo bài test'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateVocabularyTestModal;
