import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import testService from "../services/testService";
import MultipleChoiceService from "../services/multipleChoiceService";
import testResultService from "../services/testResultService";

/**
 * MultipleChoiceTestTake
 * - Sticky action bar at the bottom of the question card (Prev / Check / Next / Submit)
 * - After checking, the current question is locked (cannot change answers)
 * - Result modal: no answer grid, only shows: correct answers, your choices, and explanations
 * - Modal stays open until user closes or clicks "Câu tiếp theo" (no auto-hide)
 * - Clean UI and Tailwind-safe classes (no dynamic class concatenation)
 * - Sidebar matches main content height and spacing
 */
const MultipleChoiceTestTake = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Data
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Answers & result state
  const [userAnswers, setUserAnswers] = useState({}); // map: qid -> array of labels
  const [lockedQuestions, setLockedQuestions] = useState({}); // map: qid -> true after checked
  const [showResult, setShowResult] = useState({}); // map: qid -> { isCorrect, selectedAnswers, correctAnswer, explanation }

  // Timers
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isQuestionTimerPaused, setIsQuestionTimerPaused] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Settings
  const [settings, setSettings] = useState({
    testMode: "flexible",            // 'flexible' | 'question_timer'
    showTimer: true,
    checkMode: "after_submit",       // 'after_each' | 'after_submit'
    showQuestionNumber: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    questionTimeLimit: 30,
  });

  // Load topics (for header if needed later)
  useEffect(() => {
    const fetchTopics = async () => {
      if (!testId) return;
      try {
        const data = await testService.getTestById(testId);
        setTest((prev) => (prev ? { ...prev, ...data } : data));
      } catch (err) {
        console.error("Error fetching test topics:", err);
      }
    };
    fetchTopics();
  }, [testId]);

  // Load settings + data
  useEffect(() => {
    const savedSettings = localStorage.getItem(`test_settings_${testId}`);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else if (location.state?.settings) {
      setSettings(location.state.settings);
    }
    fetchTestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  const fetchTestData = async () => {
    try {
      const [testData, questionsData] = await Promise.all([
        MultipleChoiceService.getTestById(testId),
        MultipleChoiceService.getQuestionsByTestId(testId),
      ]);
      setTest(testData);
      let processed = [...questionsData];

      // shuffle questions/answers
      if (settings.shuffleQuestions) processed = shuffleArray(processed);
      if (settings.shuffleAnswers) {
        processed = processed.map((q) => ({
          ...q,
          options: shuffleArray([...q.options]),
        }));
      }
      setQuestions(processed);
      setTimeRemaining((testData?.time_limit_minutes || 0) * 60);
      if (settings.testMode === "question_timer") {
        setQuestionTimeRemaining(settings.questionTimeLimit || 30);
      }
    } catch (err) {
      console.error("Error fetching test data:", err);
    }
  };

  // Total timer
  useEffect(() => {
    if (!settings.showTimer || isSubmitted) return;
    const id = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [settings.showTimer, isSubmitted]);

  // Per-question timer
  useEffect(() => {
    if (settings.testMode !== "question_timer" || isSubmitted || isQuestionTimerPaused)
      return;
    const id = setInterval(() => {
      setQuestionTimeRemaining((prev) => {
        if (prev <= 1) {
          // Move next when time up
          if (questions && currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((i) => i + 1);
            setIsQuestionTimerPaused(false);
            return settings.questionTimeLimit || 30;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [
    currentQuestionIndex,
    settings.testMode,
    settings.questionTimeLimit,
    isSubmitted,
    isQuestionTimerPaused,
    questions?.length,
  ]);

  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Helpers
  const currentQuestion = useMemo(
    () => (questions?.length ? questions[currentQuestionIndex] : null),
    [questions, currentQuestionIndex]
  );

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const getAnsweredCount = () =>
    Object.values(userAnswers).filter((a) => Array.isArray(a) && a.length > 0)
      .length;

  const isLocked = (qid) => !!lockedQuestions[qid];

  // Handlers
  const toggleAnswer = (qid, label) => {
    if (isSubmitted || isLocked(qid)) return;
    setUserAnswers((prev) => {
      const current = prev[qid] || [];
      const next = current.includes(label)
        ? current.filter((x) => x !== label)
        : [...current, label];
      return { ...prev, [qid]: next };
    });
  };

  const computeResult = (q, selected) => {
    const correctSet = new Set(q.correct_answers || []);
    const selectedSet = new Set(selected || []);

    const isCorrect =
      correctSet.size === selectedSet.size &&
      [...correctSet].every((c) => selectedSet.has(c));

    // Prepare explanation parts
    const wrongSelected = [...selectedSet].filter((s) => !correctSet.has(s));

    return {
      isCorrect,
      correctAnswer: [...correctSet],
      selectedAnswers: [...selectedSet],
      wrongSelected,
      explanation: q.explanation || {},
      questionText: q.question_text,
    };
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion) return;
    const qid = currentQuestion._id;
    const selected = userAnswers[qid] || [];
    if (selected.length === 0) return;

    const result = computeResult(currentQuestion, selected);
    setShowResult((prev) => ({
      ...prev,
      [qid]: result,
    }));
    setLockedQuestions((prev) => ({ ...prev, [qid]: true }));

    setModalData(result);
    setShowModal(true);

    if (settings.testMode === "question_timer") {
      setIsQuestionTimerPaused(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (settings.testMode === "question_timer") {
      setIsQuestionTimerPaused(false);
    }
  };

  const handleNext = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      if (settings.testMode === "question_timer") {
        setQuestionTimeRemaining(settings.questionTimeLimit || 30);
        setIsQuestionTimerPaused(false);
      }
    }
  };

  const handlePrev = () => {
    if (settings.testMode !== "flexible") return;
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  };

  const handleSubmitTest = async () => {
    setIsSubmitted(true);

    const results = (questions || []).map((q) => {
      const selected = userAnswers[q._id] || [];
      const r = computeResult(q, selected);
      return {
        questionId: q._id,
        userAnswer: selected,
        correctAnswer: r.correctAnswer,
        isCorrect: r.isCorrect,
        explanation: r.explanation,
      };
    });

    // Calculate score
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const totalQuestions = results.length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Create draft test result immediately
    try {
      const testResultData = {
        test_id: testId,
        test_type: 'multiple_choice',
        answers: results.map(r => ({
          question_id: r.questionId,
          user_answer: Array.isArray(r.userAnswer) ? r.userAnswer.join(', ') : r.userAnswer,
          correct_answer: r.correctAnswer,
          is_correct: r.isCorrect,
          question_text: questions.find(q => q._id === r.questionId)?.question_text || ''
        })),
        score: score,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        time_taken: Math.floor((settings.timeLimit * 60 - timeRemaining) / 60) * 60 + (settings.timeLimit * 60 - timeRemaining) % 60,
        status: 'draft' // Create as draft initially
      };

      const draftResult = await testResultService.createTestResult(testResultData);
      
      navigate(`/multiple-choice/test/${testId}/review`, {
        state: {
          test,
          questions,
          userAnswers,
          results,
          settings,
          draftResultId: draftResult._id || draftResult.id // Pass the draft result ID
        },
      });
    } catch (error) {
      console.error('Error creating draft result:', error);
      // Still navigate to review even if draft creation fails
      navigate(`/multiple-choice/test/${testId}/review`, {
        state: {
          test,
          questions,
          userAnswers,
          results,
          settings,
        },
      });
    }
  };

  // Color schemes per option index (Tailwind-safe explicit classes)
  const optionSchemes = [
    { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", tick: "text-blue-500", borderSel: "border-blue-300" },
    { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", tick: "text-emerald-500", borderSel: "border-emerald-300" },
    { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", tick: "text-violet-500", borderSel: "border-violet-300" },
    { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", tick: "text-orange-500", borderSel: "border-orange-300" },
  ];

  if (!currentQuestion || !test) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
        Đang tải bài kiểm tra...
      </div>
    );
  }

  const qid = currentQuestion._id;
  const selectedForQ = userAnswers[qid] || [];
  const isCurrentLocked = isLocked(qid);
  const currentComputed = showResult[qid];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="max-w-[1600px] mx-auto flex flex-col min-h-screen">
        {/* Top spacing to align with header */}
        <div className="h-4" />

        {/* Main two-column layout */}
        <div className="flex-1 px-4 pb-6">
          <div className="h-full grid grid-cols-12 gap-2 items-stretch">
            {/* Main question area */}
            <div className="col-span-12 lg:col-span-9 flex flex-col">
              {/* Card */}
              <div className="flex-1 rounded-2xl border border-gray-200/60 shadow-sm bg-white/90 backdrop-blur-sm p-0 overflow-hidden flex flex-col">
                {/* Enhanced Question header */}
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-start gap-3">
                    {settings.showQuestionNumber && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold flex items-center justify-center text-base shadow-md">
                          {currentQuestionIndex + 1}
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-lg text-gray-800 font-semibold leading-relaxed mb-1">
                        {currentQuestion.question_text}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Chọn đáp án phù hợp
                        </span>
                        {isCurrentLocked && (
                          <span className="flex items-center gap-1 text-orange-600 font-medium">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Đã khóa
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Options */}
                <div className="px-6 flex-1 overflow-y-auto">
                  <div className="space-y-3 pb-28"> {/* bottom pad so sticky bar not overlap */}
                    {currentQuestion?.options?.map((op, idx) => {
                      const scheme = optionSchemes[idx % optionSchemes.length];
                      const isSelected = selectedForQ.includes(op.label);

                      return (
                        <button
                          key={op.label}
                          className={`group w-full relative p-2 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 ${isSelected
                              ? `bg-white ${scheme.borderSel} shadow-md ring-1 ring-offset-1 ${scheme.borderSel.replace('border-', 'ring-')} transform scale-[1.01]`
                              : `${scheme.bg} ${scheme.border} hover:shadow-sm hover:border-opacity-60 ${!isCurrentLocked ? 'hover:scale-[1.005]' : ''}`
                            } ${isCurrentLocked ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                          onClick={() => toggleAnswer(qid, op.label)}
                          disabled={isCurrentLocked}
                        >
                          {/* Enhanced checkbox */}
                          <div className="flex-shrink-0 mt-0.5">
                            <div className={`relative w-6 h-6 rounded-lg border-2 transition-all duration-200 ${isSelected
                                ? `${scheme.borderSel} bg-white shadow-sm`
                                : 'border-gray-300 bg-white group-hover:border-gray-400'
                              }`}>
                              {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg
                                    className={`w-4 h-4 ${scheme.tick}`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Enhanced label + text */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-200 ${isSelected
                                  ? `bg-gradient-to-br ${scheme.bg.replace('bg-', 'from-')} ${scheme.bg.replace('bg-', 'to-').replace('50', '100')} text-white`
                                  : `bg-white border-2 ${scheme.border} ${scheme.text}`
                                }`}>
                                {op.label}
                              </div>
                              <div className="flex-1 pt-1">
                                <span className={`text-base leading-relaxed ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-800'
                                  }`}>
                                  {op.text}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Selection indicator */}
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <div className={`w-2 h-2 rounded-full ${scheme.tick.replace('text-', 'bg-')} shadow-sm`}></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Enhanced Sticky action bar */}
                <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/80 px-6 py-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    {/* Prev (flexible only) */}
                    {settings.testMode === "flexible" && (
                      <button
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${currentQuestionIndex === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                            : "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 shadow-md hover:shadow-lg transform hover:scale-105"
                          }`}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Câu trước
                      </button>
                    )}

                    <div className="ml-auto flex items-center gap-3">
                      {/* Check */}
                      {selectedForQ.length > 0 && !currentComputed && (
                        <button
                          onClick={handleCheckAnswer}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 hover:from-sky-600 hover:via-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Kiểm tra đáp án
                        </button>
                      )}

                      {/* Next (flexible) */}
                      {settings.testMode === "flexible" &&
                        questions && currentQuestionIndex < questions.length - 1 && (
                          <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                          >
                            Câu tiếp theo
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}

                      {/* Submit */}
                      {(questions && currentQuestionIndex === questions.length - 1 ||
                        (settings.testMode === "question_timer" &&
                          currentComputed &&
                          questions && currentQuestionIndex === questions.length - 1)) && (
                          <button
                            onClick={handleSubmitTest}
                            disabled={getAnsweredCount() === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-200 ${getAnsweredCount() === 0
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                                : "bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 text-white hover:from-emerald-600 hover:via-green-600 hover:to-teal-700 hover:shadow-lg transform hover:scale-105"
                              }`}
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Nộp bài
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-3 flex flex-col">
              <div className="flex-1 rounded-2xl border border-gray-200/60 shadow-sm bg-white/90 backdrop-blur-sm flex flex-col">
                {/* Header in sidebar */}
                <div className="p-2 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-indigo-600">
                        {test?.main_topic} - {test?.sub_topic}
                      </h4>
                      {settings.showQuestionNumber && (
                        <p className="text-xs text-gray-600">
                          Câu {currentQuestionIndex + 1} / {questions?.length || 0}
                        </p>
                      )}
                    </div>
                    {settings.showTimer && (
                      <div className="px-2 py-1 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center gap-1">
                        <svg
                          className="w-4 h-4 text-indigo-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-bold text-indigo-700">
                          {formatTime(timeRemaining)}
                        </span>
                        <small className="text-xs text-gray-600">tổng</small>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Đã trả lời</span>
                    <span className="text-sm font-bold text-blue-700">
                      {getAnsweredCount()}/{questions?.length || 0}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(getAnsweredCount() / Math.max(questions?.length || 1, 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Grid question numbers */}
                <div className="flex-1 overflow-y-auto p-2">
                  <div className="grid grid-cols-5 gap-2">
                    {questions?.map((q, idx) => {
                      const isAnswered = (userAnswers[q._id] || []).length > 0;
                      const isCurrent = idx === currentQuestionIndex;
                      const base =
                        "w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all";
                      let cls = "";
                      if (isCurrent) {
                        cls =
                          "bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow ring-2 ring-purple-300";
                      } else if (isAnswered) {
                        cls =
                          "bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white shadow";
                      } else {
                        cls =
                          "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200";
                      }
                      return (
                        <button
                          key={q._id}
                          className={`${base} ${cls}`}
                          onClick={() => {
                            if (settings.testMode === "flexible") {
                              setCurrentQuestionIndex(idx);
                            }
                          }}
                          disabled={
                            settings.testMode === "question_timer" &&
                            idx !== currentQuestionIndex
                          }
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit bottom */}
                <div className="p-2 border-t border-gray-200">
                  <button
                    onClick={handleSubmitTest}
                    disabled={getAnsweredCount() === 0}
                    className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all ${getAnsweredCount() === 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow"
                      }`}
                  >
                    Nộp bài ({getAnsweredCount()}/{questions?.length || 0})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom spacing to align with footer */}
        <div className="h-4" />
      </div>

      {/* Result Modal - Enhanced Professional UI */}
      {showModal && modalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-2">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
            {/* Enhanced Header with status indicator */}
            <div className={`relative p-6 border-b border-gray-200/50 ${modalData.isCorrect
                ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
                : 'bg-gradient-to-br from-red-50 via-pink-50 to-rose-50'
              }`}>
              <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
              <div className="relative flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-xl shadow-lg ${modalData.isCorrect
                      ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                      : 'bg-gradient-to-br from-red-500 to-pink-600'
                    }`}>
                    <svg
                      className="w-6 h-6 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      {modalData.isCorrect ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-1 ${modalData.isCorrect ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                      {modalData.isCorrect ? '🎉 Chính xác!' : '❌ Chưa chính xác'}
                    </h3>
                    <p className="text-gray-700 text-sm font-medium leading-relaxed">
                      <span className="text-indigo-600 font-semibold">Câu {currentQuestionIndex + 1}:</span> {modalData.questionText}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-lg bg-white/80 hover:bg-white border border-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Đóng"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Enhanced Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
              {/* Answer Comparison Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {/* Correct Answers */}
                <div className="group">
                  <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-2 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-emerald-500 text-white">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-base font-bold text-emerald-700">✅ Đáp án đúng</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {modalData.correctAnswer.map((lbl) => (
                        <span
                          key={lbl}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-white border-2 border-emerald-300 text-emerald-700 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <span className="mr-1.5 text-emerald-500">●</span>
                          {lbl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Your Answers */}
                <div className="group">
                  <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-2 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-blue-500 text-white">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h4 className="text-base font-bold text-blue-700">🤔 Bạn đã chọn</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {modalData.selectedAnswers.length > 0 ? (
                        modalData.selectedAnswers.map((lbl) => (
                          <span
                            key={lbl}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all ${modalData.correctAnswer.includes(lbl)
                                ? "bg-white border-2 border-emerald-300 text-emerald-700"
                                : "bg-white border-2 border-red-300 text-red-700"
                              }`}
                          >
                            <span className={`mr-1.5 ${modalData.correctAnswer.includes(lbl) ? 'text-emerald-500' : 'text-red-500'
                              }`}>●</span>
                            {lbl}
                          </span>
                        ))
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 border-2 border-gray-200">
                          Chưa chọn đáp án
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Explanation Section */}
              {modalData.explanation && (
                <div className="space-y-4">
                  {/* Correct Answer Explanation */}
                  {modalData.explanation.correct && (
                    <div className="group">
                      <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-2 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-emerald-500 text-white">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <h4 className="text-base font-bold text-emerald-700">💡 Giải thích đáp án đúng</h4>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-emerald-100">
                          <p className="text-gray-800 leading-relaxed text-sm">
                            {modalData.explanation.correct}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Incorrect Choices Explanation */}
                  {modalData.explanation.incorrect_choices && Object.keys(modalData.explanation.incorrect_choices).length > 0 && (
                    <div className="group">
                      <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 p-2 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-red-500 text-white">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                          <h4 className="text-base font-bold text-red-700">🚫 Lý do các lựa chọn sai</h4>
                        </div>
                        <div className="space-y-3">
                          {Object.entries(modalData.explanation.incorrect_choices).map(([choice, explanation]) => (
                            <div key={choice} className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-red-100 transition-all duration-200 hover:shadow-md">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 border border-red-200 text-red-700 font-bold text-xs">
                                    {choice}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-800 leading-relaxed text-sm">
                                    {explanation || "Không đúng với bối cảnh câu hỏi."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Footer */}
            <div className="p-2 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-white/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    <span>Câu {currentQuestionIndex + 1} / {questions?.length || 0}</span>
                  </div>
                  <div className="w-px h-3 bg-gray-300"></div>
                  <span className={modalData.isCorrect ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                    {modalData.isCorrect ? 'Trả lời chính xác' : 'Cần xem lại'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                  >
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Đóng
                    </span>
                  </button>
                  {questions && currentQuestionIndex < questions.length - 1 && (
                    <button
                      onClick={() => {
                        handleCloseModal();
                        handleNext();
                      }}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                    >
                      <span className="flex items-center gap-1.5">
                        Câu tiếp theo
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceTestTake;
