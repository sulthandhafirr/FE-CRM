import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MdArrowBack, MdAttachFile, MdDescription } from "react-icons/md";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { getTicketById, getAttachmentDownloadUrl } from "../ticket.service";
import { getStatusColor, formatTicketDate } from "../ticket.schema";

export default function CustomerTicketViewDetailPage() {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [downloadingId, setDownloadingId] = useState(null);

  const {
    data: ticket,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["ticket-detail", ticketId],
    queryFn: () => getTicketById(ticketId),
    enabled: Boolean(ticketId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const attachments = useMemo(() => ticket?.attachments || [], [ticket]);

  const handleDownloadAttachment = async (attachmentId) => {
    try {
      setDownloadingId(attachmentId);
      const result = await getAttachmentDownloadUrl(ticketId, attachmentId);
      const signedUrl = result.signedUrl;

      if (!signedUrl) {
        throw new Error("No signed URL received from server");
      }

      // Open file in a new browser tab
      window.open(signedUrl, "_blank");
    } catch (error) {
      console.error("Failed to download attachment:", error);
      alert("Failed to download attachment. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          background: "white",
          padding: "15px 30px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          height: "70px",
        }}
      />

      <div style={{ padding: "30px" }}>
        <div style={{ maxWidth: "1020px", margin: "0 auto" }}>
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "linear-gradient(180deg, #FFF7F2 0%, #FFFFFF 100%)",
                padding: "16px 22px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <button
                onClick={() => navigate(-1)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#FF8040",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                <MdArrowBack size={20} /> Back
              </button>
              <div
                style={{
                  color: "#FF8040",
                  fontWeight: "700",
                  fontSize: "14px",
                }}
              >
                Ticket #{ticketId}
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              {isLoading ? (
                <div style={{ textAlign: "center", padding: "24px" }}>
                  <LoadingSpinner />
                </div>
              ) : isError || !ticket ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#6b7280",
                    padding: "24px",
                  }}
                >
                  Ticket detail not found.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "20px",
                    alignItems: "start",
                  }}
                >
                  <div
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "26px",
                      border: "1px solid #f1f5f9",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        marginBottom: "10px",
                        color: "#333",
                      }}
                    >
                      {ticket.subject}
                    </h2>
                    <div
                      style={{
                        color: "#FF8040",
                        fontWeight: "600",
                        fontSize: "14px",
                        marginBottom: "6px",
                      }}
                    >
                      Description
                    </div>
                    <p
                      style={{
                        color: "#555",
                        lineHeight: "1.65",
                        marginBottom: "24px",
                      }}
                    >
                      {ticket.description || "No description provided."}
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "18px",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "#FF8040",
                            fontWeight: "600",
                            fontSize: "13px",
                            marginBottom: "4px",
                          }}
                        >
                          Status
                        </div>
                        <div
                          style={{
                            color: getStatusColor(ticket.status),
                            fontWeight: "600",
                          }}
                        >
                          {ticket.status || "-"}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            color: "#FF8040",
                            fontWeight: "600",
                            fontSize: "13px",
                            marginBottom: "4px",
                          }}
                        >
                          Handler
                        </div>
                        <div style={{ color: "#333" }}>
                          {ticket.handler || "-"}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            color: "#FF8040",
                            fontWeight: "600",
                            fontSize: "13px",
                            marginBottom: "4px",
                          }}
                        >
                          Created At
                        </div>
                        <div style={{ color: "#333" }}>
                          {formatTicketDate(ticket.createdAt)}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            color: "#FF8040",
                            fontWeight: "600",
                            fontSize: "13px",
                            marginBottom: "4px",
                          }}
                        >
                          Resolved At
                        </div>
                        <div style={{ color: "#333" }}>
                          {formatTicketDate(ticket.resolvedAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "22px",
                      border: "1px solid #f1f5f9",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        marginBottom: "14px",
                        color: "#333",
                      }}
                    >
                      Attachments
                    </h3>

                    {attachments.length === 0 ? (
                      <div style={{ color: "#9ca3af", fontSize: "14px" }}>
                        No attachments.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {attachments.map((file) => (
                          <button
                            key={file.id}
                            type="button"
                            onClick={() => handleDownloadAttachment(file.id)}
                            disabled={downloadingId === file.id}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              border: "1px solid #fde4d4",
                              borderRadius: "10px",
                              background: "#fffaf7",
                              padding: "10px 12px",
                              cursor:
                                downloadingId === file.id
                                  ? "not-allowed"
                                  : "pointer",
                              opacity: downloadingId === file.id ? 0.6 : 1,
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              transition: "all 0.2s",
                            }}
                          >
                            <MdAttachFile size={16} color="#FF8040" />
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  color: "#374151",
                                  fontWeight: "600",
                                  fontSize: "13px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {file.fileName}
                              </div>
                              <div
                                style={{
                                  color: "#9ca3af",
                                  fontSize: "12px",
                                  marginTop: "2px",
                                }}
                              >
                                {downloadingId === file.id
                                  ? "Loading..."
                                  : "Click to view"}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
