import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import testService from '../services/testService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AdminTests = () => {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [formData, setFormData] = useState({
    test_title: '',
    description: '',
    test_type: 'vocabulary',
    main_topic: '',
    sub_topic: '',
    total_questions: 10,
    duration_minutes: 15,
    visibility: 'public'
  });

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    filterTests();
  }, [tests, searchTerm, filterType, filterVisibility]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await testService.getAllTests();
      setTests(data);
    } catch (err) {
      setError('Không thể tải danh sách tests');
      console.error('Error fetching tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    let filtered = [...tests];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.test_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(test => test.test_type === filterType);
    }

    // Filter by visibility
    if (filterVisibility !== 'all') {
      filtered = filtered.filter(test => test.visibility === filterVisibility);
    }

    setFilteredTests(filtered);
  };

  const handleCreateClick = () => {
    setFormData({
      test_title: '',
      description: '',
      test_type: 'vocabulary',
      main_topic: '',
      sub_topic: '',
      total_questions: 10,
      duration_minutes: 15,
      visibility: 'public'
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const newTest = await testService.createTest(formData);
      setTests([newTest, ...tests]);
      setShowCreateModal(false);
      setFormData({
        test_title: '',
        description: '',
        test_type: 'vocabulary',
        main_topic: '',
        sub_topic: '',
        total_questions: 10,
        duration_minutes: 15,
        visibility: 'public'
      });
    } catch (err) {
      console.error('Error creating test:', err);
      alert('Không thể tạo test. Vui lòng thử lại!');
    }
  };

  const handleDeleteClick = (test) => {
    setTestToDelete(test);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!testToDelete) return;

    try {
      await testService.deleteTest(testToDelete._id);
      setTests(tests.filter(t => t._id !== testToDelete._id));
      setShowDeleteModal(false);
      setTestToDelete(null);
    } catch (err) {
      console.error('Error deleting test:', err);
      alert('Không thể xóa test. Vui lòng thử lại!');
    }
  };

  const TestForm = ({ onSubmit, buttonText }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tên test <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.test_title}
          onChange={(e) => setFormData({ ...formData, test_title: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Nhập tên test..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Mô tả về test..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại test <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.test_type}
            onChange={(e) => setFormData({ ...formData, test_type: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="vocabulary">Từ vựng</option>
            <option value="multiple_choice">Trắc nghiệm</option>
            <option value="grammar">Ngữ pháp</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hiển thị <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.visibility}
            onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="public">🌍 Công khai</option>
            <option value="private">🔒 Riêng tư</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Topic <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.main_topic}
            onChange={(e) => setFormData({ ...formData, main_topic: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="VD: Vocabulary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sub Topic <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.sub_topic}
            onChange={(e) => setFormData({ ...formData, sub_topic: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="VD: Education"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số câu hỏi <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.total_questions}
            onChange={(e) => setFormData({ ...formData, total_questions: parseInt(e.target.value) })}
            required
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thời gian (phút) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
            required
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={() => setShowCreateModal(false)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </form>
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
          Bạn có chắc chắn muốn xóa test <strong>"{testToDelete?.test_title}"</strong>?
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
        <LoadingSpinner message="Đang tải danh sách tests..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Tests</h1>
            <p className="text-gray-600 mt-1">Tổng số: {filteredTests.length} tests</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button
              onClick={fetchTests}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Làm mới</span>
            </button>
            <button
              onClick={handleCreateClick}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Tạo test mới</span>
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên test..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Filter Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại test
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="vocabulary">Từ vựng</option>
                <option value="multiple_choice">Trắc nghiệm</option>
                <option value="grammar">Ngữ pháp</option>
              </select>
            </div>

            {/* Filter Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hiển thị
              </label>
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="public">Công khai</option>
                <option value="private">Riêng tư</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên Test
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số câu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hiển thị
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || filterType !== 'all' || filterVisibility !== 'all'
                        ? 'Không tìm thấy test nào phù hợp'
                        : 'Chưa có test nào'}
                    </td>
                  </tr>
                ) : (
                  filteredTests.map((test) => (
                    <tr key={test._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {test.test_title}
                        </div>
                        {test.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {test.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          test.test_type === 'vocabulary' ? 'bg-purple-100 text-purple-800' :
                          test.test_type === 'multiple_choice' ? 'bg-blue-100 text-blue-800' :
                          test.test_type === 'grammar' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {test.test_type === 'vocabulary' ? 'Từ vựng' :
                           test.test_type === 'multiple_choice' ? 'Trắc nghiệm' :
                           test.test_type === 'grammar' ? 'Ngữ pháp' :
                           test.test_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {test.total_questions || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {test.created_by?.full_name?.[0]?.toUpperCase() || 
                             test.created_by?.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">
                              {test.created_by?.full_name || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {test.created_by?.email || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          test.visibility === 'public' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {test.visibility === 'public' ? '🌍 Công khai' : '🔒 Riêng tư'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/tests/${test._id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(test)}
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
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Tạo test mới</h3>
            <TestForm onSubmit={handleCreateSubmit} buttonText="Tạo test" />
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && <DeleteModal />}
    </AdminLayout>
  );
};

export default AdminTests;
