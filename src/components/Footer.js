import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-auto bg-gradient-to-b from-slate-50 to-slate-100 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-white grid place-items-center mr-2">
                <svg
                  className="w-[16px] h-[16px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1M21 12h-1M4 12H3" />
                </svg>
              </div>
              <h5 className="text-lg font-bold text-slate-900">QuizSmart</h5>
            </div>
            <p className="text-slate-600">
              Nền tảng luyện tập thông minh cho trắc nghiệm, ngữ pháp và từ vựng.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h6 className="text-sm font-semibold text-slate-900 mb-3">Liên kết nhanh</h6>
            <ul className="space-y-2 text-slate-600">
              <li><Link to="/" className="hover:text-slate-900">Trang chủ</Link></li>
              <li><Link to="/multiple-choice/topics" className="hover:text-slate-900">Trắc nghiệm</Link></li>
              <li><Link to="/grammar/topics" className="hover:text-slate-900">Ngữ pháp</Link></li>
              <li><Link to="/vocabulary/topics" className="hover:text-slate-900">Từ vựng</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h6 className="text-sm font-semibold text-slate-900 mb-3">Tài nguyên</h6>
            <ul className="space-y-2 text-slate-600">
              <li><Link to="/help" className="hover:text-slate-900">Hướng dẫn</Link></li>
              <li><Link to="/about" className="hover:text-slate-900">Giới thiệu</Link></li>
              <li><a href="https://github.com/npthanhnhan2003" target="_blank" rel="noreferrer" className="hover:text-slate-900">GitHub</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h6 className="text-sm font-semibold text-slate-900 mb-3">Liên hệ</h6>
            <ul className="space-y-2 text-slate-600">
              <li>
                <a href="mailto:npthanhnhan2003@gmail.com" className="hover:text-slate-900">
                  npthanhnhan2003@gmail.com
                </a>
              </li>
              <li>TP. Hồ Chí Minh, Việt Nam</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white/70">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} QuizSmart. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/privacy" className="text-slate-600 hover:text-slate-900">Chính sách bảo mật</Link>
            <Link to="/terms" className="text-slate-600 hover:text-slate-900">Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
