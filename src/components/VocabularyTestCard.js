import React from 'react';
import { Link } from 'react-router-dom';

const VocabularyTestCard = ({ test, onStartTest, viewMode, className = '' }) => {
  // Handle different ID field names from different APIs
  const testId = test._id || test.id || test.test_id;
  
  const getDifficultyConfig = (difficulty) => {
    const configs = {
      easy: { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-800', 
        label: 'Dễ',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        )
      },
      medium: { 
        bg: 'bg-amber-100', 
        text: 'text-amber-800', 
        label: 'Trung bình',
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="8" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
          </svg>
        )
      },
      hard: { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        label: 'Khó',
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="6" cy="12" r="1.2" />
            <circle cx="12" cy="12" r="1.2" />
            <circle cx="18" cy="12" r="1.2" />
          </svg>
        )
      }
    };
    return configs[difficulty] || configs.medium;
  };

  const difficultyConfig = getDifficultyConfig(test.difficulty);

  // List view for vocabulary tests
  if (viewMode === 'list') {
    return (
      <div className={`group bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300 ${className}`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Vocabulary Icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-slate-600 transition-colors">
                  {test.test_title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-1">
                  {test.description}
                </p>
              </div>
            </div>

            {/* Badges and Action */}
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${difficultyConfig.bg} ${difficultyConfig.text}`}>
                {difficultyConfig.icon}
                <span className="ml-1">{difficultyConfig.label}</span>
              </span>
              
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-700">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {test.total_questions} từ
              </span>

              <Link
                to={`/vocabulary/test/${testId}/settings`}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white text-sm font-medium rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Bắt đầu
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Card view (default)
  return (
    <div className={`group bg-white rounded-2xl shadow-lg border-2 border-gray-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Enhanced Vocabulary Icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border border-slate-200/50">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          {/* Enhanced Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-slate-600 transition-colors duration-200">
              {test.test_title}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
              {test.description}
            </p>

            {/* Enhanced Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold border-2 ${difficultyConfig.bg} ${difficultyConfig.text} border-gray-200`}>
                <span className="mr-2">{difficultyConfig.icon}</span>
                {difficultyConfig.label}
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-50 text-slate-700 border-2 border-slate-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {test.total_questions} từ vựng
              </span>
              {test.time_limit_minutes && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-50 text-gray-700 border-2 border-gray-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {test.time_limit_minutes} phút
                </span>
              )}
            </div>

            {/* Enhanced Action Button */}
            <Link
              to={`/vocabulary/test/${testId}/settings`}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white text-sm font-semibold rounded-xl hover:from-slate-700 hover:to-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200 shadow-lg hover:shadow-xl border border-slate-500/20"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Bắt đầu học từ vựng
            </Link>
          </div>
        </div>
      </div>

      {/* Vocabulary-specific footer info */}
      <div className="px-6 py-3 bg-gradient-to-r from-slate-50 to-gray-50 border-t border-slate-100 rounded-b-2xl">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-slate-700">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="font-medium">3 chế độ học</span>
          </div>
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{test.main_topic} - {test.sub_topic}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyTestCard;