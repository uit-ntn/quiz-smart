import React, { useEffect, useState } from 'react';
import AdminLayout from '../layout/AdminLayout';
import vocabularyService from '../services/vocabularyService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

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
  const [formData, setFormData] = useState({
    word: '',
    phonetic: '',
    meaning: '',
    example: '',
    example_meaning: '',
    image_url: '',
    audio_url: ''
  });

  useEffect(() => {
    fetchVocabularies();
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
    } catch (err) {
      setError('Không thể tải danh sách từ vựng');
      console.error('Error fetching vocabularies:', err);
    } finally {
      setLoading(false);
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
      phonetic: '',
      meaning: '',
      example: '',
      example_meaning: '',
      image_url: '',
      audio_url: ''
    });
    setShowCreateModal(true);
  };

  const handleEditClick = (vocab) => {
    setSelectedVocab(vocab);
    setFormData({
      word: vocab.word || '',
      phonetic: vocab.phonetic || '',
      meaning: vocab.meaning || '',
      example: vocab.example || '',
      example_meaning: vocab.example_meaning || '',
      image_url: vocab.image_url || '',
      audio_url: vocab.audio_url || ''
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
        phonetic: '',
        meaning: '',
        example: '',
        example_meaning: '',
        image_url: '',
        audio_url: ''
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

  const VocabForm = ({ onSubmit, buttonText }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Từ vựng <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.word}
            onChange={(e) => setFormData({ ...formData, word: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Nhập từ vựng..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phiên âm
          </label>
          <input
            type="text"
            value={formData.phonetic}
            onChange={(e) => setFormData({ ...formData, phonetic: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="/ˈwɜːrd/"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nghĩa <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.meaning}
          onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Nghĩa của từ..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ví dụ
        </label>
        <textarea
          value={formData.example_sentence}
          onChange={(e) => setFormData({ ...formData, example_sentence: e.target.value })}
          rows="2"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Câu ví dụ..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nghĩa ví dụ
        </label>
        <textarea
          value={formData.example_meaning}
          onChange={(e) => setFormData({ ...formData, example_meaning: e.target.value })}
          rows="2"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Nghĩa của câu ví dụ..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL hình ảnh
        </label>
        <input
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL audio
        </label>
        <input
          type="url"
          value={formData.audio_url}
          onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="https://example.com/audio.mp3"
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
          }}
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
          Bạn có chắc chắn muốn xóa từ <strong>"{selectedVocab?.word}"</strong>?
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
        <LoadingSpinner message="Đang tải danh sách từ vựng..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Từ vựng</h1>
            <p className="text-gray-600 mt-1">Tổng số: {filteredVocabs.length} từ</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button
              onClick={fetchVocabularies}
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
              <span>Thêm từ mới</span>
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo từ vựng hoặc nghĩa..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Vocabularies Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Từ vựng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phiên âm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nghĩa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ví dụ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVocabs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'Không tìm thấy từ vựng nào phù hợp' : 'Chưa có từ vựng nào'}
                    </td>
                  </tr>
                ) : (
                  filteredVocabs.map((vocab) => (
                    <tr key={vocab._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-sm font-semibold text-gray-900">
                            {vocab.word}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                        {vocab.phonetic || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {vocab.meaning}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-md truncate">
                          {vocab.example_sentence || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(vocab)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(vocab)}
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Thêm từ vựng mới</h3>
            <VocabForm onSubmit={handleCreateSubmit} buttonText="Tạo mới" />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Chỉnh sửa từ vựng</h3>
            <VocabForm onSubmit={handleEditSubmit} buttonText="Cập nhật" />
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && <DeleteModal />}
    </AdminLayout>
  );
};

export default AdminVocabularies;
