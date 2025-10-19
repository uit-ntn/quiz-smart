import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import testService from '../services/testService';
import MultipleChoiceService from '../services/multipleChoiceService';

const MultipleChoiceTestTake = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(0);
  const [showResult, setShowResult] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isQuestionTimerPaused, setIsQuestionTimerPaused] = useState(false);
  const [mainTopic, setMainTopic] = useState(null);
  const [subTopic, setSubTopic] = useState(null);

  // Get settings from location state or localStorage
  const [settings, setSettings] = useState({
    testMode: 'flexible',
    showTimer: true,
    checkMode: 'after_submit',
    showQuestionNumber: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    questionTimeLimit: 30
  });

  // Fetch main topic and sub topic from test service by id
  useEffect(() => {
    const fetchTopics = async () => {
      if (!testId) return;
      try {
        const data = await testService.getTestById(testId);
        // adapt to backend field names if necessary
        setMainTopic(data?.main_topic ?? data?.mainTopic ?? null);
        setSubTopic(data?.sub_topic ?? data?.subTopic ?? null);
      } catch (err) {
        console.error('Error fetching test topics:', err);
      }
    };

    fetchTopics();
  }, [testId]);




  useEffect(() => {
    // Load settings
    const savedSettings = localStorage.getItem(`test_settings_${testId}`);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else if (location.state?.settings) {
      setSettings(location.state.settings);
    }

    fetchTestData();
  }, [testId]);

  useEffect(() => {
    if (!test || !settings.showTimer || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test, settings.showTimer, isSubmitted]);

  // Question timer effect (for question_timer mode)
  useEffect(() => {
    if (settings.testMode !== 'question_timer' || isSubmitted || isQuestionTimerPaused) return;

    const timer = setInterval(() => {
      setQuestionTimeRemaining((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return settings.questionTimeLimit;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, settings.testMode, settings.questionTimeLimit, isSubmitted, isQuestionTimerPaused]);

  const fetchTestData = async () => {
    try {
      setLoading(true);
      const [testData, questionsData] = await Promise.all([
        MultipleChoiceService.getTestById(testId),
        MultipleChoiceService.getQuestionsByTestId(testId)
      ]);

      setTest(testData);

      let processedQuestions = [...questionsData];

      // Shuffle questions if enabled
      if (settings.shuffleQuestions) {
        processedQuestions = shuffleArray(processedQuestions);
      }

      // Shuffle answers if enabled
      if (settings.shuffleAnswers) {
        processedQuestions = processedQuestions.map(q => ({
          ...q,
          options: shuffleArray([...q.options])
        }));
      }

      setQuestions(processedQuestions);
      setTimeRemaining(testData.time_limit_minutes * 60);

      // Set initial question time for question_timer mode
      if (settings.testMode === 'question_timer') {
        setQuestionTimeRemaining(settings.questionTimeLimit);
      }

      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu bài kiểm tra. Vui lòng thử lại sau.');
      console.error('Error fetching test data:', err);
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleAnswerSelect = (questionId, answer) => {
    if (isSubmitted) return;

    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));

    // If check mode is after each question, show result immediately
    if (settings.checkMode === 'after_each') {
      const currentQuestion = questions[currentQuestionIndex];
      const isCorrect = currentQuestion.correct_answers.includes(answer);
      setShowResult((prev) => ({
        ...prev,
        [questionId]: {
          isCorrect,
          correctAnswer: currentQuestion.correct_answers[0],
          explanation: currentQuestion.explanation
        }
      }));

      // Pause question timer when showing result
      if (settings.testMode === 'question_timer') {
        setIsQuestionTimerPaused(true);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);

      // Reset question timer for next question
      if (settings.testMode === 'question_timer') {
        setQuestionTimeRemaining(settings.questionTimeLimit);
        setIsQuestionTimerPaused(false);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0 && settings.testMode === 'flexible') {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleCheckAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestion._id];

    if (!userAnswer) return;

    const isCorrect = currentQuestion.correct_answers.includes(userAnswer);
    setShowResult((prev) => ({
      ...prev,
      [currentQuestion._id]: {
        isCorrect,
        correctAnswer: currentQuestion.correct_answers[0],
        explanation: currentQuestion.explanation
      }
    }));

    // Pause question timer when checking answer
    if (settings.testMode === 'question_timer') {
      setIsQuestionTimerPaused(true);
    }
  };

  const handleContinue = () => {
    // Resume question timer and move to next question
    setIsQuestionTimerPaused(false);
    handleNextQuestion();
  };

  const handleSubmitTest = () => {
    setIsSubmitted(true);

    // Calculate results
    const results = questions.map((question) => {
      const userAnswer = userAnswers[question._id];
      const isCorrect = question.correct_answers.includes(userAnswer);
      return {
        questionId: question._id,
        userAnswer,
        correctAnswer: question.correct_answers[0],
        isCorrect,
        explanation: question.explanation
      };
    });

    // Navigate to review page
    navigate(`/multiple-choice/test/${testId}/review`, {
      state: {
        test,
        questions,
        userAnswers,
        results,
        settings
      }
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(userAnswers).length;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-3">Đang tải bài kiểm tra...</p>
      </div>
    );
  }

  if (error || !test || questions.length === 0) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error || 'Không tìm thấy bài kiểm tra'}
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestion._id];
  const currentResult = showResult[currentQuestion._id];

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Main Content */}
        <div className="col-lg-9">
          {/* Header */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h4 className="mb-1">Main topic : {mainTopic} - sub topic : {subTopic}</h4>
                  {settings.showQuestionNumber && (
                    <p className="text-muted mb-0">
                      Câu {currentQuestionIndex + 1} / {questions.length}
                    </p>
                  )}
                </div>
                <div className="d-flex align-items-center gap-4">
                  {/* Question Timer */}
                  {settings.testMode === 'question_timer' && (
                    <div className="d-flex align-items-center">
                      <i className="bi bi-stopwatch fs-5 text-warning me-2"></i>
                      <span className={`fs-5 fw-bold ${questionTimeRemaining < 10 ? 'text-danger' : 'text-warning'}`}>
                        {formatTime(questionTimeRemaining)}
                      </span>
                      <small className="text-muted ms-1">/ câu</small>
                    </div>
                  )}

                  {/* Total Timer */}
                  {settings.showTimer && (
                    <div className="d-flex align-items-center">
                      <i className="bi bi-clock fs-4 text-primary me-2"></i>
                      <span className={`fs-4 fw-bold ${timeRemaining < 60 ? 'text-danger' : 'text-primary'}`}>
                        {formatTime(timeRemaining)}
                      </span>
                      <small className="text-muted ms-1">tổng</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="card-title mb-4">
                {settings.showQuestionNumber && `${currentQuestionIndex + 1}. `}
                {currentQuestion.question_text}
              </h5>

              <div className="d-grid gap-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = currentAnswer === option.label;
                  const isCorrect = currentQuestion.correct_answers.includes(option.label);

                  let buttonClass = 'btn btn-outline-secondary text-start d-flex align-items-center';

                  if (currentResult) {
                    if (isCorrect) {
                      buttonClass = 'btn btn-success text-start d-flex align-items-center';
                    } else if (isSelected) {
                      buttonClass = 'btn btn-danger text-start d-flex align-items-center';
                    }
                  } else if (isSelected) {
                    buttonClass = 'btn btn-primary text-start d-flex align-items-center';
                  }

                  return (
                    <button
                      key={option.label}
                      className={`${buttonClass} p-3`}
                      onClick={() => handleAnswerSelect(currentQuestion._id, option.label)}
                      disabled={currentResult !== undefined}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="form-check-input me-3 mt-0"
                        style={{ width: '18px', height: '18px' }}
                      />
                      <div className="flex-1 text-start">
                        <div className="d-flex align-items-center">
                          <span className="badge bg-light text-dark me-3">{option.label}</span>
                          <span>{option.text}</span>
                        </div>
                        {currentResult && (
                          <div className="mt-2">
                            {isCorrect && <i className="bi bi-check-circle-fill text-white"></i>}
                            {!isCorrect && isSelected && <i className="bi bi-x-circle-fill text-white"></i>}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Show explanation if check mode is after each */}
              {currentResult && (
                <div className={`alert ${currentResult.isCorrect ? 'alert-success' : 'alert-danger'} mt-4`}>
                  <h6 className="alert-heading">
                    <i className={`bi ${currentResult.isCorrect ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
                    {currentResult.isCorrect ? 'Chính xác!' : 'Chưa chính xác'}
                  </h6>
                  <p className="mb-2">
                    <strong>Giải thích:</strong> {currentResult.explanation.correct}
                  </p>
                  {!currentResult.isCorrect && currentResult.explanation.incorrect_choices?.[currentAnswer] && (
                    <p className="mb-0">
                      <strong>Lý do sai:</strong> {currentResult.explanation.incorrect_choices[currentAnswer]}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="d-flex justify-content-between gap-3">
            {/* Previous Button - only for flexible mode */}
            {settings.testMode === 'flexible' && (
              <button
                className="btn btn-outline-secondary"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Câu trước
              </button>
            )}

            <div className="d-flex gap-2 ms-auto">
              {/* Check Answer Button - for question_timer mode when not showing result */}
              {settings.testMode === 'question_timer' && !currentResult && currentAnswer && (
                <button
                  className="btn btn-warning"
                  onClick={handleCheckAnswer}
                >
                  <i className="bi bi-search me-2"></i>
                  Kiểm tra đáp án
                </button>
              )}

              {/* Continue Button - for question_timer mode when showing result */}
              {settings.testMode === 'question_timer' && currentResult && currentQuestionIndex < questions.length - 1 && (
                <button
                  className="btn btn-info"
                  onClick={handleContinue}
                >
                  Tiếp tục
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              )}

              {/* Next Question Button - for flexible mode */}
              {settings.testMode === 'flexible' && currentQuestionIndex < questions.length - 1 && (
                <button
                  className="btn btn-primary"
                  onClick={handleNextQuestion}
                >
                  Câu tiếp theo
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              )}

              {/* Submit Button */}
              {(currentQuestionIndex === questions.length - 1 ||
                (settings.testMode === 'question_timer' && currentResult && currentQuestionIndex === questions.length - 1)) && (
                  <button
                    className="btn btn-success"
                    onClick={handleSubmitTest}
                    disabled={getAnsweredCount() === 0}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Nộp bài
                  </button>
                )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-3">
          <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">Tổng quan</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted">Đã trả lời</small>
                <div className="progress" style={{ height: '25px' }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${(getAnsweredCount() / questions.length) * 100}%` }}
                  >
                    {getAnsweredCount()} / {questions.length}
                  </div>
                </div>
              </div>

              <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                <div className="d-grid" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '8px' }}>
                  {questions.map((q, index) => {
                    const isAnswered = userAnswers[q._id] !== undefined;
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <button
                        key={q._id}
                        className={`btn btn-sm text-sm p-2 ${isCurrent
                            ? 'btn-primary'
                            : isAnswered
                              ? 'btn-success'
                              : 'btn-outline-secondary'
                          }`}
                        onClick={() => setCurrentQuestionIndex(index)}
                        style={{ minHeight: '42px' }}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                className="btn btn-warning w-100 mt-3"
                onClick={handleSubmitTest}
                disabled={getAnsweredCount() === 0}
              >
                <i className="bi bi-send me-2"></i>
                Nộp bài ({getAnsweredCount()}/{questions.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .card {
          border: none;
          border-radius: 12px;
        }
        .btn {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default MultipleChoiceTestTake;
