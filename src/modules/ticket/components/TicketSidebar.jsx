import { MdAutoAwesome, MdCheckCircle, MdOutlineFilterNone, MdEngineering, MdHourglassEmpty, MdAttachFile, MdPersonAdd, MdSwapVert, MdPerson, MdSync } from "react-icons/md";
import { O } from "./ticketTheme";
import { useState, useEffect } from "react";
import { Badge, ProgressBar } from "./TicketShared";
import { useTranslation } from "react-i18next";
import {
  getIntentLabel,
  getIntentColor,
  getPriorityColor,
  getActiveIntentNames,
  formatTicketDateTime
} from "../ticket.schema";

const getTechSkills = (tech) => {
  const raw = tech.profile_skill ?? tech.profileSkills ?? tech.skills ?? [];
  return raw
    .map((item) => {
      if (item == null) return null;

      if (typeof item.skill === "string") {
        return { id: item.id ?? item.skillId ?? item.skill_id, skill: item.skill };
      }

      const s = item.skills ?? item.skill;
      if (s && typeof s === "object") {
        const id = s.id ?? item.skillId ?? item.skill_id;
        const skill = s.skill ?? s.skillName;
        return id != null && skill ? { id, skill } : null;
      }

      return null;
    })
    .filter(Boolean);
};

const PRIORITY_OPTIONS = ["Low", "Normal", "High", "Critical"];

