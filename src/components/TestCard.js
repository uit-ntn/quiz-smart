import React from 'react';
import { Link } from 'react-router-dom';

const TestCard = ({ test, onStartTest, viewMode, className = '' }) => {
  // Handle different ID field names from different APIs
  const testId = test._id || test.id || test.test_id;
  const getDifficultyConfig = (difficulty) => {
    const configs = {
      easy: { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        label: 'Dễ',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        )
      },
      medium: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
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

  return (
    <div className={`group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className="bg-blue-50 p-3 rounded-full flex-shrink-0">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {test.test_title}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-2">
              {test.description}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${difficultyConfig.bg} ${difficultyConfig.text}`}>
                <span className="mr-1">{difficultyConfig.icon}</span>
                {difficultyConfig.label}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {test.total_questions} câu
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {test.time_limit_minutes} phút
              </span>
            </div>

            {/* Action Button */}
            <Link
              to={`/multiple-choice/test/${testId}/settings`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Bắt đầu làm bài
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCard;