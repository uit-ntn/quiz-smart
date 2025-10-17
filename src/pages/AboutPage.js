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
      description: 'Sinh viên Nguyễn Thanh Nhân bắt đầu phát triển ứng dụng quizz thông minh'
    },
    {
      year: '2025',
      title: 'Phát triển MVP',
      description: 'Hoàn thành phiên bản đầu tiên với tính năng quizz đa dạng và phát âm AI'
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">
                Về QuizSmart
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Chúng tôi tin rằng việc học từ vựng không cần phải nhàm chán. 
                QuizSmart được tạo ra để biến việc học thành một trải nghiệm thú vị và hiệu quả.
              </p>
              <div className="flex gap-8">
                <div className="text-center">
                  <h3 className="text-3xl font-bold">2025</h3>
                  <small className="text-blue-200">Năm thành lập</small>
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-bold">500+</h3>
                  <small className="text-blue-200">Người dùng</small>
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-bold">3</h3>
                  <small className="text-blue-200">Chế độ quiz</small>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-8xl text-yellow-400">👥</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <div className="text-3xl text-blue-600">🎯</div>
              </div>
              <h4 className="text-xl font-bold mb-4">Sứ mệnh</h4>
              <p className="text-gray-600">
                Làm cho việc học từ vựng trở nên dễ dàng, thú vị và hiệu quả 
                cho mọi người, mọi lúc, mọi nơi.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <div className="text-3xl text-green-600">👁️</div>
              </div>
              <h4 className="text-xl font-bold mb-4">Tầm nhìn</h4>
              <p className="text-gray-600">
                Trở thành nền tảng học từ vựng hàng đầu Việt Nam, 
                hỗ trợ hàng triệu người cải thiện khả năng ngôn ngữ.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <div className="text-3xl text-yellow-600">❤️</div>
              </div>
              <h4 className="text-xl font-bold mb-4">Giá trị</h4>
              <p className="text-gray-600">
                Đổi mới, chất lượng, tính cộng đồng và sự phát triển bền vững 
                trong giáo dục.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Hành trình phát triển
            </h2>
            <p className="text-xl text-gray-600">
              Những cột mốc quan trọng trong sự phát triển của QuizSmart
            </p>
          </div>
          
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-6">
                  {milestone.year}
                </div>
                <div className="flex-grow">
                  <h5 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h5>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Đội ngũ của chúng tôi
            </h2>
            <p className="text-xl text-gray-600">
              Những con người tài năng đằng sau QuizSmart
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg text-center h-full">
                <div className="p-8">
                  <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span className="text-4xl text-blue-600">👤</span>
                  </div>
                  <h5 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h5>
                  <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-6">{member.description}</p>
                  
                  {/* Contact Links */}
                  <div className="flex justify-center gap-3">
                    <a href={`mailto:${member.email}`} 
                       className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center text-blue-600 transition-colors duration-200" 
                       title="Email">
                      📧
                    </a>
                    <a href={member.github} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-colors duration-200" 
                       title="GitHub">
                      🐙
                    </a>
                    <a href={member.linkedin} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center text-blue-600 transition-colors duration-200" 
                       title="LinkedIn">
                      💼
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Kết nối với chúng tôi
          </h2>
          <p className="text-xl mb-12 text-blue-100">
            Có câu hỏi hay góp ý? Chúng tôi luôn sẵn sàng lắng nghe!
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <h5 className="text-xl font-semibold mb-2">Email</h5>
              <p className="text-blue-100">support@quizsmart.com</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">📞</div>
              <h5 className="text-xl font-semibold mb-2">Điện thoại</h5>
              <p className="text-blue-100">+84 123 456 789</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">📍</div>
              <h5 className="text-xl font-semibold mb-2">Địa chỉ</h5>
              <p className="text-blue-100">Hà Nội, Việt Nam</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;