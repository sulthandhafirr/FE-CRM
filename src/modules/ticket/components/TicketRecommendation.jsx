import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MdAutoAwesome, MdInfoOutline, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { getTicketRecommendation } from "../ticket.service";
import { getPriorityColor } from "../ticket.schema";

export default function TicketRecommendation({ onTakeAction, onDetail }) {
  const { t } = useTranslation();

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ["ticket-recommendations"],
    queryFn: getTicketRecommendation,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const [page, setPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(recommendations.length / itemsPerPage);
  const safePage = page >= totalPages ? 0 : page;
  const pageItems = recommendations.slice(
    safePage * itemsPerPage,
    safePage * itemsPerPage + itemsPerPage
  );

  if (isLoading) {
  return (
    <div style={{ marginBottom: "30px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <MdAutoAwesome size={20} color="#FF8040" />
        <span style={{ fontWeight: "700", fontSize: "16px", color: "#333" }}>
          {t("pages.agentTicket.recommended.title")}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", padding: "16px", height: "190px" }}>
            <div style={{ background: "#f0f0f0", borderRadius: "4px", height: "14px", width: "60%", marginBottom: "16px" }} />
            <div style={{ background: "#f0f0f0", borderRadius: "4px", height: "16px", width: "90%", marginBottom: "8px" }} />
            <div style={{ background: "#f0f0f0", borderRadius: "4px", height: "12px", width: "40%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

if (recommendations.length === 0) return null;

  return (
    <div style={{ marginBottom: "30px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MdAutoAwesome size={20} color="#FF8040" />
          <span style={{ fontWeight: "700", fontSize: "16px", color: "#333" }}>
            {t("pages.agentTicket.recommended.title")}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", color: "#999" }}>
            {t("pages.agentTicket.recommended.subtitle")}
          </span>
          {totalPages > 1 && (
            <div style={{ display: "flex", gap: "2px" }}>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: page === 0 ? "default" : "pointer",
                  color: page === 0 ? "#e0e0e0" : "#999",
                  padding: "2px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <MdChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={page === totalPages - 1}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: page === totalPages - 1 ? "default" : "pointer",
                  color: page === totalPages - 1 ? "#e0e0e0" : "#999",
                  padding: "2px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <MdChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "14px",
        }}
      >
        {pageItems.map((ticket) => (
          <div
            key={ticket.ticketId}
            style={{
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  color: getPriorityColor(ticket.priority),
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              >
                {ticket.priority}
              </span>
              <span style={{ color: "#999", fontSize: "12px" }}>
                #{ticket.ticketId}
              </span>
            </div>

            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#333",
                margin: "0 0 6px",
                lineHeight: 1.4,
                minHeight: "40px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {ticket.subject}
            </p>
            <p style={{ fontSize: "12px", color: "#999", margin: "0 0 14px" }}>
              {t("pages.agentTicket.recommended.waiting", {
                hours: Math.round(ticket.ticketAgeHours),
              })}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                borderTop: "1px solid #f0f0f0",
                paddingTop: "10px",
                marginBottom: "12px",
              }}
            >
              <span style={{ fontSize: "12px", color: "#999" }}>
                {t("pages.agentTicket.recommended.scoreImpact")}
              </span>
              <span
                style={{ fontSize: "18px", fontWeight: 700, color: "#FF8040" }}
              >
                +{Math.round(ticket.estimatedScoreImpact)}
              </span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => onDetail(ticket.ticketId)}
                style={{
                  flex: 1,
                  background: "white",
                  color: "#FF8040",
                  border: "2px solid #FF8040",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                {t("pages.agentTicket.detail")}
              </button>
              <button
                onClick={() => onTakeAction(ticket.ticketId)}
                style={{
                  flex: 1,
                  background: "#FF8040",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                {t("pages.agentTicket.takeAction")}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "10px",
          color: "#999",
          fontSize: "11px",
        }}
      >
        <MdInfoOutline size={13} />
        <span>{t("pages.agentTicket.recommended.disclaimer")}</span>
      </div>
    </div>
  );
}
