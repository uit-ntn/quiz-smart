import React, { useState, useEffect } from 'react';
import testService from '../services/testService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';
import { Link } from 'react-router-dom';

const MultipleChoiceListTopic = () => {
  const [allTopics, setAllTopics] = useState([]);
  const [topicsWithSubTopics, setTopicsWithSubTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Filter state
  const [filters, setFilters] = useState({
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  useEffect(() => {
    fetchMainTopics();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [topicsWithSubTopics, filters]);

  const fetchMainTopics = async () => {
    try {
      setLoading(true);
      const response = await testService.getAllMultipleChoiceMainTopics();
      const mainTopics = response || [];

      const topicsWithSubs = await Promise.all(
        mainTopics.map(async (mainTopic) => {
          try {
            const subTopics = await testService.getMultipleChoiceSubTopicsByMainTopic(mainTopic);
            return {
              mainTopic,
              subTopics: subTopics || [],
              testCount: subTopics ? subTopics.length : 0
            };
          } catch (err) {
            console.error(`Error fetching sub topics for ${mainTopic}:`, err);
            return {
              mainTopic,
              subTopics: [],
              testCount: 0
            };
          }
        })
      );

      setAllTopics(mainTopics);
      setTopicsWithSubTopics(topicsWithSubs);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách chủ đề. Vui lòng thử lại sau.');
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...topicsWithSubTopics];

    // Search
    if (filters.searchTerm) {
      filtered = filtered.filter(topicData =>
        topicData.mainTopic.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        topicData.subTopics.some(subTopic =>
          subTopic.toLowerCase().includes(filters.searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.mainTopic.toLowerCase();
          bValue = b.mainTopic.toLowerCase();
          break;
        case 'testCount':
          aValue = a.testCount;
          bValue = b.testCount;
          break;
        default:
          aValue = a.mainTopic.toLowerCase();
          bValue = b.mainTopic.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setFilteredTopics(filtered);
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

  // Pagination
  const totalPages = Math.ceil(filteredTopics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTopics = filteredTopics.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải danh sách chủ đề..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchMainTopics} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="max-w-full mx-auto">
        {/* tăng khoảng cách giữa sidebar và nội dung bằng gap lớn hơn */}
        <div className="lg:grid lg:grid-cols-5 lg:gap-10 lg:px-6 lg:py-8">

          {/* Sidebar */}
          <div className="lg:col-span-1 lg:pr-8">
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
          <div className="lg:col-span-4 px-4 sm:px-6 lg:px-0 lg:pl-8 py-8 lg:py-0">
            {/* Header */}
            <div className="mb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center sm:mb-0">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl mr-4 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Trắc nghiệm theo chủ đề</h1>
                    <p className="text-gray-300">Chọn chủ đề để xem các bài kiểm tra trắc nghiệm</p>
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
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Tổng chủ đề</p>
                      <p className="text-lg font-semibold text-gray-900">{allTopics.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-300">
                  <div className="flex items-center">
                    <div className="bg-green-50 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Đã lọc</p>
                      <p className="text-lg font-semibold text-gray-900">{filteredTopics.length}</p>
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
                      <p className="text-lg font-semibold text-gray-900">{currentTopics.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            {filteredTopics.length === 0 ? (
              <EmptyState
                icon="inbox"
                title={filters.searchTerm ? "Không tìm thấy kết quả" : "Chưa có chủ đề nào"}
                description={filters.searchTerm ?
                  `Không tìm thấy chủ đề nào phù hợp với "${filters.searchTerm}".` :
                  "Hiện tại chưa có chủ đề trắc nghiệm nào được tạo."
                }
                action={filters.searchTerm && (
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
              />
            ) : (
              <>
                {/* Topic List */}
                <div className="space-y-4 mb-8">
                  {currentTopics.map((topicData, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
                      {/* Main Topic Header */}
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-lg">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">{topicData.mainTopic}</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {topicData.subTopics.length} chủ đề con
                              </p>
                            </div>
                          </div>

                          {/* luôn hiển thị nút xem tất cả chủ đề con */}
                          <div className="mt-4 text-center">
                            <Link
                              to={`/multiple-choice/topic/${encodeURIComponent(topicData.mainTopic)}`}
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                              Xem tất cả {topicData.subTopics.length} chủ đề con
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Sub Topics: luôn hiển thị đầy đủ, không dropdown */}
                      {topicData.subTopics.length > 0 && (
                        <div className="border-t border-gray-200 bg-gray-50/50">
                          <div className="p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Chủ đề con:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                              {topicData.subTopics.map((subTopic, subIndex) => (
                                <Link
                                  key={subIndex}
                                  to={`/multiple-choice/tests/${encodeURIComponent(topicData.mainTopic)}/${encodeURIComponent(subTopic)}`}
                                  className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                                >
                                  <div className="bg-green-50 p-2 rounded-md mr-3 group-hover:bg-green-100 transition-colors">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{subTopic}</p>
                                    <p className="text-xs text-gray-500">Xem bài kiểm tra</p>
                                  </div>
                                  <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                  </svg>
                                </Link>
                              ))}
                            </div>


                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredTopics.length}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleChoiceListTopic;
