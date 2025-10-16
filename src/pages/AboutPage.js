import React from 'react';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Nguyễn Thanh Nhân',
      role: 'Founder & Developer',
      image: 'https://via.placeholder.com/150',
      description: 'Sinh viên Đại học Công nghệ Thông tin, đam mê phát triển ứng dụng web và AI.',
      email: 'npthanhnhan2003@gmail.com',
      github: 'https://github.com/npthanhnhan2003',
      linkedin: 'https://linkedin.com/in/npthanhnhan2003'
    }
  ];

  const milestones = [
    {
      year: '2025',
      title: 'Ý tưởng khởi nguồn',
      description: 'Sinh viên Nguyễn Thanh Nhân bắt đầu phát triển ứng dụng học từ vựng thông minh'
    },
    {
      year: '2025',
      title: 'Phát triển MVP',
      description: 'Hoàn thành phiên bản đầu tiên với tính năng quiz đa dạng và phát âm AI'
    },
    {
      year: '2025',
      title: 'Ra mắt QuizSmart',
      description: 'Chính thức giới thiệu ứng dụng với cộng đồng học tập'
    },
    {
      year: '2025',
      title: 'Tương lai',
      description: 'Mở rộng tính năng AI cá nhân hóa và cộng đồng học tập'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Về QuizSmart
              </h1>
              <p className="lead mb-4">
                Chúng tôi tin rằng việc học từ vựng không cần phải nhàm chán. 
                QuizSmart được tạo ra để biến việc học thành một trải nghiệm thú vị và hiệu quả.
              </p>
              <div className="d-flex gap-3">
                <div className="text-center">
                  <h3 className="fw-bold">2024</h3>
                  <small>Năm thành lập</small>
                </div>
                <div className="text-center">
                  <h3 className="fw-bold">500+</h3>
                  <small>Người dùng</small>
                </div>
                <div className="text-center">
                  <h3 className="fw-bold">3</h3>
                  <small>Chế độ quiz</small>
                </div>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <i className="bi bi-people-fill display-1 text-warning"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-4">
              <div className="text-center">
                <div className="bg-primary bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                  <i className="bi bi-target fs-1 text-primary"></i>
                </div>
                <h4 className="fw-bold">Sứ mệnh</h4>
                <p className="text-muted">
                  Làm cho việc học từ vựng trở nên dễ dàng, thú vị và hiệu quả 
                  cho mọi người, mọi lúc, mọi nơi.
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="text-center">
                <div className="bg-success bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                  <i className="bi bi-eye fs-1 text-success"></i>
                </div>
                <h4 className="fw-bold">Tầm nhìn</h4>
                <p className="text-muted">
                  Trở thành nền tảng học từ vựng hàng đầu Việt Nam, 
                  hỗ trợ hàng triệu người cải thiện khả năng ngôn ngữ.
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="text-center">
                <div className="bg-warning bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                  <i className="bi bi-heart fs-1 text-warning"></i>
                </div>
                <h4 className="fw-bold">Giá trị</h4>
                <p className="text-muted">
                  Đổi mới, chất lượng, tính cộng đồng và sự phát triển bền vững 
                  trong giáo dục.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">
              Hành trình phát triển
            </h2>
            <p className="lead text-muted">
              Những cột mốc quan trọng trong sự phát triển của QuizSmart
            </p>
          </div>
          
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="timeline">
                {milestones.map((milestone, index) => (
                  <div key={index} className="timeline-item d-flex mb-4">
                    <div className="timeline-marker bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px', minWidth: '50px'}}>
                      <strong>{milestone.year}</strong>
                    </div>
                    <div className="timeline-content">
                      <h5 className="fw-bold">{milestone.title}</h5>
                      <p className="text-muted mb-0">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">
              Đội ngũ của chúng tôi
            </h2>
            <p className="lead text-muted">
              Những con người tài năng đằng sau QuizSmart
            </p>
          </div>
          
          <div className="row g-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <div className="card border-0 shadow-sm text-center h-100">
                  <div className="card-body p-4">
                    <div className="avatar-placeholder bg-primary bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{width: '100px', height: '100px'}}>
                      <i className="bi bi-person-fill fs-1 text-primary"></i>
                    </div>
                    <h5 className="card-title fw-bold">{member.name}</h5>
                    <p className="text-primary fw-medium">{member.role}</p>
                    <p className="card-text text-muted small">{member.description}</p>
                    
                    {/* Contact Links */}
                    <div className="d-flex justify-content-center gap-2 mt-3">
                      <a href={`mailto:${member.email}`} 
                         className="btn btn-outline-primary btn-sm" 
                         title="Email">
                        <i className="bi bi-envelope"></i>
                      </a>
                      <a href={member.github} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="btn btn-outline-dark btn-sm" 
                         title="GitHub">
                        <i className="bi bi-github"></i>
                      </a>
                      <a href={member.linkedin} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="btn btn-outline-info btn-sm" 
                         title="LinkedIn">
                        <i className="bi bi-linkedin"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="display-6 fw-bold mb-3">
            Kết nối với chúng tôi
          </h2>
          <p className="lead mb-4">
            Có câu hỏi hay góp ý? Chúng tôi luôn sẵn sàng lắng nghe!
          </p>
          <div className="row g-4 justify-content-center">
            <div className="col-md-4">
              <i className="bi bi-envelope-fill fs-1 mb-3"></i>
              <h5>Email</h5>
              <p>support@quizsmart.com</p>
            </div>
            <div className="col-md-4">
              <i className="bi bi-telephone-fill fs-1 mb-3"></i>
              <h5>Điện thoại</h5>
              <p>+84 123 456 789</p>
            </div>
            <div className="col-md-4">
              <i className="bi bi-geo-alt-fill fs-1 mb-3"></i>
              <h5>Địa chỉ</h5>
              <p>Hà Nội, Việt Nam</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;