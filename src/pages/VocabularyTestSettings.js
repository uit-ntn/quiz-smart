import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VocabularyLayout from '../layout/VocabularyLayout';
import vocabularyService from '../services/vocabularyService';
import LoadingSpinner from '../components/LoadingSpinner';

const modes = [
  { key: 'meaning_to_word', label: 'Đưa nghĩa đoán từ' },
  { key: 'word_to_meaning', label: 'Đưa từ đoán nghĩa' },
  { key: 'listen_and_type', label: 'Nghe và ghi từ' }
];

const VocabularyTestSettings = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [testInfo, setTestInfo] = useState(null);
  const [settings, setSettings] = useState({ mode: 'word_to_meaning', timePerQuestion: 30, totalQuestions: 10 });

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await vocabularyService.getAllVocabulariesByTestId(testId);
        setTestInfo({ title: data?.[0]?.test_title || `Bài ${testId}` });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [testId]);

  if (loading) return <LoadingSpinner message="Đang tải cài đặt..." />;

  const start = () => {
    // persist settings to localStorage and navigate to take page
    try { localStorage.setItem(`vocab_settings_${testId}`, JSON.stringify(settings)); } catch (e) {}
    navigate(`/vocabulary/test/${testId}/take`, { state: { settings } });
  };

  return (
    <VocabularyLayout
      title="Cài đặt bài tập"
      description={testInfo?.title}
      breadcrumbItems={[{ label: 'Trang chủ', path: '/' }, { label: 'Từ vựng', path: '/vocabulary' }, { label: testInfo?.title }]}
    >
      <div className="max-w-3xl mx-auto bg-white rounded-lg p-6 shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Chế độ</label>
          <div className="flex gap-2">
            {modes.map(m => (
              <button key={m.key} onClick={() => setSettings(s => ({ ...s, mode: m.key }))} className={`px-3 py-2 rounded ${settings.mode===m.key? 'bg-indigo-600 text-white':'bg-gray-100'}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian cho mỗi câu (giây)</label>
          <input type="range" min={5} max={300} value={settings.timePerQuestion} onChange={(e)=> setSettings(s=>({...s, timePerQuestion: Number(e.target.value)}))} />
          <div className="text-sm mt-1">{settings.timePerQuestion} giây</div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng câu</label>
          <input type="number" min={1} max={200} value={settings.totalQuestions} onChange={(e)=> setSettings(s=>({...s, totalQuestions: Number(e.target.value)}))} className="w-28 border rounded px-2 py-1" />
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded border">Quay lại</button>
          <button onClick={start} className="px-4 py-2 rounded bg-indigo-600 text-white">Bắt đầu</button>
        </div>
      </div>
    </VocabularyLayout>
  );
};

export default VocabularyTestSettings;
