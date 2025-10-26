import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import TestService from '../services/testService';
import testResultService from '../services/testResultService';
import LoadingSpinner from '../components/LoadingSpinner';

const MultipleChoiceTestReview = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [test, setTest] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [draftResultId, setDraftResultId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const data = await TestService.getTestById(testId);
        setTestInfo(data);
      } catch (error) {
        console.error('Error fetching test data:', error);
      }
    };

    fetchTestData();
  }, [testId]);

  useEffect(() => {
    if (location.state) {
      const { test, questions, userAnswers, results, draftResultId } = location.state;
      setTest(test);
      setQuestions(questions);
      setUserAnswers(userAnswers);
      setResults(results);
      setDraftResultId(draftResultId);

      // Calculate score - thang 10: số câu đúng / tổng số câu * 10
      const correctCount = results.filter((r) => r.isCorrect).length;
      const totalQuestions = results.length;
      const calculatedScore = ((correctCount / totalQuestions) * 10).toFixed(1);
      setScore(calculatedScore);
    } else {
      // If no state, redirect back
      navigate(`/multiple-choice/test/${testId}/settings`);
    }
  }, [location.state, testId, navigate]);

  const saveResult = async () => {
    if (!draftResultId) {
      setError('Không tìm thấy bản nháp kết quả để lưu');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Update status from draft to active
      await testResultService.updateTestResultStatus(draftResultId, 'active');
      setIsSaved(true);
    } catch (err) {
      console.error('Error saving result:', err);
      setError('Không thể lưu kết quả. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6.5) return 'warning';
    if (score >= 5) return 'info';
    return 'danger';
  };

  const getScoreMessage = (score) => {
    if (score >= 9) return 'Xuất sắc!';
    if (score >= 8) return 'Tốt lắm!';
    if (score >= 6.5) return 'Khá tốt!';
    if (score >= 5) return 'Trung bình';
    return 'Cần cố gắng hơn';
  };

  if (!test || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  const correctCount = results.filter((r) => r.isCorrect).length;
  const incorrectCount = results.filter((r) => !r.isCorrect && r.userAnswer).length;
  const unansweredCount = results.filter((r) => !r.userAnswer).length;
  const currentQuestion = questions[selectedQuestion];
  const currentResult = results.find((r) => r.questionId === currentQuestion._id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/8 to-indigo-400/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/8 to-blue-400/8 rounded-full blur-3xl" />

      <div className="relative py-4 px-3">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Enhanced Score Card */}
              <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />
                <div className="relative p-4 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{score}/10</h2>
                  <h4 className="text-lg font-semibold text-blue-600 mb-4">
                    {getScoreMessage(score)}
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto">
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100/50" />
                      <div className="relative p-3">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-md bg-gray-500 flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-700">{results.length}</p>
                            <p className="text-xs text-gray-500">Tổng câu</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative rounded-lg overflow-hidden border border-emerald-200 bg-white shadow-sm">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50" />
                      <div className="relative p-3">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-emerald-700">{correctCount}</p>
                            <p className="text-xs text-gray-500">Đúng</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative rounded-lg overflow-hidden border border-red-200 bg-white shadow-sm">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100/50" />
                      <div className="relative p-3">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-md bg-red-500 flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-red-700">{incorrectCount}</p>
                            <p className="text-xs text-gray-500">Sai</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative rounded-lg overflow-hidden border border-amber-200 bg-white shadow-sm">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100/50" />
                      <div className="relative p-3">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-amber-700">{unansweredCount}</p>
                            <p className="text-xs text-gray-500">Chưa làm</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Test Info */}
              <div className="relative rounded-xl overflow-hidden shadow-lg border border-blue-200 bg-white mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />
                <div className="relative p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Thông tin bài kiểm tra</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Tiêu đề</p>
                      <p className="font-semibold text-gray-800">{testInfo?.test_title}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Chủ đề</p>
                      <p className="font-semibold text-gray-800">{testInfo?.main_topic} - {testInfo?.sub_topic}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Độ khó</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium capitalize ${test.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        test.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {test.difficulty}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Thời gian giới hạn</p>
                      <p className="font-semibold text-gray-800">{test.time_limit_minutes} phút</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Question Review */}
              <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50/30" />
                <div className="relative">
                  {/* Question Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white">
                        Câu {selectedQuestion + 1} / {questions.length}
                      </h3>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm ${currentResult?.isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                        }`}>
                        {currentResult?.isCorrect ? '✓' : '✗'}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 leading-relaxed">
                      {currentQuestion.question_text}
                    </h4>

                    <div className="space-y-2 mb-4">
                      {currentQuestion.options.map((option) => {
                        const isUserAnswer = userAnswers[currentQuestion._id] === option.label;
                        const isCorrectAnswer = currentQuestion.correct_answers.includes(option.label);

                        let optionStyle = 'border-gray-200 bg-gray-50/50';
                        let iconColor = 'text-gray-400';
                        let icon = null;

                        if (isCorrectAnswer) {
                          optionStyle = 'border-emerald-300 bg-emerald-50';
                          iconColor = 'text-emerald-600';
                          icon = (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          );
                        } else if (isUserAnswer) {
                          optionStyle = 'border-red-300 bg-red-50';
                          iconColor = 'text-red-600';
                          icon = (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          );
                        }

                        return (
                          <div key={option.label} className={`relative rounded-lg border p-3 transition-all duration-200 ${optionStyle}`}>
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm bg-white border shadow-sm ${isCorrectAnswer ? 'border-emerald-300 text-emerald-700' :
                                isUserAnswer ? 'border-red-300 text-red-700' :
                                  'border-gray-300 text-gray-600'
                                }`}>
                                {option.label}
                              </div>
                              <span className="flex-1 text-gray-800">{option.text}</span>
                              {icon && (
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${iconColor}`}>
                                  {icon}
                                </div>
                              )}
                            </div>

                            {/* User choice indicator */}
                            {isUserAnswer && (
                              <div className="absolute -top-1 -right-1">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${isCorrectAnswer ? 'bg-emerald-500' : 'bg-red-500'
                                  }`}>
                                  <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Enhanced Explanation */}
                    <div className={`relative rounded-lg border p-4 ${currentResult?.isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'
                      }`}>
                      <div className="flex items-center mb-3">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center mr-2 ${currentResult?.isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                          }`}>
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {currentResult?.isCorrect ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            )}
                          </svg>
                        </div>
                        <h5 className={`font-bold text-base ${currentResult?.isCorrect ? 'text-emerald-800' : 'text-red-800'
                          }`}>
                          {currentResult?.isCorrect ? 'Bạn đã trả lời đúng!' : 'Bạn đã trả lời sai'}
                        </h5>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-gray-800 mb-1 text-sm">Giải thích đáp án đúng:</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{currentQuestion.explanation.correct}</p>
                        </div>

                        {/* Show explanations for all incorrect choices */}
                        {currentQuestion.explanation.incorrect_choices && Object.keys(currentQuestion.explanation.incorrect_choices).length > 0 && (
                          <div className="pt-3 border-t border-gray-200">
                            <p className="font-semibold text-gray-800 mb-2 text-sm">Giải thích các đáp án sai:</p>
                            <div className="space-y-2">
                              {Object.entries(currentQuestion.explanation.incorrect_choices).map(([choice, explanation]) => (
                                <div key={choice} className="flex items-start space-x-2">
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold bg-red-100 text-red-700 flex-shrink-0 mt-0.5">
                                    {choice}
                                  </span>
                                  <p className="text-gray-700 text-sm leading-relaxed">{explanation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Navigation */}
              <div className="flex justify-between items-center gap-3 mb-4">
                <button
                  className="group flex items-center px-4 py-2 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white shadow-sm hover:shadow-md"
                  onClick={() => setSelectedQuestion(Math.max(0, selectedQuestion - 1))}
                  disabled={selectedQuestion === 0}
                >
                  <svg className="w-4 h-4 mr-2 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-medium text-gray-700 group-hover:text-blue-700 transition-colors text-sm">Câu trước</span>
                </button>

                <div className="text-center">
                  <div className="inline-flex items-center px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-lg text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {selectedQuestion + 1} / {questions.length}
                  </div>
                </div>

                <button
                  className="group flex items-center px-4 py-2 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white shadow-sm hover:shadow-md"
                  onClick={() =>
                    setSelectedQuestion(Math.min(questions.length - 1, selectedQuestion + 1))
                  }
                  disabled={selectedQuestion === questions.length - 1}
                >
                  <span className="font-medium text-gray-700 group-hover:text-blue-700 transition-colors text-sm">Câu tiếp theo</span>
                  <svg className="w-4 h-4 ml-2 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  className="flex-1 group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => navigate(`/multiple-choice/test/${testId}/settings`)}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <div className="relative flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Làm lại bài kiểm tra
                  </div>
                </button>

                <button
                  className={`group relative overflow-hidden rounded-lg px-4 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                    isSaved 
                      ? 'bg-gradient-to-r from-green-500 to-green-600' 
                      : loading 
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                  }`}
                  onClick={isSaved ? undefined : saveResult}
                  disabled={loading || isSaved}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <div className="relative flex items-center justify-center">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang lưu...
                      </>
                    ) : isSaved ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Đã lưu kết quả
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Lưu kết quả
                      </>
                    )}
                  </div>
                </button>

                {/* Error Display */}
                {error && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Back to Topics Button */}
              <div className="text-center">
                <button
                  className="group flex items-center px-4 py-2 rounded-lg border border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 shadow-sm hover:shadow-md mx-auto"
                  onClick={() => navigate('/multiple-choice/topics')}
                >
                  <svg className="w-4 h-4 mr-2 text-gray-600 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="font-medium text-gray-700 group-hover:text-indigo-700 transition-colors text-sm">Về danh sách chủ đề</span>
                </button>
              </div>
            </div>
            {/* Simple Question Grid Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-5">
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Danh sách câu hỏi
                    </h3>
                  </div>

                  <div className="p-4">
                    {/* Legend */}
                    <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded bg-green-500 mr-1"></div>
                        <span className="text-gray-600">Đúng ({correctCount})</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded bg-red-500 mr-1"></div>
                        <span className="text-gray-600">Sai ({incorrectCount})</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded bg-yellow-500 mr-1"></div>
                        <span className="text-gray-600">Chưa làm ({unansweredCount})</span>
                      </div>
                    </div>

                    {/* Question Grid */}
                    <div className="grid grid-cols-5 gap-2">
                      {results.map((result, index) => {
                        const isCurrent = index === selectedQuestion;
                        const isAnswered = Array.isArray(result.userAnswer) ? result.userAnswer.length > 0 : !!result.userAnswer;
                        
                        let bgColor = 'bg-yellow-500'; // chưa làm
                        if (result.isCorrect) {
                          bgColor = 'bg-green-500';
                        } else if (isAnswered) {
                          bgColor = 'bg-red-500';
                        }

                        return (
                          <button
                            key={result.questionId}
                            onClick={() => setSelectedQuestion(index)}
                            className={`
                              w-full aspect-square rounded ${bgColor} text-white font-semibold text-sm 
                              hover:opacity-80 transition-all duration-200
                              ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                            `}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleChoiceTestReview;
