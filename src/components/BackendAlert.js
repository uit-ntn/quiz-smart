import React from 'react';

const BackendAlert = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Backend Server Chưa Chạy</h3>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Để sử dụng tính năng đăng nhập Google, bạn cần khởi động backend server trước.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">Cách khởi động backend:</h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Mở terminal/command prompt</li>
                <li>Navigate đến folder backend</li>
                <li>Chạy lệnh: <code className="bg-gray-200 px-1 rounded">npm start</code></li>
                <li>Đợi server chạy trên port 8000</li>
              </ol>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                💡 <strong>Tip:</strong> Bạn có thể sử dụng file <code>start-backend.bat</code> để khởi động backend dễ dàng hơn.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                window.open('http://localhost:8000', '_blank');
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kiểm tra Backend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendAlert;