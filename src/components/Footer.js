import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand and description */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="text-2xl mr-3">🎓</div>
              <h5 className="text-xl font-semibold text-white">QuizSmart</h5>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Ứng dụng học từ vựng thông minh với nhiều chế độ quiz đa dạng, 
              giúp bạn nâng cao vốn từ vựng một cách hiệu quả.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                📘
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                🐦
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                📷
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                🎬
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h6 className="text-white font-semibold mb-4">Liên kết nhanh</h6>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/topics" className="text-gray-400 hover:text-white transition-colors">
                  Chủ đề
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-400 hover:text-white transition-colors">
                  Hướng dẫn
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h6 className="text-white font-semibold mb-4">Tính năng</h6>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-400">
                <span className="text-green-400 mr-2">✓</span>
                Tự luận từ vựng
              </li>
              <li className="flex items-center text-gray-400">
                <span className="text-green-400 mr-2">✓</span>
                Tự luận ngữ pháp
              </li>
              <li className="flex items-center text-gray-400">
                <span className="text-green-400 mr-2">✓</span>
                Trắc nghiệm
              </li>
              <li className="flex items-center text-gray-400">
                <span className="text-green-400 mr-2">✓</span>
                Thống kê chi tiết
              </li>
            </ul>
          </div>

          {/* Developer Info */}
          <div>
            <h6 className="text-white font-semibold mb-4">Tác giả</h6>
            <div className="text-gray-400 space-y-3">
              <div className="flex items-center">
                <span className="mr-2">👤</span>
                <strong>Nguyễn Thanh Nhân</strong>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🎓</span>
                Sinh viên DHCNTT
              </div>
              <div className="flex items-center">
                <span className="mr-2">📧</span>
                <a 
                  href="mailto:npthanhnhan2003@gmail.com" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  npthanhnhan2003@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <span className="mr-2">💻</span>
                <a 
                  href="https://github.com/npthanhnhan2003" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  github.com/npthanhnhan2003
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 QuizSmart. Phát triển bởi <strong className="text-white">Nguyễn Thanh Nhân</strong>.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Chính sách bảo mật
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;