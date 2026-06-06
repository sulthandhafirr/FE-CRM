import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  MdArrowBack,
  MdAttachFile,
  MdAccountCircle,
  MdSupportAgent,
  MdPerson,
  MdCheckCircle,
} from "react-icons/md";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../hooks/useAuth";
import {
  getTicketById,
  getAttachmentDownloadUrl,
  getTicketComments,
  createTicketComment,
  uploadTicketAttachment,
  resolveTicket,
  updateTicket,
  getTechnicians,
} from "../ticket.service";
import { getPriorityColor, getStatusColor, formatTicketDate, formatTechnicianSkills } from "../ticket.schema";

export default function AgentTicketViewDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [responseText, setResponseText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resolvingTicket, setResolvingTicket] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [showDispatchPanel, setShowDispatchPanel] = useState(false);
  const [technicianSearch, setTechnicianSearch] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [dispatchingTech, setDispatchingTech] = useState(false);

  // ── Queries ──
  const { data: ticket, isLoading, isError } = useQuery({
    queryKey: ["ticket-detail", ticketId],
    queryFn: () => getTicketById(ticketId),
    enabled: Boolean(ticketId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { data: comments = [], isLoading: commentsLoading, isError: commentsError } = useQuery({
    queryKey: ["ticket-comments", ticketId],
    queryFn: () => getTicketComments(ticketId),
    enabled: Boolean(ticketId),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ["technicians"],
    queryFn: getTechnicians,
    staleTime: 1000 * 60 * 5,
  });

  const { mutateAsync: submitComment } = useMutation({
    mutationFn: (message) => createTicketComment(ticketId, message),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-comments", ticketId] }),
  });

  // ── Permission check ──
  // ticket.solver berisi nama agent yang assigned, dibandingkan dengan nama user login
  const isAssignedToMe = ticket?.solverId
    ? ticket.solverId === user?.id
    : false;

  // ── Handlers ──
  const handleViewAttachment = async (attachmentId) => {
    try {
      setDownloadingId(attachmentId);
      const result = await getAttachmentDownloadUrl(ticketId, attachmentId);
      if (!result.signedUrl) throw new Error("No signed URL");
      window.open(result.signedUrl, "_blank");
    } catch (error) {
      console.error("Failed to open attachment:", error);
      alert(t("pages.ticketDetail.errors.download"));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleResolveTicket = async () => {
    if (!ticket || !isAssignedToMe) return;
    if (!window.confirm(t("pages.agentTicketDetail.confirmResolve"))) return;
    try {
      setResolvingTicket(true);
      await resolveTicket(ticketId);
      queryClient.invalidateQueries({ queryKey: ["ticket-detail", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
    } catch (err) {
      console.error("Error resolving ticket:", err.message);
      alert(t("pages.agentTicketDetail.errors.resolve"));
    } finally {
      setResolvingTicket(false);
    }
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!isAssignedToMe) return;
    const message = responseText.trim();
    if (!message && !attachment) return;
    try {
      setSubmitting(true);
      let newCommentId = null;
      if (message) {
        const result = await submitComment(message);
        newCommentId = result?.id ?? null;
      }
      if (attachment) {
        await uploadTicketAttachment(ticketId, attachment, newCommentId);
        queryClient.invalidateQueries({ queryKey: ["ticket-detail", ticketId] });
      }
      if (ticket?.status === "Waiting") {
        await updateTicket(ticketId, { status: "Progress" });
        queryClient.invalidateQueries({ queryKey: ["ticket-detail", ticketId] });
        queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
      }
      setResponseText("");
      setAttachment(null);
    } catch (err) {
      console.error("Error submitting response:", err.message);
      alert(t("pages.ticketDetail.errors.submit"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatchTechnician = async () => {
    if (!selectedTechnician || !ticket || !isAssignedToMe) return;
    try {
      setDispatchingTech(true);
      await updateTicket(ticketId, { technicianId: selectedTechnician.id, status: "Progress" });
      queryClient.invalidateQueries({ queryKey: ["ticket-detail", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
      setShowDispatchPanel(false);
      setSelectedTechnician(null);
      setTechnicianSearch("");
    } catch (err) {
      console.error("Error dispatching technician:", err.message);
      alert(t("pages.agentTicketDetail.errors.dispatch"));
    } finally {
      setDispatchingTech(false);
    }
  };

  // ── Helpers ──
  const attachments = ticket?.attachments ?? [];
  const ticketLevelAttachments = attachments.filter((a) => !a.commentId);

  // ── Render ──
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <style>{`
        @media (max-width: 767px) {
          .agent-detail-grid { grid-template-columns: 1fr !important; }
          .agent-info-grid { grid-template-columns: 1fr !important; }
          .agent-detail-right-col { border: none !important; background: transparent !important; padding: 0 !important; margin-top: 20px !important; }
        }
      `}</style>

      <div style={{ padding: "30px" }}>
        <div style={{ maxWidth: "1020px", margin: "0 auto" }}>
          <div style={{ background: "white", borderRadius: "14px", boxShadow: "0 8px 28px rgba(0,0,0,0.08)", overflow: "hidden" }}>

            {/* ── Header ── */}
            <div style={{ background: "linear-gradient(180deg, #FFF7F2 0%, #FFFFFF 100%)", padding: "16px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                onClick={() => navigate(-1)}
                style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "#FF8040", fontWeight: "600", fontSize: "14px" }}
              >
                <MdArrowBack size={20} /> {t("pages.ticketDetail.back")}
              </button>
              <div style={{ color: "#FF8040", fontWeight: "700", fontSize: "14px" }}>
                {t("pages.ticketDetail.ticketNumber", { id: ticketId })}
              </div>
              <div>
                {ticket?.status === "Progress" && isAssignedToMe && (
                  <button
                    onClick={handleResolveTicket}
                    disabled={resolvingTicket}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "8px", border: "none", background: resolvingTicket ? "#ccc" : "#FF8040", color: "white", fontWeight: "700", fontSize: "14px", cursor: resolvingTicket ? "not-allowed" : "pointer", boxShadow: "0 2px 8px rgba(255,128,64,0.3)" }}
                  >
                    <MdCheckCircle size={18} />
                    {resolvingTicket ? t("pages.agentTicketDetail.resolving") : t("pages.agentTicketDetail.markResolved")}
                  </button>
                )}
                {ticket?.status === "Solved" && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#FF8040", fontWeight: "700", fontSize: "14px" }}>
                    <MdCheckCircle size={18} /> {t("pages.agentTicketDetail.resolved")}
                  </span>
                )}
              </div>
            </div>

            {/* ── Body ── */}
            <div style={{ padding: "24px" }}>
              {isLoading ? (
                <div style={{ textAlign: "center", padding: "24px" }}><LoadingSpinner /></div>
              ) : isError || !ticket ? (
                <div style={{ textAlign: "center", color: "#6b7280", padding: "24px" }}>{t("pages.ticketDetail.notFound")}</div>
              ) : (
                <div className="agent-detail-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>

                  {/* ── Left column ── */}
                  <div style={{ padding: "12px 6px" }}>
                    <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "10px", color: "#333" }}>{ticket.subject}</h2>
                    <div style={{ color: "#FF8040", fontWeight: "600", fontSize: "14px", marginBottom: "6px" }}>
                      {t("pages.ticketDetail.description")}
                    </div>
                    <p style={{ color: "#555", lineHeight: "1.65", marginBottom: "24px" }}>
                      {ticket.description || t("pages.ticketDetail.noDescription")}
                    </p>

                    <div className="agent-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                      <div>
                        <div style={{ color: "#FF8040", fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>{t("pages.ticketDetail.createdAt")}</div>
                        <div style={{ color: "#333" }}>{formatTicketDate(ticket.createdAt)}</div>
                      </div>
                      <div>
                        <div style={{ color: "#FF8040", fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>{t("pages.agentTicketDetail.priority")}</div>
                        <div style={{ color: getPriorityColor(ticket.priority), fontWeight: "500" }}>{ticket.priority ?? "-"}</div>
                      </div>
                      <div>
                        <div style={{ color: "#FF8040", fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>{t("pages.ticketDetail.status")}</div>
                        <div style={{ color: getStatusColor(ticket.status), fontWeight: "600" }}>{ticket.status || "-"}</div>
                      </div>
                      <div>
                        <div style={{ color: "#FF8040", fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>{t("pages.agentTicketDetail.customer")}</div>
                        <div style={{ color: "#333", display: "flex", alignItems: "center", gap: "6px" }}>
                          <MdAccountCircle size={16} color="#FF8040" />{ticket.customer ?? "-"}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: "#FF8040", fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>{t("pages.agentTicketDetail.assignedTo")}</div>
                        <div style={{ color: "#333" }}>{ticket.solver ?? t("pages.agentTicketDetail.unassigned")}</div>
                      </div>
                      <div>
                        <div style={{ color: "#FF8040", fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>{t("pages.ticketDetail.technician")}</div>
                        <div style={{ color: "#333" }}>{ticket.technician ?? t("pages.agentTicketDetail.unassigned")}</div>
                      </div>
                      {ticket.resolvedAt && (
                        <div>
                          <div style={{ color: "#FF8040", fontWeight: "600", fontSize: "13px", marginBottom: "4px" }}>{t("pages.ticketDetail.resolvedAt")}</div>
                          <div style={{ color: "#333" }}>{formatTicketDate(ticket.resolvedAt)}</div>
                        </div>
                      )}
                    </div>

                    {/* ── Response form ── */}
                    <div style={{ marginTop: "26px", paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
                      <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "14px", color: "#333" }}>
                        {t("pages.ticketDetail.addResponse")}
                      </h3>

                      {/* Not assigned notice */}
                      {!isAssignedToMe && ticket.status !== "Solved" && (
                        <div style={{ background: "#fef9ec", border: "1px solid #fde68a", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: "#92400e" }}>
                          {t("pages.agentTicketDetail.notAssigned", "You are not assigned to this ticket.")}
                        </div>
                      )}

                      <form onSubmit={handleSubmitResponse}>
                        <textarea
                          rows={4}
                          placeholder={t("pages.ticketDetail.responsePlaceholder")}
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          disabled={!isAssignedToMe}
                          style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", resize: "none", fontSize: "14px", outline: "none", marginBottom: "10px", boxSizing: "border-box", background: isAssignedToMe ? "white" : "#f9fafb", cursor: isAssignedToMe ? "text" : "not-allowed", opacity: isAssignedToMe ? 1 : 0.6 }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <label style={{ color: isAssignedToMe ? "#FF8040" : "#bbb", fontWeight: "600", cursor: isAssignedToMe ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: "5px", fontSize: "14px" }}>
                            <MdAttachFile size={18} /> {t("pages.ticketDetail.attachFile")}
                            <input type="file" style={{ display: "none" }} disabled={!isAssignedToMe} onChange={(e) => setAttachment(e.target.files[0] ?? null)} />
                          </label>
                          {attachment && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#555", background: "#FFF5EF", border: "1px solid #fde4d4", borderRadius: "6px", padding: "4px 10px" }}>
                              <MdAttachFile size={14} color="#FF8040" />
                              {attachment.name}
                              <button type="button" onClick={() => setAttachment(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: "16px", lineHeight: 1, padding: "0 2px" }}>×</button>
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                          <button
                            type="button"
                            disabled={!isAssignedToMe}
                            onClick={() => { if (isAssignedToMe) { setShowDispatchPanel(true); setSelectedTechnician(null); setTechnicianSearch(""); } }}
                            style={{ padding: "10px 25px", borderRadius: "8px", border: `2px solid ${isAssignedToMe ? "#FF8040" : "#ddd"}`, background: "white", color: isAssignedToMe ? "#FF8040" : "#bbb", fontWeight: "600", cursor: isAssignedToMe ? "pointer" : "not-allowed", fontSize: "14px" }}
                          >
                            {t("pages.agentTicketDetail.dispatch")}
                          </button>
                          <button
                            type="submit"
                            disabled={!isAssignedToMe || submitting || (!responseText.trim() && !attachment)}
                            style={{ padding: "10px 30px", borderRadius: "8px", border: "none", background: "#FF8040", color: "white", fontWeight: "600", cursor: (!isAssignedToMe || submitting || (!responseText.trim() && !attachment)) ? "not-allowed" : "pointer", opacity: (!isAssignedToMe || submitting || (!responseText.trim() && !attachment)) ? 0.5 : 1, fontSize: "14px" }}
                          >
                            {submitting ? t("pages.ticketDetail.submitting") : t("pages.ticketDetail.submit")}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* ── Right column ── */}
                  {showDispatchPanel && isAssignedToMe ? (
                    /* ── Dispatch Panel ── */
                    <div style={{ background: "#fffdfb", borderRadius: "14px", padding: "22px", border: "1px solid #fce6d8" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#333" }}>
                        {t("pages.agentTicketDetail.dispatchTechnician")}
                      </h3>
                      <div style={{ marginBottom: "16px" }}>
                        <label style={{ color: "#FF8040", fontWeight: "600", fontSize: "13px", display: "block", marginBottom: "6px" }}>
                          {t("pages.agentTicketDetail.searchTechnician")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("pages.agentTicketDetail.searchPlaceholder")}
                          value={technicianSearch}
                          onChange={(e) => { setTechnicianSearch(e.target.value); setSelectedTechnician(null); }}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #fde4d4", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                        />
                        <div style={{ border: "1px solid #fde4d4", borderRadius: "8px", marginTop: "4px", background: "white", maxHeight: "160px", overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                            {technicians
                              .filter((tech) =>
                                !technicianSearch ||
                                tech.name?.toLowerCase().includes(technicianSearch.toLowerCase()) ||
                                tech.email?.toLowerCase().includes(technicianSearch.toLowerCase())
                              )
                              .map((tech) => (
                                <div
                                  key={tech.id}
                                  onClick={() => { setSelectedTechnician(tech); setTechnicianSearch(tech.name); }}
                                  style={{ padding: "10px 14px", cursor: "pointer", fontSize: "13px", color: "#333", borderBottom: "1px solid #f5f5f5" }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = "#FFF5EF"}
                                  onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                                >
                                  <span style={{ fontWeight: "600" }}>{tech.name}</span>
                                  <span style={{ color: "#999", marginLeft: "8px" }}>{tech.email}</span>
                                </div>
                              ))}
                            {technicians.filter((tech) =>
                              !technicianSearch ||
                              tech.name?.toLowerCase().includes(technicianSearch.toLowerCase()) ||
                              tech.email?.toLowerCase().includes(technicianSearch.toLowerCase())
                            ).length === 0 && (
                              <div style={{ padding: "12px 14px", color: "#999", fontSize: "13px" }}>
                                {t("pages.agentTicketDetail.noTechnicians")}
                              </div>
                            )}
                        </div>
                      </div>
                      {selectedTechnician && (
                        <div style={{ background: "#FFF5EF", border: "1px solid #fde4d4", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
                          {[
                            { label: t("pages.agentTicketDetail.techName"), value: selectedTechnician.name },
                            { label: t("pages.agentTicketDetail.techPosition"), value: selectedTechnician.position ?? "-" },
                            { label: t("pages.agentTicketDetail.techEmail"), value: selectedTechnician.email },
                            { label: t("pages.agentTicketDetail.techSkills"), value: formatTechnicianSkills(selectedTechnician.skills) },
                          ].map(({ label, value }) => (
                            <div key={label} style={{ display: "flex", gap: "10px", marginBottom: "8px", fontSize: "13px" }}>
                              <span style={{ color: "#FF8040", fontWeight: "600", minWidth: "60px" }}>{label}:</span>
                              <span style={{ color: "#333" }}>{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => { setShowDispatchPanel(false); setSelectedTechnician(null); setTechnicianSearch(""); }}
                          style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "2px solid #ddd", background: "white", color: "#666", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}
                        >
                          {t("pages.agentTicketDetail.cancel")}
                        </button>
                        <button
                          onClick={handleDispatchTechnician}
                          disabled={!selectedTechnician || dispatchingTech}
                          style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: !selectedTechnician || dispatchingTech ? "#ccc" : "#FF8040", color: "white", fontWeight: "600", cursor: !selectedTechnician || dispatchingTech ? "not-allowed" : "pointer", fontSize: "14px" }}
                        >
                          {dispatchingTech ? t("pages.agentTicketDetail.dispatching") : t("pages.agentTicketDetail.dispatch")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Attachments + Timeline ── */
                    <div className="agent-detail-right-col" style={{ background: "#fffdfb", borderRadius: "14px", padding: "22px", border: "1px solid #fce6d8" }}>

                      {/* ── Attachments ── */}
                      <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "14px", color: "#333" }}>
                        {t("pages.ticketDetail.attachments")}
                      </h3>
                      {ticketLevelAttachments.length === 0 ? (
                        <div style={{ color: "#9ca3af", fontSize: "14px" }}>{t("pages.ticketDetail.noAttachments")}</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {ticketLevelAttachments.map((file) => (
                            <button
                              key={file.id}
                              type="button"
                              onClick={() => handleViewAttachment(file.id)}
                              disabled={downloadingId === file.id}
                              style={{ width: "100%", textAlign: "left", border: "1px solid #fde4d4", borderRadius: "10px", background: "#fffaf7", padding: "10px 12px", cursor: downloadingId === file.id ? "not-allowed" : "pointer", opacity: downloadingId === file.id ? 0.6 : 1, display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
                            >
                              <MdAttachFile size={16} color="#FF8040" />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ color: "#374151", fontWeight: "600", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {file.fileName ?? file.name ?? "Attachment"}
                                </div>
                                <div style={{ color: "#9ca3af", fontSize: "12px", marginTop: "2px" }}>
                                  {downloadingId === file.id ? t("pages.ticketDetail.loading") : t("pages.ticketDetail.clickToView")}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      <div style={{ height: "1px", background: "#fce6d8", margin: "18px 0" }} />

                      {/* ── Timeline ── */}
                      <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#333" }}>
                        {t("pages.ticketDetail.timeline")}
                      </h3>
                      {commentsLoading ? (
                        <div style={{ textAlign: "center", padding: "16px 0" }}><LoadingSpinner /></div>
                      ) : commentsError ? (
                        <div style={{ color: "#9ca3af", fontSize: "14px" }}>{t("pages.ticketDetail.errors.loadTimeline")}</div>
                      ) : (
                        <div style={{ position: "relative", paddingLeft: "30px" }}>
                          {(() => {
                            const createdDate = new Date(ticket?.createdAt);
                            const createdDateStr = Number.isNaN(createdDate.getTime()) ? "-" : createdDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
                            const createdTimeStr = Number.isNaN(createdDate.getTime()) ? "-" : createdDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

                            const allItems = [
                              { _type: "created" },
                              ...comments.map((c) => ({ _type: "comment", ...c })),
                              ...(ticket.status === "Solved" && ticket.resolvedAt ? [{ _type: "resolved" }] : []),
                            ];

                            return allItems.map((item, index) => {
                              const isLast = index === allItems.length - 1;

                              if (item._type === "created") return (
                                <div key="ticket-created" style={{ position: "relative", marginBottom: "18px" }}>
                                  {!isLast && <div style={{ position: "absolute", left: "-20px", top: "22px", bottom: "-20px", width: "2px", background: "#FF8040" }} />}
                                  <div style={{ position: "absolute", left: "-30px", top: "2px", width: "22px", height: "22px", borderRadius: "50%", background: "white", border: "2px solid #FF8040", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <MdPerson size={12} color="#FF8040" />
                                  </div>
                                  <div style={{ border: "1px solid #fde4d4", borderRadius: "10px", padding: "10px 12px", background: "#fffdfb" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                                      <div style={{ fontWeight: "600", fontSize: "13px", color: "#333" }}>{ticket?.customer || t("pages.agentTicketDetail.customer")}</div>
                                      <div style={{ fontSize: "11px", color: "#9ca3af", whiteSpace: "nowrap" }}>{createdDateStr} • {createdTimeStr}</div>
                                    </div>
                                    <div style={{ fontSize: "13px", color: "#555", lineHeight: "1.5" }}>{t("pages.agentTicketDetail.ticketCreated")}</div>
                                  </div>
                                </div>
                              );

                              if (item._type === "resolved") {
                                const rd = new Date(ticket.resolvedAt);
                                const rdStr = Number.isNaN(rd.getTime()) ? "-" : rd.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
                                const rtStr = Number.isNaN(rd.getTime()) ? "-" : rd.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                                return (
                                  <div key="ticket-resolved" style={{ position: "relative", marginBottom: "18px" }}>
                                    <div style={{ position: "absolute", left: "-30px", top: "2px", width: "22px", height: "22px", borderRadius: "50%", background: "#FF8040", border: "2px solid #FF8040", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <MdCheckCircle size={13} color="white" />
                                    </div>
                                    <div style={{ border: "1px solid #bbf7d0", borderRadius: "10px", padding: "10px 12px", background: "#f0fdf4" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                                        <div style={{ fontWeight: "600", fontSize: "13px", color: "#16a34a" }}>{t("pages.agentTicketDetail.ticketResolved")}</div>
                                        <div style={{ fontSize: "11px", color: "#9ca3af", whiteSpace: "nowrap" }}>{rdStr} • {rtStr}</div>
                                      </div>
                                      <div style={{ fontSize: "13px", color: "#15803d", lineHeight: "1.5" }}>{t("pages.agentTicketDetail.statusSolved")}</div>
                                    </div>
                                  </div>
                                );
                              }

                              const commentDate = new Date(item.createdAt);
                              const dateStr = Number.isNaN(commentDate.getTime()) ? "-" : commentDate.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
                              const timeStr = Number.isNaN(commentDate.getTime()) ? "-" : commentDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                              const isAgentReply = item.senderId && user?.id && item.senderId === user.id;
                              const commentAttachments = attachments.filter((a) => a.commentId === item.id);

                              return (
                                <div key={item.id ?? index} style={{ position: "relative", marginBottom: "18px" }}>
                                  {!isLast && <div style={{ position: "absolute", left: "-20px", top: "22px", bottom: "-20px", width: "2px", background: "#FF8040" }} />}
                                  <div style={{ position: "absolute", left: "-30px", top: "2px", width: "22px", height: "22px", borderRadius: "50%", background: isAgentReply ? "#FF8040" : "white", border: "2px solid #FF8040", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {isAgentReply ? <MdSupportAgent size={12} color="white" /> : <MdPerson size={12} color="#FF8040" />}
                                  </div>
                                  <div style={{ border: "1px solid #fde4d4", borderRadius: "10px", padding: "10px 12px", background: isAgentReply ? "#FF8040" : "#fffdfb" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                                      <div style={{ fontWeight: "600", fontSize: "13px", color: isAgentReply ? "white" : "#333" }}>
                                        {item.senderName || t("pages.ticketDetail.unknownSender")}
                                      </div>
                                      <div style={{ fontSize: "11px", color: isAgentReply ? "rgba(255,255,255,0.75)" : "#9ca3af", whiteSpace: "nowrap" }}>{dateStr} • {timeStr}</div>
                                    </div>
                                    <div style={{ fontSize: "13px", color: isAgentReply ? "white" : "#555", lineHeight: "1.5", wordBreak: "break-word" }}>{item.message || "-"}</div>
                                    {commentAttachments.length > 0 && (
                                      <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: `1px solid ${isAgentReply ? "rgba(255,255,255,0.3)" : "#fde4d4"}`, display: "flex", flexDirection: "column", gap: "6px" }}>
                                        {commentAttachments.map((file) => (
                                          <button
                                            key={file.id}
                                            type="button"
                                            onClick={() => handleViewAttachment(file.id)}
                                            disabled={downloadingId === file.id}
                                            style={{ width: "100%", textAlign: "left", border: `1px solid ${isAgentReply ? "rgba(255,255,255,0.4)" : "#fde4d4"}`, borderRadius: "8px", background: downloadingId === file.id ? (isAgentReply ? "rgba(255,255,255,0.15)" : "#fde4d4") : (isAgentReply ? "rgba(255,255,255,0.12)" : "#fffaf7"), padding: "8px 10px", cursor: downloadingId === file.id ? "not-allowed" : "pointer", opacity: downloadingId === file.id ? 0.6 : 1, display: "flex", alignItems: "center", gap: "8px" }}
                                          >
                                            <MdAttachFile size={15} color={isAgentReply ? "white" : "#FF8040"} />
                                            <div style={{ minWidth: 0 }}>
                                              <div style={{ color: isAgentReply ? "white" : "#374151", fontWeight: "600", fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {file.fileName ?? file.name ?? "Attachment"}
                                              </div>
                                              <div style={{ color: isAgentReply ? "rgba(255,255,255,0.65)" : "#9ca3af", fontSize: "11px", marginTop: "1px" }}>
                                                {downloadingId === file.id ? t("pages.ticketDetail.loading") : t("pages.ticketDetail.clickToView")}
                                              </div>
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}