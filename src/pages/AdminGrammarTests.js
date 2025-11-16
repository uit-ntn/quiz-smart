import React from 'react';
import AdminLayout from '../layout/AdminLayout';

const AdminGrammarTests = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản Lý Bài Test Ngữ Pháp</h1>
            <p className="text-gray-600 mt-1">Quản lý tất cả bài test ngữ pháp trong hệ thống</p>
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tính Năng Đang Phát Triển
            </h2>
            
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Chức năng quản lý bài test ngữ pháp đang được phát triển và sẽ sớm có mặt trong phiên bản tới.
              Hiện tại bạn có thể sử dụng các tính năng quản lý bài test từ vựng và trắc nghiệm.
            </p>

            <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-xl p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-orange-900 mb-3">Tính năng sắp có:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-orange-600 mt-0.5">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-orange-800">Tạo bài test ngữ pháp</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-orange-600 mt-0.5">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-orange-800">Quản lý câu hỏi ngữ pháp</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-orange-600 mt-0.5">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-orange-800">Phân loại theo chủ đề ngữ pháp</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-orange-600 mt-0.5">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-orange-800">Thống kê và báo cáo</span>
                </div>
              </div>
            </div>

            {/* Alternative Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/admin/vocabulary-tests"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Quản lý Test Từ Vựng
              </a>
              
              <a
                href="/admin/multiple-choice-tests"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Quản lý Test Trắc Nghiệm
              </a>
            </div>
          </div>
        </div>

        {/* Development Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lộ trình phát triển</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Bài test từ vựng</h4>
                <p className="text-sm text-gray-500">Đã hoàn thành - Có thể tạo và quản lý bài test từ vựng</p>
              </div>
              <span className="text-sm text-green-600 font-medium">Hoàn thành ✓</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Bài test trắc nghiệm</h4>
                <p className="text-sm text-gray-500">Đã hoàn thành - Có thể tạo và quản lý bài test trắc nghiệm</p>
              </div>
              <span className="text-sm text-green-600 font-medium">Hoàn thành ✓</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Bài test ngữ pháp</h4>
                <p className="text-sm text-gray-500">Đang phát triển - Dự kiến hoàn thành trong phiên bản tiếp theo</p>
              </div>
              <span className="text-sm text-orange-600 font-medium">Đang phát triển ⏳</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminGrammarTests;