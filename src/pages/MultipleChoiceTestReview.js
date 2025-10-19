import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const MultipleChoiceTestReview = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  useEffect(() => {
    if (location.state) {
      const { test, questions, userAnswers, results } = location.state;
      setTest(test);
      setQuestions(questions);
      setUserAnswers(userAnswers);
      setResults(results);

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
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
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
    <div className="container-fluid py-4">
      <div className="row">
        {/* Main Content */}
        <div className="col-lg-9">
          {/* Score Card */}
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center py-5">
              <div className="mb-3">
                <i className={`bi bi-trophy fs-1 text-${getScoreColor(score)}`}></i>
              </div>
              <h2 className="display-4 fw-bold mb-2">{score}/10</h2>
              <h4 className={`text-${getScoreColor(score)} mb-4`}>
                {getScoreMessage(score)}
              </h4>
              <div className="row justify-content-center">
                <div className="col-md-8">
                  <div className="row text-center">
                    <div className="col-3">
                      <div className="p-3 bg-light rounded">
                        <h3 className="mb-1">{results.length}</h3>
                        <small className="text-muted">Tổng câu</small>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="p-3 bg-success bg-opacity-10 rounded">
                        <h3 className="mb-1 text-success">{correctCount}</h3>
                        <small className="text-muted">Đúng</small>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="p-3 bg-danger bg-opacity-10 rounded">
                        <h3 className="mb-1 text-danger">{incorrectCount}</h3>
                        <small className="text-muted">Sai</small>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="p-3 bg-warning bg-opacity-10 rounded">
                        <h3 className="mb-1 text-warning">{unansweredCount}</h3>
                        <small className="text-muted">Chưa làm</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Info */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="bi bi-info-circle me-2"></i>
                Thông tin bài kiểm tra
              </h5>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <strong>Tiêu đề:</strong> {test.test_title}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Chủ đề:</strong> {test.main_topic} - {test.sub_topic}
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Độ khó:</strong>{' '}
                  <span className="text-capitalize">{test.difficulty}</span>
                </div>
                <div className="col-md-6 mb-2">
                  <strong>Thời gian giới hạn:</strong> {test.time_limit_minutes} phút
                </div>
              </div>
            </div>
          </div>

          {/* Question Review */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0">
                Câu {selectedQuestion + 1} / {questions.length}
              </h5>
            </div>
            <div className="card-body p-4">
              <h5 className="card-title mb-4">{currentQuestion.question_text}</h5>

              <div className="d-grid gap-3 mb-4">
                {currentQuestion.options.map((option) => {
                  const isUserAnswer = userAnswers[currentQuestion._id] === option.label;
                  const isCorrectAnswer = currentQuestion.correct_answers.includes(option.label);

                  let buttonClass = 'btn btn-outline-secondary text-start';
                  let icon = null;

                  if (isCorrectAnswer) {
                    buttonClass = 'btn btn-success text-start';
                    icon = <i className="bi bi-check-circle-fill ms-auto"></i>;
                  } else if (isUserAnswer) {
                    buttonClass = 'btn btn-danger text-start';
                    icon = <i className="bi bi-x-circle-fill ms-auto"></i>;
                  }

                  return (
                    <div key={option.label} className={`${buttonClass} p-3`}>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-light text-dark me-3">{option.label}</span>
                        <span className="flex-grow-1">{option.text}</span>
                        {icon}
                      </div>
                      {isUserAnswer && !isCorrectAnswer && (
                        <small className="d-block mt-2 text-white">
                          <i className="bi bi-arrow-right me-1"></i>
                          Bạn đã chọn đáp án này
                        </small>
                      )}
                      {isCorrectAnswer && (
                        <small className="d-block mt-2 text-white">
                          <i className="bi bi-check-lg me-1"></i>
                          Đáp án đúng
                        </small>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div className={`alert ${currentResult?.isCorrect ? 'alert-success' : 'alert-danger'}`}>
                <h6 className="alert-heading">
                  <i className={`bi ${currentResult?.isCorrect ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
                  {currentResult?.isCorrect ? 'Bạn đã trả lời đúng!' : 'Bạn đã trả lời sai'}
                </h6>
                <hr />
                <p className="mb-2">
                  <strong>Giải thích đáp án đúng:</strong>
                  <br />
                  {currentQuestion.explanation.correct}
                </p>
                {!currentResult?.isCorrect && 
                 currentQuestion.explanation.incorrect_choices?.[userAnswers[currentQuestion._id]] && (
                  <p className="mb-0">
                    <strong>Lý do đáp án {userAnswers[currentQuestion._id]} sai:</strong>
                    <br />
                    {currentQuestion.explanation.incorrect_choices[userAnswers[currentQuestion._id]]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="d-flex justify-content-between gap-3 mb-4">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setSelectedQuestion(Math.max(0, selectedQuestion - 1))}
              disabled={selectedQuestion === 0}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Câu trước
            </button>

            <button
              className="btn btn-outline-secondary"
              onClick={() =>
                setSelectedQuestion(Math.min(questions.length - 1, selectedQuestion + 1))
              }
              disabled={selectedQuestion === questions.length - 1}
            >
              Câu tiếp theo
              <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-3 mb-4">
            <button
              className="btn btn-primary flex-grow-1"
              onClick={() => navigate(`/multiple-choice/test/${testId}/settings`)}
            >
              <i className="bi bi-arrow-repeat me-2"></i>
              Làm lại bài kiểm tra
            </button>
            <button
              className="btn btn-success"
              onClick={() => {
                // TODO: Implement save result functionality
                alert('Tính năng lưu kết quả sẽ được phát triển trong tương lai!');
              }}
            >
              <i className="bi bi-bookmark me-2"></i>
              Lưu kết quả
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/multiple-choice/topics')}
            >
              <i className="bi bi-house me-2"></i>
              Về danh sách chủ đề
            </button>
          </div>
        </div>

        {/* Sidebar - Question Grid */}
        <div className="col-lg-3">
          <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">Danh sách câu hỏi</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <span className="badge bg-success me-2">&nbsp;</span>
                  <small>Trả lời đúng ({correctCount})</small>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <span className="badge bg-danger me-2">&nbsp;</span>
                  <small>Trả lời sai ({incorrectCount})</small>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge bg-warning me-2">&nbsp;</span>
                  <small>Chưa trả lời ({unansweredCount})</small>
                </div>
              </div>

              <hr />

              <div className="d-grid gap-2" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {results.map((result, index) => {
                  const isCurrent = index === selectedQuestion;
                  const buttonClass = result.isCorrect
                    ? 'btn-success'
                    : result.userAnswer
                    ? 'btn-danger'
                    : 'btn-warning';

                  return (
                    <button
                      key={result.questionId}
                      className={`btn btn-sm ${isCurrent ? 'btn-primary' : buttonClass}`}
                      onClick={() => setSelectedQuestion(index)}
                    >
                      Câu {index + 1}
                      {result.isCorrect && <i className="bi bi-check ms-1"></i>}
                      {!result.isCorrect && result.userAnswer && (
                        <i className="bi bi-x ms-1"></i>
                      )}
                    </button>
                  );
                })}
              </div>
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

export default MultipleChoiceTestReview;
