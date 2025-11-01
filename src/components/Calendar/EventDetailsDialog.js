// pages/xyz/components/EventDetailsDialog.js
import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";
import moment from "moment";

function EventDetailsDialog({ open, onClose, selectedEvent, onEdit }) {
  const router = useRouter();

  const serviceDetails = useMemo(() => {
    if (!selectedEvent?.title) {
      return { serviceType: "No title", speciality: "N/A" };
    }
    const parts = selectedEvent.title.split(" - ");
    return {
      serviceType: parts[0] || "No title",
      speciality: parts[1] || "N/A",
    };
  }, [selectedEvent?.title]);

  const { serviceType, speciality } = serviceDetails;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(25, 118, 210, 0.15)",
        },
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          color: "white",
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <DialogTitle sx={{ p: 0, fontSize: "1.5rem", fontWeight: 600 }}>
          Event Details
        </DialogTitle>
        <Button
          onClick={onEdit}
          sx={{
            color: "#1976d2",
            backgroundColor: "white",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            px: 3,
          }}
        >
          Edit
        </Button>
      </Box>

      <DialogContent sx={{ p: 3, mt: 2 }}>
        {selectedEvent ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Service Type */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                border: "1px solid #90caf9",
                borderRadius: 2.5,
                p: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#1565c0",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  mb: 0.5,
                  display: "block",
                }}
              >
                Service Type
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#1976d2",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                {serviceType}
              </Typography>
            </Box>

            {/* Specialities */}
            <Box
              sx={{
                backgroundColor: "white",
                border: "2px solid #1976d2",
                borderRadius: 2.5,
                p: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#1565c0",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  mb: 0.5,
                  display: "block",
                }}
              >
                Specialities
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "#1976d2",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                {speciality}
              </Typography>
            </Box>

            {/* Start Time */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                border: "1px solid #90caf9",
                borderRadius: 2.5,
                p: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#1976d2",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  component="span"
                  sx={{
                    color: "white",
                    fontSize: "1.5rem",
                  }}
                >
                  📅
                </Box>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#1565c0",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    display: "block",
                  }}
                >
                  Start Time
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#1976d2",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    mt: 0.5,
                  }}
                >
                  {moment(selectedEvent.start).format("ddd, MMM D, h:mm A")}
                </Typography>
              </Box>
            </Box>

            {/* End Time */}
            <Box
              sx={{
                backgroundColor: "white",
                border: "2px solid #1976d2",
                borderRadius: 2.5,
                p: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#1976d2",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  component="span"
                  sx={{
                    color: "white",
                    fontSize: "1.5rem",
                  }}
                >
                  ⏰
                </Box>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#1565c0",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    display: "block",
                  }}
                >
                  End Time
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#1976d2",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    mt: 0.5,
                  }}
                >
                  {moment(selectedEvent.end).format("ddd, MMM D, h:mm A")}
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Box
              sx={{
                backgroundColor: "#e3f2fd",
                borderRadius: "50%",
                width: 64,
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Box component="span" sx={{ fontSize: "2rem" }}>
                📅
              </Box>
            </Box>
            <Typography sx={{ color: "#1976d2" }}>
              No event selected.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          backgroundColor: "#f5f5f5",
          borderTop: "1px solid #e0e0e0",
          p: 2,
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: "#1976d2",
            fontWeight: 500,
            textTransform: "none",
            px: 3,
            border: "1px solid #1976d2",
            "&:hover": {
              border: "1px solid #1565c0",
            },
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          onClick={() => router.push("/xyz/priview")}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 4,
          }}
        >
          Preview
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EventDetailsDialog;