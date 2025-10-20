import React from "react";
import { Link } from "react-router-dom";

const PALETTES = {
  blue:   { grad: "from-blue-400 to-blue-500",  iconWrap: "bg-blue-50",   icon: "text-blue-600",   badge: "bg-blue-50 text-blue-700",  btn: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" },
  green:  { grad: "from-emerald-400 to-emerald-500", iconWrap: "bg-emerald-50",icon: "text-emerald-600",badge: "bg-emerald-50 text-emerald-700", btn: "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700" },
  indigo: { grad: "from-indigo-400 to-indigo-500", iconWrap: "bg-indigo-50", icon: "text-indigo-600", badge: "bg-indigo-50 text-indigo-700", btn: "from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700" },
  orange: { grad: "from-orange-400 to-orange-500",  iconWrap: "bg-orange-50",  icon: "text-orange-600",  badge: "bg-orange-50 text-orange-700",  btn: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700" },
};

const TopicCard = ({
  topic,
  mainTopic,
  subTopics = [],
  testCount = 0,
  to,
  color = "blue",
  buttonLabel,
  className = "",
  onOpenModal, // Function để mở modal
}) => {
  const p = PALETTES[color] || PALETTES.blue;

  const shownSubs = subTopics.slice(0, 3);
  const moreCount = Math.max(subTopics.length - shownSubs.length, 0);

  return (
    <div
      className={[
        "group relative rounded-2xl border-2 border-gray-200",
        "bg-white shadow-lg hover:shadow-xl transition-all duration-300",
        "hover:-translate-y-1 hover:border-gray-300",
        className,
      ].join(" ")}
    >
      {/* Enhanced inner card */}
      <div className="rounded-xl bg-white h-full flex flex-col min-h-[280px] overflow-hidden">
        {/* Top accent bar */}
        <div className={`h-1 bg-gradient-to-r ${p.grad}`} />
        
        {/* shine */}
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"
          style={{ background: "radial-gradient(80% 60% at 20% 0%, rgba(59, 130, 246, 0.1), transparent 60%)" }}
        />

        {/* Enhanced CONTENT AREA */}
        <div className="p-5 flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${p.iconWrap} flex items-center justify-center flex-shrink-0`}>
            <svg className={`w-6 h-6 ${p.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-gray-800 leading-tight">
                {topic}
              </h3>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h12M4 18h8"/>
                </svg>
                {subTopics.length} phân mục
              </span>
            </div>
          </div>
        </div>

        {shownSubs.length > 0 && (
          <div className="px-5 pb-2">
            <div className="flex flex-wrap gap-2">
              {shownSubs.map((s, i) => (
                <Link
                  key={s + i}
                  to={`/multiple-choice/tests/${encodeURIComponent(mainTopic || topic)}/${encodeURIComponent(s)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className={[
                    "px-3 py-1.5 rounded-lg border-2 text-xs font-medium",
                    p.badge, "border-gray-200",
                    "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
                  ].join(" ")}
                  title={s}
                >
                  {s}
                </Link>
              ))}
              {moreCount > 0 && (
                <span className="px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs border-2 border-gray-200 font-medium">
                  +{moreCount}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Enhanced CTA BUTTON */}
        <div className="mt-auto p-5">
          <button
            onClick={() => onOpenModal && onOpenModal()}
            className={[
              "w-full inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-lg px-4 py-3",
              "bg-gradient-to-r", p.btn, "text-white shadow-md",
              "hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              "transition-all duration-200 border border-white/20",
            ].join(" ")}
            aria-label={(buttonLabel || "Xem tất cả") + " - " + topic}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            {buttonLabel || `Xem tất cả (${subTopics.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicCard;
