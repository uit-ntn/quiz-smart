import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

/* ---------- tiny atoms ---------- */
const Eyebrow = ({ children }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
    {children}
  </span>
);

const Section = ({ children, className = "" }) => (
  <section className={`py-14 md:py-20 ${className}`}>{children}</section>
);

const H2 = ({ children, center = true }) => (
  <h2
    className={[
      "mt-3 text-3xl md:text-4xl font-extrabold text-slate-900",
      center ? "text-center" : "",
    ].join(" ")}
  >
    {children}
  </h2>
);

const Sub = ({ children, center = true, className = "" }) => (
  <p
    className={[
      "mt-3 text-slate-600",
      center ? "max-w-2xl mx-auto text-center" : "",
      className,
    ].join(" ")}
  >
    {children}
  </p>
);

/* ---------- cards ---------- */
const Pillar = ({ icon, title, desc }) => (
  <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
    <div className="w-11 h-11 rounded-xl bg-slate-900 text-white grid place-items-center">
      {icon}
    </div>
    <h4 className="mt-4 text-lg font-semibold text-slate-900">{title}</h4>
    <p className="mt-2 text-slate-600">{desc}</p>
  </div>
);

const Category = ({ to, title, desc, glyph }) => (
  <Link
    to={to}
    className="group rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition text-left"
  >
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white grid place-items-center shrink-0">
        {glyph}
      </div>
      <div>
        <h5 className="text-slate-900 font-semibold">{title}</h5>
        <p className="text-slate-600 text-sm mt-1">{desc}</p>
        <span className="inline-flex items-center mt-3 text-sm font-medium text-indigo-700">
          Bắt đầu ngay
          <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  </Link>
);

const Quote = ({ quote, name, role }) => (
  <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
    <p className="text-slate-800">“{quote}”</p>
    <div className="mt-4">
      <p className="text-sm font-semibold text-slate-900">{name}</p>
      <p className="text-xs text-slate-500">{role}</p>
    </div>
  </div>
);

