import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VocabularyLayout from '../layout/VocabularyLayout';
import testResultService from '../services/testResultService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const MyTestResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchResults();
    fetchStatistics();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await testResultService.getMyTestResults();
      setResults(data);
    } catch (err) {
      console.error('Error fetching test results:', err);
      setError('Không thể tải danh sách kết quả.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await testResultService.getMyStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (percentage) => {
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) return <LoadingSpinner message="Đang tải kết quả..." />;
  if (error) return <ErrorMessage error={error} onRetry={fetchResults} />;

  return (
    <VocabularyLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kết quả bài test của tôi</h1>
          <p className="text-gray-600">Xem lại các bài test từ vựng đã làm</p>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="text-2xl font-bold text-blue-600">{statistics.total_tests}</div>
              <div className="text-sm text-gray-600">Tổng bài test</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="text-2xl font-bold text-green-600">{statistics.average_score}%</div>
              <div className="text-sm text-gray-600">Điểm trung bình</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="text-2xl font-bold text-purple-600">{statistics.total_questions}</div>
              <div className="text-sm text-gray-600">Tổng câu hỏi</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="text-2xl font-bold text-orange-600">{statistics.total_correct}</div>
              <div className="text-sm text-gray-600">Câu trả lời đúng</div>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {results.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có kết quả nào</h3>
              <p className="text-gray-600 mb-6">Bạn chưa hoàn thành bài test nào. Hãy bắt đầu làm bài!</p>
              <button
                onClick={() => navigate('/vocabulary')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đi đến danh sách từ vựng
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {results.map((result) => (
                <div key={result._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getScoreBg(result.percentage)}`}>
                          <span className={`text-xl font-bold ${getScoreColor(result.percentage)}`}>
                            {result.percentage}%
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {result.test_id?.test_title || 'Bài test từ vựng'}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>📊 {result.correct_count}/{result.total_questions} câu đúng</span>
                            <span>⏱️ {Math.round(result.duration_ms / 1000)}s</span>
                            <span>📅 {new Date(result.created_at).toLocaleDateString('vi-VN')}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              result.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {result.status === 'active' ? 'Đã lưu' : 'Nháp'}
                            </span>
                          </div>
                          
                          {result.test_id?.main_topic && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {result.test_id.main_topic}
                                {result.test_id?.sub_topic && ` › ${result.test_id.sub_topic}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-6">
                      <button
                        onClick={() => navigate(`/vocabulary/test-result/${result._id}/review`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Xem chi tiết
                      </button>
                      
                      <button
                        onClick={() => navigate(`/vocabulary/test/${result.test_id._id}/settings`)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        Làm lại
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/vocabulary')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            📚 Về danh sách từ vựng
          </button>
        </div>
      </div>
    </VocabularyLayout>
  );
};

export default MyTestResults;