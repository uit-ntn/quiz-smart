import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import testService from "../services/testService";
import MultipleChoiceService from "../services/multipleChoiceService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import MultipleChoiceLayout from "../layout/MultipleChoiceLayout";

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

const MultipleChoiceTestSettings = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [settings, setSettings] = useState({
    testMode: "flexible", // 'flexible' | 'question_timer'
    showTimer: true,
    checkMode: "after_submit", // 'after_each' | 'after_submit'
    showQuestionNumber: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    questionTimeLimit: null, // seconds
  });

  const getSafePerQuestionLimit = (t) => {
    const totalSecs = Number(t?.time_limit_minutes) * 60;
    const totalQ = Number(t?.total_questions);
    if (!Number.isFinite(totalSecs) || !Number.isFinite(totalQ) || totalQ <= 0)
      return 60;
    return clamp(Math.floor(totalSecs / totalQ), 10, 300);
  };

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        setLoading(true);
        const response = await testService.getTestById(testId);
        const testData = response.test || response;
        setTest(testData);
        setSettings((prev) => ({
          ...prev,
          questionTimeLimit: getSafePerQuestionLimit(testData),
        }));
        setError(null);
      } catch (err) {
        console.error("Error fetching test details:", err);
        setError(
          "Không thể tải thông tin bài kiểm tra. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchTestDetails();
    }
  }, [testId]);

  useEffect(() => {
    if (settings.testMode === "question_timer" && test) {
      const safe = getSafePerQuestionLimit(test);
      setSettings((prev) => ({
        ...prev,
        questionTimeLimit:
          Number.isFinite(prev.questionTimeLimit) && prev.questionTimeLimit
            ? clamp(prev.questionTimeLimit, 10, safe)
            : safe,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.testMode, test]);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleStartTest = () => {
    try {
      localStorage.setItem(
        `test_settings_${testId}`,
        JSON.stringify(settings)
      );
    } catch (e) {
      console.warn("Cannot access localStorage", e);
    }

    const targetPath = `/multiple-choice/test/${testId}/take`;
    navigate(targetPath, { state: { settings } });
  };

  if (loading)
    return (
      <LoadingSpinner message="Đang tải thông tin bài kiểm tra..." />
    );

  if (error || !test) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-xl mx-auto px-4">
          <div className="rounded-xl border border-red-200 bg-white shadow-sm">
            <div className="p-5">
              <ErrorMessage
                error={error || "Không tìm thấy bài kiểm tra"}
                onRetry={
                  error ? () => window.location.reload() : null
                }
              />
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxPerQuestion = getSafePerQuestionLimit(test);
  const sliderValue = clamp(
    Number(settings.questionTimeLimit ?? maxPerQuestion),
    10,
    maxPerQuestion
  );

  const title =
    test?.test_title ||
    [test?.main_topic, test?.sub_topic].filter(Boolean).join(" - ") ||
    "Bài kiểm tra";

  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Trắc nghiệm theo chủ đề", path: "/multiple-choice" },
    {
      label: test?.main_topic || "Chủ đề",
      path: `/multiple-choice/${test?.main_topic}`,
    },
    {
      label: test?.sub_topic || "Phân mục",
      path: `/multiple-choice/${test?.main_topic}/${test?.sub_topic}`,
    },
    { label: "Cài đặt bài kiểm tra", path: "#" },
  ];

  return (
    <MultipleChoiceLayout
      title="Cài đặt bài kiểm tra"
      description="Điều chỉnh nhanh một số thiết lập trước khi bắt đầu làm bài."
      breadcrumbItems={breadcrumbItems}
    >
      <div className="max-w-6xl mx-auto">
        {/* Shell */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid md:grid-cols-5">
            {/* LEFT: Test info */}
            <aside className="md:col-span-2 border-b md:border-b-0 md:border-r border-slate-200">
              <div className="p-5">
                {/* Title block */}
                <div className="mb-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                      <span className="text-xs font-semibold text-slate-700">
                        MCQ
                      </span>
                    </div>
                    <div>
                      <h1 className="text-base font-semibold text-slate-900">
                        {title}
                      </h1>
                      <p className="mt-1 text-xs text-slate-500">
                        {test?.description || "Bài kiểm tra trắc nghiệm."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meta info */}
                <dl className="space-y-2 text-sm mb-6">
                  <div className="flex gap-2">
                    <dt className="min-w-[92px] text-slate-500">
                      Chủ đề chính
                    </dt>
                    <dd className="text-slate-900">
                      {test?.main_topic || "-"}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="min-w-[92px] text-slate-500">
                      Phân mục
                    </dt>
                    <dd className="text-slate-900">
                      {test?.sub_topic || "-"}
                    </dd>
                  </div>
                </dl>

                {/* Stats cards */}
                <div className="flex flex-col gap-2.5">
                  {/* Questions */}
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-white border border-slate-200 text-xs text-slate-700">
                        ?
                      </span>
                      <div>
                        <p className="text-[11px] font-medium text-slate-600">
                          Số câu hỏi
                        </p>
                        <p className="text-xs text-slate-500">
                          Tổng số câu trong bài
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {test.total_questions}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-white border border-slate-200 text-xs text-slate-700">
                        ⏱
                      </span>
                      <div>
                        <p className="text-[11px] font-medium text-slate-600">
                          Thời gian
                        </p>
                        <p className="text-xs text-slate-500">
                          Tổng thời gian làm bài
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {test.time_limit_minutes} phút
                    </p>
                  </div>

                  {/* Difficulty */}
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-white border border-slate-200 text-xs text-slate-700">
                        ⚙
                      </span>
                      <div>
                        <p className="text-[11px] font-medium text-slate-600">
                          Độ khó
                        </p>
                        <p className="text-xs text-slate-500">
                          Được định nghĩa bởi bài test
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 capitalize">
                      {test.difficulty || "-"}
                    </p>
                  </div>
                </div>

                {/* Desktop actions */}
                <div className="mt-6 hidden md:flex gap-2">
                  <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Quay lại
                  </button>
                  <button
                    onClick={handleStartTest}
                    className="inline-flex items-center px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-black text-sm"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Bắt đầu làm bài
                  </button>
                </div>
              </div>
            </aside>

            {/* RIGHT: Settings */}
            <section className="md:col-span-3 p-5 space-y-5">
              {/* Test mode */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h2 className="text-sm font-semibold text-slate-900 mb-2">
                  Chế độ làm bài
                </h2>
                <p className="text-xs text-slate-500 mb-3">
                  Chọn cách bạn muốn hệ thống chạy đồng hồ và cho phép di
                  chuyển giữa các câu hỏi.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label
                    htmlFor="mode-flex"
                    className={`cursor-pointer rounded-lg border p-3 text-sm transition ${
                      settings.testMode === "flexible"
                        ? "border-slate-900 bg-slate-900/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        id="mode-flex"
                        name="testMode"
                        type="radio"
                        value="flexible"
                        checked={settings.testMode === "flexible"}
                        onChange={(e) =>
                          handleSettingChange("testMode", e.target.value)
                        }
                        className="mt-0.5 w-4 h-4 accent-slate-900"
                      />
                      <div>
                        <p className="font-medium text-slate-900">
                          Chế độ linh hoạt
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Di chuyển tự do giữa các câu, sử dụng chung một
                          đồng hồ cho toàn bài.
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    htmlFor="mode-qtimer"
                    className={`cursor-pointer rounded-lg border p-3 text-sm transition ${
                      settings.testMode === "question_timer"
                        ? "border-slate-900 bg-slate-900/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        id="mode-qtimer"
                        name="testMode"
                        type="radio"
                        value="question_timer"
                        checked={settings.testMode === "question_timer"}
                        onChange={(e) =>
                          handleSettingChange("testMode", e.target.value)
                        }
                        className="mt-0.5 w-4 h-4 accent-slate-900"
                      />
                      <div>
                        <p className="font-medium text-slate-900">
                          Thời gian cho từng câu
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Mỗi câu có giới hạn thời gian riêng, hết giờ tự
                          chuyển sang câu tiếp theo.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Per-question time */}
              {settings.testMode === "question_timer" && (
                <div className="border border-slate-200 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">
                    Thời gian tối đa cho mỗi câu
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Kéo thanh bên dưới để chọn số giây phù hợp. Hệ thống
                    tính toán dựa trên tổng thời gian bài test.
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={10}
                      max={maxPerQuestion}
                      value={sliderValue}
                      onChange={(e) =>
                        handleSettingChange(
                          "questionTimeLimit",
                          clamp(
                            parseInt(e.target.value, 10) || 10,
                            10,
                            maxPerQuestion
                          )
                        )
                      }
                      className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="min-w-[68px] px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs text-center">
                      {sliderValue}s
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Tối đa: {maxPerQuestion} giây/câu.
                  </p>
                </div>
              )}

              {/* Display options */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Tùy chọn hiển thị
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Bật/tắt một số yếu tố giao diện khi làm bài.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: "showTimer",
                      label: "Hiển thị đồng hồ đếm ngược",
                      desc: "Hiển thị thời gian còn lại khi làm bài.",
                      key: "showTimer",
                    },
                    {
                      id: "showQuestionNumber",
                      label: "Hiển thị số thứ tự câu hỏi",
                      desc: "Ví dụ: Câu 1/10, Câu 2/10…",
                      key: "showQuestionNumber",
                    },
                    {
                      id: "shuffleQuestions",
                      label: "Xáo trộn thứ tự câu hỏi",
                      desc: "Hiển thị câu hỏi theo thứ tự ngẫu nhiên.",
                      key: "shuffleQuestions",
                    },
                    {
                      id: "shuffleAnswers",
                      label: "Xáo trộn thứ tự đáp án",
                      desc: "Các đáp án sẽ được ngẫu nhiên hóa.",
                      key: "shuffleAnswers",
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2"
                    >
                      <input
                        id={item.id}
                        type="checkbox"
                        checked={settings[item.key]}
                        onChange={(e) =>
                          handleSettingChange(item.key, e.target.checked)
                        }
                        className="mt-0.5 w-4 h-4 accent-slate-900 rounded border-slate-300"
                      />
                      <div>
                        <label
                          htmlFor={item.id}
                          className="block text-sm font-medium text-slate-900"
                        >
                          {item.label}
                        </label>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Check mode */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Cách hiển thị kết quả
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Chọn thời điểm hiển thị đúng/sai cho từng câu hỏi.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label
                    htmlFor="checkAfterEach"
                    className={`cursor-pointer rounded-lg border p-3 text-sm transition ${
                      settings.checkMode === "after_each"
                        ? "border-slate-900 bg-slate-900/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        id="checkAfterEach"
                        name="checkMode"
                        type="radio"
                        value="after_each"
                        checked={settings.checkMode === "after_each"}
                        onChange={(e) =>
                          handleSettingChange("checkMode", e.target.value)
                        }
                        className="mt-0.5 w-4 h-4 accent-slate-900"
                      />
                      <div>
                        <p className="font-medium text-slate-900">
                          Sau mỗi câu
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Hiển thị đúng/sai ngay sau khi bạn kiểm tra một
                          câu hỏi.
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    htmlFor="checkAfterSubmit"
                    className={`cursor-pointer rounded-lg border p-3 text-sm transition ${
                      settings.checkMode === "after_submit"
                        ? "border-slate-900 bg-slate-900/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        id="checkAfterSubmit"
                        name="checkMode"
                        type="radio"
                        value="after_submit"
                        checked={settings.checkMode === "after_submit"}
                        onChange={(e) =>
                          handleSettingChange("checkMode", e.target.value)
                        }
                        className="mt-0.5 w-4 h-4 accent-slate-900"
                      />
                      <div>
                        <p className="font-medium text-slate-900">
                          Sau khi nộp bài
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Chỉ hiển thị kết quả khi bạn hoàn thành toàn bộ
                          bài kiểm tra.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Bottom actions (mobile) */}
              <div className="mt-4 flex md:hidden gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm flex-shrink-0"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Quay lại
                </button>
                <button
                  onClick={handleStartTest}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-black text-sm"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Bắt đầu làm bài
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MultipleChoiceLayout>
  );
};

export default MultipleChoiceTestSettings;
