import React, { useState } from 'react';

const HelpPage = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const faqs = [
    {
      question: 'Làm thế nào để bắt đầu sử dụng QuizSmart?',
      answer: 'Bạn chỉ cần nhập danh sách từ vựng theo định dạng "từ : nghĩa", chọn chế độ quiz phù hợp và bắt đầu học ngay!'
    },
    {
      question: 'Định dạng nhập từ vựng như thế nào?',
      answer: 'Mỗi dòng một từ với định dạng: "từ vựng : nghĩa". Ví dụ: "hello : xin chào"'
    },
    {
      question: 'Có những chế độ quiz nào?',
      answer: 'Hiện tại có 3 chế độ: Quiz từ vựng (cho nghĩa, điền từ), Quiz nghĩa (cho từ, điền nghĩa), và Quiz nghe (nghe phát âm, điền từ).'
    },
    {
      question: 'Tính năng phát âm hoạt động như thế nào?',
      answer: 'Chúng tôi sử dụng Web Speech API để phát âm từ vựng. Bạn có thể điều chỉnh tốc độ, giọng đọc và âm lượng.'
    },
    {
      question: 'Có giới hạn số lượng từ vựng không?',
      answer: 'Hiện tại không có giới hạn số lượng từ vựng bạn có thể nhập vào.'
    },
    {
      question: 'Kết quả quiz có được lưu lại không?',
      answer: 'Hiện tại kết quả chỉ hiển thị trong phiên làm việc. Tính năng lưu trữ sẽ được cập nhật trong tương lai.'
    }
  ];

  const sections = [
    { id: 'getting-started', title: 'Bắt đầu', icon: 'bi-play-circle' },
    { id: 'quiz-modes', title: 'Chế độ Quiz', icon: 'bi-list-ul' },
    { id: 'speech', title: 'Tính năng Nghe', icon: 'bi-volume-up' },
    { id: 'tips', title: 'Mẹo học tập', icon: 'bi-lightbulb' },
    { id: 'faq', title: 'FAQ', icon: 'bi-question-circle' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-4">
                <i className="bi bi-question-circle-fill me-3"></i>
                Trung tâm trợ giúp
              </h1>
              <p className="lead mb-4">
                Tìm hiểu cách sử dụng QuizSmart một cách hiệu quả nhất
              </p>
              {/* Search Box */}
              <div className="input-group input-group-lg">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Tìm kiếm câu hỏi..."
                />
                <button className="btn btn-light" type="button">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </div>
            <div className="col-lg-4 text-center">
              <i className="bi bi-headset display-1 text-warning"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            {/* Sidebar */}
            <div className="col-lg-3 mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-light">
                  <h6 className="mb-0 fw-bold">Danh mục</h6>
                </div>
                <div className="list-group list-group-flush">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      className={`list-group-item list-group-item-action d-flex align-items-center ${
                        activeSection === section.id ? 'active' : ''
                      }`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <i className={`${section.icon} me-3`}></i>
                      {section.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="col-lg-9">
              {activeSection === 'getting-started' && (
                <div className="help-content">
                  <h2 className="fw-bold mb-4">Bắt đầu với QuizSmart</h2>
                  
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-1-circle-fill text-primary me-2"></i>
                            Nhập từ vựng
                          </h5>
                          <p className="card-text">
                            Nhập hoặc copy-paste danh sách từ vựng theo định dạng: 
                            <code>từ vựng : nghĩa</code>
                          </p>
                          <div className="bg-light p-3 rounded">
                            <small className="font-monospace">
                              hello : xin chào<br/>
                              world : thế giới<br/>
                              study : học tập
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-2-circle-fill text-success me-2"></i>
                            Chọn chế độ
                          </h5>
                          <p className="card-text">
                            Chọn một trong 3 chế độ quiz phù hợp với mục tiêu học tập
                          </p>
                          <ul className="list-unstyled">
                            <li><i className="bi bi-check text-success me-2"></i>Quiz từ vựng</li>
                            <li><i className="bi bi-check text-success me-2"></i>Quiz nghĩa</li>
                            <li><i className="bi bi-check text-success me-2"></i>Quiz nghe</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-3-circle-fill text-warning me-2"></i>
                            Làm quiz
                          </h5>
                          <p className="card-text">
                            Trả lời các câu hỏi và nhận feedback ngay lập tức
                          </p>
                          <div className="alert alert-info">
                            <small>
                              <i className="bi bi-info-circle me-2"></i>
                              Nhấn Enter để tiếp tục nhanh chóng
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-4-circle-fill text-danger me-2"></i>
                            Xem kết quả
                          </h5>
                          <p className="card-text">
                            Kiểm tra điểm số và xem chi tiết các câu trả lời
                          </p>
                          <div className="d-flex gap-2">
                            <span className="badge bg-success">Đúng</span>
                            <span className="badge bg-danger">Sai</span>
                            <span className="badge bg-primary">Điểm số</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'quiz-modes' && (
                <div className="help-content">
                  <h2 className="fw-bold mb-4">Các chế độ Quiz</h2>
                  
                  <div className="accordion" id="quizModeAccordion">
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#vocabulary-mode">
                          <i className="bi bi-book-fill text-primary me-3"></i>
                          Quiz từ vựng
                        </button>
                      </h2>
                      <div id="vocabulary-mode" className="accordion-collapse collapse show" data-bs-parent="#quizModeAccordion">
                        <div className="accordion-body">
                          <p>Chế độ này hiển thị nghĩa của từ và bạn cần điền từ vựng tương ứng.</p>
                          <div className="bg-light p-3 rounded">
                            <strong>Ví dụ:</strong><br/>
                            <span className="text-muted">Nghĩa:</span> xin chào<br/>
                            <span className="text-muted">Bạn điền:</span> hello
                          </div>
                          <p className="mt-3">
                            <strong>Phù hợp cho:</strong> Kiểm tra khả năng nhớ từ vựng từ nghĩa tiếng Việt.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#meaning-mode">
                          <i className="bi bi-translate text-success me-3"></i>
                          Quiz nghĩa
                        </button>
                      </h2>
                      <div id="meaning-mode" className="accordion-collapse collapse" data-bs-parent="#quizModeAccordion">
                        <div className="accordion-body">
                          <p>Chế độ này hiển thị từ vựng tiếng Anh và bạn cần điền nghĩa tiếng Việt.</p>
                          <div className="bg-light p-3 rounded">
                            <strong>Ví dụ:</strong><br/>
                            <span className="text-muted">Từ vựng:</span> hello<br/>
                            <span className="text-muted">Bạn điền:</span> xin chào
                          </div>
                          <p className="mt-3">
                            <strong>Phù hợp cho:</strong> Hiểu sâu về ý nghĩa và cách sử dụng từ.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#listening-mode">
                          <i className="bi bi-volume-up-fill text-warning me-3"></i>
                          Quiz nghe
                        </button>
                      </h2>
                      <div id="listening-mode" className="accordion-collapse collapse" data-bs-parent="#quizModeAccordion">
                        <div className="accordion-body">
                          <p>Chế độ này phát âm từ vựng và bạn cần điền từ bạn nghe được.</p>
                          <div className="bg-light p-3 rounded">
                            <strong>Ví dụ:</strong><br/>
                            <span className="text-muted">Bạn nghe:</span> 🔊 hello<br/>
                            <span className="text-muted">Bạn điền:</span> hello
                          </div>
                          <p className="mt-3">
                            <strong>Phù hợp cho:</strong> Cải thiện khả năng nghe và phát âm.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'speech' && (
                <div className="help-content">
                  <h2 className="fw-bold mb-4">Tính năng Nghe và Phát âm</h2>
                  
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Tính năng này chỉ hoạt động trên các trình duyệt hỗ trợ Web Speech API (Chrome, Firefox, Safari, Edge).
                  </div>
                  
                  <h4>Cài đặt giọng đọc</h4>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <h6>Tốc độ phát âm</h6>
                      <p>Điều chỉnh từ 0.3x (rất chậm) đến 2.0x (rất nhanh)</p>
                    </div>
                    <div className="col-md-6">
                      <h6>Âm lượng</h6>
                      <p>Điều chỉnh từ 10% đến 100%</p>
                    </div>
                    <div className="col-md-6">
                      <h6>Cao độ giọng</h6>
                      <p>Điều chỉnh từ 0.5x (trầm) đến 2.0x (cao)</p>
                    </div>
                    <div className="col-md-6">
                      <h6>Giọng đọc</h6>
                      <p>Chọn từ các giọng tiếng Anh có sẵn</p>
                    </div>
                  </div>
                  
                  <h4>Cài đặt nhanh</h4>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div className="card">
                        <div className="card-body text-center">
                          <i className="bi bi-speedometer text-info fs-3"></i>
                          <h6 className="mt-2">Chậm</h6>
                          <small>Tốc độ 0.5x</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card">
                        <div className="card-body text-center">
                          <i className="bi bi-speedometer2 text-success fs-3"></i>
                          <h6 className="mt-2">Bình thường</h6>
                          <small>Tốc độ 0.7x</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card">
                        <div className="card-body text-center">
                          <i className="bi bi-lightning text-warning fs-3"></i>
                          <h6 className="mt-2">Nhanh</h6>
                          <small>Tốc độ 1.2x</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card">
                        <div className="card-body text-center">
                          <i className="bi bi-mic text-primary fs-3"></i>
                          <h6 className="mt-2">Rõ ràng</h6>
                          <small>Pitch 1.1x</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'tips' && (
                <div className="help-content">
                  <h2 className="fw-bold mb-4">Mẹo học tập hiệu quả</h2>
                  
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h5 className="card-title text-primary">
                            <i className="bi bi-clock me-2"></i>
                            Học đều đặn
                          </h5>
                          <p>Dành 15-20 phút mỗi ngày để làm quiz thay vì học dồn trong thời gian dài.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h5 className="card-title text-success">
                            <i className="bi bi-arrow-repeat me-2"></i>
                            Lặp lại nhiều lần
                          </h5>
                          <p>Làm lại quiz với những từ bạn đã sai để củng cố kiến thức.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h5 className="card-title text-warning">
                            <i className="bi bi-volume-up me-2"></i>
                            Kết hợp nghe và viết
                          </h5>
                          <p>Sử dụng cả Quiz nghe và Quiz từ vựng để học toàn diện.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <h5 className="card-title text-info">
                            <i className="bi bi-journal-text me-2"></i>
                            Ghi chú từ khó
                          </h5>
                          <p>Lưu lại những từ thường sai để ôn tập thêm.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'faq' && (
                <div className="help-content">
                  <h2 className="fw-bold mb-4">Câu hỏi thường gặp</h2>
                  
                  <div className="accordion" id="faqAccordion">
                    {faqs.map((faq, index) => (
                      <div key={index} className="accordion-item">
                        <h2 className="accordion-header">
                          <button 
                            className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`}
                            type="button" 
                            data-bs-toggle="collapse" 
                            data-bs-target={`#faq-${index}`}
                          >
                            {faq.question}
                          </button>
                        </h2>
                        <div 
                          id={`faq-${index}`}
                          className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                          data-bs-parent="#faqAccordion"
                        >
                          <div className="accordion-body">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-5 bg-light">
        <div className="container text-center">
          <h3 className="fw-bold mb-3">Vẫn cần hỗ trợ?</h3>
          <p className="text-muted mb-4">
            Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <a href="mailto:support@quizsmart.com" className="btn btn-primary">
              <i className="bi bi-envelope me-2"></i>
              Gửi email
            </a>
            <a href="tel:+84123456789" className="btn btn-outline-primary">
              <i className="bi bi-telephone me-2"></i>
              Gọi điện
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpPage;