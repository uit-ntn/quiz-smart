import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Trang chủ', icon: '🏠' },
    { path: '/multiple-choice/topics', label: 'Trắc nghiệm', icon: '📝' },
    { path: '/grammar', label: 'Ngữ pháp tiếng Anh', icon: '📇' },
    { path: '/vocabulary', label: 'Từ vựng', icon: '🃏' },
    { path: '/about', label: 'Giới thiệu', icon: 'ℹ️' },
    { path: '/help', label: 'Hướng dẫn', icon: '❓' }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link className="flex items-center space-x-3" to="/">
            <div className="text-2xl">🎓</div>
            <div>
              <h4 className="text-xl font-bold text-blue-600">QuizSmart</h4>
              <small className="text-gray-500 text-sm">Quizz thông minh</small>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                }`}
                to={item.path}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <div className="relative">
              <button 
                className="flex items-center px-3 py-2 border border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <span className="mr-2">👤</span>
                Tài khoản
                <svg className={`ml-2 h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <span className="mr-3">👤</span>
                    Hồ sơ
                  </Link>
                  <Link 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    to="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <span className="mr-3">⚙️</span>
                    Cài đặt
                  </Link>
                  <hr className="my-1 border-gray-200" />
                  <Link 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    to="/logout"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <span className="mr-3">🚪</span>
                    Đăng xuất
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    location.pathname === item.path 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;