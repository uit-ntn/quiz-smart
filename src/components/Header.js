import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Trang chủ', icon: 'bi-house-fill' },
    { path: '/quiz', label: 'Làm Quiz', icon: 'bi-play-circle-fill' },
    { path: '/about', label: 'Giới thiệu', icon: 'bi-info-circle-fill' },
    { path: '/help', label: 'Hướng dẫn', icon: 'bi-question-circle-fill' }
  ];

  return (
    <header className="bg-white shadow-sm border-bottom sticky-top">
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container">
          {/* Brand */}
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <div className="brand-icon me-3">
              <i className="bi bi-mortarboard-fill fs-2 text-primary"></i>
            </div>
            <div>
              <h4 className="mb-0 fw-bold text-primary">QuizSmart</h4>
              <small className="text-muted">Học từ vựng thông minh</small>
            </div>
          </Link>

          {/* Mobile toggle */}
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {navItems.map((item) => (
                <li className="nav-item" key={item.path}>
                  <Link 
                    className={`nav-link px-3 py-2 rounded-pill mx-1 ${
                      location.pathname === item.path 
                        ? 'active bg-primary text-white' 
                        : 'text-dark hover-bg-light'
                    }`}
                    to={item.path}
                  >
                    <i className={`${item.icon} me-2`}></i>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* User actions */}
            <div className="d-flex align-items-center ms-3">
              <div className="dropdown">
                <button 
                  className="btn btn-outline-primary dropdown-toggle" 
                  type="button" 
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-person-circle me-2"></i>
                  Tài khoản
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person me-2"></i>
                      Hồ sơ
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/settings">
                      <i className="bi bi-gear me-2"></i>
                      Cài đặt
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to="/logout">
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Đăng xuất
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-light border-top">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb py-2 mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none">
                  <i className="bi bi-house me-1"></i>
                  Trang chủ
                </Link>
              </li>
              {location.pathname !== '/' && (
                <li className="breadcrumb-item active">
                  {navItems.find(item => item.path === location.pathname)?.label || 'Trang hiện tại'}
                </li>
              )}
            </ol>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;