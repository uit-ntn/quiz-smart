import React, { useState, useEffect } from 'react';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis';

const Quiz = ({ vocabulary, quizType, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [shuffledVocab, setShuffledVocab] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [speechSettings, setSpeechSettings] = useState({
    rate: 0.7,
    pitch: 1,
    volume: 1,
    voiceIndex: 0
  });
  const [showSpeechSettings, setShowSpeechSettings] = useState(false);
  const { speak, speaking, supported, voices } = useSpeechSynthesis();

  useEffect(() => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    setShuffledVocab(shuffled);
  }, [vocabulary]);

  const currentWord = shuffledVocab[currentIndex];

  const handleSubmit = () => {
    if (!userAnswer.trim()) {
      alert('Vui lòng nhập câu trả lời!');
      return;
    }

    let correctAnswer;
    if (quizType === 'vocabulary') {
      correctAnswer = currentWord.word;
    } else if (quizType === 'meaning') {
      correctAnswer = currentWord.meaning;
    } else if (quizType === 'listening') {
      correctAnswer = currentWord.word;
    }

    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
    
    if (isCorrect) {
      setScore(score + 1);
    }

    let question;
    if (quizType === 'vocabulary') {
      question = currentWord.meaning;
    } else if (quizType === 'meaning') {
      question = currentWord.word;
    } else if (quizType === 'listening') {
      question = `🔊 ${currentWord.word}`;
    }

    const newAnswer = {
      question,
      userAnswer: userAnswer.trim(),
      correctAnswer,
      isCorrect
    };

    setAnswers([...answers, newAnswer]);
    setFeedback({ isCorrect, correctAnswer });
    setIsAnswerChecked(true);
  };

  const handleCheckAnswer = () => {
    if (!userAnswer.trim()) {
      alert('Vui lòng nhập câu trả lời trước khi kiểm tra!');
      return;
    }

    let correctAnswer;
    if (quizType === 'vocabulary') {
      correctAnswer = currentWord.word;
    } else if (quizType === 'meaning') {
      correctAnswer = currentWord.meaning;
    } else if (quizType === 'listening') {
      correctAnswer = currentWord.word;
    }

    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
    setFeedback({ isCorrect, correctAnswer });
    setIsAnswerChecked(true);
  };

  const handleShowAnswer = () => {
    let correctAnswer;
    if (quizType === 'vocabulary') {
      correctAnswer = currentWord.word;
    } else if (quizType === 'meaning') {
      correctAnswer = currentWord.meaning;
    } else if (quizType === 'listening') {
      correctAnswer = currentWord.word;
    }
    
    setShowAnswer(true);
    setFeedback({ isCorrect: false, correctAnswer });
  };

  const handleNext = () => {
    if (isAnswerChecked || showAnswer) {
      // Save answer if checked
      if (isAnswerChecked) {
        if (feedback.isCorrect) {
          setScore(score + 1);
        }

        let question;
        if (quizType === 'vocabulary') {
          question = currentWord.meaning;
        } else if (quizType === 'meaning') {
          question = currentWord.word;
        } else if (quizType === 'listening') {
          question = `🔊 ${currentWord.word}`;
        }

        const newAnswer = {
          question,
          userAnswer: userAnswer.trim() || '(Không trả lời)',
          correctAnswer: feedback.correctAnswer,
          isCorrect: feedback.isCorrect
        };

        setAnswers([...answers, newAnswer]);
      } else if (showAnswer) {
        // If only showed answer without checking
        let question;
        if (quizType === 'vocabulary') {
          question = currentWord.meaning;
        } else if (quizType === 'meaning') {
          question = currentWord.word;
        } else if (quizType === 'listening') {
          question = `🔊 ${currentWord.word}`;
        }

        const newAnswer = {
          question,
          userAnswer: userAnswer.trim() || '(Xem đáp án)',
          correctAnswer: feedback.correctAnswer,
          isCorrect: false
        };

        setAnswers([...answers, newAnswer]);
      }

      // Reset for next question
      setFeedback(null);
      setShowAnswer(false);
      setIsAnswerChecked(false);
      setUserAnswer('');

      if (currentIndex + 1 < shuffledVocab.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setShowResult(true);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !feedback && !showAnswer) {
      handleCheckAnswer();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswer('');
    setScore(0);
    setAnswers([]);
    setShowResult(false);
    setFeedback(null);
    setShowAnswer(false);
    setIsAnswerChecked(false);
    setShowSpeechSettings(false);
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    setShuffledVocab(shuffled);
  };

  const handleSpeak = (text) => {
    if (supported) {
      const selectedVoice = voices[speechSettings.voiceIndex] || null;
      speak(text, {
        rate: speechSettings.rate,
        pitch: speechSettings.pitch,
        volume: speechSettings.volume,
        voice: selectedVoice,
        lang: 'en-US'
      });
    } else {
      alert('Trình duyệt của bạn không hỗ trợ chức năng đọc văn bản!');
    }
  };

  const handleSpeechSettingChange = (setting, value) => {
    setSpeechSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const applyPreset = (preset) => {
    const presets = {
      slow: { rate: 0.5, pitch: 1, volume: 1 },
      normal: { rate: 0.7, pitch: 1, volume: 1 },
      fast: { rate: 1.2, pitch: 1, volume: 1 },
      clear: { rate: 0.6, pitch: 1.1, volume: 1 }
    };
    
    setSpeechSettings(prev => ({
      ...prev,
      ...presets[preset]
    }));
  };

  if (shuffledVocab.length === 0) {
    return (
      <div className="min-vh-75 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="text-primary mb-2">Đang chuẩn bị Quiz</h4>
          <p className="text-muted">Vui lòng chờ một chút...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / shuffledVocab.length) * 100);
    const getResultLevel = () => {
      if (percentage >= 90) return { text: 'Xuất sắc!', icon: 'trophy-fill', color: 'success', emoji: '🏆' };
      if (percentage >= 80) return { text: 'Rất tốt!', icon: 'star-fill', color: 'primary', emoji: '⭐' };
      if (percentage >= 70) return { text: 'Tốt!', icon: 'hand-thumbs-up-fill', color: 'info', emoji: '👍' };
      if (percentage >= 50) return { text: 'Khá!', icon: 'check-circle-fill', color: 'warning', emoji: '✅' };
      return { text: 'Cần cải thiện!', icon: 'arrow-up-circle-fill', color: 'danger', emoji: '📚' };
    };
    
    const result = getResultLevel();
    
    return (
      <div className="container-fluid px-0">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            {/* Hero Result Section */}
            <div className="text-center mb-5">
              <div className="position-relative d-inline-block">
                <div 
                  className="display-1 fw-bold mb-3"
                  style={{ fontSize: '4rem' }}
                >
                  {result.emoji}
                </div>
                <h1 className="display-4 fw-bold text-primary mb-3">
                  {score}<span className="text-muted">/{shuffledVocab.length}</span>
                </h1>
                <div className="mb-4">
                  <span className={`badge bg-${result.color} fs-5 px-4 py-2 rounded-pill`}>
                    <i className={`bi bi-${result.icon} me-2`}></i>
                    {result.text} ({percentage}%)
                  </span>
                </div>
                
                {/* Animated Progress Circle */}
                <div className="position-relative d-inline-block mb-4">
                  <svg width="120" height="120" className="position-relative">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#e9ecef"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={`var(--bs-${result.color})`}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - percentage / 100)}`}
                      transform="rotate(-90 60 60)"
                      style={{
                        transition: 'stroke-dashoffset 2s ease-in-out'
                      }}
                    />
                  </svg>
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <div className="fw-bold fs-4 text-primary">{percentage}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Answer Review Cards */}
            <div className="row mb-5">
              <div className="col-12">
                <div className="card border-0 shadow-lg">
                  <div className="card-header bg-gradient text-white py-3">
                    <h5 className="mb-0 d-flex align-items-center">
                      <i className="bi bi-list-check me-2"></i>
                      Chi tiết câu trả lời
                      <span className="badge bg-light text-dark ms-auto">{answers.length} câu</span>
                    </h5>
                  </div>
                  <div className="card-body p-0">
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                      {answers.map((answer, index) => (
                        <div
                          key={index}
                          className={`border-bottom p-4 ${
                            answer.isCorrect ? 'bg-light border-start border-success border-4' : 'bg-light border-start border-danger border-4'
                          }`}
                          style={{ 
                            borderLeftWidth: '4px !important',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div className="row align-items-center">
                            <div className="col-1">
                              <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                                answer.isCorrect ? 'bg-success' : 'bg-danger'
                              }`} style={{ width: '40px', height: '40px' }}>
                                <i className={`bi ${answer.isCorrect ? 'bi-check-lg' : 'bi-x-lg'} text-white`}></i>
                              </div>
                            </div>
                            <div className="col-2">
                              <span className="badge bg-primary rounded-pill px-3 py-2">
                                Câu {index + 1}
                              </span>
                            </div>
                            <div className="col-9">
                              <div className="mb-2">
                                <strong className="text-primary">
                                  {quizType === 'vocabulary' ? 'Nghĩa' : 
                                   quizType === 'meaning' ? 'Từ vựng' : 
                                   'Từ được phát âm'}: 
                                </strong>
                                <span className="ms-2 fs-5">{answer.question.replace('🔊 ', '')}</span>
                                {quizType === 'listening' && (
                                  <button
                                    onClick={() => handleSpeak(answer.correctAnswer)}
                                    className="btn btn-sm btn-outline-primary ms-2"
                                    disabled={speaking}
                                  >
                                    <i className="bi bi-volume-up"></i>
                                  </button>
                                )}
                              </div>
                              <div className="mb-1">
                                <span className="text-muted me-2">Bạn trả lời:</span>
                                <span className={`fw-bold ${answer.isCorrect ? 'text-success' : 'text-danger'}`}>
                                  "{answer.userAnswer}"
                                </span>
                              </div>
                              {!answer.isCorrect && (
                                <div>
                                  <span className="text-muted me-2">Đáp án đúng:</span>
                                  <span className="fw-bold text-success">"{answer.correctAnswer}"</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <button
                  onClick={handleRestart}
                  className="btn btn-gradient-primary btn-lg px-4 py-3"
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Làm lại Quiz
                </button>
                <button
                  onClick={onFinish}
                  className="btn btn-outline-secondary btn-lg px-4 py-3"
                >
                  <i className="bi bi-house-fill me-2"></i>
                  Về trang chủ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Left Sidebar - Question */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0 text-primary fw-bold">
                  <i className={`bi ${
                    quizType === 'vocabulary' ? 'bi-book-fill' : 
                    quizType === 'meaning' ? 'bi-translate' : 
                    'bi-volume-up-fill'
                  } me-2`}></i>
                  {quizType === 'vocabulary' ? 'Quiz Từ vựng' : 
                   quizType === 'meaning' ? 'Quiz Nghĩa' : 
                   'Quiz Nghe'}
                </h4>
                <span className="badge bg-primary fs-6 px-3 py-2">
                  {currentIndex + 1} / {shuffledVocab.length}
                </span>
              </div>
            </div>
            
            <div className="card-body p-4">
              {/* Progress */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <small className="text-muted">Tiến độ</small>
                  <small className="text-muted">{Math.round(((currentIndex) / shuffledVocab.length) * 100)}%</small>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ 
                      width: `${((currentIndex) / shuffledVocab.length) * 100}%`,
                      transition: 'width 0.5s ease'
                    }}
                  ></div>
                </div>
              </div>

              {/* Question Content */}
              {quizType === 'listening' ? (
                <div className="text-center">
                  <div className="p-5 bg-light rounded-3 mb-4">
                    <i className="bi bi-headphones display-1 text-primary mb-3"></i>
                    <h5 className="text-muted mb-4">Nhấn để nghe từ vựng</h5>
                    
                    <button
                      onClick={() => handleSpeak(currentWord.word)}
                      className={`btn btn-primary btn-lg px-5 py-3 rounded-pill`}
                      disabled={speaking}
                    >
                      <i className={`bi ${speaking ? 'bi-volume-up-fill' : 'bi-play-fill'} me-2`}></i>
                      {speaking ? 'Đang phát...' : 'Nghe từ vựng'}
                    </button>
                    
                    <div className="mt-3">
                      <small className="text-muted">Tốc độ: {speechSettings.rate}x</small>
                    </div>
                  </div>

                  {/* Compact Settings */}
                  <div className="text-center">
                    <button
                      onClick={() => setShowSpeechSettings(!showSpeechSettings)}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      <i className="bi bi-gear me-2"></i>
                      Cài đặt
                    </button>
                  </div>

                  {showSpeechSettings && (
                    <div className="card mt-3 bg-light border-0">
                      <div className="card-body">
                        <div className="row g-2">
                          <div className="col-6">
                            <label className="form-label small">Tốc độ: {speechSettings.rate}x</label>
                            <input
                              type="range"
                              className="form-range"
                              min="0.3"
                              max="2"
                              step="0.1"
                              value={speechSettings.rate}
                              onChange={(e) => handleSpeechSettingChange('rate', parseFloat(e.target.value))}
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label small">Âm lượng: {Math.round(speechSettings.volume * 100)}%</label>
                            <input
                              type="range"
                              className="form-range"
                              min="0.1"
                              max="1"
                              step="0.1"
                              value={speechSettings.volume}
                              onChange={(e) => handleSpeechSettingChange('volume', parseFloat(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="d-flex gap-2 justify-content-center mt-3">
                          {[
                            { key: 'slow', label: 'Chậm' },
                            { key: 'normal', label: 'Bình thường' },
                            { key: 'fast', label: 'Nhanh' }
                          ].map(preset => (
                            <button
                              key={preset.key}
                              onClick={() => applyPreset(preset.key)}
                              className="btn btn-outline-primary btn-sm"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="mb-3">
                    <h6 className="text-muted mb-3">
                      {quizType === 'vocabulary' ? '💭 Nghĩa của từ:' : '🔤 Từ vựng:'}
                    </h6>
                    <div className="alert alert-primary h-auto py-4 text-center">
                      <h2 className="display-5 fw-bold mb-0">
                        {quizType === 'vocabulary' ? currentWord.meaning : currentWord.word}
                      </h2>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Answer */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 text-secondary fw-bold">
                <i className="bi bi-pencil-square me-2"></i>
                Câu trả lời của bạn
              </h5>
            </div>
            
            <div className="card-body p-4">
              {/* Current Stats */}
              <div className="row text-center mb-4">
                <div className="col-4">
                  <div className="p-3 bg-light rounded">
                    <div className="h5 mb-1 text-primary fw-bold">{score}</div>
                    <small className="text-muted">Đúng</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-light rounded">
                    <div className="h5 mb-1 text-danger fw-bold">{currentIndex - score}</div>
                    <small className="text-muted">Sai</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3 bg-light rounded">
                    <div className="h5 mb-1 text-info fw-bold">{shuffledVocab.length - currentIndex - 1}</div>
                    <small className="text-muted">Còn lại</small>
                  </div>
                </div>
              </div>

              {/* Answer Input */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  {quizType === 'vocabulary' ? '✍️ Nhập từ vựng:' : 
                   quizType === 'meaning' ? '✍️ Nhập nghĩa:' :
                   '✍️ Nhập từ bạn nghe được:'}
                </label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    quizType === 'vocabulary' ? 'Gõ từ vựng...' : 
                    quizType === 'meaning' ? 'Gõ nghĩa...' :
                    'Gõ từ bạn vừa nghe...'
                  }
                  className="form-control form-control-lg"
                  disabled={feedback !== null || showAnswer}
                  style={{ 
                    fontSize: '1.1rem',
                    borderColor: userAnswer.trim() ? '#198754' : '#dee2e6'
                  }}
                />
              </div>

              {/* Feedback */}
              {(feedback || showAnswer) && (
                <div className={`alert ${
                  showAnswer || !feedback.isCorrect ? 'alert-warning' : 'alert-success'
                } mb-4`}>
                  <div className="d-flex align-items-center">
                    <i className={`bi ${
                      showAnswer ? 'bi-eye-fill' : 
                      feedback.isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'
                    } fs-5 me-3`}></i>
                    <div>
                      {showAnswer ? (
                        <div>
                          <div className="fw-bold">Đáp án đúng:</div>
                          <div className="fs-5">{feedback.correctAnswer}</div>
                        </div>
                      ) : feedback.isCorrect ? (
                        <div className="fw-bold fs-5">Chính xác! 🎉</div>
                      ) : (
                        <div>
                          <div className="fw-bold">Chưa đúng!</div>
                          <div>Đáp án: <strong>{feedback.correctAnswer}</strong></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-grid gap-2">
                {!feedback && !showAnswer ? (
                  <>
                    <button
                      onClick={handleCheckAnswer}
                      className="btn btn-primary btn-lg"
                      disabled={!userAnswer.trim()}
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Kiểm tra
                    </button>
                    <button
                      onClick={handleShowAnswer}
                      className="btn btn-outline-warning btn-lg"
                    >
                      <i className="bi bi-eye me-2"></i>
                      Xem đáp án
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleNext}
                    className="btn btn-success btn-lg"
                  >
                    {currentIndex + 1 === shuffledVocab.length ? (
                      <>
                        <i className="bi bi-flag-fill me-2"></i>
                        Hoàn thành Quiz
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-right me-2"></i>
                        Câu tiếp theo
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={onFinish}
                  className="btn btn-outline-secondary"
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Thoát Quiz
                </button>
              </div>

              {/* Help Text */}
              <div className="text-center mt-3">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  {!feedback && !showAnswer ? 'Nhấn Enter để kiểm tra' : 'Nhấn để tiếp tục'}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;