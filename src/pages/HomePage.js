import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

/* Utils */
const formatK = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`);

/* Small UI atoms (LIGHT THEME) */
const SectionTitle = ({ eyebrow, title, desc, center = true }) => (
  <div className={`${center ? "text-center" : ""} mb-10`}>
    {eyebrow && (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
        {eyebrow}
      </span>
    )}
    <h2 className={`mt-3 text-3xl md:text-4xl font-extrabold text-slate-900 ${center ? "" : "md:text-left"}`}>
      {title}
    </h2>
    {desc && (
      <p className={`mt-3 text-slate-600 ${center ? "max-w-2xl mx-auto" : ""}`}>
        {desc}
      </p>
    )}
  </div>
);

const GlowCard = ({ children, className = "" }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-indigo-200/40 via-blue-200/20 to-purple-200/40 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
    <div className="relative rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
      {children}
    </div>
  </div>
);

const StatCard = ({ label, value, icon }) => (
  <GlowCard>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-extrabold text-slate-900">{value}</p>
      </div>
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-indigo-600">{icon}</div>
    </div>
  </GlowCard>
);

const FeatureCard = ({ title, desc, icon }) => (
  <GlowCard>
    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
      {icon}
    </div>
    <h4 className="mt-4 text-lg font-semibold text-slate-900">{title}</h4>
    <p className="mt-2 text-slate-600 leading-relaxed">{desc}</p>
  </GlowCard>
);

const HowStep = ({ step, title, desc }) => (
  <div className="relative pl-10">
    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow">
      {step}
    </div>
    <h5 className="text-base font-semibold text-slate-900">{title}</h5>
    <p className="mt-1 text-slate-600">{desc}</p>
  </div>
);

const Testimonial = ({ quote, name, role }) => (
  <GlowCard>
    <p className="text-slate-700">“{quote}”</p>
    <div className="mt-4">
      <p className="text-sm font-semibold text-slate-900">{name}</p>
      <p className="text-xs text-slate-500">{role}</p>
    </div>
  </GlowCard>
);

const HomePage = () => {
  const [stats, setStats] = useState({
    totalTopics: 0,
    totalQuestions: 0,
    totalUsers: 0,
    completedTests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const base = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${base}/topics`);
      if (res.ok) {
        const data = await res.json();
        const topics = data?.data || [];
        setStats({
          totalTopics: topics.length,
          totalQuestions: topics.reduce((sum, t) => sum + (t.totalQuestions || 0), 0),
          totalUsers: 1250,       // mock
          completedTests: 15420,  // mock
        });
      } else {
        setStats({ totalTopics: 15, totalQuestions: 2500, totalUsers: 1250, completedTests: 15420 });
      }
    } catch {
      setStats({ totalTopics: 15, totalQuestions: 2500, totalUsers: 1250, completedTests: 15420 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-white text-slate-900">
        {/* ================ HERO (LIGHT) ================ */}
        <section className="relative overflow-hidden">
          {/* subtle decorations */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 w-[26rem] h-[26rem] bg-indigo-200/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] bg-blue-200/30 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div>
                <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
                  Nền tảng học tập hiện đại
                </span>
                <h1 className="mt-5 text-4xl md:text-6xl font-extrabold leading-tight">
                  Học thông minh cùng{" "}
                  <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    QuizSmart
                  </span>
                </h1>
                <p className="mt-5 text-slate-600 text-lg leading-relaxed max-w-2xl">
                  Luyện thi TOEIC, IELTS, chứng chỉ Cloud/IT và kỹ năng nghề nghiệp với hệ thống bài test
                  được thiết kế theo lộ trình.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/multiple-choice/topics"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
                  >
                    Trắc nghiệm theo chủ đề
                  </Link>
                  <Link
                    to="/vocabulary"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-slate-700 font-semibold bg-white border border-slate-200 hover:bg-slate-50 transition"
                  >
                    Luyện từ vựng
                  </Link>
                  <Link
                    to="/grammar"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-slate-700 font-semibold bg-white border border-slate-200 hover:bg-slate-50 transition"
                  >
                    Luyện ngữ pháp
                  </Link>
                </div>

                {/* quick stats */}
                <div className="mt-10 grid grid-cols-2 gap-4 max-w-md">
                  {loading ? (
                    <>
                      <div className="h-24 rounded-xl bg-slate-100 border border-slate-200 animate-pulse" />
                      <div className="h-24 rounded-xl bg-slate-100 border border-slate-200 animate-pulse" />
                    </>
                  ) : (
                    <>
                      <GlowCard>
                        <p className="text-2xl font-extrabold">{stats.totalTopics}</p>
                        <p className="text-slate-600 text-sm">Chủ đề</p>
                      </GlowCard>
                      <GlowCard>
                        <p className="text-2xl font-extrabold">{stats.totalQuestions}</p>
                        <p className="text-slate-600 text-sm">Câu hỏi</p>
                      </GlowCard>
                    </>
                  )}
                </div>
              </div>

              {/* hero art */}
              <div className="relative">
                <div className="relative aspect-[4/3] rounded-[28px] bg-white border border-slate-200 shadow-md overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 via-transparent to-blue-100" />
                  <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]" />
                  <div className="absolute top-6 left-6 right-6 grid grid-cols-3 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-24 rounded-xl bg-white border border-slate-200 shadow-sm"
                        style={{ animation: `float ${5 + i}s ease-in-out ${i * 0.2}s infinite alternate` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================ OVERVIEW STATS ================ */}
        <section className="-mt-10 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading ? (
                <>
                  <div className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                  <div className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                  <div className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                  <div className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                </>
              ) : (
                <>
                  <StatCard
                    label="Chủ đề"
                    value={stats.totalTopics}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h6M21 15V9a2 2 0 00-2-2h-7l-2-2H5" />
                      </svg>
                    }
                  />
                  <StatCard
                    label="Câu hỏi"
                    value={stats.totalQuestions}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9c0-1.657 1.79-3 4-3s4 1.343 4 3-1 2-2 2-1 1-1 2m-1 4h.01" />
                      </svg>
                    }
                  />
                  <StatCard
                    label="Người dùng"
                    value={`${stats.totalUsers}+`}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5V9l-7-5-7 5v11h5" />
                      </svg>
                    }
                  />
                  <StatCard
                    label="Tests hoàn thành"
                    value={`${formatK(stats.completedTests)}+`}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 17l6-6 4 4 8-8" />
                      </svg>
                    }
                  />
                </>
              )}
            </div>
          </div>
        </section>

        {/* ================ FEATURES ================ */}
        <section className="py-18 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Tính năng"
              title="Vì sao chọn QuizSmart?"
              desc="Nền tảng học tập dựa trên dữ liệu & trải nghiệm người dùng để tối ưu hiệu quả."
            />
            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                title="Lộ trình rõ ràng"
                desc="Bài test phân cấp theo mục tiêu, kèm gợi ý luyện tập phù hợp năng lực hiện tại."
                icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20Zm1 14H7v-2h6v2Zm4-4H7V8h10v4Z" /></svg>}
              />
              <FeatureCard
                title="Theo dõi tiến độ"
                desc="Biểu đồ kết quả, thời gian làm bài và điểm mạnh/yếu để điều chỉnh học tập."
                icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h2v18H3V3Zm4 8h2v10H7V11Zm4-6h2v16h-2V5Zm4 10h2v6h-2v-6Zm4-14h2v20h-2V1Z" /></svg>}
              />
              <FeatureCard
                title="Trải nghiệm mượt"
                desc="Giao diện tối giản, tốc độ nhanh, tương thích tốt trên mọi thiết bị."
                icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4zM2 18h20v2H2z" /></svg>}
              />
            </div>
          </div>
        </section>

        {/* ================ HOW IT WORKS + TESTIMONIALS ================ */}
        <section className="py-18 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <SectionTitle
                eyebrow="Bắt đầu nhanh"
                title="Chỉ 3 bước để học hiệu quả"
                desc="Đăng ký nhanh, chọn mục tiêu và luyện tập mỗi ngày."
                center={false}
              />
              <div className="relative mt-6">
                <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-300 to-blue-300" />
                <div className="space-y-7">
                  <HowStep step="1" title="Chọn chủ đề" desc="Tìm chủ đề phù hợp mục tiêu (TOEIC, IELTS, Cloud…)." />
                  <HowStep step="2" title="Làm bài test" desc="Chế độ làm bài linh hoạt, có đồng hồ và chấm ngay." />
                  <HowStep step="3" title="Xem phân tích" desc="Theo dõi tiến độ, nhận gợi ý cải thiện cụ thể." />
                </div>
                <div className="mt-8">
                  <Link
                    to="/multiple-choice/topics"
                    className="inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
                  >
                    Khám phá chủ đề
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <SectionTitle
                eyebrow="Đánh giá"
                title="Người học nói gì?"
                desc="Một vài cảm nhận thực tế từ người dùng."
              />
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { name: "Phương Anh", role: "Sinh viên", quote: "Giao diện rất dễ dùng, bài tập bám sát mục tiêu học." },
                  { name: "Minh Khoa", role: "Dev Fresher", quote: "Mục Cloud có nhiều bài hay, giúp mình nắm kiến thức nhanh." },
                  { name: "Lan Hương", role: "Người đi làm", quote: "Theo dõi tiến độ rõ ràng, rất dễ duy trì thói quen." },
                  { name: "Quốc Huy", role: "Thí sinh IELTS", quote: "Phần từ vựng + ngữ pháp hỗ trợ tốt cho Reading." },
                ].map((t, i) => (
                  <Testimonial key={i} {...t} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================ CTA ================ */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 via-blue-100 to-purple-100" />
            <div className="absolute -inset-x-10 -bottom-40 h-80 bg-gradient-to-t from-indigo-200 to-transparent blur-2xl" />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Sẵn sàng bắt đầu?</h2>
            <p className="mt-3 text-slate-600">
              Gia nhập cộng đồng học tập hiệu quả với QuizSmart ngay hôm nay.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/multiple-choice/topics"
                className="px-6 py-3 rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
              >
                Trắc nghiệm ngay
              </Link>
              <Link
                to="/vocabulary"
                className="px-6 py-3 rounded-xl text-slate-700 font-semibold bg-white border border-slate-200 hover:bg-slate-50 transition"
              >
                Luyện từ vựng
              </Link>
              <Link
                to="/grammar"
                className="px-6 py-3 rounded-xl text-slate-700 font-semibold bg-white border border-slate-200 hover:bg-slate-50 transition"
              >
                Luyện ngữ pháp
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default HomePage;