export default function TicketSidebar({
  ticket,
  ticketId,
  role,
  duplicateCounts,
  customerTier,
  getTierStyle,
  isAssignedToMe,
  isTechnicianDispatched,
  showDispatchPanel,
  technicianSearch,
  selectedTechnician,
  technicians,
  dispatchingTech,
  stellaSummary,
  summarizing,
  loadingDots,
  typewriterIndex,
  typewriterDone,
  downloadingId,
  attachments,
  onNavigate,
  onViewAttachment,
  onStellaSummary,
  onShowDispatchPanel,
  onHideDispatchPanel,
  onTechnicianSearch,
  onSelectTechnician,
  onDispatchTechnician,
  // ── Admin props ──
  resolved,
  csAgents,
  showAgentPanel,
  agentSearch,
  selectedAgent,
  assigningAgent,
  showPriorityMenu,
  showIntentMenu,
  changingPriority,
  changingIntent,
  onShowAgentPanel,
  onHideAgentPanel,
  onAgentSearch,
  onSelectAgent,
  onAssignToAgent,
  onChangePriority,
  onTogglePriorityMenu,
  onChangeIntent,
  onToggleIntentMenu,
}) {
  const { t } = useTranslation();
  return (
    <div
      className="mtd-sidebar"
      style={{
        width: "360px",
        background: "white",
        borderLeft: "1px solid #E5E7EB",
        overflowY: "auto",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        boxShadow: "-4px 0 15px -3px rgba(0,0,0,0.03)",
        zIndex: 10,
      }}
    >
      {/* ── Stella Help / AI Summary (all roles) ── */}
      <StellaHelpPanel
        stellaSummary={stellaSummary}
        summarizing={summarizing}
        loadingDots={loadingDots}
        typewriterIndex={typewriterIndex}
        typewriterDone={typewriterDone}
        onClick={onStellaSummary}
      />
      
      {/* ── Stella Analysis (non-customer) ── */}
      {role !== "customer" && (
        <div
          style={{
            padding: "20px",
            background: `linear-gradient(180deg, ${O[50]} 50%, white 100%)`,
            borderBottom: "1px solid #F3F4F6",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                padding: "6px",
                background: `linear-gradient(135deg, ${O[500]}, ${O[700]})`,
                color: "white",
                borderRadius: "8px",
                boxShadow: `0 1px 4px rgba(255,128,64,0.4)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MdAutoAwesome size={16} />
            </div>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#111827",
                letterSpacing: "-0.01em",
              }}
            >
              {t("pages.ticketSidebar.stellaAnalysis")}
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Intent */}
            <div
              style={{
                background: "white",
                padding: "12px",
                borderRadius: "12px",
                border: `1px solid ${O[200]}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "10px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#9CA3AF",
                  marginBottom: "8px",
                }}
              >
                <span>{t("pages.ticketSidebar.issueDetected")}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    color: getIntentColor(ticket.intent),
                  }}
                >
                  {getIntentLabel(ticket.intent)}
                </span>
                <MdCheckCircle size={16} color="#16A34A" />
              </div>
            </div>

            {/* SLA Prediction */}
            <div
              style={{
                background: "white",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "10px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#9CA3AF",
                  marginBottom: "8px",
                }}
              >
                <span>{t("pages.ticketSidebar.slaPrediction")}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <Badge type={ticket.priority}>{ticket.priority || "—"}</Badge>
                {/* <span style={{ fontSize: "12px", fontWeight: "500", color: "#DC2626" }}>
                  Breach in 45m
                </span> */}
                <SlaCountdown slaDeadline={ticket.slaDeadline} formatTicketDateTime={formatTicketDateTime} />
              </div>
              {/* <ProgressBar progress={85} color="#EF4444" /> */}
            </div>

            {/* Duplicate Tickets */}
            <DuplicateCard
              duplicateCounts={duplicateCounts}
              ticketId={ticket.id}
              ticketIdParam={ticketId}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      )}

      {/* ── Actions / Handler ── */}
      <div style={{ padding: role === "customer" ? "0px 20px 20px" : "20px", order: role === "customer" ? 2 : 1 }}>
        <div style={{ paddingTop: "8px" }}>
          {role === "technician" ? (
            <HandlerSection ticket={ticket} />
          ) : role === "customer" ? (
            <CustomerHandlerSection ticket={ticket} />
          ) : role === "admin" ? (
            <AdminActionsSection
              ticket={ticket}
              isTechnicianDispatched={isTechnicianDispatched}
              resolved={resolved}
              csAgents={csAgents}
              showAgentPanel={showAgentPanel}
              agentSearch={agentSearch}
              selectedAgent={selectedAgent}
              assigningAgent={assigningAgent}
              showPriorityMenu={showPriorityMenu}
              showIntentMenu={showIntentMenu}
              showDispatchPanel={showDispatchPanel}
              changingPriority={changingPriority}
              changingIntent={changingIntent}
              technicians={technicians}
              technicianSearch={technicianSearch}
              selectedTechnician={selectedTechnician}
              dispatchingTech={dispatchingTech}
              onShowAgentPanel={onShowAgentPanel}
              onHideAgentPanel={onHideAgentPanel}
              onAgentSearch={onAgentSearch}
              onSelectAgent={onSelectAgent}
              onAssignToAgent={onAssignToAgent}
              onChangePriority={onChangePriority}
              onTogglePriorityMenu={onTogglePriorityMenu}
              onChangeIntent={onChangeIntent}
              onToggleIntentMenu={onToggleIntentMenu}
              onShowDispatchPanel={onShowDispatchPanel}
              onHideDispatchPanel={onHideDispatchPanel}
              onTechnicianSearch={onTechnicianSearch}
              onSelectTechnician={onSelectTechnician}
              onDispatchTechnician={onDispatchTechnician}
            />
          ) : (
            <AgentActionsSection
              ticket={ticket}
              isAssignedToMe={isAssignedToMe}
              isTechnicianDispatched={isTechnicianDispatched}
              resolved={resolved}
              onShowDispatchPanel={onShowDispatchPanel}
            />
          )}

          {/* Dispatch Panel */}
          {showDispatchPanel && role !== "admin" && isAssignedToMe && !isTechnicianDispatched && !resolved && (
            <DispatchPanel
              technicians={technicians}
              technicianSearch={technicianSearch}
              selectedTechnician={selectedTechnician}
              dispatchingTech={dispatchingTech}
              currentTechnician={isTechnicianDispatched ? ticket.technician : null}
              onSearch={onTechnicianSearch}
              onSelect={onSelectTechnician}
              onDispatch={onDispatchTechnician}
              onCancel={onHideDispatchPanel}
            />
          )}
        </div>
      </div>

      {/* ── Customer Info ── */}
      <CustomerInfoSection
        role={role}
        ticket={ticket}
        customerTier={customerTier}
        getTierStyle={getTierStyle}
        downloadingId={downloadingId}
        attachments={attachments}
        onViewAttachment={onViewAttachment}
      />
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function DuplicateCard({ duplicateCounts, ticketId, ticketIdParam, onNavigate }) {
  const dupCount = duplicateCounts[ticketId] ?? 0;
  const { t } = useTranslation();
  return (
    <div
      onClick={() => dupCount > 0 && onNavigate("/dashboard/csAgent/ticket", { state: { openDuplicatesForId: Number(ticketIdParam) } })}
      style={{
        background: "white",
        padding: "12px",
        borderRadius: "12px",
        border: `1px solid ${dupCount > 0 ? "#FF8040" : "#E5E7EB"}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        cursor: dupCount > 0 ? "pointer" : "default",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (dupCount === 0) return;
        e.currentTarget.style.borderColor = "#E86A2C";
        e.currentTarget.style.background = "#FFF7F2";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(255,128,64,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = dupCount > 0 ? "#FF8040" : "#E5E7EB";
        e.currentTarget.style.background = "white";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "10px",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#9CA3AF",
          marginBottom: "8px",
        }}
      >
        <span>{t("pages.ticketSidebar.duplicateTickets")}</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontWeight: "600",
            fontSize: "14px",
            color: dupCount > 0 ? "#FF8040" : "#9CA3AF",
          }}
        >
          {dupCount > 0 ? t("pages.ticketSidebar.duplicateFound", { count: dupCount }) : t("pages.ticketSidebar.noDuplicates")}
        </span>
        {dupCount > 0 && <MdOutlineFilterNone size={16} color="#FF8040" />}
      </div>
      {dupCount > 0 && (
        <p style={{ fontSize: "11px", color: "#6B7280", marginTop: "4px" }}>
          {t("pages.ticketSidebar.clickReviewDuplicates")}
        </p>
      )}
    </div>
  );
}

function HandlerSection({ ticket }) {
  const { t } = useTranslation();
  return (
    <>
      <p style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: "8px" }}>
        {t("pages.ticketSidebar.handler")}
      </p>
      <div style={{ background: O[50], padding: "12px", borderRadius: "12px", border: `1px solid ${O[200]}`, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <p style={{ fontWeight: "600", fontSize: "14px", color: O[700] }}>
          {ticket.solver || "—"}
        </p>
        <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
          {t("pages.ticketSidebar.csAgent")}
        </p>
      </div>
    </>
  );
}

function CustomerHandlerSection({ ticket }) {
  const { t } = useTranslation();
  return (
    <>
      <p style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: "8px" }}>{t("pages.ticketSidebar.handler")}</p>
      <div style={{ background: O[50], padding: "12px", borderRadius: "12px", border: `1px solid ${O[200]}`, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        {ticket.solver ? (
          <>
            <p style={{ fontWeight: "600", fontSize: "14px", color: O[700] }}>{ticket.solver}</p>
            <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>{t("pages.ticketSidebar.csAgent")}</p>
            {ticket.technician && (
              <>
                <div style={{ height: "1px", background: O[200], margin: "8px 0" }} />
                <p style={{ fontWeight: "600", fontSize: "14px", color: O[700] }}>{ticket.technician}</p>
                <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>{t("pages.ticketSidebar.technician")}</p>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MdHourglassEmpty size={16} color={O[500]} />
              <p style={{ fontWeight: "600", fontSize: "14px", color: O[700] }}>{t("pages.ticketSidebar.waitingForCsAgent")}</p>
            </div>
            <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>{t("pages.ticketSidebar.waitingForCsAgentDesc")}</p>
          </>
        )}
      </div>
    </>
  );
}

function AgentActionsSection({ ticket, isAssignedToMe, isTechnicianDispatched, resolved, onShowDispatchPanel }) {
  const { t } = useTranslation();
  return (
    <>
      <p style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: "8px" }}>
        {t("pages.ticketSidebar.actions")}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <button
          onClick={onShowDispatchPanel}
          disabled={!isAssignedToMe || isTechnicianDispatched || resolved}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            background: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            cursor: isAssignedToMe && !isTechnicianDispatched && !resolved ? "pointer" : "not-allowed",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!isAssignedToMe || isTechnicianDispatched || resolved) return;
            e.currentTarget.style.borderColor = O[300];
            e.currentTarget.style.background = O[50];
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#E5E7EB";
            e.currentTarget.style.background = "white";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <p style={{ fontWeight: "600", fontSize: "14px", color: "#111827" }}>
              {isTechnicianDispatched
                ? t("pages.ticketSidebar.technicianLabel", { name: ticket.technician })
                : t("pages.ticketSidebar.dispatchTechnician")}
            </p>
            <MdEngineering size={16} color="#9CA3AF" />
          </div>
          <p style={{ fontSize: "12px", color: "#6B7280" }}>
            {resolved
              ? t("pages.ticketSidebar.resolvedCannotDispatch")
              : isTechnicianDispatched
                ? t("pages.ticketSidebar.technicianAssigned")
                : t("pages.ticketSidebar.assignFieldTechnician")}
          </p>
        </button>
      </div>
    </>
  );
}

function AdminActionsSection({
  ticket,
  isTechnicianDispatched,
  resolved,
  csAgents,
  showAgentPanel,
  agentSearch,
  selectedAgent,
  assigningAgent,
  showPriorityMenu,
  showIntentMenu,
  showDispatchPanel,
  changingPriority,
  changingIntent,
  technicians,
  technicianSearch,
  selectedTechnician,
  dispatchingTech,
  onShowAgentPanel,
  onHideAgentPanel,
  onAgentSearch,
  onSelectAgent,
  onAssignToAgent,
  onChangePriority,
  onTogglePriorityMenu,
  onChangeIntent,
  onToggleIntentMenu,
  onShowDispatchPanel,
  onHideDispatchPanel,
  onTechnicianSearch,
  onSelectTechnician,
  onDispatchTechnician,
}) {
  const { t } = useTranslation();
  const currentPriority = ticket.priority || "Normal";
  const currentIntent = getIntentLabel(ticket.intent) || "Unclassified";
  const intentOptions = getActiveIntentNames();
  
  return (
    <>
      <p style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: "8px" }}>
        {t("pages.ticketSidebar.adminActions")}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* ── Assign to CS Agent ── */}
        <button
          onClick={showAgentPanel ? onHideAgentPanel : onShowAgentPanel}
          disabled={resolved}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            background: showAgentPanel ? O[50] : "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            cursor: resolved ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            if (resolved || showAgentPanel) return;
            e.currentTarget.style.borderColor = O[300];
            e.currentTarget.style.background = O[50];
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#E5E7EB";
            e.currentTarget.style.background = showAgentPanel ? O[50] : "white";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <p style={{ fontWeight: "600", fontSize: "14px", color: "#111827" }}>
              {ticket.solver || t("pages.ticketSidebar.assignToCsAgent")}
            </p>
            <MdPersonAdd size={16} color={ticket.solver ? O[500] : "#9CA3AF"} />
          </div>
          <p style={{ fontSize: "12px", color: "#6B7280" }}>
            {ticket.solver
              ? t("pages.ticketSidebar.currentlyLabel", { name: ticket.solver })
              : t("pages.ticketSidebar.assignCsAgentDesc")}
          </p>
        </button>

        {/* Agent assign panel */}
        {showAgentPanel && (
          <AgentAssignPanel
            csAgents={csAgents}
            agentSearch={agentSearch}
            selectedAgent={selectedAgent}
            assigningAgent={assigningAgent}
            onSearch={onAgentSearch}
            onSelect={onSelectAgent}
            onAssign={onAssignToAgent}
            onCancel={onHideAgentPanel}
          />
        )}

        {/* ── Dispatch / Change Technician ── */}
        <button
          onClick={onShowDispatchPanel}
          disabled={resolved}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            background: showDispatchPanel ? O[50] : "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            cursor: resolved ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            if (resolved || showDispatchPanel) return;
            e.currentTarget.style.borderColor = O[300];
            e.currentTarget.style.background = O[50];
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#E5E7EB";
            e.currentTarget.style.background = showDispatchPanel ? O[50] : "white";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <p style={{ fontWeight: "600", fontSize: "14px", color: "#111827" }}>
              {isTechnicianDispatched
                ? t("pages.ticketSidebar.technicianLabel", { name: ticket.technician })
                : t("pages.ticketSidebar.dispatchTechnician")}
            </p>
            <MdEngineering size={16} color={isTechnicianDispatched ? O[500] : "#9CA3AF"} />
          </div>
          <p style={{ fontSize: "12px", color: "#6B7280" }}>
            {isTechnicianDispatched
              ? t("pages.ticketSidebar.clickToChangeTechnician")
              : t("pages.ticketSidebar.assignFieldTechnician")}
          </p>
        </button>

        {/* Dispatch panel */}
        {showDispatchPanel && (
          <DispatchPanel
            technicians={technicians}
            technicianSearch={technicianSearch}
            selectedTechnician={selectedTechnician}
            dispatchingTech={dispatchingTech}
            currentTechnician={isTechnicianDispatched ? ticket.technician : null}
            onSearch={onTechnicianSearch}
            onSelect={onSelectTechnician}
            onDispatch={onDispatchTechnician}
            onCancel={onHideDispatchPanel}
          />
        )}

        {/* ── Change Priority ── */}
        <div style={{ position: "relative" }}>
          <button
            onClick={resolved || changingPriority ? null : onTogglePriorityMenu}
            disabled={resolved || changingPriority}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              background: changingPriority ? O[50] : "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              cursor: resolved || changingPriority ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (resolved || changingPriority) return;
              e.currentTarget.style.borderColor = O[300];
              e.currentTarget.style.background = O[50];
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.background = changingPriority ? O[50] : "white";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <p style={{ fontWeight: "600", fontSize: "14px", color: "#111827" }}>
                {changingPriority ? t("pages.ticketSidebar.changing") : currentPriority}
              </p>
              {changingPriority ? (
                <MdSync size={16} color={O[500]} style={{ animation: "mtd-spin 0.9s linear infinite" }} />
              ) : (
                <MdSwapVert size={16} color="#9CA3AF" />
              )}
            </div>
            <p style={{ fontSize: "12px", color: "#6B7280" }}>
              {t("pages.ticketSidebar.ticketPriority")}
            </p>
          </button>

          {/* Priority dropdown */}
          {showPriorityMenu && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                zIndex: 1000,
                background: "white",
                border: `1px solid ${O[200]}`,
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
                overflow: "hidden",
              }}
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChangePriority(opt)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 14px",
                    border: "none",
                    background: opt === currentPriority ? "#FFF5EF" : "transparent",
                    color: getPriorityColor(opt),
                    fontWeight: opt === currentPriority ? "700" : "500",
                    fontSize: "13px",
                    cursor: "pointer",
                    borderBottom: "1px solid #F5F5F5",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#FFF5EF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      opt === currentPriority ? "#FFF5EF" : "transparent";
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Change Issue Detected (Intent) ── */}
        <div style={{ position: "relative" }}>
          <button
            onClick={resolved || changingIntent ? null : onToggleIntentMenu}
            disabled={resolved || changingIntent}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              background: changingIntent ? O[50] : "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              cursor: resolved || changingIntent ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (resolved || changingIntent) return;
              e.currentTarget.style.borderColor = O[300];
              e.currentTarget.style.background = O[50];
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.background = changingIntent ? O[50] : "white";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <p style={{ fontWeight: "600", fontSize: "14px", color: getIntentColor(ticket.intent) }}>
                {changingIntent ? t("pages.ticketSidebar.changing") : currentIntent}
              </p>
              {changingIntent ? (
                <MdSync size={16} color={O[500]} style={{ animation: "mtd-spin 0.9s linear infinite" }} />
              ) : (
                <MdSwapVert size={16} color="#9CA3AF" />
              )}
            </div>
            <p style={{ fontSize: "12px", color: "#6B7280" }}>
              {t("pages.ticketSidebar.issueDetected")}
            </p>
          </button>

          {/* Intent dropdown */}
          {showIntentMenu && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                zIndex: 1000,
                background: "white",
                border: `1px solid ${O[200]}`,
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
                overflow: "hidden",
              }}
            >
              {intentOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChangeIntent(opt)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 14px",
                    border: "none",
                    background: opt === currentIntent ? "#FFF5EF" : "transparent",
                    color: getIntentColor(opt),
                    fontWeight: opt === currentIntent ? "700" : "500",
                    fontSize: "13px",
                    cursor: "pointer",
                    borderBottom: "1px solid #F5F5F5",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#FFF5EF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      opt === currentIntent ? "#FFF5EF" : "transparent";
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function AgentAssignPanel({ csAgents, agentSearch, selectedAgent, assigningAgent, onSearch, onSelect, onAssign, onCancel }) {
  const { t } = useTranslation();
  const filtered = csAgents.filter(
    (agent) =>
      !agentSearch ||
      agent.name?.toLowerCase().includes(agentSearch.toLowerCase()) ||
      agent.email?.toLowerCase().includes(agentSearch.toLowerCase()),
  );

  return (
    <div
      style={{
        background: "white",
        padding: "12px",
        borderRadius: "12px",
        border: `1px solid ${O[200]}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      <p style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: "8px" }}>
        {t("pages.ticketSidebar.selectCsAgent")}
      </p>
      <input
        type="text"
        placeholder={t("pages.ticketSidebar.searchNameEmail")}
        value={agentSearch}
        onChange={(e) => onSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: "8px",
          border: `1px solid ${O[200]}`,
          fontSize: "13px",
          outline: "none",
          boxSizing: "border-box",
          marginBottom: "6px",
        }}
      />
      <div
        style={{
          border: `1px solid ${O[200]}`,
          borderRadius: "8px",
          background: "white",
          maxHeight: "120px",
          overflowY: "auto",
        }}
      >
        {filtered.map((agent) => (
          <div
            key={agent.id}
            onClick={() => onSelect(agent)}
            style={{
              padding: "8px 10px",
              cursor: "pointer",
              fontSize: "13px",
              color: "#333",
              borderBottom: "1px solid #F5F5F5",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = O[50])}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            <span style={{ fontWeight: "600" }}>{agent.name}</span>
            <span style={{ color: "#999", marginLeft: "6px", fontSize: "11px" }}>{agent.email}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: "8px 10px", color: "#9CA3AF", fontSize: "12px" }}>{t("pages.ticketSidebar.noCsAgentsFound")}</div>
        )}
      </div>
      {selectedAgent && (
        <div
          style={{
            background: O[50],
            border: `1px solid ${O[200]}`,
            borderRadius: "8px",
            padding: "8px 10px",
            marginTop: "6px",
            fontSize: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "8px", marginBottom: "2px" }}>
            <span style={{ color: O[500], fontWeight: "600" }}>{t("pages.ticketSidebar.selectedLabel")}</span>
            <span style={{ color: "#333", fontWeight: "600" }}>{selectedAgent.name}</span>
          </div>
          {selectedAgent.email && (
            <span style={{ color: "#6B7280" }}>{selectedAgent.email}</span>
          )}
        </div>
      )}
      <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            background: "white",
            color: "#6B7280",
            fontWeight: "500",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          {t("pages.ticketSidebar.cancel")}
        </button>
        <button
          onClick={onAssign}
          disabled={!selectedAgent || assigningAgent}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            background: !selectedAgent || assigningAgent ? "#D1D5DB" : O[500],
            color: "white",
            fontWeight: "600",
            fontSize: "13px",
            cursor: !selectedAgent || assigningAgent ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          {assigningAgent && (
            <MdSync size={13} style={{ animation: "mtd-spin 0.9s linear infinite" }} />
          )}
          {assigningAgent ? t("pages.ticketSidebar.assigning") : t("pages.ticketSidebar.assign")}
        </button>
      </div>
    </div>
  );
}

