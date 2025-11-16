import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import testService from '../services/testService';
import vocabularyService from '../services/vocabularyService';

const CreateVocabularyWithAIModal = ({ show, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Steps: 'ai-config' -> 'generating' -> 'edit-vocabulary' -> 'test-info' -> 'review' -> 'creating' -> 'success'
  const [currentStep, setCurrentStep] = useState('ai-config');
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  // AI Generation config
  const [aiConfig, setAiConfig] = useState({
    topic: '',
    category: '',
    description: '',
    count: 15
  });
  
  // Generated vocabularies from AI
  const [generatedVocabularies, setGeneratedVocabularies] = useState([]);

  // Test info
  const [testInfo, setTestInfo] = useState({
    test_title: '',
    description: '',
    main_topic: '',
    sub_topic: '',
    difficulty: 'easy',
    time_limit_minutes: 10,
    visibility: 'public', // 'public' or 'private'
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
    setCurrentStep('ai-config');
    setAiConfig({
      topic: '',
      category: '',
      description: '',
      count: 15
    });
    setGeneratedVocabularies([]);
    setTestInfo({
      test_title: '',
      description: '',
      main_topic: '',
      sub_topic: '',
      difficulty: 'easy',
      time_limit_minutes: 10,
      visibility: 'public',
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

  const handleAIConfigChange = (field, value) => {
    setAiConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateWithAI = async () => {
    if (!aiConfig.topic.trim()) {
      setErrMsg('Vui lòng nhập chủ đề');
      return;
    }

    setLoading(true);
    setErrMsg('');
    setCurrentStep('generating');

    try {
      const result = await vocabularyService.generateVocabulary(aiConfig);
      
      if (result.success && result.data && result.data.vocabulary) {
        setGeneratedVocabularies(result.data.vocabulary);
        // Auto-populate test info from AI config
        setTestInfo(prev => ({
          ...prev,
          test_title: `${aiConfig.topic} - AI Generated Test`,
          description: aiConfig.description || `AI generated vocabulary test for ${aiConfig.topic}`,
          main_topic: aiConfig.topic,
          sub_topic: aiConfig.category || 'General'
        }));
        setCurrentStep('edit-vocabulary');
      } else {
        throw new Error(result.message || 'Failed to generate vocabulary');
      }
    } catch (error) {
      console.error('Error generating vocabulary:', error);
      setErrMsg(error?.message || 'Có lỗi xảy ra khi tạo từ vựng với AI');
      setCurrentStep('ai-config');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const handleTestInfoChange = (field, value) => {
    setTestInfo((prev) => ({ ...prev, [field]: value }));
  };

  // Vocabulary editing functions
  const handleVocabularyChange = (index, field, value) => {
    setGeneratedVocabularies(prev => 
      prev.map((vocab, i) => 
        i === index ? { ...vocab, [field]: value } : vocab
      )
    );
  };

  const handleAddVocabulary = () => {
    setGeneratedVocabularies(prev => [
      ...prev,
      {
        word: '',
        meaning: '',
        example_sentence: ''
      }
    ]);
  };

  const handleRemoveVocabulary = (index) => {
    setGeneratedVocabularies(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveVocabularies = () => {
    // Validate vocabularies
    const invalidVocabs = generatedVocabularies.filter(
      vocab => !vocab.word?.trim() || !vocab.meaning?.trim()
    );
    
    if (invalidVocabs.length > 0) {
      setErrMsg('Vui lòng điền đầy đủ từ vựng và nghĩa cho tất cả các từ');
      return;
    }

    if (generatedVocabularies.length === 0) {
      setErrMsg('Cần ít nhất 1 từ vựng để tạo bài test');
      return;
    }

    setErrMsg('');
    setCurrentStep('test-info');
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

  const handleBackToAIConfig = () => {
    setCurrentStep('ai-config');
    setErrMsg('');
  };

  const handleCreateTest = async () => {
    setLoading(true);
    setErrMsg('');
    setCurrentStep('creating');
    
    try {
      // Ensure visibility is a canonical string 'public' or 'private'
      const visibilityValue = testInfo.visibility === 'public' ? 'public' : 'private';

      const testData = {
        ...testInfo,
        visibility: visibilityValue,
        test_type: 'vocabulary',
        total_questions: generatedVocabularies.length,
        status: 'active',
      };

      // Debug log to inspect outgoing payload when creating a test
      console.debug('CreateVocabularyWithAIModal - creating test payload:', testData);

      const createdTest = await testService.createTest(testData);

      const vocabularyPromises = generatedVocabularies.map((vocab) =>
        vocabularyService.createVocabulary({
          ...vocab,
          test_id: createdTest._id,
        })
      );

      const results = await Promise.allSettled(vocabularyPromises);
      const rejected = results.filter((r) => r.status === 'rejected');
      if (rejected.length) {
        setErrMsg(`Một số từ vựng tạo không thành công: ${rejected.length}/${generatedVocabularies.length}`);
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
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentStep === 'ai-config' && 'Cấu Hình AI Tạo Từ Vựng'}
                {currentStep === 'generating' && 'Đang Tạo Từ Vựng Với AI'}
                {currentStep === 'edit-vocabulary' && 'Chỉnh Sửa Từ Vựng AI'}
                {currentStep === 'test-info' && 'Thông Tin Bài Test'}
                {currentStep === 'review' && 'Xem Lại Thông Tin'}
                {currentStep === 'creating' && 'Đang Tạo Bài Test'}
                {currentStep === 'success' && 'Hoàn Thành!'}
              </h2>
              <p className="text-sm text-gray-600">
                {currentStep === 'ai-config' && 'Cấu hình AI để tạo từ vựng tự động'}
                {currentStep === 'generating' && 'AI đang tạo từ vựng theo yêu cầu của bạn...'}
                {currentStep === 'edit-vocabulary' && 'Kiểm tra và chỉnh sửa từ vựng AI đã tạo'}
                {currentStep === 'test-info' && 'Cấu hình thông tin bài test'}
                {currentStep === 'review' && 'Kiểm tra lại thông tin trước khi tạo'}
                {currentStep === 'creating' && 'Đang xử lý...'}
                {currentStep === 'success' && 'Bài test AI đã được tạo thành công'}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Step 1: AI Configuration */}
            {currentStep === 'ai-config' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-purple-900 mb-2">AI Gemini sẽ tạo từ vựng tự động</h3>
                      <p className="text-sm text-purple-800 mb-3">
                        Nhập thông tin để AI tạo ra danh sách từ vựng phù hợp với chủ đề của bạn
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-800 mb-2">Chủ đề chính *</label>
                    <input
                      type="text"
                      value={aiConfig.topic}
                      onChange={(e) => handleAIConfigChange('topic', e.target.value)}
                      placeholder="VD: Business English, Travel, Technology..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-black text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Phân loại</label>
                    <input
                      type="text"
                      value={aiConfig.category}
                      onChange={(e) => handleAIConfigChange('category', e.target.value)}
                      placeholder="VD: Office Communication, Airport..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-black text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Số từ vựng</label>
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={aiConfig.count}
                      onChange={(e) => {
                        const value = Math.max(5, Math.min(50, parseInt(e.target.value) || 5));
                        handleAIConfigChange('count', value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-black text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-800 mb-2">Mô tả thêm</label>
                    <textarea
                      value={aiConfig.description}
                      onChange={(e) => handleAIConfigChange('description', e.target.value)}
                      placeholder="Mô tả thêm về loại từ vựng bạn muốn tạo..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-black text-white placeholder-gray-400 resize-none"
                    />
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

            {/* Step 2: Generating */}
            {currentStep === 'generating' && (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI đang tạo từ vựng...</h3>
                <p className="text-sm text-gray-700">
                  Đang tạo {aiConfig.count} từ vựng cho chủ đề "{aiConfig.topic}"
                </p>
              </div>
            )}

            {/* Step 3: Edit Vocabulary */}
            {currentStep === 'edit-vocabulary' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-green-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-green-900 mb-2">AI đã tạo {generatedVocabularies.length} từ vựng</h3>
                      <p className="text-sm text-green-800 mb-3">
                        Hãy kiểm tra và chỉnh sửa từ vựng theo ý muốn. Bạn có thể thêm, xóa hoặc sửa đổi từ vựng trước khi tạo bài test.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vocabulary List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {generatedVocabularies.map((vocab, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVocabulary(index)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          aria-label="Xóa từ vựng"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Từ vựng *</label>
                          <input
                            type="text"
                            value={vocab.word || ''}
                            onChange={(e) => handleVocabularyChange(index, 'word', e.target.value)}
                            placeholder="Nhập từ vựng..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Nghĩa *</label>
                          <input
                            type="text"
                            value={vocab.meaning || ''}
                            onChange={(e) => handleVocabularyChange(index, 'meaning', e.target.value)}
                            placeholder="Nhập nghĩa..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Câu ví dụ</label>
                        <textarea
                          value={vocab.example_sentence || ''}
                          onChange={(e) => handleVocabularyChange(index, 'example_sentence', e.target.value)}
                          placeholder="Nhập câu ví dụ..."
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new vocabulary button */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleAddVocabulary}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Thêm từ vựng mới
                  </button>
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

            {/* Step 4: Test Info */}
            {currentStep === 'test-info' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Thông Tin Bài Test</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    AI đã tạo <span className="font-medium text-purple-700">{generatedVocabularies.length} từ vựng</span> cho chủ đề "{aiConfig.topic}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-800 mb-2">Tiêu đề bài test *</label>
                    <input
                      type="text"
                      value={testInfo.test_title}
                      onChange={(e) => handleTestInfoChange('test_title', e.target.value)}
                      placeholder="VD: Business English - AI Generated Test"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-black text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Chủ đề chính *</label>
                    <input
                      type="text"
                      value={testInfo.main_topic}
                      onChange={(e) => handleTestInfoChange('main_topic', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-black text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Phân mục *</label>
                    <input
                      type="text"
                      value={testInfo.sub_topic}
                      onChange={(e) => handleTestInfoChange('sub_topic', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-black text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Độ khó</label>
                    <select
                      value={testInfo.difficulty}
                      onChange={(e) => handleTestInfoChange('difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-black text-white"
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
                        const value = Math.max(1, Math.min(120, parseInt(e.target.value) || 10));
                        handleTestInfoChange('time_limit_minutes', value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-black text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Chế độ hiển thị</label>
                    <select
                      value={testInfo.visibility}
                      onChange={(e) => handleTestInfoChange('visibility', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-black text-white"
                    >
                      <option value="public">🌍 Công khai - Mọi người có thể xem</option>
                      <option value="private">🔒 Riêng tư - Chỉ mình tôi</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Mô tả</label>
                  <textarea
                    value={testInfo.description}
                    onChange={(e) => handleTestInfoChange('description', e.target.value)}
                    placeholder="Mô tả ngắn về bài test này..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-black text-white placeholder-gray-400 resize-none"
                  />
                </div>

                {!!errMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800">{errMsg}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 'review' && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Thông tin bài test AI
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
                      <p className="text-sm font-semibold text-gray-900 mt-1">{generatedVocabularies.length} từ</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 uppercase">Tạo bởi</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">AI Gemini</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 uppercase">Chế độ hiển thị</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {testInfo.visibility === 'public' ? '🌍 Công khai' : '🔒 Riêng tư'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vocabulary Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Từ vựng AI tạo ra ({generatedVocabularies.length} từ)
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
                        {generatedVocabularies.map((vocab, index) => (
                          <tr key={`${vocab.word}-${index}`} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-purple-900">{vocab.word}</td>
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

            {/* Step 6: Creating */}
            {currentStep === 'creating' && (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Đang tạo bài test...</h3>
                <p className="text-sm text-gray-700">
                  Đang tạo bài test với {generatedVocabularies.length} từ vựng AI
                </p>
              </div>
            )}

            {/* Step 7: Success */}
            {currentStep === 'success' && (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tạo thành công!</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Bài test AI "{testInfo.test_title}" đã được tạo với {generatedVocabularies.length} từ vựng
                </p>
                <p className="text-xs text-gray-500">Đang chuyển hướng đến trang cài đặt bài test...</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {(currentStep === 'ai-config' || currentStep === 'edit-vocabulary' || currentStep === 'test-info' || currentStep === 'review') && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white">
            <div className="flex space-x-3">
              {currentStep === 'edit-vocabulary' && (
                <button
                  type="button"
                  onClick={handleBackToAIConfig}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 disabled:opacity-50"
                >
                  Tạo lại với AI
                </button>
              )}
              {currentStep === 'test-info' && (
                <button
                  type="button"
                  onClick={() => setCurrentStep('edit-vocabulary')}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 disabled:opacity-50"
                >
                  Quay lại chỉnh sửa
                </button>
              )}
              {currentStep === 'review' && (
                <button
                  type="button"
                  onClick={handleBackToTestInfo}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 disabled:opacity-50"
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
                className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 disabled:opacity-50"
              >
                Hủy
              </button>

              {currentStep === 'ai-config' && (
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 border border-transparent rounded-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 disabled:opacity-50"
                >
                  {loading ? 'Đang tạo...' : 'Tạo với AI'}
                </button>
              )}

              {currentStep === 'edit-vocabulary' && (
                <button
                  type="button"
                  onClick={handleSaveVocabularies}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 border border-transparent rounded-md hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50"
                >
                  Lưu từ vựng ({generatedVocabularies.length})
                </button>
              )}

              {currentStep === 'test-info' && (
                <button
                  type="button"
                  onClick={handleContinueToReview}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 border border-transparent rounded-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 disabled:opacity-50"
                >
                  Xem lại
                </button>
              )}

              {currentStep === 'review' && (
                <button
                  type="button"
                  onClick={handleCreateTest}
                  disabled={loading}
                  className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 border border-transparent rounded-md hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50"
                >
                  {loading ? 'Đang tạo...' : 'Tạo bài test'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default CreateVocabularyWithAIModal;