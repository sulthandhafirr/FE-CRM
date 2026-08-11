import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MdStar, MdStarBorder } from "react-icons/md";
import { getTicketRating, submitTicketRating } from "../ticket.service";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

export default function TicketRatingCard({ ticketId, role, customerName }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [hoverRate, setHoverRate] = useState(0);
  const [selectedRate, setSelectedRate] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["ticket-rating", ticketId],
    queryFn: () => getTicketRating(ticketId),
    enabled: Boolean(ticketId),
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <LoadingSpinner />
      </div>
    );
  }

  const alreadyRated = data?.rate != null;
  const canRate = data?.canRate;

  // Tidak berhak rating (bukan pemilik ticket, atau belum solved, atau sudah pernah) dan belum ada rating tersimpan
  if (!alreadyRated && !canRate) return null;

  const handleSubmit = async () => {
    if (selectedRate < 1) return;
    try {
      setSubmitting(true);
      await submitTicketRating(ticketId, { rate: selectedRate, message: message.trim() || undefined });
      queryClient.invalidateQueries({ queryKey: ["ticket-rating", ticketId] });
      // ── tambahan: supaya list di halaman lain ikut update tanpa manual refresh ──
      queryClient.invalidateQueries({ queryKey: ["history-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["agent-solved-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
    } catch (err) {
      console.error("Failed to submit rating:", err);
      alert(t("pages.ticketDetail.errors.submitRating"));
    } finally {
      setSubmitting(false);
    }
  };

  const displayRate = alreadyRated ? data.rate : hoverRate || selectedRate;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          padding: "20px",
          textAlign: "center",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "12px" }}>
          {alreadyRated
            ? role === "customer"
              ? t("pages.ticketDetail.thanksForRating")
              : t("pages.ticketDetail.feedbackFrom", { name: customerName || "-" })
            : t("pages.ticketDetail.howWasYourExperience")}
        </div>

        {/* ── Bintang ── */}
        <div
          style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "12px" }}
          onMouseLeave={() => !alreadyRated && setHoverRate(0)}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              disabled={alreadyRated || submitting}
              onMouseEnter={() => !alreadyRated && setHoverRate(i)}
              onClick={() => !alreadyRated && setSelectedRate(i)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: alreadyRated ? "default" : "pointer",
              }}
              aria-label={`${i} star`}
            >
              {i <= displayRate ? (
                <MdStar size={32} color="#FF8040" />
              ) : (
                <MdStarBorder size={32} color="#D1D5DB" />
              )}
            </button>
          ))}
        </div>

        {/* ── Pesan (read-only setelah rating, atau input sebelum rating) ── */}
        {alreadyRated ? (
          data.message && (
            <p style={{ fontSize: "13px", color: "#6B7280", fontStyle: "italic", marginTop: "4px" }}>
              &ldquo;{data.message}&rdquo;
            </p>
          )
        ) : (
          <>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("pages.ticketDetail.ratingCommentPlaceholder")}
              rows={2}
              disabled={submitting}
              style={{
                width: "100%",
                marginTop: "4px",
                padding: "8px 10px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                fontSize: "13px",
                resize: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={selectedRate < 1 || submitting}
              style={{
                marginTop: "10px",
                background: selectedRate < 1 || submitting ? "#D1D5DB" : "#FF8040",
                color: "white",
                border: "none",
                padding: "8px 24px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: selectedRate < 1 || submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? t("pages.ticketDetail.submitting") : t("pages.ticketDetail.submitRating")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}