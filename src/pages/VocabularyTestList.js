import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import VocabularyLayout from '../layout/VocabularyLayout';
import vocabularyService from '../services/vocabularyService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import TestCard from '../components/TestCard';
import EmptyState from '../components/EmptyState';

const VocabularyTestList = () => {
  const { mainTopic, subTopic } = useParams();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        // In vocabulary module we treat each test_id as a single vocabulary test collection
        const list = await vocabularyService.getAllVocabulariesByTestId(null);
        // Filter by topic if provided
        const filtered = (list || []).filter(v => (
          (!mainTopic || v.main_topic === mainTopic) && (!subTopic || v.sub_topic === subTopic)
        ));
        // Group by test_id to create Test cards
        const grouped = {};
        filtered.forEach(v => {
          const id = v.test_id || 'default';
          grouped[id] = grouped[id] || { test_id: id, title: v.test_title || `${v.main_topic} - ${v.sub_topic}`, items: [] };
          grouped[id].items.push(v);
        });
        setTests(Object.values(grouped));
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách bài tập.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [mainTopic, subTopic]);

  if (loading) return <LoadingSpinner message="Đang tải bài tập..." />;
  if (error) return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;

  const breadcrumb = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Từ vựng', path: '/vocabulary' },
  ];
  if (mainTopic) breadcrumb.push({ label: mainTopic, path: `/vocabulary/${encodeURIComponent(mainTopic)}` });
  if (subTopic) breadcrumb.push({ label: subTopic, path: `/vocabulary/${encodeURIComponent(mainTopic)}/${encodeURIComponent(subTopic)}` });

  return (
    <VocabularyLayout title="Bài tập từ vựng" description={`${mainTopic || ''} ${subTopic || ''}`} breadcrumbItems={breadcrumb}>
      {tests.length === 0 ? (
        <EmptyState title="Chưa có bài tập" description="Không tìm thấy bài tập cho chủ đề này." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map(test => (
            <TestCard key={test.test_id} test={test}>
              <div className="mt-3">
                <Link to={`/vocabulary/test/${test.test_id}/settings`} className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded">Bắt đầu</Link>
              </div>
            </TestCard>
          ))}
        </div>
      )}
    </VocabularyLayout>
  );
};

export default VocabularyTestList;
