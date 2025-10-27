import React, { useState, useEffect } from 'react';
import testService from '../services/testService';
import multipleChoiceService from '../services/multipleChoiceService';
import vocabularyService from '../services/vocabularyService';
import grammarService from '../services/grammarService';
import QuestionModal from './QuestionModal';

const Badge = ({ children, tone = 'slate' }) => {
  const map = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    yellow: 'bg-amber-100 text-amber-700',
    red: 'bg-rose-100 text-rose-700',
    purple: 'bg-violet-100 text-violet-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${map[tone]}`}>
      {children}
    </span>
  );
};

const Icon = {
  file: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6a1 1 0 01.7.3l5.4 5.4a1 1 0 01.3.7V19a2 2 0 01-2 2z" />
    </svg>
  ),
  close: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.4-9.4a2 2 0 112.8 2.8L11.8 15H9v-2.8l8.6-8.6z" />
    </svg>
  ),
  trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.9 12.1A2 2 0 0116.1 21H7.9a2 2 0 01-2-1.9L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1H10a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  add: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  info: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
    </svg>
  ),
  spinner: () => (
    <svg className="w-8 h-8 animate-spin" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="5" fill="none" className="opacity-25" />
      <path d="M45 25a20 20 0 00-20-20" stroke="currentColor" strokeWidth="5" className="opacity-80" />
    </svg>
  ),
};