/* ---------- page ---------- */
const HomePage = () => {
  return (
    <MainLayout maxWidth="7xl">
      {/* HERO */}
      <Section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 w-[26rem] h-[26rem] bg-indigo-200/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.03),transparent_60%)]" />
        </div>

        <div className="relative grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <Eyebrow>Nền tảng ôn luyện thế hệ mới</Eyebrow>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-tight text-slate-900">
              Luyện tập theo lộ trình,{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                đo tiến bộ mỗi ngày
              </span>
            </h1>
            <p className="mt-5 text-slate-600 text-lg leading-relaxed max-w-xl">
              QuizSmart cung cấp kho đề bám sát mục tiêu (TOEIC/IELTS/IT), chấm tự động,
              giải thích chi tiết và dashboard tiến độ rõ ràng.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                to="/multiple-choice/topics"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold bg-slate-900 hover:bg-slate-800 shadow-sm"
              >
                Bắt đầu làm bài
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-slate-800 font-semibold bg-white border border-slate-200 hover:bg-slate-50"
              >
                Tìm hiểu nền tảng
              </Link>
            </div>

            {/* mini stats */}
            <div className="mt-10 grid grid-cols-2 gap-4 max-w-md">
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <p className="text-2xl font-extrabold">2,500+</p>
                <p className="text-slate-600 text-sm">Câu hỏi luyện tập</p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <p className="text-2xl font-extrabold">1,200+</p>
                <p className="text-slate-600 text-sm">Người học tích cực</p>
              </div>
            </div>
          </div>

          {/* mock preview panel */}
          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-56 md:h-72 rounded-2xl bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 border border-slate-200 grid place-items-center">
                <div className="text-center">
                  <p className="text-sm text-slate-600">Xem nhanh kết quả</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">78%</p>
                  <p className="text-xs text-slate-500 mt-1">Tuần này • +6% so với tuần trước</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {["Tốc độ", "Độ chính xác", "Chuỗi ngày"].map((t, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[11px] uppercase tracking-wider text-slate-500">{t}</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {i === 0 ? "1m42s" : i === 1 ? "86%" : "12 ngày"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* PILLARS */}
      <Section>
        <Eyebrow>Giá trị cốt lõi</Eyebrow>
        <H2>Học tập có hệ thống</H2>
        <Sub>
          Ba trụ cột giúp bạn tiết kiệm thời gian, tập trung đúng nội dung và nhìn rõ tiến bộ.
        </Sub>
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          <Pillar
            title="Lộ trình cá nhân"
            desc="Chọn mục tiêu, hệ thống tự gợi ý bài luyện phù hợp để chạm mốc nhanh hơn."
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h12M3 18h6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <Pillar
            title="Giải thích dễ hiểu"
            desc="Mỗi câu hỏi có phân tích rõ ràng, tránh mẹo vặt – hiểu bản chất để nhớ lâu."
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20l9-16H3l9 16z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <Pillar
            title="Theo dõi chi tiết"
            desc="Dashboard trực quan: điểm số, thời gian, chủ đề mạnh/yếu để tối ưu kế hoạch."
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18M21 21H7M7 13l4 4 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>
      </Section>

      {/* CATEGORIES */}
      <Section className="bg-white">
        <Eyebrow>Luyện theo chuyên mục</Eyebrow>
        <H2>Chọn nội dung bạn muốn chinh phục</H2>
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          <Category
            to="/multiple-choice/topics"
            title="Trắc nghiệm"
            desc="Kho đề phong phú, chấm điểm ngay lập tức, có giải thích kèm theo."
            glyph={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <Category
            to="/grammar/topics"
            title="Ngữ pháp"
            desc="Bài tập điền chỗ trống & tự luận ngắn để củng cố cấu trúc cốt lõi."
            glyph={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 5H8l-2 6h12l-2-6zM6 11v8h12v-8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          <Category
            to="/vocabulary/topics"
            title="Từ vựng"
            desc="Flashcard, điền nghĩa và luyện câu ví dụ để nhớ từ bền vững."
            glyph={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18v12H3zM7 6v12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section>
        <Eyebrow>Người học đánh giá</Eyebrow>
        <H2>Hiệu quả được kiểm chứng</H2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              name: "Minh Thư",
              role: "Thí sinh TOEIC",
              quote:
                "Sau 3 tuần, mình tăng 150 điểm. Phần giải thích cực rõ và dễ nhớ.",
            },
            {
              name: "Văn Hậu",
              role: "Junior Dev",
              quote:
                "Lộ trình Cloud/IT bám sát, làm tới đâu hiểu tới đó, đỡ hoang mang.",
            },
            {
              name: "Ngọc Anh",
              role: "Sinh viên",
              quote:
                "UI sạch sẽ, tốc độ nhanh. Rất dễ duy trì thói quen 20 phút/ngày.",
            },
            {
              name: "Trung Kiên",
              role: "IELTS learner",
              quote:
                "Vocabulary + Grammar combo giúp Reading mình tăng đáng kể.",
            },
          ].map((t, i) => (
            <Quote key={i} {...t} />
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-white">
        <Eyebrow>FAQ</Eyebrow>
        <H2>Câu hỏi thường gặp</H2>
        <div className="mt-8 grid md:grid-cols-2 gap-5">
          {[
            {
              q: "QuizSmart có miễn phí không?",
              a: "Bạn có thể luyện các chủ đề cơ bản miễn phí. Tài khoản Pro mở khóa thêm ngân hàng câu hỏi mở rộng và thống kê nâng cao.",
            },
            {
              q: "Có lộ trình gợi ý cho người mới?",
              a: "Có. Chọn mục tiêu điểm/level, hệ thống đề xuất lộ trình theo tuần với bài luyện phù hợp.",
            },
            {
              q: "Làm bài trên điện thoại ổn chứ?",
              a: "UI được tối ưu cho mobile, bạn có thể luyện mọi lúc mọi nơi.",
            },
            {
              q: "Kết quả có được lưu lại?",
              a: "Tất cả bài làm, thời gian, tỉ lệ đúng/sai được lưu và hiển thị trong dashboard cá nhân.",
            },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="font-semibold text-slate-900">{f.q}</h4>
              <p className="mt-1 text-slate-600">{f.a}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 via-blue-100 to-purple-100" />
        <div className="relative rounded-3xl border border-slate-200 bg-white/50 backdrop-blur-sm p-8 md:p-10 text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Sẵn sàng tăng tốc hành trình học tập?
          </h3>
          <p className="mt-2 text-slate-600">
            Bắt đầu với một bài test ngắn — nhận phân tích và đề xuất lộ trình ngay.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/multiple-choice/topics"
              className="px-6 py-3 rounded-xl text-white font-semibold bg-slate-900 hover:bg-slate-800"
            >
              Làm bài đầu tiên
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl text-slate-800 font-semibold bg-white border border-slate-200 hover:bg-slate-50"
            >
              Tạo tài khoản miễn phí
            </Link>
          </div>
        </div>
      </Section>
    </MainLayout>
  );
};

export default HomePage;
