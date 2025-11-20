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
    checkMode: "after_submit", // (đang không dùng nhiều ở code này)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">
            Đang tải bài kiểm tra...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
          <h3 className="text-xl font-semibold text-red-900 mb-2">
            Lỗi tải bài test
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Thử lại
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-indigo-600 font-medium">
            Đang tải câu hỏi...
          </p>
        </div>
      </div>
    );
  }

  const qid = currentQuestion._id;
  const selectedForQ = userAnswers[qid] || [];
  const isCurrentLocked = isLocked(qid);
  const currentComputed = showResult[qid];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          {/* MAIN QUESTION AREA */}
          <div className="col-span-12 lg:col-span-9">
            <div className="relative border border-gray-200 rounded-lg bg-white p-6 pb-24">
              <div className="mb-6">
                <div className="flex items-start gap-3">
                  {settings.showQuestionNumber && (
                    <div className="bg-blue-600 text-white font-bold w-8 h-8 rounded flex items-center justify-center text-sm">
                      {currentQuestionIndex + 1}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-medium mb-2">
                      {currentQuestion.question_text}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Chọn đáp án phù hợp{" "}
                      {isCurrentLocked && "(Đã khóa)"}
                    </p>
                  </div>
                </div>
              </div>

              {/* OPTIONS */}
              <div className="space-y-3">
                {currentQuestion?.options?.map((op) => {
                  const isSelected = selectedForQ.includes(op.label);
                  return (
                    <button
                      key={op.label}
                      type="button"
                      onClick={() => toggleAnswer(qid, op.label)}
                      disabled={isCurrentLocked}
                      className={`w-full text-left flex items-start gap-3 p-4 rounded-lg border transition-colors duration-150 ${
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
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-blue-500 bg-blue-600"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-4 h-4 text-white"
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
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-100 text-blue-700 text-sm font-semibold">
                            {op.label}
                          </span>
                          <p
                            className={`text-sm leading-relaxed ${
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

              {/* STICKY ACTION BAR */}
              <div className="absolute inset-x-0 bottom-0 border-t border-gray-200 bg-white px-4 py-3 rounded-b-lg">
                <div className="flex items-center justify-between gap-3">
                  {settings.testMode === "flexible" && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={currentQuestionIndex === 0}
                      className={`inline-flex items-center gap-1 px-3 py-2 rounded border text-sm ${
                        currentQuestionIndex === 0
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-gray-600 text-white border-gray-600 hover:bg-gray-700"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Câu trước
                    </button>
                  )}

                  <div className="ml-auto flex items-center gap-3">
                    {!currentComputed && selectedForQ.length > 0 && (
                      <button
                        type="button"
                        onClick={handleCheckAnswer}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Kiểm tra đáp án
                      </button>
                    )}

                    {settings.testMode === "flexible" &&
                      questions &&
                      currentQuestionIndex < questions.length - 1 && (
                        <button
                          type="button"
                          onClick={handleNext}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
                        >
                          Câu tiếp theo
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      )}

                    {(questions &&
                      currentQuestionIndex === questions.length - 1) && (
                      <button
                        type="button"
                        onClick={handleSubmitTest}
                        disabled={getAnsweredCount() === 0}
                        className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold shadow-md ${
                          getAnsweredCount() === 0
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        Nộp bài
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="col-span-12 lg:col-span-3 flex flex-col">
            <div className="flex-1 rounded-2xl border border-gray-200 shadow-sm bg-white flex flex-col p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-indigo-600">
                    {test?.main_topic} - {test?.sub_topic}
                  </h4>
                  {settings.showQuestionNumber && (
                    <p className="text-xs text-gray-600">
                      Câu {currentQuestionIndex + 1} / {questions.length}
                    </p>
                  )}
                </div>
                {settings.showTimer && (
                  <div className="px-2 py-1 rounded-lg bg-indigo-100 border border-indigo-200 flex flex-col items-center">
                    <span className="text-[11px] text-indigo-700 font-semibold">
                      Thời gian
                    </span>
                    <span className="text-sm font-bold text-indigo-800">
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}
                {settings.testMode === "question_timer" && (
                  <div className="px-2 py-1 rounded-lg bg-orange-100 border border-orange-200 flex flex-col items-center ml-2">
                    <span className="text-[11px] text-orange-700 font-semibold">
                      Mỗi câu
                    </span>
                    <span className="text-sm font-bold text-orange-800">
                      {formatTime(questionTimeRemaining)}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Đã trả lời</span>
                  <span className="font-medium">
                    {getAnsweredCount()}/{questions.length}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded">
                  <div
                    className="h-full bg-blue-500 rounded"
                    style={{
                      width: `${
                        (getAnsweredCount() /
                          Math.max(questions.length || 1, 1)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Grid câu hỏi */}
              <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered =
                      (userAnswers[q._id] || []).length > 0;
                    const isCurrent = idx === currentQuestionIndex;

                    let cls =
                      "w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all ";
                    if (isCurrent) {
                      cls +=
                        "bg-purple-600 text-white shadow ring-2 ring-purple-300";
                    } else if (isAnswered) {
                      cls +=
                        "bg-emerald-500 text-white shadow hover:bg-emerald-600";
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

              {/* Submit button ở sidebar */}
              <button
                type="button"
                onClick={handleSubmitTest}
                disabled={getAnsweredCount() === 0}
                className={`w-full px-4 py-3 rounded font-medium text-sm ${
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

      {/* RESULT MODAL */}
      {showModal && modalData && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded border w-full max-w-3xl">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3
                  className={`text-lg font-medium ${
                    modalData.isCorrect
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {modalData.isCorrect
                    ? "✓ Chính xác!"
                    : "✗ Chưa chính xác"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Câu {currentQuestionIndex + 1}:{" "}
                {modalData.questionText}
              </p>
            </div>

            {/* Content */}
            <div className="p-4 max-h-96 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {/* Đáp án đúng */}
                <div>
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded bg-green-600 text-white">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h4 className="text-base font-bold text-green-700">
                        ✅ Đáp án đúng
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {modalData.correctAnswer.map((lbl) => (
                        <span
                          key={lbl}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-white border-2 border-emerald-300 text-emerald-700 shadow-sm"
                        >
                          <span className="mr-1.5 text-emerald-500">
                            ●
                          </span>
                          {lbl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bạn đã chọn */}
                <div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded bg-blue-600 text-white">
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-base font-bold text-blue-700">
                        🤔 Bạn đã chọn
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {modalData.selectedAnswers.length > 0 ? (
                        modalData.selectedAnswers.map((lbl) => (
                          <span
                            key={lbl}
                            className={`inline-flex items-center px-3 py-1.5 rounded text-sm font-bold ${
                              modalData.correctAnswer.includes(lbl)
                                ? "bg-white border border-green-300 text-green-700"
                                : "bg-white border border-red-300 text-red-700"
                            }`}
                          >
                            <span
                              className={`mr-1.5 ${
                                modalData.correctAnswer.includes(lbl)
                                  ? "text-emerald-500"
                                  : "text-red-500"
                              }`}
                            >
                              ●
                            </span>
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

              {/* Giải thích */}
              {modalData.explanation && (
                <div className="space-y-4">
                  {modalData.explanation.correct && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded bg-green-600 text-white">
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                        </div>
                        <h4 className="text-base font-bold text-green-700">
                          💡 Giải thích đáp án đúng
                        </h4>
                      </div>
                      <div className="bg-white rounded p-3">
                        <p className="text-gray-800 leading-relaxed text-sm">
                          {modalData.explanation.correct}
                        </p>
                      </div>
                    </div>
                  )}

                  {modalData.explanation.incorrect_choices &&
                    Object.keys(
                      modalData.explanation.incorrect_choices
                    ).length > 0 && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded bg-red-600 text-white">
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                          </div>
                          <h4 className="text-base font-bold text-red-700">
                            🚫 Lý do các lựa chọn sai
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {Object.entries(
                            modalData.explanation.incorrect_choices
                          ).map(([choice, explanation]) => (
                            <div
                              key={choice}
                              className="bg-white rounded-lg p-3 border border-red-100"
                            >
                              <div className="flex items-start gap-3">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 border border-red-200 text-red-700 font-bold text-xs">
                                  {choice}
                                </span>
                                <p className="text-gray-800 leading-relaxed text-sm">
                                  {explanation ||
                                    "Không đúng với bối cảnh câu hỏi."}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Footer modal */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>
                    Câu {currentQuestionIndex + 1} / {questions.length}
                  </span>
                  <span className="w-px h-3 bg-gray-300" />
                  <span
                    className={
                      modalData.isCorrect
                        ? "text-emerald-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    {modalData.isCorrect
                      ? "Trả lời chính xác"
                      : "Cần xem lại"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    Đóng
                  </button>
                  {questions &&
                    currentQuestionIndex < questions.length - 1 && (
                      <button
                        onClick={() => {
                          handleCloseModal();
                          handleNext();
                        }}
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 text-sm"
                      >
                        Câu tiếp theo
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
