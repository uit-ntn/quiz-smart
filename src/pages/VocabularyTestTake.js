import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import VocabularyLayout from '../layout/VocabularyLayout';
import vocabularyService from '../services/vocabularyService';
import LoadingSpinner from '../components/LoadingSpinner';

const VocabularyTestTake = () => {
  const { testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const settings = location.state?.settings || JSON.parse(localStorage.getItem(`vocab_settings_${testId}`) || '{}');

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const timerRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(settings.timePerQuestion || 30);

  useEffect(()=>{
    const fetch = async () => {
      try{
        setLoading(true);
        const pool = await vocabularyService.getRandomVocabularies(settings.totalQuestions || 10, { testId });
        setItems(pool);
      }catch(e){console.error(e);}finally{setLoading(false);}    
    };
    fetch();
  },[testId, settings.totalQuestions]);

  useEffect(()=>{
    if(!items.length) return;
    setTimeLeft(settings.timePerQuestion || 30);
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(()=>{
      setTimeLeft(t => {
        if(t <= 1){
          handleSubmit(null);
          return settings.timePerQuestion || 30;
        }
        return t-1;
      });
    },1000);
    return ()=> clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[index, items]);

  const handleSubmit = (answer) => {
    setAnswers(a => [...a, { item: items[index], answer, correct: checkAnswer(items[index], answer, settings.mode) }]);
    if(index+1 >= items.length){
      // finish
      try{ localStorage.setItem(`vocab_result_${testId}`, JSON.stringify({ answers: [...answers, { item: items[index], answer }], settings })); }catch(e){}
      navigate(`/vocabulary/test/${testId}/review`);
      return;
    }
    setIndex(i=> i+1);
  };

  const checkAnswer = (item, answer, mode) => {
    if(!item) return false;
    if(mode === 'meaning_to_word') return (item.word || '').toLowerCase() === (answer || '').toLowerCase();
    if(mode === 'word_to_meaning') return (item.meaning || '').toLowerCase().includes((answer||'').toLowerCase());
    if(mode === 'listen_and_type') return (item.word || '').toLowerCase() === (answer || '').toLowerCase();
    return false;
  };

  if(loading) return <LoadingSpinner message="Đang chuẩn bị bài..." />;
  if(!items.length) return <div className="p-6">Không có câu hỏi để làm.</div>;

  const current = items[index];

  return (
    <VocabularyLayout title={`Làm bài: ${testId}`} breadcrumbItems={[{label:'Từ vựng', path:'/vocabulary'},{label:'Bài làm'}]}>
      <div className="max-w-3xl mx-auto bg-white rounded-lg p-6 shadow">
        <div className="mb-2 text-sm text-gray-600">Câu {index+1} / {items.length} — Thời gian còn lại: {timeLeft}s</div>
        <div className="mb-4">
          {settings.mode === 'meaning_to_word' && (
            <div>
              <div className="text-lg font-semibold">Nghĩa: {current.meaning}</div>
              <input className="mt-4 w-full border rounded px-3 py-2" placeholder="Gõ từ tương ứng" onKeyDown={(e)=>{ if(e.key==='Enter'){ handleSubmit(e.target.value); e.target.value=''; } }} />
            </div>
          )}
          {settings.mode === 'word_to_meaning' && (
            <div>
              <div className="text-lg font-semibold">Từ: {current.word}</div>
              <input className="mt-4 w-full border rounded px-3 py-2" placeholder="Gõ nghĩa hoặc từ đồng nghĩa" onKeyDown={(e)=>{ if(e.key==='Enter'){ handleSubmit(e.target.value); e.target.value=''; } }} />
            </div>
          )}
          {settings.mode === 'listen_and_type' && (
            <div>
              <div className="text-lg font-semibold">Nghe và gõ lại từ</div>
              <button className="px-3 py-2 bg-gray-100 rounded" onClick={() => { const u = new SpeechSynthesisUtterance(current.word); window.speechSynthesis.speak(u); }}>Nghe</button>
              <input className="mt-4 w-full border rounded px-3 py-2" placeholder="Gõ từ nghe được" onKeyDown={(e)=>{ if(e.key==='Enter'){ handleSubmit(e.target.value); e.target.value=''; } }} />
            </div>
          )}
        </div>
        <div className="flex justify-between">
          <button className="px-3 py-2 border rounded" onClick={() => { navigate(-1); }}>Thoát</button>
          <button className="px-3 py-2 bg-indigo-600 text-white rounded" onClick={() => handleSubmit(null)}>Nộp câu</button>
        </div>
      </div>
    </VocabularyLayout>
  );
};

export default VocabularyTestTake;
