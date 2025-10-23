import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Đang xử lý đăng nhập...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get token from URL parameters 
        const token = searchParams.get('token');
        const error = searchParams.get('error'); 
        
        // Check if this is a failure callback
        const isFailure = window.location.pathname.includes('/auth/failure');

        console.log('AuthCallback received params:', {
          token: token ? token.substring(0, 20) + '...' : null,
          tokenLength: token ? token.length : 0,
          error,
          isFailure,
          allParams: Object.fromEntries(searchParams.entries()),
          fullURL: window.location.href,
          pathname: window.location.pathname
        });

        // Handle failure callback
        if (isFailure || error) {
          console.error('Google OAuth failure:', error || 'Authentication failed');
          throw new Error(`Đăng nhập Google thất bại: ${error || 'Không thể xác thực với Google'}`);
        }

        if (!token) {
          console.error('No token in callback URL');
          console.error('Available search params:', Object.fromEntries(searchParams.entries()));
          console.error('Current URL:', window.location.href);
          
          // If no token and no error, something went wrong
          throw new Error('Không nhận được token từ server. Vui lòng kiểm tra backend server.');
        }

        console.log('Processing token:', {
          tokenPrefix: token.substring(0, 50),
          tokenLength: token.length,
          isJWT: token.includes('.'),
          tokenParts: token.split('.').length
        });

        // Validate token format (JWT should have 3 parts)
        if (!token.includes('.') || token.split('.').length !== 3) {
          console.error('Invalid token format - not a JWT');
          throw new Error('Token không hợp lệ. Vui lòng thử lại.');
        }

        // Handle Google OAuth callback
        const result = await authService.handleGoogleCallback(token);
        
        if (result && result.user) {
          console.log('Authentication successful, refreshing context...');
          
          // Refresh auth context with new user data
          await refreshAuth();
          
          setStatus('success');
          setMessage('Đăng nhập thành công! Đang chuyển hướng...');
          
          // Get the return URL from localStorage if it exists
          const returnTo = localStorage.getItem('authReturnTo') || '/';
          localStorage.removeItem('authReturnTo');
          
          console.log('Redirecting to:', returnTo);
          
          // Redirect after 1.5 seconds
          setTimeout(() => {
            navigate(returnTo, { replace: true });
          }, 1500);
        } else {
          throw new Error('Phản hồi xác thực không hợp lệ từ server');
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          url: window.location.href,
          searchParams: Object.fromEntries(searchParams.entries())
        });
        
        // Clean up any invalid token/user data immediately
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('authReturnTo');
        
        setStatus('error');
        
        let errorMessage = 'Có lỗi xảy ra trong quá trình đăng nhập';
        
        if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
          errorMessage = 'Không thể kết nối tới backend server. Vui lòng khởi động backend server trên port 8000.';
        } else if (error.message?.includes('401') || error.message?.includes('Token validation failed')) {
          errorMessage = 'Token không hợp lệ hoặc backend server chưa chạy. Vui lòng khởi động backend server.';
        } else if (error.message?.includes('Session expired')) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng thử lại.';
        } else if (error.message?.includes('Invalid token')) {
          errorMessage = 'Token không hợp lệ. Vui lòng thử lại.';
        } else if (error.message?.includes('Không nhận được token')) {
          errorMessage = 'Backend server không trả về token. Vui lòng kiểm tra cấu hình Google OAuth trong backend.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setMessage(errorMessage);
        
        // Redirect to login page after 4 seconds for better UX
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Đăng nhập Google thất bại. Vui lòng thử lại hoặc kiểm tra backend server.' 
            },
            replace: true
          });
        }, 4000);
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, refreshAuth]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang xử lý</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-900 mb-2">Thành công!</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-900 mb-2">Có lỗi xảy ra</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Quay lại đăng nhập
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;