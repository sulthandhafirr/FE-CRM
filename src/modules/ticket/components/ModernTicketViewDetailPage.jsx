import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  MdCheckCircle,
} from "react-icons/md";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useAuth } from "../../../hooks/useAuth";
import { api } from "../../../lib/api/apiClient";
import { supabase } from "../../../lib/supabase";
import {
  getTicketById,
  getTicketComments,
  createTicketComment,
  uploadTicketAttachment,
  resolveTicket,
  updateTicket,
  getTechnicians,
  takeAction,
  getAttachmentDownloadUrl,
  getDuplicateCounts,
  assignTicketToAgent,
  changeTicketPriority,
} from "../ticket.service";
import {
  getTicketSummary,
  getTicketDraft,
} from "../ticket.ai";
import {
  isResolvedStatus,
  formatTicketDate,
  formatTicketDateTime,
} from "../ticket.schema";
import TicketHeader from "./TicketHeader";
import TicketChatMessage from "./TicketChatMessage";
import TicketReplyComposer from "./TicketReplyComposer";
import TicketSidebar from "./TicketSidebar";

export default function ModernTicketViewDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const queryClient = useQueryClient();
  const { user, role } = useAuth();

  // ── State ──
  const replyRef = useRef(null);
  const chatRef = useRef(null);
  const [replyText, setReplyText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resolvingTicket, setResolvingTicket] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assigningAgent, setAssigningAgent] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showIntentMenu, setShowIntentMenu] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [showDispatchPanel, setShowDispatchPanel] = useState(false);
  const [technicianSearch, setTechnicianSearch] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [dispatchingTech, setDispatchingTech] = useState(false);
  const [stellaSummary, setStellaSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [loadingDots, setLoadingDots] = useState("");
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [typewriterDone, setTypewriterDone] = useState(false);

  // ── Queries ──
  const { data: ticket, isLoading, isError } = useQuery({
    queryKey: ["ticket-detail", ticketId],
    queryFn: () => getTicketById(ticketId),
    enabled: Boolean(ticketId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { data: comments = [] } = useQuery({
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

  const { data: duplicateCounts = {} } = useQuery({
    queryKey: ["duplicate-counts"],
    queryFn: () => getDuplicateCounts(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const CS_AGENT_ROLE_ID = 2;
  const { data: csAgents = [] } = useQuery({
    queryKey: ["cs-agents", user?.id],
    queryFn: async () => {
      if (!user?.id || role !== "admin") return [];
      // 1. Get admin's company_id
      const { data: profile } = await supabase
        .from("profile")
        .select("company_id")
        .eq("id", user.id)
        .single();
      const companyId = profile?.company_id;
      if (!companyId) return [];
      // 2. Query CS agents directly from Supabase filtered by company + role
      const { data: agents, error } = await supabase
        .from("profile")
        .select("id, name, email")
        .eq("company_id", companyId)
        .eq("role_id", CS_AGENT_ROLE_ID);
      if (error) {
        console.error("Failed to fetch company CS agents:", error);
        return [];
      }
      return agents || [];
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    enabled: role === "admin",
  });

  const { data: customerTier } = useQuery({
    queryKey: ["customer-tier", ticket?.customerId],
    queryFn: async () => {
      if (!ticket?.customerId) return null;
      const { data } = await api.get(`/api/tiers/profile/${ticket.customerId}`);
      return data || null;
    },
    enabled: Boolean(ticket?.customerId),
    staleTime: 1000 * 60 * 10,
  });

  const { mutateAsync: submitComment } = useMutation({
    mutationFn: (message) => createTicketComment(ticketId, message),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["ticket-comments", ticketId] }),
  });

  // ── Effects ──

  // Auto-resize textarea
  useEffect(() => {
    const el = replyRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 192) + "px";
  }, [replyText]);

  // Loading dots animation
  useEffect(() => {
    if (!summarizing) {
      setLoadingDots("");
      return;
    }
    const interval = setInterval(() => {
      setLoadingDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, [summarizing]);

  // Typewriter animation for Stella summary
  useEffect(() => {
    if (!stellaSummary) {
      setTypewriterIndex(0);
      setTypewriterDone(false);
      return;
    }
    setTypewriterIndex(0);
    setTypewriterDone(false);
    const interval = setInterval(() => {
      setTypewriterIndex((prev) => {
        if (prev >= stellaSummary.length) {
          clearInterval(interval);
          setTypewriterDone(true);
          return prev;
        }
        return prev + 2;
      });
    }, 25);
    return () => clearInterval(interval);
  }, [stellaSummary]);

  // Auto-scroll ke paling bawah seperti WhatsApp (saat masuk chat / ada pesan baru)
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [comments, ticket]);

  // Realtime subscription
  useEffect(() => {
    if (!ticketId) return;
    const channel = supabase
      .channel(`comments-${ticketId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ticket_comment" },
        (payload) => {
          if (payload.new.sender_id === user?.id) return;
          queryClient.invalidateQueries({ queryKey: ["ticket-comments", ticketId] });
        },
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [ticketId, user?.id, queryClient]);

  // ── Computed ──
  const norm = (v) => (v || "").trim().toLowerCase();
  const resolved = isResolvedStatus(ticket?.status);
  const attachments = useMemo(() => ticket?.attachments || [], [ticket]);

  const isAssignedToMe = role === "technician"
    ? norm(ticket?.technician) === norm(user?.name)
    : ticket?.solverId
      ? ticket.solverId === user?.id
      : false;
  const canReply = isAssignedToMe || role === "technician" || role === "admin" || role === "customer";
  const isAssignedToOther = role === "technician"
    ? Boolean(ticket?.technician) && norm(ticket.technician) !== norm(user?.name)
    : !isAssignedToMe && Boolean(ticket?.solver);
  const isTechnicianDispatched = Boolean(ticket?.technician);

  const getTierStyle = (tierName, tierColor) => {
    if (!tierName) return null;
    const color = tierColor || "#6b7280";
    return { label: tierName, color, bg: `${color}15`, border: color, dot: color };
  };

  // ── Handlers ──
  const handleViewAttachment = async (attachmentId) => {
    try {
      setDownloadingId(attachmentId);
      const result = await getAttachmentDownloadUrl(ticketId, attachmentId);
      if (!result.signedUrl) throw new Error("No signed URL");
      window.open(result.signedUrl, "_blank");
    } catch (error) {
      console.error(error);
      alert(t("pages.ticketDetail.errors.download"));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleAssignToMe = async () => {
    if (!ticket) return;
    // Untuk admin: izinkan re-assign meski sudah assigned
    if (isAssignedToMe && role !== "admin") return;
    try {
      setAssigning(true);
      await takeAction(ticketId);
      queryClient.invalidateQueries({ queryKey: ["ticket-detail", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
    } catch (err) {
      console.error(err);
      alert("Failed to assign ticket.");
    } finally {
      setAssigning(false);
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
      console.error(err);
      alert(t("pages.agentTicketDetail.errors.resolve"));
    } finally {
      setResolvingTicket(false);
    }
  };

  const handleDispatchTechnician = async () => {
    // Admin boleh dispatch teknisi walau tiket belum/tidak diassign ke dirinya
    if (!selectedTechnician || !ticket) return;
    if (!isAssignedToMe && role !== "admin") return;
    try {
      setDispatchingTech(true);
      await updateTicket(ticketId, { technicianId: selectedTechnician.id, status: "Progress" });
      queryClient.invalidateQueries({ queryKey: ["ticket-detail", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
      setShowDispatchPanel(false);
      setSelectedTechnician(null);
      setTechnicianSearch("");
    } catch (err) {
      console.error(err);
      alert("Failed to dispatch technician.");
    } finally {
      setDispatchingTech(false);
    }
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!canReply) return;
    const message = replyText.trim();
    if (!message && !selectedFile) return;
    try {
      setSubmitting(true);
      let newCommentId = null;
      if (message) {
        const result = await submitComment(message);
        newCommentId = result?.id ?? null;
      }
      if (selectedFile) {
        await uploadTicketAttachment(ticketId, selectedFile, newCommentId);
        queryClient.invalidateQueries({ queryKey: ["ticket-detail", ticketId] });
      }
      if (ticket?.status === "Waiting" && role !== "customer") {
        await updateTicket(ticketId, { status: "Progress" });
        queryClient.invalidateQueries({ queryKey: ["ticket-detail", ticketId] });
        queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
      }
      setReplyText("");
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert(t("pages.ticketDetail.errors.submit"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStellaSummary = async () => {
    if (stellaSummary || summarizing) return;
    setSummarizing(true);
    try {
      const data = await getTicketSummary(ticketId);
      if (data.success) {
        setStellaSummary(data.message);
      } else {
        setStellaSummary("Unable to generate summary. Please try again.");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      setStellaSummary("Unable to generate summary. Please try again.");
    } finally {
      setSummarizing(false);
    }
  };

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    try {
      const data = await getTicketDraft(ticketId);
      if (data.success) {
        setReplyText(data.message);
      }
    } catch (error) {
      console.error("Error generating draft:", error);
      setReplyText("Error connecting to AI. Please try again or write the draft manually.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShowDispatchPanel = () => {
    // Toggle: klik lagi untuk menutup panel
    if (showDispatchPanel) {
      setShowDispatchPanel(false);
    } else {
      setShowDispatchPanel(true);
      setSelectedTechnician(null);
      setTechnicianSearch("");
    }
  };

  const handleHideDispatchPanel = () => {
    setShowDispatchPanel(false);
    setSelectedTechnician(null);
    setTechnicianSearch("");
  };

  const handleTechnicianSearch = (value) => {
    setTechnicianSearch(value);
    setSelectedTechnician(null);
  };

  const handleSelectTechnician = (tech) => {
    setSelectedTechnician(tech);
    setTechnicianSearch(tech.name);
  };

  const handleNavigate = (path, state) => navigate(path, state);

  // ── Admin handlers ──

  const handleShowAgentPanel = () => {
    setShowAgentPanel(true);
    setAgentSearch("");
  };

  const handleHideAgentPanel = () => {
    setShowAgentPanel(false);
    setAgentSearch("");
  };

  const handleAgentSearch = (value) => {
    setAgentSearch(value);
    setSelectedAgent(null);
  };

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    setAgentSearch(agent.name);
  };

  const handleAssignToAgent = async () => {
    if (!ticket || !selectedAgent?.name) return;
    try {
      setAssigningAgent(true);
      const result = await assignTicketToAgent(ticketId, selectedAgent.name);
      console.log("Assign result:", result);
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["ticket-detail", ticketId] }),
        queryClient.refetchQueries({ queryKey: ["all-tickets"] }),
      ]);
      setShowAgentPanel(false);
      setSelectedAgent(null);
      setAgentSearch("");
    } catch (err) {
      console.error("Assign error:", err);
      alert(err?.response?.data?.message || err?.message || "Failed to assign ticket to agent.");
    } finally {
      setAssigningAgent(false);
    }
  };

  const handleChangePriority = async (priority) => {
    if (!ticket || priority === ticket.priority) return;
    try {
      await changeTicketPriority(ticketId, priority);
      queryClient.invalidateQueries({ queryKey: ["ticket-detail", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
      setShowPriorityMenu(false);
    } catch (err) {
      console.error(err);
      alert("Failed to change ticket priority.");
    }
  };

  const handleChangeIntent = async (intent) => {
    if (!ticket || intent === ticket.intent) return;
    try {
      await updateTicket(ticketId, { intent });
      queryClient.invalidateQueries({ queryKey: ["ticket-detail", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
      setShowIntentMenu(false);
    } catch (err) {
      console.error(err);
      alert("Failed to change issue detected.");
    }
  };

  // ── Render: Loading / Error ──
  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <LoadingSpinner />
      </div>
    );
  }
  if (isError || !ticket) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          color: "#6B7280",
          fontSize: "16px",
        }}
      >
        {t("pages.ticketDetail.notFound")}
      </div>
    );
  }

  // ── Render: Main ──
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: "#F9FAFB",
        overflow: "hidden",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{`
        main { display: flex !important; flex-direction: column !important; }
        .mtd-chat::-webkit-scrollbar { display: none; }
        .mtd-chat { scrollbar-width: none; -ms-overflow-style: none; }
        .mtd-sidebar::-webkit-scrollbar { display: none; }
        .mtd-sidebar { scrollbar-width: none; -ms-overflow-style: none; }
        @keyframes mtd-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }
        @keyframes mtd-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @media (max-width: 1023px) {
          .mtd-sidebar { display: none !important; }
        }
      `}</style>

      <TicketHeader
        ticket={ticket}
        ticketId={ticketId}
        role={role}
        resolved={resolved}
        isAssignedToMe={isAssignedToMe}
        isAssignedToOther={isAssignedToOther}
        assigning={assigning}
        resolvingTicket={resolvingTicket}
        onAssignToMe={handleAssignToMe}
        onResolveTicket={handleResolveTicket}
        onBack={() => navigate(-1)}
        formatTicketDate={formatTicketDate}
      />

      {/* ═══════════════ MAIN BODY ═══════════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── LEFT: Conversation ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            background: "#F9FAFB",
          }}
        >
          {/* Messages */}
          <div
            ref={chatRef}
            className="mtd-chat"
            style={{
              padding: "32px 32px 20px",
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              maxWidth: "896px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            {/* ── Ticket created ── */}
            <TicketCreatedMessage ticket={ticket} role={role} formatTicketDateTime={formatTicketDateTime} t={t} />

            {/* ── Comments ── */}
            {comments.map((comment) => (
              <TicketChatMessage
                key={comment.id}
                comment={comment}
                user={user}
                role={role}
                ticket={ticket}
                norm={norm}
                formatTicketDateTime={formatTicketDateTime}
                t={t}
                csAgents={csAgents}
              />
            ))}

            {/* ── Resolved marker ── */}
            {resolved && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                    borderRadius: "24px",
                    padding: "8px 20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#16A34A",
                  }}
                >
                  <MdCheckCircle size={16} />
                  Ticket Resolved
                  {ticket.resolvedAt && (
                    <>
                      {" "}
                      &bull; {formatTicketDateTime(ticket.resolvedAt)}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Reply composer ── */}
          {!resolved && (
            <TicketReplyComposer
              replyRef={replyRef}
              replyText={replyText}
              setReplyText={setReplyText}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              canReply={canReply}
              submitting={submitting}
              isGenerating={isGenerating}
              role={role}
              onSubmitResponse={handleSubmitResponse}
              onGenerateDraft={handleGenerateDraft}
            />
          )}
        </div>

        {/* ═══════════════ RIGHT SIDEBAR ═══════════════ */}
        <TicketSidebar
          ticket={ticket}
          ticketId={ticketId}
          role={role}
          comments={comments}
          duplicateCounts={duplicateCounts}
          customerTier={customerTier}
          getTierStyle={getTierStyle}
          isAssignedToMe={isAssignedToMe}
          isTechnicianDispatched={isTechnicianDispatched}
          showDispatchPanel={showDispatchPanel}
          technicianSearch={technicianSearch}
          selectedTechnician={selectedTechnician}
          technicians={technicians}
          dispatchingTech={dispatchingTech}
          stellaSummary={stellaSummary}
          summarizing={summarizing}
          loadingDots={loadingDots}
          typewriterIndex={typewriterIndex}
          typewriterDone={typewriterDone}
          downloadingId={downloadingId}
          attachments={attachments}
          onNavigate={handleNavigate}
          onViewAttachment={handleViewAttachment}
          onStellaSummary={handleStellaSummary}
          onShowDispatchPanel={handleShowDispatchPanel}
          onHideDispatchPanel={handleHideDispatchPanel}
          onTechnicianSearch={handleTechnicianSearch}
          onSelectTechnician={handleSelectTechnician}
          onDispatchTechnician={handleDispatchTechnician}
          // ── Admin props ──
          resolved={resolved}
          csAgents={csAgents}
          showAgentPanel={showAgentPanel}
          agentSearch={agentSearch}
          selectedAgent={selectedAgent}
          assigningAgent={assigningAgent}
          showPriorityMenu={showPriorityMenu}
          showIntentMenu={showIntentMenu}
          onShowAgentPanel={handleShowAgentPanel}
          onHideAgentPanel={handleHideAgentPanel}
          onAgentSearch={handleAgentSearch}
          onSelectAgent={handleSelectAgent}
          onAssignToAgent={handleAssignToAgent}
          onChangePriority={handleChangePriority}
          onTogglePriorityMenu={() => setShowPriorityMenu((p) => !p)}
          onChangeIntent={handleChangeIntent}
          onToggleIntentMenu={() => setShowIntentMenu((p) => !p)}
        />
      </div>
    </div>
  );
}

// ── Ticket created message (initial description bubble) ──
function TicketCreatedMessage({ ticket, role, formatTicketDateTime, t }) {
  return (
    <div style={{ display: "flex", justifyContent: role === "customer" ? "flex-end" : "flex-start" }}>
      {role !== "customer" && (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "9999px",
            background: "#E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "700",
            color: "#6B7280",
            flexShrink: 0,
            marginRight: "12px",
            marginTop: "4px",
          }}
        >
          {(ticket.customer || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
        </div>
      )}
      <div
        style={{
          maxWidth: "85%",
          borderRadius: "16px",
          borderBottomLeftRadius: role === "customer" ? "16px" : "4px",
          borderBottomRightRadius: role === "customer" ? "4px" : "16px",
          padding: "20px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          background: "#FEF2F2",
          border: "1px solid #FECACA",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <span style={{ fontWeight: "600", fontSize: "14px", color: "#111827" }}>
            {ticket.customer || "Customer"}
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "2px 6px",
              borderRadius: "4px",
              background: "#FEE2E2",
              color: "#DC2626",
              border: "1px solid #FECACA",
            }}
          >
            Issue Description
          </span>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
            {formatTicketDateTime(ticket.createdAt)}
          </span>
        </div>
        <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
          {ticket.description || t("pages.ticketDetail.noDescription")}
        </p>
      </div>
    </div>
  );
}
