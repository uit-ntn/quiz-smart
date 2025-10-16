import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import QuizPage from '../pages/QuizPage';
import AboutPage from '../pages/AboutPage';
import HelpPage from '../pages/HelpPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/help" element={<HelpPage />} />
      {/* Future routes */}
      <Route path="/profile" element={<div className="container py-5 text-center"><h2>Trang hồ sơ (Đang phát triển)</h2></div>} />
      <Route path="/settings" element={<div className="container py-5 text-center"><h2>Cài đặt (Đang phát triển)</h2></div>} />
      <Route path="/privacy" element={<div className="container py-5 text-center"><h2>Chính sách bảo mật (Đang phát triển)</h2></div>} />
      <Route path="/terms" element={<div className="container py-5 text-center"><h2>Điều khoản sử dụng (Đang phát triển)</h2></div>} />
      {/* 404 Page */}
      <Route path="*" element={
        <div className="container py-5 text-center">
          <i className="bi bi-exclamation-triangle display-1 text-warning"></i>
          <h2 className="mt-3">Trang không tìm thấy</h2>
          <p className="text-muted">Trang bạn đang tìm kiếm không tồn tại.</p>
          <a href="/" className="btn btn-primary">Về trang chủ</a>
        </div>
      } />
    </Routes>
  );
};

export default AppRoutes;