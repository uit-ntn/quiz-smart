import React, { useEffect, useState, useMemo } from "react";
import AdminLayout from "../layout/AdminLayout";
import multipleChoiceService from "../services/multipleChoiceService";
import testService from "../services/testService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

/* ---------- Small UI helpers ---------- */
const Badge = ({ children, tone = "sky" }) => {
  const map = {
    sky: "bg-sky-50 text-sky-800 ring-1 ring-sky-100",
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    red: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    indigo: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${map[tone]}`}>
      {children}
    </span>
  );
};

const initialForm = {
  question: "",
  options: ["", "", "", ""],
  correct_answer: 0,
  explanation: "",
};

const AdminMultipleChoices = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  // modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  // test info cache
  const [tests, setTests] = useState({});

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, searchTerm]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await multipleChoiceService.getAllMultipleChoices();
      setQuestions(Array.isArray(data) ? data : []);

      // preload test info
      const ids = [...new Set(data.map((q) => q.test_id).filter(Boolean))];
      const info = {};
      await Promise.all(
        ids.map(async (id) => {
          try {
            const t = await testService.getTestById(id);
            info[id] = t;
          } catch (e) {
            console.error("Fetch test failed", id, e);
          }
        })
      );
      setTests(info);
    } catch (e) {
      console.error(e);
      setError("Không thể tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let list = [...questions];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter((q) => {
        const questionText = q.question?.toLowerCase() || '';
        const optionsText = q.options?.map(op => 
          typeof op === 'string' ? op.toLowerCase() : op?.text?.toLowerCase() || ''
        ).join(' ') || '';
        return questionText.includes(s) || optionsText.includes(s);
      });
    }
    setFilteredQuestions(list);
  };

  /* -------------------- CRUD Handlers -------------------- */
  const openCreate = () => {
    setFormData(initialForm);
    setShowCreateModal(true);
  };

  const openEdit = (q) => {
    setSelectedQuestion(q);
    
    // Convert options objects to strings if needed
    const normalizedOptions = q.options?.length 
      ? q.options.map(op => typeof op === 'string' ? op : op?.text || '')
      : ["", "", "", ""];
    
    setFormData({
      question: q.question || "",
      options: normalizedOptions,
      correct_answer:
        typeof q.correct_answer === "number" ? q.correct_answer : 0,
      explanation: typeof q.explanation === 'object' && q.explanation.correct 
        ? q.explanation.correct 
        : q.explanation || "",
    });
    setShowEditModal(true);
  };

  const openDelete = (q) => {
    setSelectedQuestion(q);
    setShowDeleteModal(true);
  };

  const openDetail = (q) => {
    setSelectedQuestion(q);
    setShowDetailModal(true);
  };

  const validateForm = () => {
    const filled = (formData.options || []).filter((o) => o.trim() !== "");
    if (filled.length < 2) {
      alert("Vui lòng nhập ít nhất 2 đáp án!");
      return false;
    }
    if (
      typeof formData.correct_answer !== "number" ||
      !formData.options[formData.correct_answer] ||
      formData.options[formData.correct_answer].trim() === ""
    ) {
      alert("Vui lòng chọn đáp án đúng hợp lệ!");
      return false;
    }
    if (!formData.question.trim()) {
      alert("Câu hỏi không được để trống!");
      return false;
    }
    return true;
    };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const created = await multipleChoiceService.createMultipleChoice(formData);
      setQuestions((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setFormData(initialForm);
    } catch (e) {
      console.error(e);
      alert("Không thể tạo câu hỏi. Vui lòng thử lại!");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    if (!validateForm()) return;
    try {
      const updated = await multipleChoiceService.updateMultipleChoice(
        selectedQuestion._id,
        formData
      );
      setQuestions((prev) =>
        prev.map((q) => (q._id === selectedQuestion._id ? updated : q))
      );
      setShowEditModal(false);
      setSelectedQuestion(null);
    } catch (e) {
      console.error(e);
      alert("Không thể cập nhật câu hỏi. Vui lòng thử lại!");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedQuestion) return;
    try {
      await multipleChoiceService.deleteMultipleChoice(selectedQuestion._id);
      setQuestions((prev) => prev.filter((q) => q._id !== selectedQuestion._id));
      setShowDeleteModal(false);
      setSelectedQuestion(null);
    } catch (e) {
      console.error(e);
      alert("Không thể xóa câu hỏi. Vui lòng thử lại!");
    }
  };

  const handleOptionChange = (index, value) => {
    const next = [...formData.options];
    next[index] = value;
    setFormData((p) => ({ ...p, options: next }));
  };

  const correctLetter = (idx) =>
    typeof idx === "number" ? String.fromCharCode(65 + idx) : "—";

  const total = useMemo(() => filteredQuestions.length, [filteredQuestions]);

  /* -------------------- Render -------------------- */
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
            <h1 className="text-3xl font-bold text-black">Quản lý Multiple Choice</h1>
            <p className="text-indigo-900/70 mt-1">Tổng số: {total} câu hỏi</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button
              onClick={fetchQuestions}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-sky-100 bg-sky-50 text-indigo-900 hover:bg-sky-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Làm mới
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm câu hỏi
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-sky-100 p-4">
          <label className="block text-sm font-medium text-black mb-2">Tìm kiếm</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo câu hỏi..."
            className="w-full px-4 py-2 rounded-lg border border-sky-100 bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder:text-indigo-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-sky-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sky-50 border-b border-sky-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900/70 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900/70 uppercase">Câu hỏi</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900/70 uppercase">Đáp án đúng</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-indigo-900/70 uppercase">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-sky-100">
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-indigo-900/70">
                      {searchTerm ? "Không tìm thấy câu hỏi nào phù hợp" : "Chưa có câu hỏi nào"}
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((q, idx) => {
                    const t = q.test_id ? tests[q.test_id] : null;
                    const correctIdx = q.correct_answer;
                    const correct =
                      typeof correctIdx === "number" && q.options?.[correctIdx]
                        ? (typeof q.options[correctIdx] === 'string' ? q.options[correctIdx] : q.options[correctIdx]?.text)
                        : null;

                    return (
                      <tr key={q._id} className="hover:bg-sky-50/60">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge tone="indigo">{idx + 1}</Badge>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-black font-medium max-w-md truncate">
                            {q.question_text}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {correct ? (
                            <Badge tone="green">
                              {correctLetter(correctIdx)}. {correct}
                            </Badge>
                          ) : (
                            <span className="text-indigo-900/60">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => openDetail(q)}
                              className="rounded-lg border border-indigo-100 px-3 py-1.5 text-indigo-700 hover:bg-indigo-50"
                              title="Xem chi tiết"
                            >
                              Chi tiết
                            </button>
                            <button
                              onClick={() => openEdit(q)}
                              className="rounded-lg border border-sky-100 px-3 py-1.5 text-indigo-900 hover:bg-sky-50"
                              title="Chỉnh sửa"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => openDelete(q)}
                              className="rounded-lg border border-rose-200 px-3 py-1.5 text-rose-600 hover:bg-rose-50"
                              title="Xoá"
                            >
                              Xoá
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-xl">
              <h3 className="text-xl font-semibold text-black mb-4">Thêm câu hỏi mới</h3>
              <QuestionForm
                formData={formData}
                setFormData={setFormData}
                handleOptionChange={handleOptionChange}
                onCancel={() => setShowCreateModal(false)}
                onSubmit={handleCreateSubmit}
                buttonText="Tạo mới"
              />
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-xl">
              <h3 className="text-xl font-semibold text-black mb-4">Chỉnh sửa câu hỏi</h3>
              <QuestionForm
                formData={formData}
                setFormData={setFormData}
                handleOptionChange={handleOptionChange}
                onCancel={() => setShowEditModal(false)}
                onSubmit={handleEditSubmit}
                buttonText="Cập nhật"
              />
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full grid place-items-center ring-1 ring-rose-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M7 21h10a2 2 0 002-2V7l-5-5H9L4 7v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-black">Xác nhận xóa</h4>
                  <p className="text-sm text-indigo-900/70">Hành động này không thể hoàn tác</p>
                </div>
              </div>
              <p className="text-black mb-6">Bạn có chắc chắn muốn xóa câu hỏi này?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-sky-100 bg-sky-50 text-indigo-900 hover:bg-sky-100"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Chi tiết câu hỏi</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {(() => {
                  const t = tests[selectedQuestion.test_id];
                  const correctIdx = selectedQuestion.correct_answer;
                  const correct = typeof correctIdx === "number" && selectedQuestion.options?.[correctIdx] ?
                    (typeof selectedQuestion.options[correctIdx] === 'string' ? selectedQuestion.options[correctIdx] : selectedQuestion.options[correctIdx]?.text) :
                    null;

                  return (
                    <div className="space-y-6">
                      {/* Test Info */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Thông tin bài kiểm tra</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Tên bài:</span>
                            <div className="text-gray-900">{t?.test_title || '—'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Trạng thái:</span>
                            <div className="text-gray-900">{t?.visibility === 'public' ? '🌍 Công khai' : '🔒 Riêng tư'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Chủ đề chính:</span>
                            <div className="text-gray-900">{t?.main_topic || '—'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Chủ đề con:</span>
                            <div className="text-gray-900">{t?.sub_topic || '—'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Question */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Câu hỏi</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-900">{selectedQuestion.question_text}</p>
                        </div>
                      </div>

                      {/* Options */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Các đáp án</h4>
                        <div className="space-y-2">
                          {selectedQuestion.options?.map((op, i) => {
                            const isCorrect = i === correctIdx;
                            const optionText = typeof op === 'string' ? op : op?.text;
                            const optionLabel = typeof op === 'object' ? op?.label : String.fromCharCode(65 + i);
                            
                            return (
                              <div
                                key={i}
                                className={`flex items-start gap-3 p-3 rounded-lg border-2 ${
                                  isCorrect 
                                    ? 'border-emerald-500 bg-emerald-100 text-emerald-900' 
                                    : 'border-gray-300 bg-gray-50 text-gray-800'
                                }`}
                              >
                                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-gray-500 text-white'
                                }`}>
                                  {optionLabel}
                                </span>
                                <span className={`flex-1 ${isCorrect ? 'font-bold' : 'font-medium'}`}>
                                  {optionText}
                                </span>
                                {isCorrect && (
                                  <span className="text-emerald-600">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explanation */}
                      {selectedQuestion.explanation && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Giải thích</h4>
                          <div className="space-y-3">
                            {typeof selectedQuestion.explanation === 'object' ? (
                              <>
                                {selectedQuestion.explanation.correct && (
                                  <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-r">
                                    <div className="flex items-start">
                                      <svg className="w-5 h-5 text-emerald-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      <div>
                                        <h5 className="font-medium text-emerald-800 mb-1">✓ Đáp án đúng</h5>
                                        <p className="text-emerald-700">{selectedQuestion.explanation.correct}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {selectedQuestion.explanation.incorrect_choices && Object.keys(selectedQuestion.explanation.incorrect_choices).length > 0 && (
                                  <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r">
                                    <div className="flex items-start">
                                      <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                      <div>
                                        <h5 className="font-medium text-amber-800 mb-2">⚠ Tại sao các đáp án khác sai?</h5>
                                        <div className="space-y-2">
                                          {Object.entries(selectedQuestion.explanation.incorrect_choices).map(([label, explanation]) => (
                                            <div key={label} className="flex items-start bg-white/50 p-2 rounded">
                                              <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-600 text-white text-xs font-bold rounded mr-2">
                                                {label}
                                              </span>
                                              <p className="text-amber-800 text-sm">{explanation}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-gray-700">{selectedQuestion.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

/* ---------- Form component (stateless) ---------- */
const QuestionForm = ({
  formData,
  setFormData,
  handleOptionChange,
  onCancel,
  onSubmit,
  buttonText,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Câu hỏi <span className="text-rose-600">*</span>
        </label>
        <textarea
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          required
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-sky-100 bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder:text-indigo-400"
          placeholder="Nhập câu hỏi..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Các đáp án <span className="text-rose-600">*</span>
        </label>
        <div className="space-y-3">
          {formData.options.map((option, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="radio"
                checked={formData.correct_answer === idx}
                onChange={() => setFormData({ ...formData, correct_answer: idx })}
                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                required={idx < 2}
                className="flex-1 px-4 py-2 rounded-lg border border-sky-100 bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder:text-indigo-400"
                placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-indigo-900/70 mt-2">
          Chọn radio để đánh dấu đáp án đúng
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">Giải thích</label>
        <textarea
          value={formData.explanation}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-sky-100 bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder:text-indigo-400"
          placeholder="Giải thích đáp án đúng (tùy chọn)..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg border border-sky-100 bg-sky-50 text-indigo-900 hover:bg-sky-100"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
};

export default AdminMultipleChoices;
