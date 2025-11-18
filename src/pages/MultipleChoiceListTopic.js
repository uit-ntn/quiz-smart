import React, { useState, useEffect } from 'react';
import testService from '../services/testService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import TopicCard from '../components/TopicCard';
import TopicModal from '../components/TopicModal';
import MultipleChoiceLayout from '../layout/MultipleChoiceLayout';

const MultipleChoiceListTopic = () => {
  const [allTopics, setAllTopics] = useState([]);
  const [topicsWithSubTopics, setTopicsWithSubTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Modal management
  const [modalTopic, setModalTopic] = useState(null);

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
              testCount: subTopics ? subTopics.length : 0,
            };
          } catch (err) {
            console.error(`Error fetching sub topics for ${mainTopic}:`, err);
            return { mainTopic, subTopics: [], testCount: 0 };
          }
        })
      );

      setAllTopics(mainTopics);
      setTopicsWithSubTopics(topicsWithSubs);
      setError(null);
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError('Không thể tải danh sách chủ đề. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...topicsWithSubTopics];

    // Search
    if (filters.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((topicData) =>
        topicData.mainTopic.toLowerCase().includes(q) ||
        topicData.subTopics.some((s) => s.toLowerCase().includes(q))
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
      if (filters.sortOrder === 'asc') return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    });

    setFilteredTopics(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const handleClearFilters = () => setFilters({ searchTerm: '', sortBy: 'name', sortOrder: 'asc' });

  // Pagination calc
  const totalPages = Math.ceil(filteredTopics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTopics = filteredTopics.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (n) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  };

  const pickColor = (i) => (['blue', 'green', 'purple', 'orange'][i % 4]);

  if (loading) return <LoadingSpinner message="Đang tải danh sách chủ đề..." />;
  if (error) return <ErrorMessage error={error} onRetry={fetchMainTopics} />;

  const breadcrumbItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Trắc nghiệm theo chủ đề', path: '/multiple-choice' },
  ];

  return (
    <MultipleChoiceLayout
      title="Trắc nghiệm theo chủ đề"
      description="Khám phá và luyện tập với hàng nghìn câu hỏi được tổ chức theo chủ đề. Nâng cao kiến thức một cách có hệ thống và hiệu quả."
      breadcrumbItems={breadcrumbItems}
    >
      {/* Filter and Sort Controls */}
      <div className="relative rounded-lg overflow-hidden mb-8 shadow-lg">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border border-white/50" />
        <div className="relative p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm chủ đề..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange({ ...filters, searchTerm: e.target.value })}
                  className="block w-full pl-12 pr-3 py-2 border border-gray-200 rounded-lg text-base text-gray-800 bg-white/90 backdrop-blur-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white/90 rounded-lg border border-gray-200 p-1">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value })}
                  className="px-3 py-1 text-sm border-0 rounded-lg bg-transparent text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="name">Sắp xếp theo tên</option>
                  <option value="testCount">Sắp xếp theo số bài</option>
                </select>
              </div>

              <button
                onClick={() =>
                  handleFilterChange({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
                }
                className="flex items-center px-3 py-1 text-sm bg-white/90 border border-gray-200 rounded-lg text-gray-800 hover:bg-white/95 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-150"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={filters.sortOrder === 'asc' ? "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" : "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"} />
                </svg>
                {filters.sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
              </button>

              {(filters.searchTerm || filters.sortBy !== 'name' || filters.sortOrder !== 'asc') && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center px-3 py-1 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-150"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredTopics.length === 0 ? (
        <EmptyState
          icon="inbox"
          title={filters.searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có chủ đề nào'}
          description={
            filters.searchTerm
              ? `Không tìm thấy chủ đề nào phù hợp với "${filters.searchTerm}".`
              : 'Hiện tại chưa có chủ đề trắc nghiệm nào được tạo.'
          }
          action={
            filters.searchTerm && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Xóa bộ lọc
              </button>
            )
          }
        />
      ) : (
        <>
          {/* 4 cards / row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {currentTopics.map((topicData, idx) => (
              <TopicCard
                key={topicData.mainTopic}
                topic={topicData.mainTopic}
                mainTopic={topicData.mainTopic}
                subTopics={topicData.subTopics}
                testCount={topicData.testCount}
                color={["blue", "green", "purple", "orange"][idx % 4]}
                buttonLabel="Hiển thị tất cả phân mục"
                onOpenModal={() => setModalTopic(topicData.mainTopic)}
              />
            ))}
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border border-white/50" />
              <div className="relative p-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredTopics.length}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Global Topic Modal */}
      <TopicModal 
        isOpen={!!modalTopic} 
        onClose={() => setModalTopic(null)} 
        mainTopic={modalTopic}
      />
    </MultipleChoiceLayout>
  );
};

export default MultipleChoiceListTopic;
