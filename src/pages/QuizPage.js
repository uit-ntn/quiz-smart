import React, { useState } from 'react';
import DataInput from '../components/DataInput';
import QuizSelection from '../components/QuizSelection';
import Quiz from '../components/Quiz';

const QuizPage = () => {
  const [currentView, setCurrentView] = useState('input'); // 'input', 'quiz'
  const [showQuizSelection, setShowQuizSelection] = useState(false);
  const [vocabulary, setVocabulary] = useState([]);
  const [quizType, setQuizType] = useState('');

  const handleStartQuiz = (vocabData) => {
    setVocabulary(vocabData);
    setShowQuizSelection(true);
  };

  const handleSelectQuizType = (type) => {
    setQuizType(type);
    setShowQuizSelection(false);
    setCurrentView('quiz');
  };

  const handleBackToInput = () => {
    setShowQuizSelection(false);
    setVocabulary([]);
    setQuizType('');
  };

  const handleFinishQuiz = () => {
    setCurrentView('input');
    setShowQuizSelection(false);
    setVocabulary([]);
    setQuizType('');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="main-container p-4 p-md-5">
              {/* Page Header */}
              <div className="text-center mb-5">
                <h1 className="display-4 fw-bold text-primary mb-3">
                  <i className="bi bi-play-circle-fill me-3"></i>
                  Làm Quiz
                </h1>
                <p className="lead text-muted">
                  Kiểm tra và nâng cao vốn từ vựng của bạn với các bài quiz đa dạng
                </p>
              </div>
              
              {currentView === 'input' && (
                <>
                  <DataInput onStartQuiz={handleStartQuiz} />
                  
                  {/* Quiz Selection Modal Overlay */}
                  {showQuizSelection && (
                    <QuizSelection
                      vocabulary={vocabulary}
                      onSelectQuizType={handleSelectQuizType}
                      onBackToInput={handleBackToInput}
                    />
                  )}
                </>
              )}
              
              {currentView === 'quiz' && (
                <Quiz
                  vocabulary={vocabulary}
                  quizType={quizType}
                  onFinish={handleFinishQuiz}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;