import React from 'react';

const QuizSelection = ({ onSelectQuizType, vocabulary, onBackToInput }) => {
  const handleQuizTypeSelect = (type) => {
    onSelectQuizType(type);
  };

  return (
    <>
      {/* Full Screen Modal Overlay */}
      <div 
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
        style={{ 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          zIndex: 1050 
        }}
      >
        <div className="bg-white rounded shadow-lg" style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
          <div className="bg-primary text-white p-4 rounded-top">
            <h5 className="text-center fw-bold mb-0">
              <i className="bi bi-lightning-charge-fill text-warning me-2"></i>
              Chọn loại Quiz
            </h5>
          </div>
          
          <div className="p-4">
            <div className="alert alert-info d-flex align-items-center mb-4">
              <i className="bi bi-info-circle-fill me-2"></i>
              <span>Đã tải <strong>{vocabulary.length}</strong> từ vựng thành công</span>
            </div>
            
            <div className="d-grid gap-3">
              <button
                onClick={() => handleQuizTypeSelect('vocabulary')}
                className="btn btn-outline-primary btn-lg text-start p-3"
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-book-fill fs-4 me-3 text-primary"></i>
                  <div>
                    <div className="fw-bold fs-5">Quiz từ vựng</div>
                    <small className="text-muted">Cho nghĩa, điền từ vựng</small>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleQuizTypeSelect('meaning')}
                className="btn btn-outline-success btn-lg text-start p-3"
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-translate fs-4 me-3 text-success"></i>
                  <div>
                    <div className="fw-bold fs-5">Quiz nghĩa</div>
                    <small className="text-muted">Cho từ vựng, điền nghĩa</small>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleQuizTypeSelect('listening')}
                className="btn btn-outline-purple btn-lg text-start p-3"
                style={{ borderColor: '#6f42c1', color: '#6f42c1' }}
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-volume-up-fill fs-4 me-3" style={{ color: '#6f42c1' }}></i>
                  <div>
                    <div className="fw-bold fs-5">Quiz Nghe</div>
                    <small className="text-muted">Nghe phát âm, điền từ vựng</small>
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          <div className="border-top p-3 text-center rounded-bottom">
            <button
              onClick={onBackToInput}
              className="btn btn-secondary"
            >
              <i className="bi bi-arrow-left me-2"></i>
              Quay lại nhập liệu
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizSelection;