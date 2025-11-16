import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../layout/AdminLayout';
import testResultService from '../services/testResultService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AdminTestResults = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [resultToDelete, setResultToDelete] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [results, searchTerm, filterStatus]);

  useEffect(() => {
    // reset page when filters change
    setCurrentPage(1);
  }, [searchTerm, filterStatus, itemsPerPage]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await testResultService.getAllTestResults();
      setResults(data);
    } catch (err) {
      setError('Không thể tải danh sách kết quả');
      console.error('Error fetching test results:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = [...results];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.test_id?.test_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.user_id?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.user_id?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(result => result.status === filterStatus);
    }

    setFilteredResults(filtered);
  };

  // Paginated slice for UI
  const paginatedResults = (() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredResults.slice(start, end);
  })();

  const totalPages = Math.max(1, Math.ceil((filteredResults.length || 0) / itemsPerPage));

  const handleDeleteClick = (result) => {
    setResultToDelete(result);
    setShowDeleteModal(true);
  };

  const handleDetailClick = (result) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!resultToDelete) return;

    try {
      // Use soft delete (mark as deleted) to match backend behavior
      await testResultService.softDeleteTestResult(resultToDelete._id);
      // Remove from local state so UI updates immediately
      setResults(results.filter(r => r._id !== resultToDelete._id));
      setShowDeleteModal(false);
      setResultToDelete(null);
    } catch (err) {
      console.error('Error deleting result:', err);
      alert('Không thể xóa kết quả. Vui lòng thử lại!');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedResult) return;
    try {
      setLoading(true);
      await testResultService.updateTestResultStatus(selectedResult._id, newStatus);
      // Refresh selected result and list
      const refreshed = await testResultService.getTestResultById(selectedResult._id);
      setSelectedResult(refreshed);
      await fetchResults();
      alert('Cập nhật trạng thái thành công');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Không thể cập nhật trạng thái.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const DetailModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-900">Chi tiết kết quả test</h3>
          <button
            onClick={() => setShowDetailModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User & Test Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Thông tin User</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedResult?.user_id?.full_name?.[0]?.toUpperCase() || 
                   selectedResult?.user_id?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedResult?.user_id?.full_name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{selectedResult?.user_id?.email || ''}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3">Thông tin Test</h4>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-gray-700">Tên test:</span>{' '}
                <span className="text-gray-900">{selectedResult?.test_id?.test_title || 'Unknown'}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Loại:</span>{' '}
                <span className="text-gray-900">
                  {selectedResult?.test_id?.test_type === 'vocabulary' ? 'Từ vựng' :
                   selectedResult?.test_id?.test_type === 'multiple_choice' ? 'Trắc nghiệm' :
                   selectedResult?.test_id?.test_type || 'N/A'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Điểm</p>
              <p className={`text-3xl font-bold ${getScoreColor(selectedResult?.score || 0)}`}>
                {selectedResult?.score}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Đúng</p>
              <p className="text-3xl font-bold text-green-600">{selectedResult?.correct_answers || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Tổng</p>
              <p className="text-3xl font-bold text-gray-900">{selectedResult?.total_questions || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Thời gian</p>
              <p className="text-3xl font-bold text-blue-600">
                {selectedResult?.time_taken ? `${Math.floor(selectedResult.time_taken / 60)}:${(selectedResult.time_taken % 60).toString().padStart(2, '0')}` : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Answers Details */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Chi tiết câu trả lời</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedResult?.answers && selectedResult.answers.length > 0 ? (
              selectedResult.answers.map((answer, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-4 ${
                    answer.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        answer.is_correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {answer.question_text || answer.word || `Câu ${index + 1}`}
                        </p>
                      </div>
                    </div>
                    {answer.is_correct ? (
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-11 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Trả lời:</span>{' '}
                      <span className="text-gray-900">{answer.user_answer || 'Không trả lời'}</span>
                    </p>
                    {!answer.is_correct && answer.correct_answer && (
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Đáp án đúng:</span>{' '}
                        <span className="text-green-600 font-medium">{answer.correct_answer}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Không có chi tiết câu trả lời</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowDetailModal(false)}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
            <p className="text-sm text-gray-600">Hành động này không thể hoàn tác</p>
          </div>
        </div>
        <p className="text-gray-700 mb-6">
          Bạn có chắc chắn muốn xóa kết quả test này?
        </p>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleDeleteConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner message="Đang tải danh sách kết quả..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kết quả Test</h1>
            <p className="text-gray-600 mt-1">Tổng số: {filteredResults.length} kết quả</p>
          </div>
          <button
            onClick={fetchResults}
            className="mt-4 md:mt-0 flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Làm mới</span>
          </button>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên test hoặc user..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Filter Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="draft">Nháp</option>
                <option value="active">Hoàn thành</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Điểm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày làm
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || filterStatus !== 'all'
                        ? 'Không tìm thấy kết quả nào phù hợp'
                        : 'Chưa có kết quả nào'}
                    </td>
                  </tr>
                ) : (
                  paginatedResults.map((result) => (
                    <tr key={result._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {result.user_id?.full_name?.[0]?.toUpperCase() || 
                             result.user_id?.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {result.user_id?.full_name || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {result.user_id?.email || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {result.test_id?.test_title || 'Unknown Test'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.test_id?.test_type === 'vocabulary' ? 'Từ vựng' :
                           result.test_id?.test_type === 'multiple_choice' ? 'Trắc nghiệm' :
                           result.test_id?.test_type || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                          {result.score}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.correct_answers}/{result.total_questions}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.time_taken ? `${Math.floor(result.time_taken / 60)}:${(result.time_taken % 60).toString().padStart(2, '0')}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          result.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {result.status === 'active' ? 'Hoàn thành' : 'Nháp'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(result.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleDetailClick(result)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(result)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Hiển thị {filteredResults.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredResults.length)} trong {filteredResults.length} kết quả
          </div>
          <div className="flex items-center gap-2">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))}
              className="px-2 py-1 border border-gray-300 rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                «
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                ‹
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map((_, idx) => {
                  const pageNum = Math.max(1, currentPage - 2) + idx;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded ${currentPage === pageNum ? 'bg-indigo-600 text-white' : 'border'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                ›
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                »
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedResult && <DetailModal />}

      {/* Delete Modal */}
      {showDeleteModal && <DeleteModal />}
    </AdminLayout>
  );
};

export default AdminTestResults;