function DispatchPanel({ technicians, technicianSearch, selectedTechnician, dispatchingTech, currentTechnician, onSearch, onSelect, onDispatch, onCancel }) {
  const isReplacing = Boolean(currentTechnician);
  const { t } = useTranslation();

  const filteredTechnicians = technicians.filter((tech) => {
    if (!technicianSearch) return true;
    const q = technicianSearch.toLowerCase();
    const nameMatch = tech.name?.toLowerCase().includes(q);
    const emailMatch = tech.email?.toLowerCase().includes(q);
    const skillMatch = getTechSkills(tech).some((s) => s.skill.toLowerCase().includes(q));
    return nameMatch || emailMatch || skillMatch;
  });

  return (
    <div
      style={{
        background: "white",
        padding: "12px",
        borderRadius: "12px",
        border: `1px solid ${O[200]}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      <p style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: "8px" }}>
        {isReplacing ? t("pages.ticketSidebar.changeTechnician") : t("pages.ticketSidebar.selectTechnician")}
      </p>
      {isReplacing && (
        <div style={{ background: O[50], padding: "8px 10px", borderRadius: "8px", marginBottom: "8px", fontSize: "12px", color: "#6B7280" }}>
          {t("pages.ticketSidebar.currentLabel")} <strong style={{ color: O[700] }}>{currentTechnician}</strong>
        </div>
      )}
      <input
        type="text"
        placeholder={t("pages.ticketSidebar.searchNameEmail")}
        value={technicianSearch}
        onChange={(e) => onSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: "8px",
          border: `1px solid ${O[200]}`,
          fontSize: "13px",
          outline: "none",
          boxSizing: "border-box",
          marginBottom: "6px",
        }}
      />
      {!selectedTechnician && (
        <div
          style={{
            border: `1px solid ${O[200]}`,
            borderRadius: "8px",
            background: "white",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {filteredTechnicians.map((tech) => (
            <div
              key={tech.id}
              onClick={() => onSelect(tech)}
              style={{
                padding: "8px 10px",
                cursor: "pointer",
                fontSize: "13px",
                color: "#333",
                borderBottom: "1px solid #F5F5F5",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = O[50])}
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              <div>
                <span style={{ fontWeight: "600" }}>{tech.name}</span>
                <span style={{ color: "#999", marginLeft: "6px", fontSize: "11px" }}>{tech.email}</span>
              </div>
              <SkillBadgeList skills={getTechSkills(tech)} />
            </div>
          ))}
          {filteredTechnicians.length === 0 && (
            <div style={{ padding: "8px 10px", color: "#9CA3AF", fontSize: "12px" }}>{t("pages.ticketSidebar.noTechniciansFound")}</div>
          )}
        </div>
      )}
      {selectedTechnician && (
        <div
          style={{
            background: O[50],
            border: `1px solid ${O[200]}`,
            borderRadius: "8px",
            padding: "8px 10px",
            marginTop: "6px",
            fontSize: "12px",
          }}
        >
          <div style={{ display: "flex", gap: "8px", marginBottom: "2px" }}>
            <span style={{ color: O[500], fontWeight: "600" }}>{t("pages.ticketSidebar.selectedLabel")}</span>
            <span style={{ color: "#333", fontWeight: "600" }}>{selectedTechnician.name}</span>
          </div>
          {selectedTechnician.email && (
            <span style={{ color: "#6B7280" }}>{selectedTechnician.email}</span>
          )}
          <SkillBadgeList skills={getTechSkills(selectedTechnician)} />
        </div>
      )}
      <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            background: "white",
            color: "#6B7280",
            fontWeight: "500",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          {t("pages.ticketSidebar.cancel")}
        </button>
        <button
          onClick={onDispatch}
          disabled={!selectedTechnician || dispatchingTech}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            background: !selectedTechnician || dispatchingTech ? "#D1D5DB" : O[500],
            color: "white",
            fontWeight: "600",
            fontSize: "13px",
            cursor: !selectedTechnician || dispatchingTech ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          {dispatchingTech && (
            <MdSync size={13} style={{ animation: "mtd-spin 0.9s linear infinite" }} />
          )}
          {dispatchingTech ? t("pages.ticketSidebar.dispatching") : isReplacing ? t("pages.ticketSidebar.change") : t("pages.ticketSidebar.dispatch")}
        </button>
      </div>
    </div>
  );
}

const MAX_VISIBLE_SKILLS = 3;

function SkillBadgeList({ skills }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!skills.length) return null;

  const visible = skills.slice(0, MAX_VISIBLE_SKILLS);
  const overflow = skills.slice(MAX_VISIBLE_SKILLS);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
      {visible.map((s) => (
        <span
          key={s.id}
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: O[600],
            background: O[50],
            border: `1px solid ${O[200]}`,
            borderRadius: "999px",
            padding: "1px 7px",
            whiteSpace: "nowrap",
          }}
        >
          {s.skill}
        </span>
      ))}
      {overflow.length > 0 && (
        <span
          style={{ position: "relative", display: "inline-block" }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#6B7280",
              background: "#F3F4F6",
              border: "1px solid #E5E7EB",
              borderRadius: "999px",
              padding: "1px 7px",
              cursor: "default",
              whiteSpace: "nowrap",
            }}
          >
            +{overflow.length}
          </span>
          {showTooltip && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 6px)",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#111827",
                color: "white",
                fontSize: "11px",
                fontWeight: 500,
                padding: "6px 10px",
                borderRadius: "8px",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                zIndex: 2000,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              {overflow.map((s) => (
                <span key={s.id}>{s.skill}</span>
              ))}
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderTop: "5px solid #111827",
                }}
              />
            </div>
          )}
        </span>
      )}
    </div>
  );
}

function StellaHelpPanel({ stellaSummary, summarizing, loadingDots, typewriterIndex, typewriterDone, onClick }) {
  const { t } = useTranslation();
  return (
    <div
      onClick={!stellaSummary && !summarizing ? onClick : undefined}
      style={{
        padding: "18px 20px 16px",
        background: `linear-gradient(135deg, ${O[50]} 0%, #FFF7F2 100%)`,
        borderBottom: `2px solid ${O[200]}`,
        borderLeft: stellaSummary ? `3px solid ${O[500]}` : "none",
        order: 0,
        cursor: !stellaSummary && !summarizing ? "pointer" : "default",
        transition: "all 0.2s ease",
        boxShadow: stellaSummary
          ? `0 2px 8px rgba(255,128,64,0.08)`
          : summarizing
            ? "none"
            : `0 2px 8px rgba(255,128,64,0.08)`,
      }}
      onMouseEnter={(e) => {
        if (!stellaSummary && !summarizing) {
          e.currentTarget.style.background = `linear-gradient(135deg, ${O[100]} 0%, #FFEDE0 100%)`;
          e.currentTarget.style.boxShadow = `0 4px 12px rgba(255,128,64,0.15)`;
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!stellaSummary && !summarizing) {
          e.currentTarget.style.background = `linear-gradient(135deg, ${O[50]} 0%, #FFF7F2 100%)`;
          e.currentTarget.style.boxShadow = `0 2px 8px rgba(255,128,64,0.08)`;
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: stellaSummary || summarizing ? "10px" : "4px" }}>
        <div style={{
          padding: "6px",
          background: `linear-gradient(135deg, ${O[500]}, ${O[700]})`,
          color: "white",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 2px 6px rgba(255,128,64,0.3)`,
          transition: "all 0.2s",
        }}>
          <MdAutoAwesome size={14} />
        </div>
        <span style={{ fontWeight: "700", fontSize: "14px", color: "#111827", letterSpacing: "-0.01em", flex: 1 }}>
          {t("pages.ticketSidebar.stellaHelp")}
        </span>
        {!stellaSummary && !summarizing && (
          <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: O[500], background: O[100], padding: "3px 8px", borderRadius: "4px" }}>
            {t("pages.ticketSidebar.tap")}
          </span>
        )}
        {summarizing && (
          <span style={{ fontSize: "11px", color: O[500], fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
            {t("pages.ticketSidebar.generating", { dots: loadingDots })}
          </span>
        )}
      </div>
      <div style={{ fontSize: "13px", color: stellaSummary ? "#374151" : "#6B7280", lineHeight: 1.6 }}>
        {stellaSummary
          ? <>{stellaSummary.slice(0, typewriterIndex)}{!typewriterDone && <span style={{ /* ... */ }}>|</span>}</>
          : summarizing
            ? t("pages.ticketSidebar.readingConversation", { dots: loadingDots })
            : t("pages.ticketSidebar.tapToSummary")}
      </div>
      {!stellaSummary && !summarizing && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: O[300] }} />
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: O[300] }} />
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: O[300] }} />
          <span style={{ fontSize: "11px", color: "#9CA3AF", marginLeft: "4px" }}>{t("pages.ticketSidebar.understandAtGlance")}</span>
        </div>
      )}
    </div>
  );
}

function CustomerInfoSection({ role, ticket, customerTier, getTierStyle, downloadingId, attachments, onViewAttachment }) {
  const { t } = useTranslation();
  return (
    <div style={{ padding: role === "customer" ? "25px 20px 20px" : "20px", flex: role === "customer" ? "none" : 1, order: role === "customer" ? 1 : 2 }}>
      <h3 style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: "16px" }}>
        {role === "customer" ? t("pages.ticketSidebar.ticketInfo") : t("pages.ticketSidebar.customerInfo")}
      </h3>

      {role === "customer" && ticket.status !== "Solved" && ticket.slaDeadline && (
        <div style={{ background: "#F9FAFB", padding: "12px", borderRadius: "12px", border: "1px solid #F3F4F6", marginBottom: "16px" }}>
          <p style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "6px" }}>
            {t("pages.ticketSidebar.expectedResolution")}
          </p>
          <CustomerSlaNotice slaDeadline={ticket.slaDeadline} />
        </div>
      )}

      {role !== "customer" && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #F3F4F6, #E5E7EB)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: "700",
              color: "#6B7280",
              border: "1px solid #D1D5DB",
            }}
          >
            {(ticket.customer || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p style={{ fontWeight: "600", color: "#111827", fontSize: "14px" }}>
              {ticket.customer || "-"}
            </p>
            {customerTier?.tierName ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  background: getTierStyle(customerTier.tierName, customerTier.tierColor).bg,
                  border: `1.5px solid ${getTierStyle(customerTier.tierName, customerTier.tierColor).border}`,
                  color: getTierStyle(customerTier.tierName, customerTier.tierColor).color,
                  fontSize: "12px",
                  letterSpacing: "0.02em",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: getTierStyle(customerTier.tierName, customerTier.tierColor).dot,
                    flexShrink: 0,
                  }}
                />
                {getTierStyle(customerTier.tierName, customerTier.tierColor).label}
              </span>
            ) : (
              <p style={{ fontSize: "12px", color: O[500], fontWeight: "500" }}>{t("pages.ticketSidebar.noTier")}</p>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ background: "#F9FAFB", padding: "12px", borderRadius: "12px", border: "1px solid #F3F4F6" }}>
          <p style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "4px" }}>{t("pages.ticketSidebar.subject")}</p>
          <p style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>{ticket.subject || "-"}</p>
        </div>
        <div style={{ background: "#F9FAFB", padding: "12px", borderRadius: "12px", border: "1px solid #F3F4F6" }}>
          <p style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "4px" }}>{t("pages.ticketSidebar.description")}</p>
          <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{ticket.description || "-"}</p>
        </div>

        <div style={{ background: "#F9FAFB", padding: "12px", borderRadius: "12px", border: "1px solid #F3F4F6" }}>
          <p style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#9CA3AF", marginBottom: "6px" }}>{t("pages.ticketSidebar.attachments")}</p>
          {attachments.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>{t("pages.ticketSidebar.noFiles")}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {attachments.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => onViewAttachment(file.id)}
                  disabled={downloadingId === file.id}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: `1px solid ${O[200]}`,
                    borderRadius: "8px",
                    background: "white",
                    padding: "8px 10px",
                    cursor: downloadingId === file.id ? "not-allowed" : "pointer",
                    opacity: downloadingId === file.id ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <MdAttachFile size={14} color={O[500]} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: "#374151", fontWeight: "600", fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {file.fileName ?? file.name ?? "Attachment"}
                    </div>
                    <div style={{ color: "#9CA3AF", fontSize: "11px", marginTop: "1px" }}>
                      {downloadingId === file.id ? t("pages.ticketSidebar.loadingAttachment") : t("pages.ticketSidebar.clickToView")}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomerSlaNotice({ slaDeadline }) {
  const [isPast, setIsPast] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const check = () => setIsPast(new Date(slaDeadline).getTime() < Date.now());
    const timeoutId = setTimeout(check, 0);
    const intervalId = setInterval(check, 60000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [slaDeadline]);

  return (
    <div>
      <p style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>
        {formatTicketDateTime(slaDeadline)}
      </p>
      {isPast && (
        <p style={{ fontSize: "12px", color: "#D97706", marginTop: "4px" }}>
          {t("pages.ticketSidebar.slaDelayed")}
        </p>
      )}
    </div>
  );
}

function formatCountdown(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function SlaCountdown({ slaDeadline, formatTicketDateTime }) {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!slaDeadline) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [slaDeadline]);

  if (!slaDeadline) {
    return <span style={{ fontSize: "12px", fontWeight: "500", color: "#9CA3AF" }}>{t("pages.ticketSidebar.noSla")}</span>;
  }

  const remainingMs = new Date(slaDeadline).getTime() - now;

  if (remainingMs <= 0) {
    return <span style={{ fontSize: "12px", fontWeight: "600", color: "#DC2626" }}>{t("pages.ticketSidebar.slaBreached")}</span>;
  }

  const remainingMinutes = remainingMs / 60000;
  const color = remainingMinutes <= 30 ? "#DC2626" : remainingMinutes <= 120 ? "#D97706" : "#16A34A"; // green, orange, red

  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: "15px", fontWeight: "600", color, fontVariantNumeric: "tabular-nums" }}>
        {formatCountdown(remainingMs)}
      </div>
      <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
        {t("pages.ticketSidebar.due", { date: formatTicketDateTime(slaDeadline) })}
      </div>
    </div>
  );
}