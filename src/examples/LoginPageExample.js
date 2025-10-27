// Example usage trong LoginPage.js

import React from 'react';
import { useLocation } from 'react-router-dom';
import GoogleLoginButton from '../components/GoogleLoginButton';
import useGoogleAuth from '../hooks/useGoogleAuth';

const LoginPage = () => {
  const location = useLocation();
  const { redirectToGoogleAuth } = useGoogleAuth();
  
  // Lấy returnUrl từ state hoặc query params
  const returnUrl = location.state?.returnUrl || 
                   new URLSearchParams(location.search).get('returnUrl') ||
                   '/dashboard';

  const handleGoogleLogin = () => {
    // Cách 1: Dùng hook
    redirectToGoogleAuth(returnUrl);
  };

  return (
    <div className="login-form">
      <h1>Đăng nhập</h1>
      
      {/* Cách 1: Dùng GoogleLoginButton component */}
      <GoogleLoginButton 
        returnUrl={returnUrl}
        variant="google"
        className="w-full mb-4"
      />
      
      {/* Cách 2: Button custom với hook */}
      <button 
        onClick={handleGoogleLogin}
        className="btn btn-outline w-full"
      >
        Đăng nhập với Google (Custom)
      </button>
      
      {/* Form đăng nhập thường */}
      <form>
        {/* ... */}
      </form>
    </div>
  );
};

export default LoginPage;