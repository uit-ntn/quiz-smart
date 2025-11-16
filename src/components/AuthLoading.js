import React from 'react';

const AuthLoading = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 text-sm">Đang xác thực...</p>
      </div>
    </div>
  );
};

export default AuthLoading;