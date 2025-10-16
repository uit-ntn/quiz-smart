import React, { useState } from 'react';

const DataInput = ({ onStartQuiz }) => {
  const [inputData, setInputData] = useState('');

  const handleInputChange = (e) => {
    setInputData(e.target.value);
  };

  const parseData = () => {
    const lines = inputData.trim().split('\n');
    const vocabulary = [];
    
    lines.forEach(line => {
      if (line.trim()) {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const word = parts[0].trim();
          const meaning = parts.slice(1).join(':').trim();
          vocabulary.push({ word, meaning });
        }
      }
    });
    
    return vocabulary;
  };

  const handleStartQuiz = () => {
    const vocabulary = parseData();
    if (vocabulary.length > 0) {
      onStartQuiz(vocabulary);
    } else {
      alert('Vui lòng nhập dữ liệu từ vựng hợp lệ!');
    }
  };

  const wordCount = parseData().length;

  return (
    <div>
      <h2 className="h4 fw-semibold text-dark mb-4">Nhập dữ liệu từ vựng</h2>
      
      <div className="mb-4">
        <label className="form-label fw-medium text-muted">
          Định dạng: từ vựng : nghĩa (mỗi dòng một từ)
        </label>
        <div className="example-box p-3 rounded mb-3">
          <p className="small text-muted mb-2">Ví dụ:</p>
          <div className="font-monospace small text-dark">
            hello : xin chào<br/>
            world : thế giới<br/>
            computer : máy tính<br/>
            study : học tập
          </div>
        </div>
      </div>

      <div className="mb-3">
        <textarea
          value={inputData}
          onChange={handleInputChange}
          placeholder="Nhập từ vựng theo định dạng: từ : nghĩa&#10;Ví dụ:&#10;hello : xin chào&#10;world : thế giới"
          className="form-control font-monospace"
          rows="10"
          style={{ resize: 'vertical' }}
        />
      </div>
      
      {inputData && (
        <div className="text-muted small mb-3">
          <i className="bi bi-check-circle"></i> Đã nhập: <span className="fw-bold text-primary">{wordCount}</span> từ vựng
        </div>
      )}
      
      <div className="d-flex gap-2 mb-4">
        <button
          onClick={handleStartQuiz}
          className="btn btn-gradient-primary text-white px-4 py-2"
          disabled={wordCount === 0}
        >
          <i className="bi bi-play-fill me-2"></i>
          Bắt đầu Quiz ({wordCount} từ)
        </button>
      </div>
      
      <div className="instructions-box p-4 rounded">
        <h5 className="fw-semibold text-dark mb-3">
          <i className="bi bi-info-circle me-2"></i>
          Hướng dẫn sử dụng
        </h5>
        <div className="row g-3">
          <div className="col-12">
            <div className="d-flex align-items-start">
              <div className="step-number me-3">1</div>
              <span className="text-muted">Nhập hoặc copy-paste dữ liệu từ vựng vào ô trên</span>
            </div>
          </div>
          <div className="col-12">
            <div className="d-flex align-items-start">
              <div className="step-number me-3">2</div>
              <span className="text-muted">Mỗi dòng một từ, định dạng: "từ vựng : nghĩa"</span>
            </div>
          </div>
          <div className="col-12">
            <div className="d-flex align-items-start">
              <div className="step-number me-3">3</div>
              <span className="text-muted">Bấm "Bắt đầu Quiz" để chọn loại quiz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataInput;