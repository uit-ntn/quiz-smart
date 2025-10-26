import React, { useState, useEffect } from 'react';
import multipleChoiceService from '../services/multipleChoiceService';
import vocabularyService from '../services/vocabularyService';
import grammarService from '../services/grammarService';

const QuestionModal = ({ 
  isOpen, 
  onClose, 
  testId, 
  testType, 
  question = null, // null for add, object for edit
  onQuestionSaved 
}) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const isEditMode = question !== null;

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, question, testType]);

  const resetForm = () => {
    setError(null);
    setErrors({});
    
    if (testType === 'multiple_choice') {
      setFormData({
        question_text: question?.question_text || '',
        options: question?.options || [
          { label: 'A', text: '' },
          { label: 'B', text: '' },
          { label: 'C', text: '' },
          { label: 'D', text: '' }
        ],
        correct_answers: question?.correct_answers || [],
        difficulty: question?.difficulty || 'medium',
        points: question?.points || 1,
        explanation: question?.explanation || '',
        test_id: testId,
        status: question?.status || 'active'
      });
    } else if (testType === 'vocabulary') {
      setFormData({
        word: question?.word || '',
        meaning: question?.meaning || '',
        pronunciation: question?.pronunciation || '',
        example_sentence: question?.example_sentence || '',
        difficulty: question?.difficulty || 'medium',
        main_topic: question?.main_topic || '',
        sub_topic: question?.sub_topic || '',
        test_id: testId,
        status: question?.status || 'active'
      });
    } else if (testType === 'grammar') {
      setFormData({
        question_text: question?.question_text || '',
        correct_answer: question?.correct_answer || '',
        options: question?.options || ['', '', '', ''],
        explanation: question?.explanation || '',
        difficulty: question?.difficulty || 'medium',
        points: question?.points || 1,
        main_topic: question?.main_topic || '',
        sub_topic: question?.sub_topic || '',
        test_id: testId,
        status: question?.status || 'active'
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (testType === 'multiple_choice') {
      if (!formData.question_text?.trim()) {
        newErrors.question_text = 'Câu hỏi không được để trống';
      }
      
      const validOptions = formData.options?.filter(opt => opt.text?.trim());
      if (!validOptions || validOptions.length < 2) {
        newErrors.options = 'Cần ít nhất 2 đáp án';
      }
      
      if (!formData.correct_answers?.length) {
        newErrors.correct_answers = 'Phải chọn ít nhất 1 đáp án đúng';
      }
    } else if (testType === 'vocabulary') {
      if (!formData.word?.trim()) {
        newErrors.word = 'Từ vựng không được để trống';
      }
      if (!formData.meaning?.trim()) {
        newErrors.meaning = 'Nghĩa không được để trống';
      }
    } else if (testType === 'grammar') {
      if (!formData.question_text?.trim()) {
        newErrors.question_text = 'Câu hỏi không được để trống';
      }
      if (!formData.correct_answer?.trim()) {
        newErrors.correct_answer = 'Đáp án đúng không được để trống';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let response;
      if (testType === 'multiple_choice') {
        if (isEditMode) {
          response = await multipleChoiceService.updateMultipleChoice(question._id, formData);
        } else {
          response = await multipleChoiceService.createMultipleChoice(formData);
        }
      } else if (testType === 'vocabulary') {
        if (isEditMode) {
          response = await vocabularyService.updateVocabulary(question._id, formData);
        } else {
          response = await vocabularyService.createVocabulary(formData);
        }
      } else if (testType === 'grammar') {
        if (isEditMode) {
          response = await grammarService.updateGrammar(question._id, formData, localStorage.getItem('token'));
        } else {
          response = await grammarService.createGrammar(formData, localStorage.getItem('token'));
        }
      }

      onQuestionSaved?.(response);
      onClose();
    } catch (err) {
      console.error('Error saving question:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    if (testType === 'multiple_choice') {
      newOptions[index] = { ...newOptions[index], text: value };
    } else {
      newOptions[index] = value;
    }
    setFormData({ ...formData, options: newOptions });
  };

  const handleCorrectAnswerToggle = (label) => {
    const current = formData.correct_answers || [];
    let updated;
    
    if (current.includes(label)) {
      updated = current.filter(ans => ans !== label);
    } else {
      updated = [...current, label];
    }
    
    setFormData({ ...formData, correct_answers: updated });
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    const typeNames = {
      multiple_choice: 'Trắc nghiệm',
      vocabulary: 'Từ vựng',
      grammar: 'Ngữ pháp'
    };
    return `${isEditMode ? 'Sửa' : 'Thêm'} câu hỏi ${typeNames[testType]}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{getModalTitle()}</h2>
                <p className="text-sm text-gray-600">
                  {isEditMode ? 'Chỉnh sửa thông tin câu hỏi' : 'Tạo câu hỏi mới cho bài kiểm tra'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Multiple Choice Form */}
              {testType === 'multiple_choice' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Câu hỏi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.question_text || ''}
                      onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                      rows="3"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.question_text ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nhập câu hỏi..."
                    />
                    {errors.question_text && (
                      <p className="mt-1 text-sm text-red-600">{errors.question_text}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Đáp án <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      {formData.options?.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formData.correct_answers?.includes(option.label)}
                            onChange={() => handleCorrectAnswerToggle(option.label)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="w-8 text-sm font-medium text-gray-700">{option.label}:</span>
                          <input
                            type="text"
                            value={option.text || ''}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Đáp án ${option.label}`}
                          />
                        </div>
                      ))}
                    </div>
                    {errors.options && (
                      <p className="mt-1 text-sm text-red-600">{errors.options}</p>
                    )}
                    {errors.correct_answers && (
                      <p className="mt-1 text-sm text-red-600">{errors.correct_answers}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giải thích</label>
                    <textarea
                      value={formData.explanation || ''}
                      onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Giải thích đáp án (tùy chọn)..."
                    />
                  </div>
                </>
              )}

              {/* Vocabulary Form */}
              {testType === 'vocabulary' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Từ vựng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.word || ''}
                        onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.word ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Nhập từ vựng..."
                      />
                      {errors.word && (
                        <p className="mt-1 text-sm text-red-600">{errors.word}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nghĩa <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.meaning || ''}
                        onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.meaning ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Nhập nghĩa..."
                      />
                      {errors.meaning && (
                        <p className="mt-1 text-sm text-red-600">{errors.meaning}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phát âm</label>
                    <input
                      type="text"
                      value={formData.pronunciation || ''}
                      onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="/pronunciation/"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Câu ví dụ</label>
                    <textarea
                      value={formData.example_sentence || ''}
                      onChange={(e) => setFormData({ ...formData, example_sentence: e.target.value })}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập câu ví dụ..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Main Topic</label>
                      <input
                        type="text"
                        value={formData.main_topic || ''}
                        onChange={(e) => setFormData({ ...formData, main_topic: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Chủ đề chính..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sub Topic</label>
                      <input
                        type="text"
                        value={formData.sub_topic || ''}
                        onChange={(e) => setFormData({ ...formData, sub_topic: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Chủ đề phụ..."
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Grammar Form */}
              {testType === 'grammar' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Câu hỏi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.question_text || ''}
                      onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                      rows="3"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.question_text ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nhập câu hỏi ngữ pháp..."
                    />
                    {errors.question_text && (
                      <p className="mt-1 text-sm text-red-600">{errors.question_text}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đáp án đúng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.correct_answer || ''}
                      onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.correct_answer ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nhập đáp án đúng..."
                    />
                    {errors.correct_answer && (
                      <p className="mt-1 text-sm text-red-600">{errors.correct_answer}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Đáp án khác (tùy chọn)</label>
                    <div className="space-y-2">
                      {formData.options?.map((option, index) => (
                        <input
                          key={index}
                          type="text"
                          value={option || ''}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Đáp án ${index + 1}...`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giải thích</label>
                    <textarea
                      value={formData.explanation || ''}
                      onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Giải thích đáp án (tùy chọn)..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Main Topic</label>
                      <input
                        type="text"
                        value={formData.main_topic || ''}
                        onChange={(e) => setFormData({ ...formData, main_topic: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Chủ đề chính..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sub Topic</label>
                      <input
                        type="text"
                        value={formData.sub_topic || ''}
                        onChange={(e) => setFormData({ ...formData, sub_topic: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Chủ đề phụ..."
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Common Fields */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Độ khó</label>
                  <select
                    value={formData.difficulty || 'medium'}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>

                {(testType === 'multiple_choice' || testType === 'grammar') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Điểm</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.points || 1}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="draft">Nháp</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  {isEditMode ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;