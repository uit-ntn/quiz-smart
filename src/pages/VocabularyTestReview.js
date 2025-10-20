import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VocabularyLayout from '../layout/VocabularyLayout';

const VocabularyTestReview = () => {
  const { testId } = useParams();
  const [result, setResult] = useState(null);

  useEffect(()=>{
    try{
      const raw = localStorage.getItem(`vocab_result_${testId}`);
      if(raw) setResult(JSON.parse(raw));
    }catch(e){console.error(e);}    
  },[testId]);

  if(!result) return (
    <VocabularyLayout title="Kết quả">
      <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">Không tìm thấy kết quả. Có thể bạn chưa hoàn thành bài hoặc dữ liệu đã bị xóa.</div>
    </VocabularyLayout>
  );

  const correct = (result.answers || []).filter(a => a.correct).length;

  return (
    <VocabularyLayout title="Xem lại kết quả" description={`Bạn đúng ${correct} / ${result.answers.length}`}>
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-6 space-y-4">
        <div className="text-lg font-semibold">Tổng quan</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded">Đúng: {correct}</div>
          <div className="p-4 bg-red-50 rounded">Sai: {result.answers.length - correct}</div>
        </div>

        <div>
          {(result.answers || []).map((a, idx) => (
            <div key={idx} className="p-3 border rounded mb-2">
              <div className="font-medium">Câu {idx+1}</div>
              <div className="text-sm text-gray-700">Từ: {a.item?.word} — Nghĩa: {a.item?.meaning}</div>
              <div className="mt-2">Đáp án bạn chọn: <span className={`font-semibold ${a.correct? 'text-green-600':'text-red-600'}`}>{a.answer || '(không có)'}</span></div>
              {a.item?.example_sentence && <div className="mt-1 text-sm text-gray-500">Ví dụ: {a.item.example_sentence}</div>}
            </div>
          ))}
        </div>
      </div>
    </VocabularyLayout>
  );
};

export default VocabularyTestReview;
