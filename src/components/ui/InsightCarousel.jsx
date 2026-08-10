import { useState, useEffect, useRef, useCallback } from "react";
import { MdAutoAwesome } from "react-icons/md";

export default function InsightCarousel({ insights }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);

  const pages = [];
  for (let i = 0; i < insights.length; i += 2) {
    pages.push(insights.slice(i, i + 2));
  }

  const totalPages = pages.length;

  const goNext = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const goToPage = (index) => {
    setCurrentPage(index);
  };

  useEffect(() => {
    if (isPaused || totalPages <= 1) return;
    const timer = setInterval(goNext, 10000);
    return () => clearInterval(timer);
  }, [isPaused, totalPages, goNext]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goNext() : goPrev();
    }
  };

  if (!insights || insights.length === 0) return null;

  const currentCards = pages[currentPage] || [];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        background: "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
        padding: "24px",
        borderRadius: "16px",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        userSelect: "none",
        flex: 1,
        minHeight: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "160px",
          height: "160px",
          background: "#8B5CF6",
          opacity: 0.2,
          borderRadius: "50%",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-40px",
          left: "-40px",
          width: "160px",
          height: "160px",
          background: "#FF8040",
          opacity: 0.2,
          borderRadius: "50%",
          filter: "blur(40px)",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FED7AA" }}>
          <MdAutoAwesome size={16} />
          <span style={{ fontWeight: "600", fontSize: "14px" }}>
            Stella Insights
          </span>
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={goPrev}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#D1D5DB",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "700",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            >
              ‹
            </button>
            <button
              onClick={goNext}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#D1D5DB",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "700",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div
        key={currentPage}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          position: "relative",
          zIndex: 10,
          flex: 1,
          animation: "fadeSlideIn 0.35s ease-out",
        }}
      >
        <style>{`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateX(12px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>

        {currentCards.map((card, i) => (
          <div
            key={`${currentPage}-${i}`}
            style={{
              background: "rgba(255,255,255,0.1)",
              padding: "14px 16px",
              borderRadius: "12px",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#FFFFFF" }}>
                {card.title}
              </div>
              <span
                style={{
                  background: card.badgeColor || "rgba(255,255,255,0.1)",
                  color: "#D1D5DB",
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontWeight: "500",
                  border: "1px solid rgba(255,255,255,0.15)",
                  whiteSpace: "nowrap",
                  marginLeft: "8px",
                }}
              >
                {card.badge}
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#D1D5DB", lineHeight: 1.6 }}>
              {card.content}
            </div>
          </div>
        ))}

        {currentCards.length === 1 && (
          <div style={{ flex: 1 }} />
        )}
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            position: "relative",
            zIndex: 10,
          }}
        >
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              style={{
                width: i === currentPage ? "18px" : "6px",
                height: "6px",
                borderRadius: "3px",
                border: "none",
                background: i === currentPage ? "#FED7AA" : "rgba(255,255,255,0.25)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
