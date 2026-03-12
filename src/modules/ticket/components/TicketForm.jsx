import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Divider,
  Modal,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  createTicket,
  getUploadUrls,
  uploadAttachmentToStorage,
  saveAttachments,
} from "../ticket.service";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

export default function TicketForm({ open, onClose }) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    attachments: [],
  });

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create ticket and get the ticket id
      const ticketData = await createTicket({
        subject: formData.subject,
        description: formData.description,
      });
      const ticketId = ticketData.ticketId;

      // If there are attachments, get signed upload URLs and upload each file
      if (formData.attachments.length > 0) {
        const uploadUrls = await getUploadUrls({
          ticketId,
          files: formData.attachments.map((file) => ({
            fileName: file.name,
            contentType: file.type,
          })),
        });

        const uploadedAttachments = [];

        for (let i = 0; i < formData.attachments.length; i++) {
          const file = formData.attachments[i];
          const urlInfo = uploadUrls[i];

          await uploadAttachmentToStorage(
            urlInfo.filePath,
            urlInfo.token,
            file,
            file.type,
          );

          uploadedAttachments.push({
            filePath: urlInfo.filePath,
            fileName: file.name,
            fileSize: file.size,
          });
        }

        await saveAttachments(ticketId, uploadedAttachments);
      }

      await queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      alert("Ticket created successfully!");
      setFormData({ subject: "", description: "", attachments: [] });
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (sizeInBytes) => {
    const sizeInKb = sizeInBytes / 1024;
    if (sizeInKb < 1024) return `${sizeInKb.toFixed(1)} KB`;
    return `${(sizeInKb / 1024).toFixed(1)} MB`;
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(16, 24, 40, 0.35)",
            backdropFilter: "blur(2px)",
          },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "94%", sm: "86%", md: 760 },
          maxHeight: "calc(100vh - 48px)",
          outline: "none",
        }}
      >
        <Paper
          sx={{
            borderRadius: "16px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            maxHeight: "calc(100vh - 48px)",
            overflow: "hidden",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <Box
            sx={{
              px: { xs: 2.5, sm: 3.5 },
              py: 2,
              background: "linear-gradient(180deg, #FFF9F5 0%, #FFFFFF 100%)",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 800 }}
                >
                  Create New Ticket
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#667085", mt: 0.5 }}>
                  Fill the details below and submit your request.
                </Typography>
              </Box>
              <Button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                sx={{
                  minWidth: "auto",
                  px: 1.5,
                  color: "#667085",
                  fontSize: 18,
                  lineHeight: 1,
                }}
              >
                x
              </Button>
            </Stack>
          </Box>

          <Divider />

          <Box sx={{ px: { xs: 2.5, sm: 3.5 }, py: 3, overflowY: "auto" }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  required
                  label="Subject"
                  placeholder="Enter subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  fullWidth
                />

                <TextField
                  required
                  multiline
                  rows={5}
                  label="Describe your problem"
                  placeholder="Describe detail here..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  fullWidth
                />

                <Box>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#344054",
                      mb: 1,
                    }}
                  >
                    Attachments (optional)
                  </Typography>

                  <Box
                    component="label"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px dashed #E4E7EC",
                      borderRadius: "12px",
                      background: "#FCFCFD",
                      py: 4,
                      px: 2,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: "#FF8040",
                        background: "#FFF7F2",
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: 22, lineHeight: 1, mb: 1 }}>
                      +
                    </Typography>
                    <Typography
                      sx={{ fontSize: 15, fontWeight: 600, color: "#475467" }}
                    >
                      Click to upload files
                    </Typography>
                    <Typography
                      sx={{ fontSize: 12, color: "#98A2B3", mt: 0.5 }}
                    >
                      JPG, PNG, PDF, Excel, CSV (max 10MB each)
                    </Typography>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg, image/png, application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          attachments: [
                            ...formData.attachments,
                            ...Array.from(e.target.files || []),
                          ],
                        })
                      }
                      style={{ display: "none" }}
                    />
                  </Box>

                  {formData.attachments.length > 0 && (
                    <Stack spacing={1} sx={{ mt: 1.5 }}>
                      {formData.attachments.map((file, idx) => (
                        <Box
                          key={`${file.name}-${idx}`}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            border: "1px solid #EAECF0",
                            borderRadius: "10px",
                            px: 1.5,
                            py: 1,
                            background: "#FFFFFF",
                          }}
                        >
                          <Typography
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              color: "#344054",
                              fontSize: 13,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {file.name}
                          </Typography>
                          <Typography sx={{ color: "#98A2B3", fontSize: 12 }}>
                            {formatFileSize(file.size)}
                          </Typography>
                          <Button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                attachments: formData.attachments.filter(
                                  (_, i) => i !== idx,
                                ),
                              })
                            }
                            sx={{
                              minWidth: "auto",
                              px: 1,
                              color: "#D92D20",
                              fontWeight: 700,
                            }}
                          >
                            Remove
                          </Button>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  variant="outlined"
                  sx={{
                    borderRadius: "10px",
                    borderColor: "#D0D5DD",
                    color: "#344054",
                    px: 3,
                    py: 1,
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="contained"
                  sx={{
                    borderRadius: "10px",
                    background: "#FF8040",
                    px: 3,
                    py: 1,
                    fontWeight: 700,
                    "&:hover": { background: "#e6723a" },
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </Stack>
            </form>
          </Box>

          {isSubmitting && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
                backgroundColor: "rgba(15, 23, 42, 0.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  px: 3,
                  py: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  boxShadow: "0 10px 24px rgba(2, 6, 23, 0.2)",
                }}
              >
                <LoadingSpinner />
                <Typography
                  sx={{ fontSize: 13, color: "#475467", fontWeight: 600 }}
                >
                  Submitting ticket...
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Modal>
  );
}
