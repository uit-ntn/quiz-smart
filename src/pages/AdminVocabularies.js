import React, { useEffect, useState } from 'react';
import AdminLayout from '../layout/AdminLayout';
import vocabularyService from '../services/vocabularyService';
import testService from '../services/testService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

// VocabForm component moved outside to prevent re-render issues
const VocabForm = ({ onSubmit, buttonText, formData, setFormData, allTests, onCancel }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-indigo-700 mb-2">
        Bài kiểm tra <span className="text-red-500">*</span>
      </label>
      <select
        value={formData.test_id}
        onChange={(e) => setFormData({ ...formData, test_id: e.target.value })}
        required
        className="w-full px-4 py-2 rounded-lg border border-indigo-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-indigo-900"
      >
        <option value="">Chọn bài kiểm tra...</option>
        {allTests.map(test => (
          <option key={test._id} value={test._id}>
            {test.test_title} - {test.main_topic}
          </option>
        ))}
      </select>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-indigo-700 mb-2">
          Từ vựng <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.word}
          onChange={(e) => setFormData({ ...formData, word: e.target.value })}
          required
          className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Nhập từ vựng..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-indigo-700 mb-2">
          Phiên âm
        </label>
        <input
          type="text"
          value={formData.phonetic}
          onChange={(e) => setFormData({ ...formData, phonetic: e.target.value })}
          className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Ví dụ: /ˈaɪəl/"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-indigo-700 mb-2">
        Nghĩa <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={formData.meaning}
        onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
        required
        className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Nghĩa của từ..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-indigo-700 mb-2">
        Ví dụ
      </label>
      <textarea
        value={formData.example_sentence}
        onChange={(e) => setFormData({ ...formData, example_sentence: e.target.value })}
        rows="2"
        className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Câu ví dụ..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-indigo-700 mb-2">
        Nghĩa ví dụ
      </label>
      <textarea
        value={formData.example_meaning}
        onChange={(e) => setFormData({ ...formData, example_meaning: e.target.value })}
        rows="2"
        className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Nghĩa của câu ví dụ..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-indigo-700 mb-2">
        URL hình ảnh
      </label>
      <input
        type="url"
        value={formData.image_url}
        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
        className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="https://example.com/image.jpg"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-indigo-700 mb-2">
        URL audio
      </label>
      <input
        type="url"
        value={formData.audio_url}
        onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
        className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="https://example.com/audio.mp3"
      />
    </div>
    
    <div className="flex space-x-3 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 px-4 py-2 border border-indigo-200 rounded-lg text-indigo-700 hover:bg-indigo-50 transition-colors"
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

