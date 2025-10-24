import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layout/MainLayout';
import testResultService from '../services/testResultService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('results'); // 'results' or 'my-tests'
  
  // Test Results state
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsError, setResultsError] = useState(null);
  const [statistics, setStatistics] = useState(null);

  // My Tests state
  const [myTests, setMyTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [testsError, setTestsError] = useState(null);

  useEffect(() => {
    if (activeTab === 'results') {
      fetchResults();
      fetchStatistics();
    } else if (activeTab === 'my-tests') {
      fetchMyTests();
    }
  }, [activeTab]);

  const fetchResults = async () => {
    try {
      setResultsLoading(true);
      setResultsError(null);
      const data = await testResultService.getMyTestResults();
      // Only show active results
      const activeResults = data.filter(r => r.status === 'active');
      setResults(activeResults);
    } catch (err) {
      console.error('Error fetching test results:', err);
      setResultsError('Không thể tải danh sách kết quả.');
    } finally {
      setResultsLoading(false);
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

  const fetchMyTests = async () => {
    try {
      setTestsLoading(true);
      setTestsError(null);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/tests/my-tests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch my tests');
      }
      
      const data = await response.json();
      setMyTests(data);
    } catch (err) {
      console.error('Error fetching my tests:', err);
      setTestsError('Không thể tải danh sách bài test của bạn.');
    } finally {
      setTestsLoading(false);
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

  const getTestTypeIcon = (testType) => {
    switch (testType) {
      case 'vocabulary':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'multiple_choice':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'grammar':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const renderResults = () => {
    if (resultsLoading) return <LoadingSpinner message="Đang tải kết quả..." />;
    if (resultsError) return <ErrorMessage error={resultsError} onRetry={fetchResults} />;

    return (
      <div>
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
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đi đến trang chủ
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
                            {result.test_id?.test_title || 'Bài test'}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>📊 {result.correct_count}/{result.total_questions} câu đúng</span>
                            <span>⏱️ {Math.round(result.duration_ms / 1000)}s</span>
                            <span>📅 {new Date(result.created_at).toLocaleDateString('vi-VN')}</span>
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
                        onClick={() => {
                          const testType = result.test_id?.test_type;
                          if (testType === 'vocabulary') {
                            navigate(`/vocabulary/test/${result.test_id._id}/settings`);
                          } else if (testType === 'multiple_choice') {
                            navigate(`/multiple-choice/test/${result.test_id._id}/settings`);
                          }
                        }}
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
      </div>
    );
  };

  const renderMyTests = () => {
    if (testsLoading) return <LoadingSpinner message="Đang tải bài test của bạn..." />;
    if (testsError) return <ErrorMessage error={testsError} onRetry={fetchMyTests} />;

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {myTests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài test nào</h3>
            <p className="text-gray-600 mb-6">Bạn chưa tạo bài test nào. Hãy tạo bài test đầu tiên!</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {myTests.map((test) => (
              <div key={test._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md text-white">
                        {getTestTypeIcon(test.test_type)}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {test.test_title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {test.description}
                        </p>
                        
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {test.test_type === 'vocabulary' ? 'Từ vựng' : 
                             test.test_type === 'multiple_choice' ? 'Trắc nghiệm' : 
                             test.test_type === 'grammar' ? 'Ngữ pháp' : test.test_type}
                          </span>
                          
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            test.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            test.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {test.difficulty === 'easy' ? 'Dễ' :
                             test.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                          </span>
                          
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            test.visibility === 'public' ? 'bg-green-100 text-green-800 border border-green-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {test.visibility === 'public' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              )}
                            </svg>
                            {test.visibility === 'public' ? 'Công khai' : 'Riêng tư'}
                          </span>
                          
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            test.status === 'active' ? 'bg-green-100 text-green-800' :
                            test.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {test.status === 'active' ? 'Hoạt động' :
                             test.status === 'inactive' ? 'Không hoạt động' : 'Đã xóa'}
                          </span>
                          
                          <span className="text-xs text-gray-500">
                            📊 {test.total_questions} câu · ⏱️ {test.time_limit_minutes} phút
                          </span>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          {test.main_topic} › {test.sub_topic} · Tạo: {new Date(test.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => {
                        if (test.test_type === 'vocabulary') {
                          navigate(`/vocabulary/test/${test._id}/settings`);
                        } else if (test.test_type === 'multiple_choice') {
                          navigate(`/multiple-choice/test/${test._id}/settings`);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Làm bài
                    </button>
                    
                    <button
                      onClick={() => alert('Tính năng chỉnh sửa đang phát triển')}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chưa đăng nhập</h2>
            <p className="text-gray-600 mb-6">Vui lòng đăng nhập để xem thông tin hồ sơ.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* User Profile Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.full_name || user?.email}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </span>
                <span className="text-sm text-gray-500">
                  Tham gia: {new Date(user?.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('results')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'results'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Kết quả bài test ({results.length})</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('my-tests')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'my-tests'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Bài test tôi tạo ({myTests.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'results' ? renderResults() : renderMyTests()}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;