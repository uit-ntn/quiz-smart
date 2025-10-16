import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-auto">
      <div className="container py-5">
        <div className="row g-4">
          {/* Brand and description */}
          <div className="col-lg-4">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-mortarboard-fill fs-3 text-primary me-3"></i>
              <h5 className="mb-0 text-white">QuizSmart</h5>
            </div>
            <p className="text-muted mb-3">
              Ứng dụng học từ vựng thông minh với nhiều chế độ quiz đa dạng, 
              giúp bạn nâng cao vốn từ vựng một cách hiệu quả.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-white">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="#" className="text-white">
                <i className="bi bi-twitter fs-5"></i>
              </a>
              <a href="#" className="text-white">
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a href="#" className="text-white">
                <i className="bi bi-youtube fs-5"></i>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-lg-2 col-md-6">
            <h6 className="text-white mb-3">Liên kết nhanh</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none hover-text-white">
                  Trang chủ
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/quiz" className="text-muted text-decoration-none hover-text-white">
                  Làm Quiz
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-muted text-decoration-none hover-text-white">
                  Giới thiệu
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/help" className="text-muted text-decoration-none hover-text-white">
                  Hướng dẫn
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white mb-3">Tính năng</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <span className="text-muted">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Quiz từ vựng
                </span>
              </li>
              <li className="mb-2">
                <span className="text-muted">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Quiz nghĩa
                </span>
              </li>
              <li className="mb-2">
                <span className="text-muted">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Quiz nghe
                </span>
              </li>
              <li className="mb-2">
                <span className="text-muted">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Cài đặt giọng đọc
                </span>
              </li>
            </ul>
          </div>

          {/* Developer Info */}
          <div className="col-lg-3">
            <h6 className="text-white mb-3">Tác giả</h6>
            <div className="text-muted">
              <div className="mb-2">
                <i className="bi bi-person-fill me-2"></i>
                <strong>Nguyễn Thanh Nhân</strong>
              </div>
              <div className="mb-2">
                <i className="bi bi-mortarboard me-2"></i>
                Sinh viên DHCNTT
              </div>
              <div className="mb-2">
                <i className="bi bi-envelope me-2"></i>
                <a href="mailto:npthanhnhan2003@gmail.com" className="text-muted text-decoration-none hover-text-white">
                  npthanhnhan2003@gmail.com
                </a>
              </div>
              <div className="mb-3">
                <i className="bi bi-github me-2"></i>
                <a href="https://github.com/npthanhnhan2003" target="_blank" rel="noopener noreferrer" className="text-muted text-decoration-none hover-text-white">
                  github.com/npthanhnhan2003
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-top border-secondary">
        <div className="container py-3">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="text-muted mb-0">
                © 2025 QuizSmart. Phát triển bởi <strong>Nguyễn Thanh Nhân</strong>.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <Link to="/privacy" className="text-muted text-decoration-none me-3">
                Chính sách bảo mật
              </Link>
              <Link to="/terms" className="text-muted text-decoration-none">
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