const AdminVocabularies = () => {
  const [vocabularies, setVocabularies] = useState([]);
  const [filteredVocabs, setFilteredVocabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState(null);
  const [tests, setTests] = useState({});
  const [allTests, setAllTests] = useState([]);
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    example_sentence: '',
    phonetic: '',
    image_url: '',
    audio_url: '',
    test_id: ''
  });

  useEffect(() => {
    fetchVocabularies();
    fetchAllTests();
  }, []);

  useEffect(() => {
    filterVocabularies();
  }, [vocabularies, searchTerm]);

  const fetchVocabularies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vocabularyService.getAllVocabularies();
      setVocabularies(data);
      
      // Fetch test info for each vocabulary
      const testIds = [...new Set(data.map(v => v.test_id).filter(Boolean))];
      const testInfo = {};
      
      await Promise.all(testIds.map(async (testId) => {
        try {
          const test = await testService.getTestById(testId);
          testInfo[testId] = test;
        } catch (err) {
          console.error(`Error fetching test ${testId}:`, err);
        }
      }));
      
      setTests(testInfo);
    } catch (err) {
      setError('Không thể tải danh sách từ vựng');
      console.error('Error fetching vocabularies:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTests = async () => {
    try {
      const data = await testService.getAllTests();
      console.log('All tests data:', data);
      
      let testsArray = [];
      if (Array.isArray(data)) {
        testsArray = data;
      } else if (data && typeof data === 'object') {
        testsArray = data.data || data.tests || data.results || data.items || [];
      }
      
      // Filter only vocabulary tests
      const vocabularyTests = testsArray.filter(test => 
        test.test_type === 'vocabulary' || test.test_type === 'vocab'
      );
      
      setAllTests(vocabularyTests);
    } catch (e) {
      console.error('Error fetching all tests:', e);
    }
  };

  const filterVocabularies = () => {
    let filtered = [...vocabularies];

    if (searchTerm) {
      filtered = filtered.filter(vocab =>
        vocab.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vocab.meaning?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVocabs(filtered);
  };

  const handleCreateClick = () => {
    setFormData({
      word: '',
      meaning: '',
      example_sentence: '',
      example_meaning: '',
      phonetic: '',
      image_url: '',
      audio_url: '',
      test_id: ''
    });
    setShowCreateModal(true);
  };

  const handleEditClick = (vocab) => {
    setSelectedVocab(vocab);
    setFormData({
      word: vocab.word || '',
      meaning: vocab.meaning || '',
      example_sentence: vocab.example_sentence || '',
      example_meaning: vocab.example_meaning || '',
      phonetic: vocab.phonetic || '',
      image_url: vocab.image_url || '',
      audio_url: vocab.audio_url || '',
      test_id: vocab.test_id || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (vocab) => {
    setSelectedVocab(vocab);
    setShowDeleteModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const newVocab = await vocabularyService.createVocabulary(formData);
      setVocabularies([newVocab, ...vocabularies]);
      setShowCreateModal(false);
      setFormData({
        word: '',
        meaning: '',
        example_sentence: '',
        example_meaning: '',
        phonetic: '',
        image_url: '',
        audio_url: '',
        test_id: ''
      });
    } catch (err) {
      console.error('Error creating vocabulary:', err);
      alert('Không thể tạo từ vựng. Vui lòng thử lại!');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVocab) return;

    try {
      const updatedVocab = await vocabularyService.updateVocabulary(selectedVocab._id, formData);
      setVocabularies(vocabularies.map(v => 
        v._id === selectedVocab._id ? updatedVocab : v
      ));
      setShowEditModal(false);
      setSelectedVocab(null);
    } catch (err) {
      console.error('Error updating vocabulary:', err);
      alert('Không thể cập nhật từ vựng. Vui lòng thử lại!');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVocab) return;

    try {
      await vocabularyService.deleteVocabulary(selectedVocab._id);
      setVocabularies(vocabularies.filter(v => v._id !== selectedVocab._id));
      setShowDeleteModal(false);
      setSelectedVocab(null);
    } catch (err) {
      console.error('Error deleting vocabulary:', err);
      alert('Không thể xóa từ vựng. Vui lòng thử lại!');
    }
  };



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
            <h3 className="text-lg font-semibold text-indigo-900">Xác nhận xóa</h3>
            <p className="text-sm text-indigo-700">Hành động này không thể hoàn tác</p>
          </div>
        </div>
        <p className="text-indigo-800 mb-6">
          Bạn có chắc chắn muốn xóa từ <strong>"{selectedVocab?.word}"</strong>?
        </p>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="flex-1 px-4 py-2 border border-indigo-200 rounded-lg text-indigo-700 hover:bg-indigo-50 transition-colors"
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
        <LoadingSpinner message="Đang tải danh sách từ vựng..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-indigo-900 truncate">Quản lý Từ vựng</h1>
            <p className="text-indigo-700 mt-1 text-sm sm:text-base">Tổng số: {filteredVocabs.length} từ</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={fetchVocabularies}
              className="flex items-center space-x-1 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            <button
              onClick={handleCreateClick}
              className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Thêm từ</span>
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-indigo-100 p-4">
          <label className="block text-sm font-medium text-indigo-700 mb-2">
            Tìm kiếm
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo từ vựng hoặc nghĩa..."
            className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Vocabularies List - Responsive Design */}
        <div className="bg-white rounded-lg shadow-sm border border-indigo-100 overflow-hidden">
          
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-visible">
              <table className="w-full table-fixed">
                <thead className="bg-indigo-50 border-b border-indigo-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider w-1/6">
                      Từ vựng
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider w-1/6">
                      Nghĩa
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider w-1/4">
                      Ví dụ
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider w-1/6">
                      Bài kiểm tra
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider w-1/8">
                      Chủ đề
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-indigo-600 uppercase tracking-wider w-1/12">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-indigo-100">
                  {filteredVocabs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-indigo-600 text-sm">
                        {searchTerm ? 'Không tìm thấy từ vựng nào phù hợp' : 'Chưa có từ vựng nào'}
                      </td>
                    </tr>
                  ) : (
                    filteredVocabs.map((vocab) => {
                      const test = tests[vocab.test_id];
                      return (
                        <tr key={vocab._id} className="hover:bg-indigo-50">
                          <td className="px-3 py-2">
                            <div className="min-w-0">
                              <div className="font-medium text-indigo-900 text-sm">
                                {vocab.word}
                              </div>
                              {vocab.phonetic && (
                                <div className="text-xs text-indigo-600">
                                  /{vocab.phonetic}/
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-sm text-indigo-900">
                              {vocab.meaning.length > 30 ? vocab.meaning.substring(0, 30) + '...' : vocab.meaning}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="min-w-0">
                              {vocab.example_sentence && (
                                <div className="text-xs text-indigo-700" title={vocab.example_sentence}>
                                  {vocab.example_sentence.length > 40 ? vocab.example_sentence.substring(0, 40) + '...' : vocab.example_sentence}
                                </div>
                              )}
                              {vocab.example_meaning && (
                                <div className="text-xs text-indigo-600 mt-1" title={vocab.example_meaning}>
                                  {vocab.example_meaning.length > 40 ? vocab.example_meaning.substring(0, 40) + '...' : vocab.example_meaning}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-sm text-indigo-900" title={test?.test_title}>
                              {test?.test_title ? (test.test_title.length > 20 ? test.test_title.substring(0, 20) + '...' : test.test_title) : '—'}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="min-w-0">
                              <div className="text-sm text-indigo-900" title={test?.main_topic}>
                                {test?.main_topic ? (test.main_topic.length > 15 ? test.main_topic.substring(0, 15) + '...' : test.main_topic) : '—'}
                              </div>
                              {test?.sub_topic && (
                                <div className="text-xs text-indigo-600" title={test.sub_topic}>
                                  {test.sub_topic.length > 15 ? test.sub_topic.substring(0, 15) + '...' : test.sub_topic}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-medium">
                            <div className="flex justify-end space-x-1">
                              <button
                                onClick={() => handleEditClick(vocab)}
                                className="px-2 py-1 text-xs text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteClick(vocab)}
                                className="px-2 py-1 text-xs text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block lg:hidden">
            <div className="space-y-3 p-4">
              {filteredVocabs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-indigo-600 text-sm">
                    {searchTerm ? 'Không tìm thấy từ vựng nào phù hợp' : 'Chưa có từ vựng nào'}
                  </p>
                </div>
              ) : (
                filteredVocabs.map((vocab) => {
                  const test = tests[vocab.test_id];
                  return (
                    <div key={vocab._id} className="bg-indigo-50 rounded-lg p-4 space-y-3">
                      {/* Word and Meaning */}
                      <div>
                        <h3 className="font-medium text-indigo-900 text-sm">{vocab.word}</h3>
                        {vocab.phonetic && (
                          <p className="text-xs text-indigo-600">/{vocab.phonetic}/</p>
                        )}
                        <p className="text-sm text-indigo-800 mt-1">{vocab.meaning}</p>
                      </div>

                      {/* Example */}
                      {vocab.example_sentence && (
                        <div className="text-xs text-indigo-700">
                          <p className="italic">"{vocab.example_sentence}"</p>
                          {vocab.example_meaning && (
                            <p className="mt-1">→ {vocab.example_meaning}</p>
                          )}
                        </div>
                      )}

                      {/* Test Info */}
                      {test && (
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {test.test_title}
                          </span>
                          {test.main_topic && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {test.main_topic}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end space-x-3 pt-2">
                        <button
                          onClick={() => handleEditClick(vocab)}
                          className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(vocab)}
                          className="text-sm text-red-600 hover:text-red-900 font-medium"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-indigo-900 mb-4">Thêm từ vựng mới</h3>
            <VocabForm 
              onSubmit={handleCreateSubmit} 
              buttonText="Tạo mới" 
              formData={formData}
              setFormData={setFormData}
              allTests={allTests}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-indigo-900 mb-4">Chỉnh sửa từ vựng</h3>
            <VocabForm 
              onSubmit={handleEditSubmit} 
              buttonText="Cập nhật" 
              formData={formData}
              setFormData={setFormData}
              allTests={allTests}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && <DeleteModal />}
    </AdminLayout>
  );
};

export default AdminVocabularies;
