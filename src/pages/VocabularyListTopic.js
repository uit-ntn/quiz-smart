import React, { useEffect, useState } from 'react';
import VocabularyLayout from '../layout/VocabularyLayout';
import vocabularyService from '../services/vocabularyService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import SubTopicCard from '../components/SubTopicCard';

const VocabularyListTopic = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        // vocabularyService should provide grouping by main_topic in backend; fallback: getAll and group client-side
        const all = await vocabularyService.getAllVocabularies();
        const grouped = (all || []).reduce((acc, v) => {
          const key = v.main_topic || 'Khác';
          if (!acc[key]) acc[key] = new Set();
          if (v.sub_topic) acc[key].add(v.sub_topic);
          return acc;
        }, {});

        const topicsArr = Object.keys(grouped).map((main) => ({
          mainTopic: main,
          subTopics: Array.from(grouped[main])
        }));

        setTopics(topicsArr);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách chủ đề.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner message="Đang tải chủ đề từ vựng..." />;
  if (error) return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;

  return (
    <VocabularyLayout
      title="Từ vựng theo chủ đề"
      description="Duyệt các chủ đề từ vựng và phân mục để bắt đầu luyện tập"
      breadcrumbItems={[{ label: 'Trang chủ', path: '/' }, { label: 'Từ vựng', path: '/vocabulary' }]}
    >
      {topics.length === 0 ? (
        <EmptyState title="Chưa có chủ đề nào" description="Không tìm thấy chủ đề từ vựng." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((t) => (
            <div key={t.mainTopic} className="rounded-lg bg-white p-4 shadow">
              <h3 className="font-semibold text-lg mb-2">{t.mainTopic}</h3>
              <div className="flex flex-wrap gap-2">
                {t.subTopics.map((s) => (
                  <SubTopicCard key={s} title={s} parent={t.mainTopic} link={`/vocabulary/${encodeURIComponent(t.mainTopic)}/${encodeURIComponent(s)}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </VocabularyLayout>
  );
};

export default VocabularyListTopic;
 
