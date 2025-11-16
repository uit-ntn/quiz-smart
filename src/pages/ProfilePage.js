import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileLayout from '../layout/ProfileLayout';
import ProfileTabs from '../components/ProfileTabs';
import UserInfoCard from '../components/UserInfoCard';
import StatisticsCards from '../components/StatisticsCards';
import TestResultsList from '../components/TestResultsList';
import MyTestsList from '../components/MyTestsList';
import testResultService from '../services/testResultService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  
  // Test Results state
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);

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
      console.log('Test results response:', data);
      // Ensure data is an array and only show active results
      const results = Array.isArray(data) ? data : [];
      const activeResults = results.filter(r => r.status === 'active');
      setResults(activeResults);
    } catch (err) {
      console.error('Error fetching test results:', err);
      setResultsError('Không thể tải danh sách kết quả.');
      setResults([]); // Set empty array on error
    } finally {
      setResultsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatisticsLoading(true);
      const stats = await testResultService.getMyStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setStatisticsLoading(false);
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
      console.log('My tests response:', data);
      // Ensure data is an array
      setMyTests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching my tests:', err);
      setTestsError('Không thể tải danh sách bài test của bạn.');
      setMyTests([]); // Set empty array on error
    } finally {
      setTestsLoading(false);
    }
  };

  const handleViewDetail = (result) => {
    // Handle different ID field names
    const resultId = result._id || result.id;
    if (resultId) {
      navigate(`/vocabulary/test-result/${resultId}/review`);
    } else {
      console.error('No result ID found:', result);
    }
  };

  const handleRetakeTest = (result) => {
    const testType = result.test_id?.test_type;
    const testId = result.test_id?._id || result.test_id?.id || result.test_id;
    
    if (!testId) {
      console.error('No test ID found in result:', result);
      alert('Không thể tìm thấy thông tin bài test để làm lại.');
      return;
    }
    
    if (testType === 'vocabulary') {
      navigate(`/vocabulary/test/${testId}/settings`);
    } else if (testType === 'multiple_choice') {
      navigate(`/multiple-choice/test/${testId}/settings`);
    } else {
      alert('Loại bài test không được hỗ trợ.');
    }
  };

  const handleTakeTest = (test) => {
    const testId = test._id || test.id;
    
    if (!testId) {
      console.error('No test ID found:', test);
      alert('Không thể tìm thấy ID bài test.');
      return;
    }
    
    if (test.test_type === 'vocabulary') {
      navigate(`/vocabulary/test/${testId}/settings`);
    } else if (test.test_type === 'multiple_choice') {
      navigate(`/multiple-choice/test/${testId}/settings`);
    } else {
      alert('Loại bài test không được hỗ trợ.');
    }
  };

  const handleEditTest = (test) => {
    // TODO: Implement edit functionality
    alert('Tính năng chỉnh sửa đang phát triển');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <UserInfoCard user={user} />;
      
      case 'results':
        return (
          <div>
            <StatisticsCards statistics={statistics} loading={statisticsLoading} />
            <TestResultsList 
              results={results}
              loading={resultsLoading}
              error={resultsError}
              onRetry={fetchResults}
              onViewDetail={handleViewDetail}
              onRetakeTest={handleRetakeTest}
            />
          </div>
        );
      
      case 'my-tests':
        return (
          <MyTestsList 
            tests={myTests}
            loading={testsLoading}
            error={testsError}
            onRetry={fetchMyTests}
            onTakeTest={handleTakeTest}
            onEditTest={handleEditTest}
          />
        );
      
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
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
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProfileLayout
      title="Hồ sơ cá nhân"
      description="Quản lý thông tin cá nhân, xem kết quả bài test và các bài test bạn đã tạo"
    >
      <div className="space-y-6">
        {/* Tabs */}
        <ProfileTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          resultsCount={results.length}
          testsCount={myTests.length}
        />

        {/* Tab Content */}
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </ProfileLayout>
  );
};

export default ProfilePage;