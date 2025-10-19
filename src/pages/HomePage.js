import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [stats, setStats] = useState({
    totalTopics: 0,
    totalQuestions: 0,
    totalUsers: 0,
    completedTests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/topics`);
      if (response.ok) {
        const data = await response.json();
        const topics = data.data || [];
        setStats({
          totalTopics: topics.length,
          totalQuestions: topics.reduce((sum, topic) => sum + topic.totalQuestions, 0),
          totalUsers: 1250, // Mock data
          completedTests: 15420 // Mock data
        });
      } else {
        // Use mock data if API fails
        setStats({
          totalTopics: 15,
          totalQuestions: 2500,
          totalUsers: 1250,
          completedTests: 15420
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use mock data if API fails
      setStats({
        totalTopics: 15,
        totalQuestions: 2500,
        totalUsers: 1250,
        completedTests: 15420
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: 'fas fa-brain',
      title: 'Luyện trí thông minh',
      description: 'Hệ thống AI giúp tối ưu hóa quá trình học tập của bạn',
      color: 'purple',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Theo dõi tiến độ',
      description: 'Thống kê chi tiết giúp bạn nắm rõ kết quả học tập',
      color: 'success',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
    },
    {
      icon: 'fas fa-users',
      title: 'Cộng đồng học tập',
      description: 'Kết nối và thi đua với hàng nghìn người học khác',
      color: 'info',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  ];

  const statsDisplay = [
    {
      number: loading ? '...' : stats.totalTopics,
      label: 'Chủ đề',
      icon: 'fas fa-folder-open',
      color: 'primary'
    },
    {
      number: loading ? '...' : stats.totalQuestions,
      label: 'Câu hỏi',
      icon: 'fas fa-question-circle',
      color: 'success'
    },
    {
      number: loading ? '...' : `${stats.totalUsers}+`,
      label: 'Người dùng',
      icon: 'fas fa-users',
      color: 'info'
    },
    {
      number: loading ? '...' : `${Math.floor(stats.completedTests / 1000)}k+`,
      label: 'Tests hoàn thành',
      icon: 'fas fa-trophy',
      color: 'warning'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            <div className="text-center lg:text-left">
              <div className="inline-block bg-yellow-400 text-black text-sm font-semibold px-4 py-2 rounded-full mb-6">
                Nền tảng giúp bạn học tập hiệu quả hơn
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
                Học thông minh với
                <span className="block bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  QuizSmart
                </span>
              </h1>
              <p className="text-xl mb-8 text-white opacity-90 leading-relaxed">
                Khám phá phương pháp học tập hiện đại
                từ TOEIC, IELTS đến AWS, Azure,... và các kỹ năng chuyên môn khác.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/tests/topics"
                  className="bg-yellow-400 text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-500 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="mr-2">📚</span>
                  Chọn chủ đề trắc nghiệm
                </Link>

                <Link
                  to="/vocabulary"
                  className="bg-purple-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="mr-2">🧠</span>
                  Luyện tập từ vựng tiếng Anh
                </Link>

                <Link
                  to="/grammar"
                  className="bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="mr-2">📖</span>
                  Luyện tập ngữ pháp tiếng Anh
                </Link>

              </div>
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto lg:mx-0">
                {statsDisplay.slice(0, 2).map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-xl border border-white border-opacity-20">
                      <div className="text-2xl mb-2">{stat.icon === 'fas fa-folder-open' ? '📁' : '❓'}</div>
                      <div className="text-2xl font-bold text-white">{stat.number}</div>
                      <div className="text-sm text-white opacity-75">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative h-96 lg:h-[500px]">
                <div className="absolute top-8 left-8 bg-white bg-opacity-90 backdrop-blur-sm p-4 rounded-xl shadow-lg animate-bounce">
                  <div className="text-2xl text-blue-600 mb-2">🧠</div>
                  <div className="font-semibold">AI Learning</div>
                </div>
                <div className="absolute top-20 right-8 bg-white bg-opacity-90 backdrop-blur-sm p-4 rounded-xl shadow-lg animate-bounce" style={{ animationDelay: '2s' }}>
                  <div className="text-2xl text-yellow-600 mb-2">🏆</div>
                  <div className="font-semibold">Achievements</div>
                </div>
                <div className="absolute bottom-20 left-1/3 bg-white bg-opacity-90 backdrop-blur-sm p-4 rounded-xl shadow-lg animate-bounce" style={{ animationDelay: '4s' }}>
                  <div className="text-2xl text-green-600 mb-2">📈</div>
                  <div className="font-semibold">Progress</div>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-20">
                  <div className="text-9xl">🎓</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Tại sao chọn QuizSmart?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nền tảng học tập hiện đại với công nghệ AI, giúp bạn học nhanh hơn và hiệu quả hơn
            </p>
          </div>

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 h-full text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div
                    className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-white text-2xl"
                    style={{ background: feature.gradient }}
                  >
                    {feature.icon === 'fas fa-brain' ? '🧠' : feature.icon === 'fas fa-chart-line' ? '📈' : '👥'}
                  </div>
                  <h4 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h4>
                  <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                  <Link
                    to="/topics"
                    className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors group-hover:translate-x-1"
                  >
                    Khám phá ngay
                    <span className="ml-2">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {statsDisplay.map((stat, index) => (
              <div key={index} className="group">
                <div className="text-white hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl mb-4">
                    {stat.icon === 'fas fa-folder-open' ? '📁' :
                      stat.icon === 'fas fa-question-circle' ? '❓' :
                        stat.icon === 'fas fa-users' ? '👥' : '🏆'}
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.number}</h3>
                  <p className="text-white opacity-75">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Về tác giả
            </h2>
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
              <div className="mb-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <div className="text-4xl">👨‍💻</div>
                </div>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Nguyễn Thanh Nhân</h4>
              <p className="text-gray-600 mb-4">Sinh viên Trường Đại học Công nghệ Thông tin, Đại học Quốc gia TP.HCM</p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto">
                QuizSmart được tạo ra với mục tiêu giúp mọi người học tập hiệu quả hơn.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href="mailto:npthanhnhan2003@gmail.com"
                  className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <span className="mr-2">📧</span>
                  Email
                </a>
                <a
                  href="https://github.com/npthanhnhan2003"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
                >
                  <span className="mr-2">💻</span>
                  GitHub
                </a>
                <a
                  href="https://linkedin.com/in/npthanhnhan2003"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                >
                  <span className="mr-2">💼</span>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-r from-green-500 to-blue-600">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
            Sẵn sàng chinh phục mục tiêu học tập?
          </h2>
          <p className="text-xl mb-8 text-white opacity-90">
            Tham gia cùng hàng nghìn người học đã thành công với QuizSmart
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/multiple-choice"
              className="bg-yellow-400 text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-500 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="mr-2">📚</span>
              Trắc nghiệm ngay
            </Link>

            <Link
              to="/grammar"
              className="bg-green-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="mr-2">📖</span>
              Luyện tập ngữ pháp ngay
            </Link>

            <Link
              to="/vocabulary"
              className="bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span className="mr-2">🧠</span>
              Luyện tập từ vựng ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Footer is provided globally by App.js */}
    </div>
  );
};

export default HomePage;