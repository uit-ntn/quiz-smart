import React from 'react';
import { Link } from 'react-router-dom';

const TopicCard = ({ topic, to, icon = 'folder', color = 'blue', description = 'Xem các chủ đề con và bài kiểm tra', className = '' }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      button: 'border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600', 
      button: 'border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      button: 'border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400'
    }
  };

  const icons = {
    folder: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    document: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  };

  const currentColor = colorClasses[color] || colorClasses.blue;

  return (
    <Link to={to} className={`block group ${className}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-start space-x-4">
          <div className={`${currentColor.bg} p-3 rounded-full flex-shrink-0`}>
            <div className={currentColor.icon}>
              {icons[icon]}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
              {topic}
            </h3>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TopicCard;