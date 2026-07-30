import { MdAttachFile, MdSend, MdAutoAwesome } from "react-icons/md";
import { O } from "./ticketTheme";

export default function TicketReplyComposer({
  replyRef,
  replyText,
  setReplyText,
  selectedFile,
  setSelectedFile,
  canReply,
  submitting,
  isGenerating,
  role,
  onSubmitResponse,
  onGenerateDraft,
}) {
  return (
    <div
      style={{
        padding: "24px",
        background: "white",
        borderTop: "1px solid #E5E7EB",
        flexShrink: 0,
      }}
    >
      <div style={{ maxWidth: "896px", margin: "0 auto" }}>
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #D1D5DB",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            transition: "all 0.15s",
            overflow: "hidden",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = O[500];
            e.currentTarget.style.boxShadow = `0 0 0 3px ${O[100]}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#D1D5DB";
            e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
          }}
        >
          <form onSubmit={onSubmitResponse}>
            <textarea
              ref={replyRef}
              rows={1}
              placeholder="Type your reply or use AI assist (/ai)..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canReply && !submitting && (replyText.trim() || selectedFile)) {
                    onSubmitResponse(e);
                  }
                }
              }}
              disabled={!canReply || isGenerating}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                resize: "none",
                padding: "12px 16px",
                fontSize: "14px",
                lineHeight: 1.5,
                color: "#111827",
                background: canReply ? "white" : "#F9FAFB",
                cursor: canReply ? "text" : "not-allowed",
                fontFamily: "inherit",
                boxSizing: "border-box",
                minHeight: "44px",
                maxHeight: "192px",
                overflowY: "auto",
                opacity: isGenerating ? 0.5 : 1,
                transition: "opacity 0.15s",
              }}
            />
            {selectedFile && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: "#374151",
                  background: O[50],
                  border: `1px solid ${O[200]}`,
                  borderRadius: "6px",
                  padding: "6px 10px",
                  margin: "0 16px 8px",
                }}
              >
                <MdAttachFile size={14} color={O[500]} />
                <span
                  style={{
                    maxWidth: "140px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9CA3AF",
                    fontSize: "16px",
                    lineHeight: 1,
                    padding: "0 2px",
                  }}
                >
                  &times;
                </button>
              </div>
            )}
            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid #F3F4F6",
                background: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                Press{" "}
                <span
                  style={{
                    fontFamily: "monospace",
                    background: "#F3F4F6",
                    padding: "1px 4px",
                    borderRadius: "4px",
                    fontSize: "11px",
                  }}
                >
                  Enter
                </span>{" "}
                to send
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <label
                  style={{
                    padding: "8px",
                    background: "#F3F4F6",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: canReply ? "pointer" : "not-allowed",
                    transition: "background 0.15s",
                    color: "#6B7280",
                    fontSize: "16px",
                  }}
                  onMouseEnter={(e) => {
                    if (canReply) e.currentTarget.style.background = "#E5E7EB";
                  }}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#F3F4F6")}
                >
                  <MdAttachFile size={18} />
                  <input
                    type="file"
                    style={{ display: "none" }}
                    disabled={!canReply}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </label>
                {role !== "customer" && (
                  <button
                    type="button"
                    onClick={onGenerateDraft}
                    disabled={isGenerating}
                    style={{
                      padding: "8px 12px",
                      background: isGenerating ? "#F3F4F6" : O[50],
                      color: isGenerating ? "#9CA3AF" : O[600],
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "500",
                      border: isGenerating ? "none" : `1px solid ${O[200]}`,
                      cursor: isGenerating ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      transition: "all 0.15s",
                    }}
                  >
                    <MdAutoAwesome size={15} />
                    {isGenerating ? "Generating..." : "Stella Assist"}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={
                    !canReply ||
                    submitting ||
                    (!replyText.trim() && !selectedFile)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    border: "none",
                    background:
                      !canReply || submitting || (!replyText.trim() && !selectedFile)
                        ? "#D1D5DB"
                        : O[500],
                    color: "white",
                    cursor:
                      !canReply || submitting || (!replyText.trim() && !selectedFile)
                        ? "not-allowed"
                        : "pointer",
                    boxShadow:
                      !canReply || submitting || (!replyText.trim() && !selectedFile)
                        ? "none"
                        : "0 1px 3px rgba(255,128,64,0.3)",
                    transition: "all 0.15s",
                  }}
                >
                  <MdSend size={16} />
                  {submitting ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
