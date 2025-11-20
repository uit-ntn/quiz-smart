import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import testService from "../services/testService";
import MultipleChoiceService from "../services/multipleChoiceService";
import testResultService from "../services/testResultService";

// Helper shuffle
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const MultipleChoiceTestTake = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Data
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Answers & result
  const [userAnswers, setUserAnswers] = useState({}); // qid -> [labels]
  const [lockedQuestions, setLockedQuestions] = useState({}); // qid -> true
  const [showResult, setShowResult] = useState({}); // qid -> result obj

  // Timers
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isQuestionTimerPaused, setIsQuestionTimerPaused] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Settings
  const [settings, setSettings] = useState({
    testMode: "flexible", // 'flexible' | 'question_timer'
    showTimer: true,
    checkMode: "after_submit", // chưa dùng nhiều
    showQuestionNumber: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    questionTimeLimit: 30,
  });

  // Tải settings + data
  useEffect(() => {
    const loadSettingsAndData = async () => {
      try {
        let newSettings = { ...settings };

        const savedSettings = localStorage.getItem(`test_settings_${testId}`);
        if (savedSettings) {
          newSettings = JSON.parse(savedSettings);
        } else if (location.state?.settings) {
          newSettings = location.state.settings;
        }

        setSettings(newSettings);
        await fetchTestData(newSettings);
      } catch (err) {
        console.error(err);
      }
    };

    loadSettingsAndData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  const fetchTestData = async (currentSettings) => {
    setLoading(true);
    setError(null);

    try {
      const [testResponse, questionsData] = await Promise.all([
        testService.getTestById(testId),
        MultipleChoiceService.getQuestionsByTestId(testId),
      ]);

      const testData = testResponse?.test || testResponse;

      if (!testData || !questionsData || questionsData.length === 0) {
        throw new Error(
          "Không thể tải dữ liệu bài test hoặc bài test không có câu hỏi"
        );
      }

      setTest(testData);

      let processed = [...questionsData];
      if (currentSettings.shuffleQuestions) {
        processed = shuffleArray(processed);
      }
      if (currentSettings.shuffleAnswers) {
        processed = processed.map((q) => ({
          ...q,
          options: shuffleArray([...q.options]),
        }));
      }

      setQuestions(processed);

      const limitSeconds = (testData?.time_limit_minutes || 0) * 60;
      setTimeRemaining(limitSeconds);
      setTotalTime(limitSeconds);

      if (currentSettings.testMode === "question_timer") {
        setQuestionTimeRemaining(currentSettings.questionTimeLimit || 30);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching test data:", err);
      setError(err.message || "Có lỗi xảy ra khi tải bài test");
      setLoading(false);
    }
  };

  // Tổng thời gian bài test
  useEffect(() => {
    if (!settings.showTimer || isSubmitted || totalTime === 0) return;

    const id = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.showTimer, isSubmitted, totalTime]);

  // Thời gian mỗi câu hỏi
  useEffect(() => {
    if (
      settings.testMode !== "question_timer" ||
      isSubmitted ||
      isQuestionTimerPaused
    )
      return;

    const id = setInterval(() => {
      setQuestionTimeRemaining((prev) => {
        if (prev <= 1) {
          // Hết thời gian 1 câu -> tự sang câu tiếp theo
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
    questions,
  ]);

  const currentQuestion = useMemo(
    () =>
      questions && questions.length > 0
        ? questions[currentQuestionIndex]
        : null,
    [questions, currentQuestionIndex]
  );

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const getAnsweredCount = () =>
    Object.values(userAnswers).filter(
      (a) => Array.isArray(a) && a.length > 0
    ).length;

  const isLocked = (qid) => !!lockedQuestions[qid];

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
    if (!questions) return;
    if (currentQuestionIndex < questions.length - 1) {
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
    if (isSubmitted) return;
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

    const correctAnswers = results.filter((r) => r.isCorrect).length;
    const totalQuestions = results.length;
    const score =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    const timeTakenSeconds =
      totalTime > 0 ? totalTime - timeRemaining : 0;

    try {
      const testResultData = {
        test_id: testId,
        test_type: "multiple_choice",
        answers: results.map((r) => ({
          question_id: r.questionId,
          user_answer: Array.isArray(r.userAnswer)
            ? r.userAnswer.join(", ")
            : r.userAnswer,
          correct_answer: r.correctAnswer,
          is_correct: r.isCorrect,
          question_text:
            questions.find((q) => q._id === r.questionId)?.question_text ||
            "",
        })),
        score,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        time_taken: timeTakenSeconds,
        status: "draft",
      };

      const draftResult =
        await testResultService.createTestResult(testResultData);

      navigate(`/multiple-choice/test/${testId}/review`, {
        state: {
          test,
          questions,
          userAnswers,
          results,
          settings,
          draftResultId: draftResult._id || draftResult.id,
        },
      });
    } catch (err) {
      console.error("Error creating draft result:", err);
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

  // ======= RENDER =======

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3" />
          <p className="text-indigo-600 text-sm font-medium">
            Đang tải bài kiểm tra...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Lỗi tải bài test
          </h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <div className="space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Thử lại
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion || !test || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-indigo-600 text-sm font-medium">
          Đang tải câu hỏi...
        </p>
      </div>
    );
  }

  const qid = currentQuestion._id;
  const selectedForQ = userAnswers[qid] || [];
  const isCurrentLocked = isLocked(qid);
  const currentComputed = showResult[qid];

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canGoPrev = settings.testMode === "flexible" && currentQuestionIndex > 0;
  const canGoNext =
    settings.testMode === "flexible" &&
    currentQuestionIndex < questions.length - 1;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          {/* MAIN QUESTION AREA */}
          <div className="col-span-12 lg:col-span-9">
            <div className="border border-gray-200 rounded-2xl bg-white shadow-sm p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <div className="flex items-start gap-3">
                  {settings.showQuestionNumber && (
                    <div className="bg-blue-600 text-white font-semibold w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                      {currentQuestionIndex + 1}
                    </div>
                  )}
                  <div>
                    <h2 className="text-base sm:text-lg font-medium mb-1 text-gray-900">
                      {currentQuestion.question_text}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Chọn đáp án phù hợp{" "}
                      {isCurrentLocked && "(câu này đã khóa)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* OPTIONS */}
              <div className="space-y-3 sm:space-y-4">
                {currentQuestion?.options?.map((op) => {
                  const isSelected = selectedForQ.includes(op.label);
                  return (
                    <button
                      key={op.label}
                      type="button"
                      onClick={() => toggleAnswer(qid, op.label)}
                      disabled={isCurrentLocked}
                      className={`w-full text-left flex items-start gap-3 px-3 py-3 sm:px-4 sm:py-4 rounded-xl border text-sm sm:text-base transition-colors ${
                        isCurrentLocked
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer"
                      } ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-blue-500 bg-blue-600"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3.5 h-3.5 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold flex-shrink-0">
                            {op.label}
                          </span>
                          <p
                            className={`leading-relaxed ${
                              isSelected
                                ? "text-gray-900 font-medium"
                                : "text-gray-800"
                            }`}
                          >
                            {op.text}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="col-span-12 lg:col-span-3 flex flex-col">
            <div className="flex-1 rounded-2xl border border-gray-200 shadow-sm bg-white p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-indigo-700">
                    {test?.main_topic} {test?.sub_topic && "·"} {test?.sub_topic}
                  </h4>
                  {settings.showQuestionNumber && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      Câu {currentQuestionIndex + 1} / {questions.length}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {settings.showTimer && (
                    <div className="px-2 py-1 rounded-md bg-indigo-50 border border-indigo-100 flex flex-col items-center">
                      <span className="text-[10px] text-indigo-700">
                        Toàn bài
                      </span>
                      <span className="text-xs font-semibold text-indigo-800">
                        {formatTime(timeRemaining)}
                      </span>
                    </div>
                  )}
                  {settings.testMode === "question_timer" && (
                    <div className="px-2 py-1 rounded-md bg-orange-50 border border-orange-100 flex flex-col items-center">
                      <span className="text-[10px] text-orange-700">
                        Mỗi câu
                      </span>
                      <span className="text-xs font-semibold text-orange-800">
                        {formatTime(questionTimeRemaining)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Đã trả lời</span>
                  <span className="font-medium">
                    {getAnsweredCount()}/{questions.length}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${
                        (getAnsweredCount() /
                          Math.max(questions.length || 1, 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Grid câu hỏi */}
              <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-6 sm:grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered =
                      (userAnswers[q._id] || []).length > 0;
                    const isCurrent = idx === currentQuestionIndex;

                    let cls =
                      "w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ";
                    if (isCurrent) {
                      cls +=
                        "bg-purple-600 text-white shadow ring-2 ring-purple-300";
                    } else if (isAnswered) {
                      cls += "bg-emerald-500 text-white hover:bg-emerald-600";
                    } else {
                      cls +=
                        "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200";
                    }

                    const disabled =
                      settings.testMode === "question_timer" &&
                      idx !== currentQuestionIndex;

                    return (
                      <button
                        key={q._id}
                        type="button"
                        className={cls}
                        onClick={() => {
                          if (settings.testMode === "flexible") {
                            setCurrentQuestionIndex(idx);
                          }
                        }}
                        disabled={disabled}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit nhanh ở sidebar (desktop) */}
              <button
                type="button"
                onClick={handleSubmitTest}
                disabled={getAnsweredCount() === 0}
                className={`hidden sm:block w-full px-4 py-2.5 rounded-lg text-xs font-medium ${
                  getAnsweredCount() === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                Nộp bài ({getAnsweredCount()}/{questions.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR – luôn dính dưới màn hình, thân thiện mobile */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {settings.testMode === "flexible" && (
              <button
                type="button"
                onClick={handlePrev}
                disabled={!canGoPrev}
                className={`w-full sm:w-auto px-3 py-2 rounded-lg text-sm border ${
                  !canGoPrev
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Câu trước
              </button>
            )}

            <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:gap-3">
              {!currentComputed && selectedForQ.length > 0 && (
                <button
                  type="button"
                  onClick={handleCheckAnswer}
                  className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                >
                  Kiểm tra đáp án
                </button>
              )}

              {canGoNext && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
                >
                  Câu tiếp theo
                </button>
              )}

              {isLastQuestion && (
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  disabled={getAnsweredCount() === 0}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold ${
                    getAnsweredCount() === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  Nộp bài
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RESULT MODAL - đơn giản */}
      {showModal && modalData && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-gray-200 w-full max-w-xl">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-semibold ${
                    modalData.isCorrect ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {modalData.isCorrect
                    ? "Trả lời chính xác"
                    : "Trả lời chưa chính xác"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Câu {currentQuestionIndex + 1} / {questions.length}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-xs text-gray-500 hover:text-gray-800"
              >
                Đóng
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 text-sm">
              {/* Câu hỏi */}
              <div>
                <p className="text-gray-900 font-medium mb-1">Câu hỏi</p>
                <p className="text-gray-800 text-sm">
                  {modalData.questionText}
                </p>
              </div>

              {/* Đáp án đúng & bạn chọn */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-gray-200 rounded p-3">
                  <p className="font-semibold text-gray-900 text-xs mb-2">
                    Đáp án đúng
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {modalData.correctAnswer.map((lbl) => (
                      <span
                        key={lbl}
                        className="inline-flex items-center px-2 py-1 rounded border border-gray-300 text-xs text-gray-800"
                      >
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border border-gray-200 rounded p-3">
                  <p className="font-semibold text-gray-900 text-xs mb-2">
                    Bạn đã chọn
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {modalData.selectedAnswers.length > 0 ? (
                      modalData.selectedAnswers.map((lbl) => (
                        <span
                          key={lbl}
                          className={`inline-flex items-center px-2 py-1 rounded border text-xs ${
                            modalData.correctAnswer.includes(lbl)
                              ? "border-green-500 text-green-700"
                              : "border-red-500 text-red-700"
                          }`}
                        >
                          {lbl}
                        </span>
                      ))
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded border border-gray-300 text-xs text-gray-500">
                        Chưa chọn đáp án
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Giải thích (nếu có) */}
              {modalData.explanation && (
                <div className="space-y-3">
                  {modalData.explanation.correct && (
                    <div className="border border-gray-200 rounded p-3">
                      <p className="font-semibold text-gray-900 text-xs mb-1">
                        Giải thích đáp án đúng
                      </p>
                      <p className="text-gray-800 text-xs leading-relaxed">
                        {modalData.explanation.correct}
                      </p>
                    </div>
                  )}

                  {modalData.explanation.incorrect_choices &&
                    Object.keys(
                      modalData.explanation.incorrect_choices
                    ).length > 0 && (
                      <div className="border border-gray-200 rounded p-3">
                        <p className="font-semibold text-gray-900 text-xs mb-2">
                          Lý do các lựa chọn sai
                        </p>
                        <div className="space-y-2">
                          {Object.entries(
                            modalData.explanation.incorrect_choices
                          ).map(([choice, explanation]) => (
                            <div
                              key={choice}
                              className="flex items-start gap-2 text-xs"
                            >
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-gray-300 text-gray-700 font-semibold">
                                {choice}
                              </span>
                              <p className="text-gray-800 leading-relaxed">
                                {explanation ||
                                  "Không đúng với bối cảnh câu hỏi."}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={handleCloseModal}
                className="px-3 py-1.5 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Đóng
              </button>
              {questions && currentQuestionIndex < questions.length - 1 && (
                <button
                  onClick={() => {
                    handleCloseModal();
                    handleNext();
                  }}
                  className="px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-black"
                >
                  Câu tiếp theo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceTestTake;
