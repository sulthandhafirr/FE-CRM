import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import { MdClose } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { getTicketsPreview } from "../dashboard.service";
import { formatTicketDate, getIntentLabel } from "../../ticket/ticket.schema";

const STATUS_BADGE = {
  Solved: { bg: "#E8F5E9", color: "#2E7D32" },
  Progress: { bg: "#FFF3E0", color: "#E65100" },
  Waiting: { bg: "#E3F2FD", color: "#1565C0" },
};

const PRIORITY_BADGE = {
  Low: { bg: "#E3F2FD", color: "#1565C0" },
  Normal: { bg: "#E8F5E9", color: "#2E7D32" },
  High: { bg: "#FFF3E0", color: "#E65100" },
  Critical: { bg: "#FFEBEE", color: "#C62828" },
};

const Badge = ({ label, palette }) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "999px",
      background: palette?.bg ?? "#F5F5F5",
      color: palette?.color ?? "#555",
      fontSize: "12px",
      fontWeight: "600",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </span>
);

// filters: { status?, priority?, intentKey?, startDate?, endDate? }
// onDetailClick(ticket): role-aware navigation, owned by the parent page
export default function TicketPreviewModal({ open, onClose, title, filters, onDetailClick }) {
  const { t } = useTranslation();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets-preview", filters],
    queryFn: () => getTicketsPreview(filters),
    enabled: open && !!filters,
    staleTime: 1000 * 60 * 2,
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableScrollLock
      disableAutoFocus
      disableEnforceFocus
      PaperProps={{
        style: {
          borderRadius: "16px",
          overflow: "hidden",
        },
      }}
    >
      {/* Sticky header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid #f0f0f0",
          position: "sticky",
          top: 0,
          background: "white",
          zIndex: 1,
        }}
      >
        <div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a1a" }}>
            {title}
          </div>
          {tickets && (
            <div style={{ fontSize: "13px", color: "#999", marginTop: "2px" }}>
              {tickets.length} {t("pages.dashboard.previewTicketsFound")}
            </div>
          )}
        </div>
        <IconButton
          size="small"
          onClick={onClose}
          style={{ background: "#f5f5f5" }}
        >
          <MdClose size={18} color="#666" />
        </IconButton>
      </div>

      <DialogContent style={{ padding: 0 }}>
        {isLoading ? (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              color: "#999",
              fontSize: "14px",
            }}
          >
            {t("pages.dashboard.loadingChart")}
          </div>
        ) : !tickets || tickets.length === 0 ? (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              color: "#999",
              fontSize: "14px",
            }}
          >
            {t("pages.dashboard.noTicketsFound")}
          </div>
        ) : (
          <div style={{ maxHeight: "60vh", overflowY: "auto", overflowX: "hidden", paddingRight: "10px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "12%" }} />
                <col style={{ width: "26%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "8%" }} />
              </colgroup>
              <thead>
                <tr>
                  {[
                    t("pages.dashboard.previewId"),
                    t("pages.dashboard.previewSubject"),
                    t("pages.dashboard.previewStatus"),
                    t("pages.dashboard.previewPriority"),
                    t("pages.dashboard.previewIntent"),
                    t("pages.dashboard.previewCreatedAt"),
                    "",
                  ].map((head, i) => (
                    <th
                      key={i}
                      style={{
                        textAlign: i === 6 ? "right" : "left",
                        padding: i === 6 ? "10px 24px 10px 14px" : "10px 14px",
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#999",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        borderBottom: "1px solid #f0f0f0",
                        position: "sticky",
                        top: 0,
                        background: "#fafafa",
                      }}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    style={{
                      borderBottom: "1px solid #f5f5f5",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fffaf7")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#999", fontFamily: "monospace" }}>
                      #{ticket.id}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: "13px",
                        color: "#333",
                        fontWeight: "500",
                        maxWidth: "220px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ticket.subject ?? "-"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Badge label={ticket.status ?? "-"} palette={STATUS_BADGE[ticket.status]} />
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Badge label={ticket.priority ?? "-"} palette={PRIORITY_BADGE[ticket.priority]} />
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#666" }}>
                      {ticket.intent === "Unclassified" ? "Unclassified" : getIntentLabel(ticket.intent)}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#666", whiteSpace: "nowrap" }}>
                      {formatTicketDate(ticket.createdAt)}
                    </td>
                    <td style={{ padding: "12px 24px 12px 14px", textAlign: "right" }}>
                      <button
                        onClick={() => onDetailClick(ticket)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "8px",
                          border: "1.5px solid #FF8040",
                          background: "white",
                          color: "#FF8040",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#FF8040";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.color = "#FF8040";
                        }}
                      >
                        {t("pages.dashboard.previewDetail")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}