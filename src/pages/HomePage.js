import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const features = [
    {
      icon: 'bi-book-fill',
      title: 'Quiz từ vựng',
      description: 'Cho nghĩa, điền từ vựng tương ứng. Phù hợp để kiểm tra khả năng nhớ từ.',
      color: 'primary'
    },
    {
      icon: 'bi-translate',
      title: 'Quiz nghĩa',
      description: 'Cho từ vựng, điền nghĩa. Giúp hiểu sâu hơn về ý nghĩa của từ.',
      color: 'success'
    },
    {
      icon: 'bi-volume-up-fill',
      title: 'Quiz nghe',
      description: 'Nghe phát âm và điền từ vựng. Cải thiện kỹ năng nghe và phát âm.',
      color: 'warning'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Từ vựng', icon: 'bi-journal-text' },
    { number: '500+', label: 'Người dùng', icon: 'bi-people-fill' },
    { number: '10k+', label: 'Quiz hoàn thành', icon: 'bi-trophy-fill' },
    { number: '98%', label: 'Độ hài lòng', icon: 'bi-heart-fill' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section py-5 bg-gradient-primary text-white">
        <div className="container">
          <div className="row align-items-center min-vh-75">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Học từ vựng thông minh với 
                <span className="text-warning"> QuizSmart</span>
              </h1>
              <p className="lead mb-4">
                Nâng cao vốn từ vựng của bạn với các bài quiz đa dạng, 
                tính năng phát âm AI và giao diện thân thiện.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/quiz" className="btn btn-light btn-lg px-4">
                  <i className="bi bi-play-circle-fill me-2"></i>
                  Bắt đầu ngay
                </Link>
                <Link to="/help" className="btn btn-outline-light btn-lg px-4">
                  <i className="bi bi-info-circle me-2"></i>
                  Tìm hiểu thêm
                </Link>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div className="hero-image">
                <i className="bi bi-mortarboard-fill display-1 text-warning"></i>
                <div className="mt-3">
                  <i className="bi bi-book me-3 fs-1 text-light opacity-75"></i>
                  <i className="bi bi-volume-up me-3 fs-1 text-light opacity-75"></i>
                  <i className="bi bi-translate fs-1 text-light opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">
              Các chế độ học đa dạng
            </h2>
            <p className="lead text-muted">
              Chọn chế độ phù hợp với mục tiêu học tập của bạn
            </p>
          </div>
          
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <div className="card h-100 shadow-sm border-0 hover-card">
                  <div className="card-body text-center p-4">
                    <div className={`feature-icon bg-${feature.color} bg-opacity-10 rounded-circle mx-auto mb-3`}>
                      <i className={`${feature.icon} fs-1 text-${feature.color}`}></i>
                    </div>
                    <h5 className="card-title fw-bold">{feature.title}</h5>
                    <p className="card-text text-muted">{feature.description}</p>
                    <Link to="/quiz" className={`btn btn-outline-${feature.color}`}>
                      Thử ngay
                      <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row g-4 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="stat-item">
                  <i className={`${stat.icon} fs-1 text-primary mb-3`}></i>
                  <h3 className="display-6 fw-bold text-dark">{stat.number}</h3>
                  <p className="text-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">
              Cách sử dụng
            </h2>
            <p className="lead text-muted">
              3 bước đơn giản để bắt đầu học từ vựng
            </p>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-4 text-center">
              <div className="step-number bg-primary text-white rounded-circle mx-auto mb-3">1</div>
              <h5 className="fw-bold">Nhập từ vựng</h5>
              <p className="text-muted">
                Copy-paste hoặc nhập danh sách từ vựng theo định dạng: từ : nghĩa
              </p>
            </div>
            <div className="col-lg-4 text-center">
              <div className="step-number bg-primary text-white rounded-circle mx-auto mb-3">2</div>
              <h5 className="fw-bold">Chọn chế độ</h5>
              <p className="text-muted">
                Lựa chọn Quiz từ vựng, Quiz nghĩa hoặc Quiz nghe phù hợp với bạn
              </p>
            </div>
            <div className="col-lg-4 text-center">
              <div className="step-number bg-primary text-white rounded-circle mx-auto mb-3">3</div>
              <h5 className="fw-bold">Bắt đầu học</h5>
              <p className="text-muted">
                Hoàn thành quiz và xem kết quả chi tiết để cải thiện
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="display-6 fw-bold text-dark mb-4">
                Về tác giả
              </h2>
              <div className="card border-0 shadow-lg">
                <div className="card-body p-5">
                  <div className="mb-4">
                    <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center" 
                         style={{ width: '100px', height: '100px' }}>
                      <i className="bi bi-person-fill fs-1 text-primary"></i>
                    </div>
                  </div>
                  <h4 className="fw-bold text-dark mb-2">Nguyễn Thanh Nhân</h4>
                  <p className="text-muted mb-3">Sinh viên Đại học Công nghệ Thông tin</p>
                  <p className="lead text-muted mb-4">
                    Đam mê phát triển ứng dụng web hiện đại và công nghệ AI. 
                    QuizSmart được tạo ra với mục tiêu giúp mọi người học từ vựng hiệu quả hơn.
                  </p>
                  <div className="d-flex justify-content-center gap-3">
                    <a href="mailto:npthanhnhan2003@gmail.com" 
                       className="btn btn-outline-primary">
                      <i className="bi bi-envelope me-2"></i>
                      Email
                    </a>
                    <a href="https://github.com/npthanhnhan2003" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="btn btn-outline-dark">
                      <i className="bi bi-github me-2"></i>
                      GitHub
                    </a>
                    <a href="https://linkedin.com/in/npthanhnhan2003" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="btn btn-outline-info">
                      <i className="bi bi-linkedin me-2"></i>
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="display-6 fw-bold mb-3">
            Sẵn sàng nâng cao từ vựng?
          </h2>
          <p className="lead mb-4">
            Tham gia cùng hàng nghìn người học đã cải thiện từ vựng với QuizSmart
          </p>
          <Link to="/quiz" className="btn btn-light btn-lg px-5">
            <i className="bi bi-rocket-takeoff me-2"></i>
            Bắt đầu ngay hôm nay
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;