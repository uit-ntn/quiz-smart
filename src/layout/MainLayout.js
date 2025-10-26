import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

/**
 * MainLayout
 * - fixed Header (sticky, blur)
 * - content wrapper với max-width có map rõ ràng (tránh max-w-${var})
 * - tùy chọn nền gradient nhẹ
 */
const MAX_WIDTHS = {
  full: "max-w-full",
  "7xl": "max-w-7xl",
  "6xl": "max-w-6xl",
  "5xl": "max-w-5xl",
  "4xl": "max-w-4xl",
};

const MainLayout = ({
  children,
  showBackground = true,
  maxWidth = "7xl",
  className = "",
}) => {
  const containerClass =
    MAX_WIDTHS[maxWidth] || MAX_WIDTHS["7xl"];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Skip link for a11y */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] px-3 py-2 rounded bg-slate-900 text-white"
      >
        Bỏ qua menu tới nội dung
      </a>

      <Header />

      {/* Optional subtle background */}
      {showBackground && (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 w-[30rem] h-[30rem] rounded-full bg-blue-200/25 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.06),transparent_40%),radial-gradient(circle_at_80%_0,rgba(59,130,246,0.05),transparent_30%)]" />
        </div>
      )}

      {/* Main content */}
      <main
        id="main"
        className={[
          "grow w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10",
          containerClass,
          className,
        ].join(" ")}
      >
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
