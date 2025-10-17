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
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h1 className="text-5xl font-bold mb-6">
                <span className="mr-4">❓</span>
                Trung tâm trợ giúp
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Tìm hiểu cách sử dụng QuizSmart một cách hiệu quả nhất
              </p>
              {/* Search Box */}
              <div className="flex">
                <input 
                  type="text" 
                  className="flex-1 px-4 py-3 text-gray-900 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-300" 
                  placeholder="Tìm kiếm câu hỏi..."
                />
                <button className="px-6 py-3 bg-white text-blue-600 rounded-r-lg hover:bg-gray-100 transition-colors duration-200">
                  🔍
                </button>
              </div>
            </div>
            <div className="text-center">
              <div className="text-8xl text-yellow-400">🎧</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4">
                  <h6 className="font-bold text-gray-900">Danh mục</h6>
                </div>
                <div className="divide-y divide-gray-200">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      className={`w-full px-6 py-4 text-left flex items-center hover:bg-gray-50 transition-colors duration-200 ${
                        activeSection === section.id ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-700'
                      }`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <span className="mr-3 text-lg">
                        {section.icon === 'bi-play-circle' && '▶️'}
                        {section.icon === 'bi-list-ul' && '📝'}
                        {section.icon === 'bi-volume-up' && '🔊'}
                        {section.icon === 'bi-lightbulb' && '💡'}
                        {section.icon === 'bi-question-circle' && '❓'}
                      </span>
                      {section.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeSection === 'getting-started' && (
                <div className="help-content">
                  <h2 className="text-3xl font-bold mb-8 text-gray-900">Bắt đầu với QuizSmart</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                      <h5 className="text-xl font-semibold mb-4 flex items-center">
                        <span className="text-2xl text-blue-600 mr-3">1️⃣</span>
                        Nhập từ vựng
                      </h5>
                      <p className="text-gray-600 mb-4">
                        Nhập hoặc copy-paste danh sách từ vựng theo định dạng: 
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">từ vựng : nghĩa</code>
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="font-mono text-sm text-gray-700">
                          hello : xin chào<br/>
                          world : thế giới<br/>
                          study : học tập
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                      <h5 className="text-xl font-semibold mb-4 flex items-center">
                        <span className="text-2xl text-green-600 mr-3">2️⃣</span>
                        Chọn chế độ
                      </h5>
                      <p className="text-gray-600 mb-4">
                        Chọn một trong 3 chế độ quiz phù hợp với mục tiêu học tập
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center"><span className="text-green-500 mr-2">✅</span>Quiz từ vựng</li>
                        <li className="flex items-center"><span className="text-green-500 mr-2">✅</span>Quiz nghĩa</li>
                        <li className="flex items-center"><span className="text-green-500 mr-2">✅</span>Quiz nghe</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                      <h5 className="text-xl font-semibold mb-4 flex items-center">
                        <span className="text-2xl text-yellow-600 mr-3">3️⃣</span>
                        Làm quiz
                      </h5>
                      <p className="text-gray-600 mb-4">
                        Trả lời các câu hỏi và nhận feedback ngay lập tức
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-sm text-blue-800">
                          <span className="mr-2">ℹ️</span>
                          Nhấn Enter để tiếp tục nhanh chóng
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                      <h5 className="text-xl font-semibold mb-4 flex items-center">
                        <span className="text-2xl text-red-600 mr-3">4️⃣</span>
                        Xem kết quả
                      </h5>
                      <p className="text-gray-600 mb-4">
                        Kiểm tra điểm số và xem chi tiết các câu trả lời
                      </p>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Đúng</span>
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Sai</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Điểm số</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'quiz-modes' && (
                <div className="help-content">
                  <h2 className="text-3xl font-bold mb-8 text-gray-900">Các chế độ Quiz</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="bg-blue-50 px-6 py-4 border-l-4 border-blue-500">
                        <h3 className="text-xl font-semibold text-blue-800 flex items-center">
                          <span className="text-2xl mr-3">📚</span>
                          Quiz từ vựng
                        </h3>
                      </div>
                      <div className="p-6">
                        <p className="text-gray-600 mb-4">Chế độ này hiển thị nghĩa của từ và bạn cần điền từ vựng tương ứng.</p>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="font-semibold mb-2">Ví dụ:</div>
                          <div className="text-gray-600">Nghĩa: xin chào</div>
                          <div className="text-gray-600">Bạn điền: hello</div>
                        </div>
                        <p className="text-gray-700">
                          <span className="font-semibold">Phù hợp cho:</span> Kiểm tra khả năng nhớ từ vựng từ nghĩa tiếng Việt.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="bg-green-50 px-6 py-4 border-l-4 border-green-500">
                        <h3 className="text-xl font-semibold text-green-800 flex items-center">
                          <span className="text-2xl mr-3">🌐</span>
                          Quiz nghĩa
                        </h3>
                      </div>
                      <div className="p-6">
                        <p className="text-gray-600 mb-4">Chế độ này hiển thị từ vựng tiếng Anh và bạn cần điền nghĩa tiếng Việt.</p>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="font-semibold mb-2">Ví dụ:</div>
                          <div className="text-gray-600">Từ vựng: hello</div>
                          <div className="text-gray-600">Bạn điền: xin chào</div>
                        </div>
                        <p className="text-gray-700">
                          <span className="font-semibold">Phù hợp cho:</span> Hiểu sâu về ý nghĩa và cách sử dụng từ.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="bg-yellow-50 px-6 py-4 border-l-4 border-yellow-500">
                        <h3 className="text-xl font-semibold text-yellow-800 flex items-center">
                          <span className="text-2xl mr-3">🔊</span>
                          Quiz nghe
                        </h3>
                      </div>
                      <div className="p-6">
                        <p className="text-gray-600 mb-4">Chế độ này phát âm từ vựng và bạn cần điền từ bạn nghe được.</p>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="font-semibold mb-2">Ví dụ:</div>
                          <div className="text-gray-600">Bạn nghe: 🔊 hello</div>
                          <div className="text-gray-600">Bạn điền: hello</div>
                        </div>
                        <p className="text-gray-700">
                          <span className="font-semibold">Phù hợp cho:</span> Cải thiện khả năng nghe và phát âm.
                        </p>
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