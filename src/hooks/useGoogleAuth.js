import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export const useGoogleAuth = () => {
  const { loginWithGoogle, handleGoogleCallback } = useAuth();
  const location = useLocation();

  const initiateGoogleLogin = (customReturnUrl = null) => {
    // Nếu không có customReturnUrl, dùng current location
    const returnUrl = customReturnUrl || (location.pathname + location.search);
    return loginWithGoogle(returnUrl);
  };

  const redirectToGoogleAuth = (fromPage = null) => {
    const returnUrl = fromPage || (location.pathname + location.search);
    const encodedReturnUrl = encodeURIComponent(returnUrl);
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    window.location.href = `${backendUrl}/auth/google?returnUrl=${encodedReturnUrl}`;
  };

  return {
    initiateGoogleLogin,
    redirectToGoogleAuth,
    handleGoogleCallback
  };
};

export default useGoogleAuth;