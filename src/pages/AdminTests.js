import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../layout/AdminLayout';
import testService from '../services/testService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import TestDetailModal from '../components/TestDetailModal';
import DeleteTestModal from '../components/DeleteTestModal';
import Toast from '../components/Toast';
import CreateVocabularyTestModal from '../components/CreateVocabularyTestModal';
import CreateVocabularyWithAIModal from '../components/CreateVocabularyWithAIModal';
import CreateMultipleChoiceTestModal from '../components/CreateMultipleChoiceTestModal';

const AdminTests = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTestTypeModal, setShowTestTypeModal] = useState(false);
  const [showVocabularyModal, setShowVocabularyModal] = useState(false);
  const [showVocabularyTestModal, setShowVocabularyTestModal] = useState(false);
  const [showVocabularyAIModal, setShowVocabularyAIModal] = useState(false);
  const [showMultipleChoiceModal, setShowMultipleChoiceModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [testToDelete, setTestToDelete] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });
  
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

  // Toast helper function
  const showToast = (message, type = 'success') => {
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    filterTests();
  }, [tests, searchTerm, filterType, filterVisibility, filterDifficulty, filterStatus, sortBy, sortOrder, dateFrom, dateTo]);

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

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Sort icon component
  const SortIcon = ({ field }) => {
    if (sortBy !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (sortOrder === 'asc') {
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
        </svg>
      );
    }
  };

  const filterTests = () => {
    let filtered = [...tests];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.test_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.main_topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.sub_topic?.toLowerCase().includes(searchTerm.toLowerCase())
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

    // Filter by difficulty
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(test => test.difficulty === filterDifficulty);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(test => test.status === filterStatus);
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(test => new Date(test.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(test => new Date(test.created_at) <= new Date(dateTo));
    }

    // Sort tests
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'test_title':
          aVal = a.test_title?.toLowerCase() || '';
          bVal = b.test_title?.toLowerCase() || '';
          break;
        case 'total_questions':
          aVal = a.total_questions || 0;
          bVal = b.total_questions || 0;
          break;
        case 'created_at':
          aVal = new Date(a.created_at || 0);
          bVal = new Date(b.created_at || 0);
          break;
        case 'updated_at':
          aVal = new Date(a.updated_at || 0);
          bVal = new Date(b.updated_at || 0);
          break;
        default:
          aVal = a[sortBy] || '';
          bVal = b[sortBy] || '';
      }

      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    setFilteredTests(filtered);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTests = filteredTests.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterVisibility, filterDifficulty, filterStatus, sortBy, sortOrder, dateFrom, dateTo]);

  const handleCreateClick = () => {
    setShowTestTypeModal(true);
  };

  const handleTestTypeSelect = (testType) => {
    setShowCreateModal(false);
    if (testType === 'vocabulary') {
      // Hiển thị modal chọn tạo vocabulary (manual hoặc AI)
      setShowVocabularyModal(true);
    } else if (testType === 'multiple_choice') {
      setShowMultipleChoiceModal(true);
    } else if (testType === 'grammar') {
      // TODO: Implement grammar test creation
      showToast('Grammar test chưa được hỗ trợ', 'warning');
    }
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
      showToast('Tạo test thành công!', 'success');
    } catch (err) {
      console.error('Error creating test:', err);
      showToast('Không thể tạo test. Vui lòng thử lại!', 'error');
    }
  };

  const handleDeleteClick = (test) => {
    setTestToDelete(test);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (deleteType) => {
    if (!testToDelete) return;

    try {
      console.log('Delete operation details:', {
        testId: testToDelete._id,
        deleteType,
        userRole: user?.role,
        testCreatedBy: testToDelete.created_by,
        currentUserId: user?._id
      });
      
      if (deleteType === 'soft') {
        console.log('Calling softDeleteTest...');
        await testService.softDeleteTest(testToDelete._id);
      } else {
        console.log('Calling hardDeleteTest...');
        await testService.hardDeleteTest(testToDelete._id);
      }

      console.log(`${deleteType} delete successful, refreshing list...`);
      await fetchTests(); // Refresh the list
      setShowDeleteModal(false);
      setTestToDelete(null);
      
      // Show success toast
      showToast(`Xóa test thành công (${deleteType === 'soft' ? 'xóa mềm' : 'xóa cứng'})`, 'success');
    } catch (err) {
      console.error('Error deleting test:', err);
      
      // More detailed error message
      let errorMessage = err.message || 'Lỗi không xác định';
      if (err.message.includes('403') || err.message.includes('Access denied')) {
        errorMessage = 'Bạn không có quyền xóa test này. Chỉ admin hoặc người tạo test mới được xóa.';
      } else if (err.message.includes('401') || err.message.includes('Authentication')) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (err.message.includes('404') || err.message.includes('not found')) {
        errorMessage = 'Test không tồn tại hoặc đã bị xóa.';
      }
      
      showToast(`Không thể xóa test: ${errorMessage}`, 'error');
    }
  };

  const handleDetailClick = (testId) => {
    setSelectedTestId(testId);
    setShowDetailModal(true);
  };

  const handleTestUpdated = () => {
    fetchTests(); // Refresh the list when test is updated
    showToast('Cập nhật test thành công!', 'success');
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

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner message="Đang tải danh sách tests..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý Tests</h1>
            <p className="text-gray-600 mt-1">Tổng số: {filteredTests.length} tests</p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={fetchTests}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Làm mới</span>
            </button>
            <button
              onClick={handleCreateClick}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Tạo test mới</span>
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Advanced Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Bộ lọc và tìm kiếm</h2>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterVisibility('all');
                setFilterDifficulty('all');
                setFilterStatus('all');
                setDateFrom('');
                setDateTo('');
                setSortBy('created_at');
                setSortOrder('desc');
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Xóa bộ lọc
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Tìm kiếm
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên, mô tả, chủ đề..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Filter Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Loại test
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="all">Tất cả loại</option>
                <option value="vocabulary">📚 Từ vựng</option>
                <option value="multiple_choice">✅ Trắc nghiệm</option>
                <option value="grammar">📖 Ngữ pháp</option>
              </select>
            </div>

            {/* Filter Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👁️ Hiển thị
              </label>
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="public">🌍 Công khai</option>
                <option value="private">🔒 Riêng tư</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Filter Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⭐ Độ khó
              </label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="easy">🟢 Dễ</option>
                <option value="medium">🟡 Trung bình</option>
                <option value="hard">🔴 Khó</option>
              </select>
            </div>

            {/* Filter Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔄 Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="active">✅ Hoạt động</option>
                <option value="draft">📝 Nháp</option>
                <option value="archived">📦 Lưu trữ</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Từ ngày
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Đến ngày
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Spacer for responsive layout */}
            <div className="hidden lg:block"></div>
          </div>

          {/* Filter Summary */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 gap-2">
            <div className="text-sm text-gray-600">
              Hiển thị <span className="font-medium text-gray-900">{filteredTests.length}</span> / {tests.length} test
              {(searchTerm || filterType !== 'all' || filterVisibility !== 'all' || filterDifficulty !== 'all' || filterStatus !== 'all' || dateFrom || dateTo) && (
                <span className="ml-2 text-blue-600">• Đã áp dụng bộ lọc</span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Sắp xếp theo {sortBy === 'created_at' ? 'ngày tạo' : sortBy === 'updated_at' ? 'ngày sửa' : sortBy === 'test_title' ? 'tên test' : 'số câu hỏi'} ({sortOrder === 'asc' ? 'tăng dần' : 'giảm dần'})
            </div>
          </div>
        </div>

        {/* Tests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12 sm:w-16">
                    STT
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    <button 
                      onClick={() => handleSort('test_title')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Tên Test</span>
                      <SortIcon field="test_title" />
                    </button>
                  </th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    <button 
                      onClick={() => handleSort('test_type')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Loại</span>
                      <SortIcon field="test_type" />
                    </button>
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    <button 
                      onClick={() => handleSort('total_questions')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Số câu</span>
                      <SortIcon field="total_questions" />
                    </button>
                  </th>
                  <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    <button 
                      onClick={() => handleSort('created_by')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Người tạo</span>
                      <SortIcon field="created_by" />
                    </button>
                  </th>
                  <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                    <button 
                      onClick={() => handleSort('created_at')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Ngày tạo</span>
                      <SortIcon field="created_at" />
                    </button>
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    <button 
                      onClick={() => handleSort('visibility')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Hiển thị</span>
                      <SortIcon field="visibility" />
                    </button>
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || filterType !== 'all' || filterVisibility !== 'all'
                        ? 'Không tìm thấy test nào phù hợp'
                        : 'Chưa có test nào'}
                    </td>
                  </tr>
                ) : (
                  paginatedTests.map((test, index) => (
                    <tr key={test._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {test.test_title}
                        </div>
                        {test.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs sm:max-w-sm">
                            {test.description}
                          </div>
                        )}
                        {/* Mobile-only info */}
                        <div className="sm:hidden text-xs text-gray-500 mt-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${test.test_type === 'vocabulary' ? 'bg-purple-100 text-purple-800' :
                                test.test_type === 'multiple_choice' ? 'bg-blue-100 text-blue-800' :
                                  test.test_type === 'grammar' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                              }`}>
                              {test.test_type === 'vocabulary' ? 'Từ vựng' :
                                test.test_type === 'multiple_choice' ? 'Trắc nghiệm' :
                                  test.test_type === 'grammar' ? 'Ngữ pháp' :
                                    test.test_type}
                            </span>
                            <span>{test.total_questions || 0} câu</span>
                          </div>
                          <div>{new Date(test.created_at).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${test.test_type === 'vocabulary' ? 'bg-purple-100 text-purple-800' :
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
                      <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {test.total_questions || 0}
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {test.created_by?.full_name?.[0]?.toUpperCase() ||
                              test.created_by?.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-[100px]">
                              {test.created_by?.full_name || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[100px]">
                              {test.created_by?.email || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="text-sm text-gray-900">
                          {new Date(test.created_at).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(test.created_at).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${test.visibility === 'public' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                          {test.visibility === 'public' ? '🌍 Công khai' : '🔒 Riêng tư'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleDetailClick(test._id)}
                            className="text-blue-600 hover:text-blue-900 p-1 sm:p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(test)}
                            className="text-red-600 hover:text-red-900 p-1 sm:p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-700">Hiển thị</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-gray-700">trên trang</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 border border-gray-300 rounded text-sm ${
                        currentPage === pageNum 
                          ? 'bg-blue-500 text-white border-blue-500' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 py-1 text-sm text-gray-500">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
            
            <div className="text-sm text-gray-700 text-center sm:text-left">
              Trang {currentPage} / {totalPages} 
              <span className="block sm:inline sm:ml-2">
                (Tổng: {filteredTests.length} tests)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Type Selection Modal */}
      {showTestTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Chọn loại test</h3>
            <div className="grid gap-3">
              <button
                onClick={() => {
                  setShowTestTypeModal(false);
                  handleTestTypeSelect('vocabulary');
                }}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
              >
                <div className="font-semibold text-lg">📚 Vocabulary Test</div>
                <div className="text-gray-600 text-sm">Tạo bài test từ vựng</div>
              </button>
              
              <button
                onClick={() => {
                  setShowTestTypeModal(false);
                  handleTestTypeSelect('multiple_choice');
                }}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
              >
                <div className="font-semibold text-lg">✅ Multiple Choice Test</div>
                <div className="text-gray-600 text-sm">Tạo bài test trắc nghiệm</div>
              </button>
              
              <button
                onClick={() => {
                  setShowTestTypeModal(false);
                  handleTestTypeSelect('grammar');
                }}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
              >
                <div className="font-semibold text-lg">📖 Grammar Test</div>
                <div className="text-gray-600 text-sm">Tạo bài test ngữ pháp</div>
              </button>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowTestTypeModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteTestModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTestToDelete(null);
        }}
        test={testToDelete}
        onDeleteConfirmed={handleDeleteConfirm}
      />

      {/* Test Detail Modal */}
      <TestDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTestId(null);
        }}
        testId={selectedTestId}
        onTestUpdated={handleTestUpdated}
      />

      {/* Toast */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />

      {/* Vocabulary Type Selection Modal */}
      {showVocabularyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Chọn cách tạo Vocabulary Test</h3>
            <div className="grid gap-3">
              <button
                onClick={() => {
                  setShowVocabularyModal(false);
                  setShowVocabularyAIModal(true);
                }}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
              >
                <div className="font-semibold text-lg">Tạo với AI</div>
                <div className="text-gray-600 text-sm">Nhập topic và để AI tạo từ vựng</div>
              </button>
              
              <button
                onClick={() => {
                  setShowVocabularyModal(false);
                  setShowVocabularyTestModal(true);
                }}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
              >
                <div className="font-semibold text-lg">Tạo thủ công</div>
                <div className="text-gray-600 text-sm">Nhập từ vựng và định nghĩa</div>
              </button>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowVocabularyModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multiple Choice Creation Modal */}
      <CreateMultipleChoiceTestModal
        show={showMultipleChoiceModal}
        onClose={() => {
          setShowMultipleChoiceModal(false);
          fetchTests(); // Refresh tests list
        }}
      />

      {/* Vocabulary AI Modal */}
      <CreateVocabularyWithAIModal
        isOpen={showVocabularyAIModal}
        onClose={() => setShowVocabularyAIModal(false)}
        onTestCreated={() => {
          setShowVocabularyAIModal(false);
          fetchTests();
          showToast('Vocabulary test với AI đã được tạo thành công!', 'success');
        }}
      />

      {/* Vocabulary Manual Modal */}
      <CreateVocabularyTestModal
        show={showVocabularyTestModal}
        onClose={() => {
          setShowVocabularyTestModal(false);
          fetchTests(); // Refresh tests list
        }}
      />
    </AdminLayout>
  );
};

export default AdminTests;
