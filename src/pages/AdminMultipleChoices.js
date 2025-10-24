import React, { useEffect, useState } from 'react';
import AdminLayout from '../layout/AdminLayout';
import multipleChoiceService from '../services/multipleChoiceService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AdminMultipleChoices = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await multipleChoiceService.getAllMultipleChoices();
      setQuestions(data);
    } catch (err) {
      setError('Không thể tải danh sách câu hỏi');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = [...questions];

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.question?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  };

  const handleCreateClick = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: ''
    });
    setShowCreateModal(true);
  };

  const handleEditClick = (question) => {
    setSelectedQuestion(question);
    setFormData({
      question: question.question || '',
      options: question.options || ['', '', '', ''],
      correct_answer: question.correct_answer || 0,
      explanation: question.explanation || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (question) => {
    setSelectedQuestion(question);
    setShowDeleteModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    // Validate options
    const filledOptions = formData.options.filter(opt => opt.trim() !== '');
    if (filledOptions.length < 2) {
      alert('Vui lòng nhập ít nhất 2 đáp án!');
      return;
    }

    try {
      const newQuestion = await multipleChoiceService.createMultipleChoice(formData);
      setQuestions([newQuestion, ...questions]);
      setShowCreateModal(false);
      setFormData({
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: ''
      });
    } catch (err) {
      console.error('Error creating question:', err);
      alert('Không thể tạo câu hỏi. Vui lòng thử lại!');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuestion) return;

    // Validate options
    const filledOptions = formData.options.filter(opt => opt.trim() !== '');
    if (filledOptions.length < 2) {
      alert('Vui lòng nhập ít nhất 2 đáp án!');
      return;
    }

    try {
      const updatedQuestion = await multipleChoiceService.updateMultipleChoice(
        selectedQuestion._id,
        formData
      );
      setQuestions(questions.map(q => 
        q._id === selectedQuestion._id ? updatedQuestion : q
      ));
      setShowEditModal(false);
      setSelectedQuestion(null);
    } catch (err) {
      console.error('Error updating question:', err);
      alert('Không thể cập nhật câu hỏi. Vui lòng thử lại!');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedQuestion) return;

    try {
      await multipleChoiceService.deleteMultipleChoice(selectedQuestion._id);
      setQuestions(questions.filter(q => q._id !== selectedQuestion._id));
      setShowDeleteModal(false);
      setSelectedQuestion(null);
    } catch (err) {
      console.error('Error deleting question:', err);
      alert('Không thể xóa câu hỏi. Vui lòng thử lại!');
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const QuestionForm = ({ onSubmit, buttonText }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Câu hỏi <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          required
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Nhập câu hỏi..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Các đáp án <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="radio"
                checked={formData.correct_answer === index}
                onChange={() => setFormData({ ...formData, correct_answer: index })}
                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required={index < 2}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Chọn radio button để đánh dấu đáp án đúng
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Giải thích
        </label>
        <textarea
          value={formData.explanation}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Giải thích đáp án đúng..."
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </form>
  );

  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
            <p className="text-sm text-gray-600">Hành động này không thể hoàn tác</p>
          </div>
        </div>
        <p className="text-gray-700 mb-6">
          Bạn có chắc chắn muốn xóa câu hỏi này?
        </p>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner message="Đang tải danh sách câu hỏi..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Multiple Choice</h1>
            <p className="text-gray-600 mt-1">Tổng số: {filteredQuestions.length} câu hỏi</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button
              onClick={fetchQuestions}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Làm mới</span>
            </button>
            <button
              onClick={handleCreateClick}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Thêm câu hỏi</span>
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo câu hỏi..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">
                {searchTerm ? 'Không tìm thấy câu hỏi nào phù hợp' : 'Chưa có câu hỏi nào'}
              </p>
            </div>
          ) : (
            filteredQuestions.map((question, index) => (
              <div key={question._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-bold text-sm">
                        {index + 1}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {question.question}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      {question.options?.map((option, optIndex) => (
                        option && (
                          <div
                            key={optIndex}
                            className={`flex items-center space-x-3 p-3 rounded-lg border-2 ${
                              question.correct_answer === optIndex
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <span className={`flex items-center justify-center w-6 h-6 rounded-full font-semibold text-sm ${
                              question.correct_answer === optIndex
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-700'
                            }`}>
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="text-gray-900">{option}</span>
                          </div>
                        )
                      ))}
                    </div>

                    {question.explanation && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Giải thích: </span>
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditClick(question)}
                      className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(question)}
                      className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Thêm câu hỏi mới</h3>
            <QuestionForm onSubmit={handleCreateSubmit} buttonText="Tạo mới" />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Chỉnh sửa câu hỏi</h3>
            <QuestionForm onSubmit={handleEditSubmit} buttonText="Cập nhật" />
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && <DeleteModal />}
    </AdminLayout>
  );
};

export default AdminMultipleChoices;