const TestDetailModal = ({ isOpen, onClose, testId, onTestUpdated }) => {
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingTest, setEditingTest] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50); // Cho phép thay đổi
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'

  // Question modal
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Edit form
  const [testFormData, setTestFormData] = useState({
    test_title: '',
    description: '',
    main_topic: '',
    sub_topic: '',
    test_type: '',
    total_questions: 0,
    duration_minutes: 0,
    visibility: 'public',
  });

  useEffect(() => {
    if (isOpen && testId) fetchTestDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, testId]);

  useEffect(() => {
    if (test) {
      setTestFormData({
        test_title: test.test_title || '',
        description: test.description || '',
        main_topic: test.main_topic || '',
        sub_topic: test.sub_topic || '',
        test_type: test.test_type || '',
        total_questions: test.total_questions || 0,
        duration_minutes: test.duration_minutes || 0,
        visibility: test.visibility || 'public',
      });
    }
  }, [test]);

  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const t = await testService.getTestById(testId);
      setTest(t);
      let qs = [];
      if (t.test_type === 'multiple_choice') {
        qs = await multipleChoiceService.getQuestionsByTestId(testId);
      } else if (t.test_type === 'vocabulary') {
        qs = await vocabularyService.getAllVocabulariesByTestId(testId);
      } else if (t.test_type === 'grammar') {
        qs = await grammarService.getGrammarsByTestId(testId);
      }
      setQuestions(Array.isArray(qs) ? qs : []);
      setCurrentPage(1);
    } catch (e) {
      setError(e.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleTestUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await testService.updateTest(testId, testFormData);
      await fetchTestDetails();
      setEditingTest(false);
      onTestUpdated?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionModalOpen(true);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionModalOpen(true);
  };

  const handleQuestionSaved = () => {
    fetchTestDetails();
    setQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Xoá câu hỏi này?')) return;
    try {
      setLoading(true);
      if (test.test_type === 'multiple_choice') await multipleChoiceService.deleteMultipleChoice(id);
      else if (test.test_type === 'vocabulary') await vocabularyService.deleteVocabulary(id);
      else if (test.test_type === 'grammar') await grammarService.deleteGrammar(id, localStorage.getItem('token'));
      await fetchTestDetails();
      onTestUpdated?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(questions.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentQuestions = questions.slice(startIndex, startIndex + itemsPerPage);

  const difficultyTone = (d) => (d === 'easy' ? 'green' : d === 'medium' ? 'yellow' : 'red');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative min-h-full flex items-center justify-center p-4">
        {/* Modal */}
        <div className="relative w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl shadow-2xl">
          {/* Header gradient */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
            <div className="relative px-6 py-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 grid place-items-center ring-1 ring-white/20">
                  <Icon.file />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold leading-tight">Chi tiết bài kiểm tra</h2>
                  <p className="text-white/80 text-sm">
                    {test ? `${test.test_title} • ${questions.length} câu hỏi` : 'Đang tải...'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors ring-1 ring-white/20"
                aria-label="Đóng"
              >
                <Icon.close />
              </button>
            </div>
          </div>

          {/* Body (glass card) */}
          <div className="bg-white">
            {/* Sticky action bar */}
            <div className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur">
              <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Badge tone="blue">{test?.test_type || '—'}</Badge>
                  <Badge tone="slate">
                    Chủ đề: <span className="ml-1 font-medium">{test?.main_topic || '—'}</span>
                    {test?.sub_topic ? <span className="ml-1">/ {test.sub_topic}</span> : null}
                  </Badge>
                  <Badge tone={test?.visibility === 'public' ? 'green' : 'red'}>
                    {test?.visibility === 'public' ? 'Công khai' : 'Riêng tư'}
                  </Badge>
                  <Badge tone="purple">{test?.duration_minutes || 0} phút</Badge>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('card')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        viewMode === 'card' 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Card
                      </div>
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        viewMode === 'table' 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m5-8v8M7 7V4a1 1 0 011-1h8a1 1 0 011 1v3" />
                        </svg>
                        Table
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={() => setEditingTest(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Icon.edit />
                    Sửa thông tin
                  </button>
                  <button
                    onClick={handleAddQuestion}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Icon.add />
                    Thêm câu hỏi
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 overflow-y-auto max-h-[72vh]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                  <div className="text-blue-600">
                    <Icon.spinner />
                  </div>
                  <p className="mt-3">Đang tải dữ liệu…</p>
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 grid place-items-center mx-auto mb-4">
                    <Icon.info />
                  </div>
                  <p className="text-slate-600 mb-4">{error}</p>
                  <button
                    onClick={fetchTestDetails}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
                  >
                    Thử lại
                  </button>
                </div>
              ) : (
                <>
                  {/* Edit section */}
                  {editingTest && (
                    <div className="mb-6 rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <h3 className="text-base font-semibold text-slate-900 mb-4">Cập nhật thông tin</h3>
                      <form onSubmit={handleTestUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Tên test</label>
                            <input
                              type="text"
                              value={testFormData.test_title}
                              onChange={(e) => setTestFormData({ ...testFormData, test_title: e.target.value })}
                              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700">Loại test</label>
                            <select
                              value={testFormData.test_type}
                              onChange={(e) => setTestFormData({ ...testFormData, test_type: e.target.value })}
                              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="multiple_choice">Trắc nghiệm</option>
                              <option value="vocabulary">Từ vựng</option>
                              <option value="grammar">Ngữ pháp</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700">Mô tả</label>
                          <textarea
                            rows={2}
                            value={testFormData.description}
                            onChange={(e) => setTestFormData({ ...testFormData, description: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Main Topic</label>
                            <input
                              type="text"
                              value={testFormData.main_topic}
                              onChange={(e) => setTestFormData({ ...testFormData, main_topic: e.target.value })}
                              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700">Sub Topic</label>
                            <input
                              type="text"
                              value={testFormData.sub_topic}
                              onChange={(e) => setTestFormData({ ...testFormData, sub_topic: e.target.value })}
                              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="rounded-xl bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTest(false)}
                            className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Hủy
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Questions */}
                  {currentQuestions.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 grid place-items-center mx-auto mb-4">
                        <Icon.file />
                      </div>
                      <p className="text-slate-600">Chưa có câu hỏi nào.</p>
                    </div>
                  ) : viewMode === 'table' ? (
                    /* Table View */
                    <div className="overflow-x-auto">
                      <table className="w-full border border-slate-200 rounded-xl overflow-hidden">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">#</th>
                            {test?.test_type === 'vocabulary' && (
                              <>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Từ vựng</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nghĩa</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ví dụ</th>
                              </>
                            )}
                            {test?.test_type === 'multiple_choice' && (
                              <>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Câu hỏi</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Đáp án đúng</th>
                              </>
                            )}
                            {test?.test_type === 'grammar' && (
                              <>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Câu hỏi</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Đáp án</th>
                              </>
                            )}
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Độ khó</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {currentQuestions.map((q, idx) => (
                            <tr key={q._id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <Badge tone="blue">#{startIndex + idx + 1}</Badge>
                              </td>
                              
                              {/* Vocabulary Table Columns */}
                              {test?.test_type === 'vocabulary' && (
                                <>
                                  <td className="px-4 py-3">
                                    <span className="font-semibold text-slate-900">{q.word}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-slate-800">{q.meaning}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-sm text-slate-600 italic">
                                      {q.example_sentence ? `"${q.example_sentence}"` : '—'}
                                    </span>
                                  </td>
                                </>
                              )}

                              {/* Multiple Choice Table Columns */}
                              {test?.test_type === 'multiple_choice' && (
                                <>
                                  <td className="px-4 py-3">
                                    <span className="text-slate-900">{q.question_text}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                      {q.correct_answers?.map((answer, i) => (
                                        <Badge key={i} tone="green">{answer}</Badge>
                                      ))}
                                    </div>
                                  </td>
                                </>
                              )}

                              {/* Grammar Table Columns */}
                              {test?.test_type === 'grammar' && (
                                <>
                                  <td className="px-4 py-3">
                                    <span className="text-slate-900">{q.question_text}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-emerald-700">{q.correct_answer || '—'}</span>
                                  </td>
                                </>
                              )}

                              <td className="px-4 py-3 whitespace-nowrap">
                                {q.difficulty ? (
                                  <Badge tone={difficultyTone(q.difficulty)}>{q.difficulty}</Badge>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {q.status ? (
                                  <Badge tone={q.status === 'active' ? 'green' : q.status === 'draft' ? 'slate' : 'red'}>
                                    {q.status}
                                  </Badge>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right">
                                <div className="flex justify-end gap-1">
                                  <button
                                    onClick={() => handleEditQuestion(q)}
                                    className="rounded-lg border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-50"
                                    title="Sửa"
                                  >
                                    <Icon.edit />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuestion(q._id)}
                                    className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                                    title="Xoá"
                                  >
                                    <Icon.trash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Card View */
                    <div className="space-y-4">
                      {currentQuestions.map((q, idx) => (
                        <div
                          key={q._id}
                          className="group rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge tone="blue">#{startIndex + idx + 1}</Badge>
                                {q.difficulty && <Badge tone={difficultyTone(q.difficulty)}>{q.difficulty}</Badge>}
                                {q.status && (
                                  <Badge tone={q.status === 'active' ? 'green' : q.status === 'draft' ? 'slate' : 'red'}>
                                    {q.status}
                                  </Badge>
                                )}
                              </div>

                              {/* Multiple choice */}
                              {test?.test_type === 'multiple_choice' && (
                                <>
                                  <p className="font-medium text-slate-900 mb-2">{q.question_text}</p>
                                  <div className="grid sm:grid-cols-2 gap-2">
                                    {q.options?.map((op, i) => {
                                      const correct = q.correct_answers?.includes(op.label);
                                      return (
                                        <div
                                          key={i}
                                          className={`rounded-xl px-3 py-2 text-sm ${
                                            correct
                                              ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
                                              : 'bg-slate-50 text-slate-700'
                                          }`}
                                        >
                                          <span className="font-semibold">{op.label}:</span> {op.text}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>
                              )}

                              {/* Vocabulary */}
                              {test?.test_type === 'vocabulary' && (
                                <>
                                  <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-slate-900 font-semibold">{q.word}</span>
                                    <span className="text-slate-400">→</span>
                                    <span className="text-slate-800">{q.meaning}</span>
                                  </div>
                                  {q.example_sentence && (
                                    <p className="text-sm text-slate-600 italic mt-2">“{q.example_sentence}”</p>
                                  )}
                                </>
                              )}

                              {/* Grammar */}
                              {test?.test_type === 'grammar' && (
                                <>
                                  <p className="font-medium text-slate-900">{q.question_text}</p>
                                  {q.correct_answer && (
                                    <p className="text-sm text-emerald-700 mt-1">
                                      <span className="font-semibold">Đáp án:</span> {q.correct_answer}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>

                            <div className="flex shrink-0 gap-1 opacity-80 group-hover:opacity-100">
                              <button
                                onClick={() => handleEditQuestion(q)}
                                className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
                                title="Sửa"
                              >
                                <Icon.edit />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q._id)}
                                className="rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                                title="Xoá"
                              >
                                <Icon.trash />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                      {/* Pagination or Info */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 gap-3">
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-slate-600">
                            Hiển thị {startIndex + 1}–
                            {Math.min(startIndex + itemsPerPage, questions.length)} / {questions.length}
                          </p>
                          {questions.length > 10 && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-slate-600">Hiển thị:</span>
                              <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                  setItemsPerPage(Number(e.target.value));
                                  setCurrentPage(1);
                                }}
                                className="px-2 py-1 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={questions.length}>Tất cả ({questions.length})</option>
                              </select>
                              <span className="text-slate-600">mục/trang</span>
                            </div>
                          )}
                        </div>
                        
                        {totalPages > 1 && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50"
                            >
                              Trước
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              const page = i + 1;
                              return (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`px-3 py-1.5 rounded-xl text-sm ${
                                    currentPage === page
                                      ? 'bg-blue-600 text-white'
                                      : 'border border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            })}
                            <button
                              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50"
                            >
                              Sau
                            </button>
                          </div>
                        )}
                      </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Modal */}
      <QuestionModal
        isOpen={questionModalOpen}
        onClose={() => {
          setQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        testId={testId}
        testType={test?.test_type}
        question={editingQuestion}
        onQuestionSaved={handleQuestionSaved}
      />
    </div>
  );
};

export default TestDetailModal;
