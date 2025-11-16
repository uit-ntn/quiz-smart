import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VocabularyLayout from '../layout/VocabularyLayout';
import testResultService from '../services/testResultService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const VocabularyTestReview = () => {
  const { resultId } = useParams(); // Changed from testId to resultId
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await testResultService.getTestResultById(resultId);
        setResult(data);
      } catch (err) {
        console.error('Error fetching test result:', err);
        setError('Không thể tải kết quả bài test.');
      } finally {
        setLoading(false);
      }
    };

    if (resultId) {
      fetchResult();
    }
  }, [resultId]);

  if (loading) return <LoadingSpinner message="Đang tải kết quả..." />;
  if (error) return <ErrorMessage error={error} />;
  if (!result) return (
    <VocabularyLayout>
      <ErrorMessage error="Không tìm thấy kết quả bài test." />
    </VocabularyLayout>
  );

  const correct = result.correct_count;

  return (
    <VocabularyLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Xem lại kết quả</h1>
          <p className="text-gray-600">{result.test_id?.test_title || 'Bài test từ vựng'}</p>
        </div>

        {/* Score Overview */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-4">
              {result.percentage}%
            </div>
            <div className="text-lg text-gray-700 mb-6">
              Bạn đã trả lời đúng {correct}/{result.total_questions} câu
            </div>
            
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{result.total_questions}</div>
                <div className="text-sm text-gray-600">Tổng câu</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{correct}</div>
                <div className="text-sm text-gray-600">Đúng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{result.total_questions - correct}</div>
                <div className="text-sm text-gray-600">Sai</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Chi tiết từng câu</h2>
          
          <div className="space-y-4">
            {(result.answers || []).map((answer, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  answer.is_correct 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      answer.is_correct ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {answer.question_text}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`font-bold ${
                    answer.is_correct ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {answer.is_correct ? '✓ Đúng' : '✗ Sai'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Câu trả lời của bạn:</span>
                    <div className={`mt-1 p-2 rounded ${
                      answer.is_correct ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {answer.user_answer || <em className="text-gray-500">(Không trả lời)</em>}
                    </div>
                  </div>
                  
                  {!answer.is_correct && (
                    <div>
                      <span className="font-medium text-gray-600">Đáp án đúng:</span>
                      <div className="mt-1 p-2 bg-green-100 rounded">
                        {answer.correct_answer}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Info */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="font-medium">Ngày làm bài:</span>
              <div>{new Date(result.created_at).toLocaleDateString('vi-VN')}</div>
            </div>
            <div>
              <span className="font-medium">Thời gian:</span>
              <div>{Math.round(result.duration_ms / 1000)}s</div>
            </div>
            <div>
              <span className="font-medium">Điểm số:</span>
              <div>{result.percentage}%</div>
            </div>
            <div>
              <span className="font-medium">Trạng thái:</span>
              <div className={`font-medium ${
                result.status === 'active' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {result.status === 'active' ? 'Đã lưu' : 'Nháp'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </VocabularyLayout>
  );
};

export default VocabularyTestReview;
