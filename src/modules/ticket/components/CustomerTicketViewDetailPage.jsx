import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MdArrowBack,
  MdAttachFile,
  MdSupportAgent,
  MdPerson,
} from "react-icons/md";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import {
  getTicketById,
  getAttachmentDownloadUrl,
  getTicketComments,
  createTicketComment,
} from "../ticket.service";
import { getStatusColor, formatTicketDate } from "../ticket.schema";

export default function CustomerTicketViewDetailPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const [downloadingId, setDownloadingId] = useState(null);
  const [responseText, setResponseText] = useState("");

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

  const {
    data: comments = [],
    isLoading: commentsLoading,
    isError: commentsError,
  } = useQuery({
    queryKey: ["ticket-comments", ticketId],
    queryFn: () => getTicketComments(ticketId),
    enabled: Boolean(ticketId),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: submitComment, isPending: isSubmittingComment } =
    useMutation({
      mutationFn: (message) => createTicketComment(ticketId, message),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["ticket-comments", ticketId],
        });
      },
    });

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

  const handleSubmitResponse = async (event) => {
    event.preventDefault();
    const message = responseText.trim();
    if (!message) return;

    try {
      await submitComment(message);
      setResponseText("");
    } catch (error) {
      console.error("Failed to submit comment:", error);
      alert("Failed to submit response. Please try again.");
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
                    gap: "24px",
                    alignItems: "start",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 6px",
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

                    <div
                      style={{
                        marginTop: "26px",
                        paddingTop: "20px",
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          marginBottom: "14px",
                          color: "#333",
                        }}
                      >
                        Add Response
                      </h3>
                      <form onSubmit={handleSubmitResponse}>
                        <textarea
                          rows={4}
                          placeholder="Write your response..."
                          value={responseText}
                          onChange={(event) =>
                            setResponseText(event.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            resize: "none",
                            fontSize: "14px",
                            outline: "none",
                            marginBottom: "12px",
                            boxSizing: "border-box",
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            type="submit"
                            disabled={
                              isSubmittingComment || !responseText.trim()
                            }
                            style={{
                              padding: "10px 30px",
                              borderRadius: "8px",
                              border: "none",
                              background: "#FF8040",
                              color: "white",
                              fontWeight: "600",
                              cursor:
                                isSubmittingComment || !responseText.trim()
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                isSubmittingComment || !responseText.trim()
                                  ? 0.7
                                  : 1,
                              fontSize: "14px",
                            }}
                          >
                            {isSubmittingComment ? "Submitting..." : "Submit"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#fffdfb",
                      borderRadius: "14px",
                      padding: "22px",
                      border: "1px solid #fce6d8",
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

                    <div
                      style={{
                        height: "1px",
                        background: "#fce6d8",
                        margin: "18px 0",
                      }}
                    />

                    <div
                      style={{
                        minHeight: "280px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: "700",
                          marginBottom: "16px",
                          color: "#333",
                        }}
                      >
                        Timeline
                      </h3>

                      {commentsLoading ? (
                        <div style={{ textAlign: "center", padding: "16px 0" }}>
                          <LoadingSpinner />
                        </div>
                      ) : commentsError ? (
                        <div style={{ color: "#9ca3af", fontSize: "14px" }}>
                          Failed to load timeline.
                        </div>
                      ) : comments.length === 0 ? (
                        <div style={{ color: "#9ca3af", fontSize: "14px" }}>
                          No timeline events yet.
                        </div>
                      ) : (
                        <div
                          style={{ position: "relative", paddingLeft: "30px" }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              left: "11px",
                              top: "10px",
                              bottom: "10px",
                              width: "2px",
                              background: "#FF8040",
                            }}
                          />

                          {comments.map((comment, index) => {
                            const commentDate = new Date(comment.createdAt);
                            const dateStr = Number.isNaN(commentDate.getTime())
                              ? "-"
                              : commentDate.toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                });
                            const timeStr = Number.isNaN(commentDate.getTime())
                              ? "-"
                              : commentDate.toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });
                            const isAgentReply =
                              ticket?.handler &&
                              comment.senderName &&
                              comment.senderName === ticket.handler;

                            return (
                              <div
                                key={comment.id ?? index}
                                style={{
                                  position: "relative",
                                  marginBottom: "18px",
                                }}
                              >
                                <div
                                  style={{
                                    position: "absolute",
                                    left: "-30px",
                                    top: "2px",
                                    width: "22px",
                                    height: "22px",
                                    borderRadius: "50%",
                                    background: "white",
                                    border: "2px solid #FF8040",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {isAgentReply ? (
                                    <MdSupportAgent size={12} color="#FF8040" />
                                  ) : (
                                    <MdPerson size={12} color="#FF8040" />
                                  )}
                                </div>

                                <div
                                  style={{
                                    border: "1px solid #fde4d4",
                                    borderRadius: "10px",
                                    padding: "10px 12px",
                                    background: "#fffdfb",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      gap: "8px",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontWeight: "600",
                                        fontSize: "13px",
                                        color: "#333",
                                      }}
                                    >
                                      {comment.senderName || "Unknown sender"}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "11px",
                                        color: "#9ca3af",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {dateStr} • {timeStr}
                                    </div>
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "13px",
                                      color: "#555",
                                      lineHeight: "1.5",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {comment.message || "-"}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
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
