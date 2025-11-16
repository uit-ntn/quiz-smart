import React from 'react';

const TestLayout = ({
  children,
  testTitle,
  currentQuestion,
  totalQuestions,
  timeLeft,
  timePerQuestion,
  onExit
}) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const timeProgress = (timeLeft / timePerQuestion) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <button
                onClick={onExit}
                className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Thoát
              </button>
              <div className="h-5 w-px bg-gray-300" />
              <div>
                <h1 className="text-base font-semibold text-gray-900">{testTitle}</h1>
                <div className="text-sm text-gray-600">
                  Câu {currentQuestion + 1}/{totalQuestions}
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">{formatTime(timeLeft)}</div>
                <div className="text-xs text-gray-500">Thời gian còn lại</div>
              </div>
              <div className="w-14 h-14 relative">
                <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={timeLeft <= 10 ? "#ef4444" : timeLeft <= 30 ? "#f59e0b" : "#10b981"}
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - timeProgress / 100)}`}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`text-xs font-bold ${
                      timeLeft <= 10 ? "text-red-600" : timeLeft <= 30 ? "text-yellow-600" : "text-green-600"
                    }`}
                  >
                    {timeLeft}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Tiến độ bài test</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default TestLayout;
