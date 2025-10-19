import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import testService from '../services/testService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import TopicCard from '../components/TopicCard';
import EmptyState from '../components/EmptyState';
import Breadcrumb from '../components/Breadcrumb';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';

const MultipleChoiceTopicDetail = () => {
  const { mainTopic } = useParams();
  const [allSubTopics, setAllSubTopics] = useState([]);
  const [filteredSubTopics, setFilteredSubTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Filter state
  const [filters, setFilters] = useState({
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  useEffect(() => {
    fetchSubTopics();
  }, [mainTopic]);

  useEffect(() => {
    applyFilters();
  }, [allSubTopics, filters]);

  const fetchSubTopics = async () => {
    try {
      setLoading(true);
      const response = await testService.getMultipleChoiceSubTopicsByMainTopic(mainTopic);
      setAllSubTopics(response || []);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách chủ đề con. Vui lòng thử lại sau.');
      console.error('Error fetching sub topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allSubTopics];

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(subTopic =>
        subTopic.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a.toLowerCase();
      const bValue = b.toLowerCase();
      
      if (filters.sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    setFilteredSubTopics(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredSubTopics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubTopics = filteredSubTopics.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const breadcrumbItems = [
    { label: 'Chủ đề', href: '/multiple-choice/topics' },
    { label: mainTopic }
  ];

  if (loading) {
    return <LoadingSpinner message="Đang tải danh sách chủ đề con..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchSubTopics} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="max-w-full mx-auto">
        <div className="lg:grid lg:grid-cols-5 lg:gap-6 lg:px-6 lg:py-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              filterOptions={{
                showDifficulty: false,
                showStatus: false,
                showQuestionCount: false
              }}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4 px-4 sm:px-6 lg:px-0 py-8 lg:py-0">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="bg-gradient-to-br from-green-500 to-teal-600 p-3 rounded-xl mr-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{mainTopic}</h1>
                    <p className="text-gray-300">Chọn chủ đề con để xem danh sách bài kiểm tra</p>
                  </div>
                </div>

                {/* Mobile filter button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-800 text-sm font-medium text-gray-200 hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                  Bộ lọc
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-300">
                  <div className="flex items-center">
                    <div className="bg-green-50 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Tổng chủ đề con</p>
                      <p className="text-lg font-semibold text-gray-900">{allSubTopics.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-300">
                  <div className="flex items-center">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Đã lọc</p>
                      <p className="text-lg font-semibold text-gray-900">{filteredSubTopics.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-300">
                  <div className="flex items-center">
                    <div className="bg-purple-50 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Trang hiện tại</p>
                      <p className="text-lg font-semibold text-gray-900">{currentPage}/{totalPages || 1}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-300">
                  <div className="flex items-center">
                    <div className="bg-yellow-50 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Hiển thị</p>
                      <p className="text-lg font-semibold text-gray-900">{currentSubTopics.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            {filteredSubTopics.length === 0 ? (
              <EmptyState
                icon="inbox"
                title={filters.searchTerm ? "Không tìm thấy kết quả" : "Chưa có chủ đề con nào"}
                description={filters.searchTerm ? 
                  `Không tìm thấy chủ đề con nào phù hợp với "${filters.searchTerm}".` : 
                  `Hiện tại chưa có chủ đề con nào cho ${mainTopic}.`
                }
                action={
                  <div className="flex flex-col sm:flex-row gap-3">
                    {filters.searchTerm && (
                      <button
                        onClick={handleClearFilters}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Xóa bộ lọc
                      </button>
                    )}
                    <Link
                      to="/multiple-choice/topics"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Quay lại danh sách chủ đề
                    </Link>
                  </div>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {currentSubTopics.map((subTopic, index) => (
                    <div key={index} className="h-full">
                      <TopicCard
                        topic={subTopic}
                        to={`/multiple-choice/tests/${encodeURIComponent(mainTopic)}/${encodeURIComponent(subTopic)}`}
                        icon="document"
                        color="green"
                        description="Xem danh sách bài kiểm tra"
                        className="h-full"
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredSubTopics.length}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                )}

                {/* Back Button */}
                <div className="flex justify-center mt-8">
                  <Link
                    to="/multiple-choice/topics"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Quay lại danh sách chủ đề
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleChoiceTopicDetail;
