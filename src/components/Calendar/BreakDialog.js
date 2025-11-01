// pages/xyz/components/BreakDialog.js
import React from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Divider,
  IconButton,
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableContainer,
  TableBody,
  Chip,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Delete, Edit, Check, Close } from "@mui/icons-material";
import dayjs from "dayjs";
// import { useBreakManagement } from "@/Hook/useBreakManagement";

function BreakDialog({ open, onClose, breakManagement }) {
  const {
    sortedBreaks,
    editingBreakIndex,
    editBreakData,
    fieldErrors,
    handleStartInlineEdit,
    handleCancelInlineEdit,
    handleSaveInlineEdit,
    handleDeleteDay,
    updateBreakField,
  } = breakManagement;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx:{
          borderRadius: 4,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          background: "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          color: "#2c3e50",
          fontWeight: 700,
          fontSize: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#2c3e50" }}>
          Break Details
        </Typography>
      </DialogTitle>
      <Divider sx={{ borderColor: "#e0e0e0" }} />
      <DialogContent sx={{ px: 2, py: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {sortedBreaks.length > 0 ? (
            <TableContainer
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid #e0e0e0",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background:
                        "linear-gradient(135deg, #227fdbff 0%, #3285e3ff 0%)",
                    }}
                  >
                    <TableCell
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "1rem",
                        textAlign: "center",
                      }}
                    >
                      📅 Days
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "1rem",
                        textAlign: "center",
                      }}
                    >
                      🕐 Start Time
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "1rem",
                        textAlign: "center",
                      }}
                    >
                      🕐 End Time
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "1rem",
                        textAlign: "center",
                      }}
                      align="center"
                    >
                      ⚙️ Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedBreaks.map((item, sortedIndex) => (
                    <TableRow
                      key={`${item.breakIndex}-${item.dayIndex}`}
                      sx={{
                        background:
                          sortedIndex % 2 === 0
                            ? "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)"
                            : "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)",
                        borderTop: "1px solid #e0e0e0",
                      }}
                    >
                      {/* Day Column */}
                      <TableCell sx={{ py: 1.5, textAlign: "center" }}>
                        <Chip
                          label={item.day}
                          size="small"
                          sx={{
                            background:
                              "linear-gradient(135deg, #4d94dbff 0%, #3285e3ff 0%)",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                          }}
                        />
                      </TableCell>

                      {/* Start Time Column */}
                      <TableCell sx={{ py: 1.5, textAlign: "center" }}>
                        {editingBreakIndex ===
                        `${item.breakIndex}-${item.dayIndex}` ? (
                          <TimePicker
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2.5,
                                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.12)",
                                "&:hover fieldset": {
                                  borderColor: "#1976d2",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#1976d2",
                                  borderWidth: 2,
                                },
                              },
                            }}
                            value={editBreakData?.startTime}
                            onChange={(newValue) =>
                              updateBreakField("startTime", newValue)
                            }
                            slotProps={{
                              textField: {
                                size: "small",
                                fullWidth: true,
                                error: !!fieldErrors.startTime,
                                helperText: fieldErrors.startTime,
                              },
                            }}
                          />
                        ) : (
                          <Typography
                            sx={{
                              color: "#424242",
                              fontWeight: 500,
                              fontSize: "0.95rem",
                            }}
                          >
                            {item.startTime
                              ? dayjs(item.startTime, "HH:mm").format("hh:mm A")
                              : "Not set"}
                          </Typography>
                        )}
                      </TableCell>

                      {/* End Time Column */}
                      <TableCell sx={{ py: 1.5, textAlign: "center" }}>
                        {editingBreakIndex ===
                        `${item.breakIndex}-${item.dayIndex}` ? (
                          <TimePicker
                            value={editBreakData?.endTime}
                            onChange={(newValue) =>
                              updateBreakField("endTime", newValue)
                            }
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2.5,
                                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.12)",
                              },
                            }}
                            slotProps={{
                              textField: {
                                size: "small",
                                fullWidth: true,
                                error: !!fieldErrors.endTime,
                                helperText: fieldErrors.endTime,
                              },
                            }}
                          />
                        ) : (
                          <Typography
                            sx={{
                              color: "#424242",
                              fontWeight: 500,
                              fontSize: "0.95rem",
                            }}
                          >
                            {item.endTime
                              ? dayjs(item.endTime, "HH:mm").format("hh:mm A")
                              : "Not set"}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Actions Column */}
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        {editingBreakIndex ===
                        `${item.breakIndex}-${item.dayIndex}` ? (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.5,
                              justifyContent: "center",
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={handleSaveInlineEdit}
                              sx={{
                                color: "white",
                                bgcolor: "#4caf50",
                                "&:hover": { bgcolor: "#45a049" },
                              }}
                            >
                              <Check fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={handleCancelInlineEdit}
                              sx={{
                                color: "white",
                                bgcolor: "#f44336",
                                "&:hover": { bgcolor: "#da190b" },
                              }}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.5,
                              justifyContent: "center",
                            }}
                          >
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() =>
                                handleStartInlineEdit(
                                  `${item.breakIndex}-${item.dayIndex}`,
                                  item
                                )
                              }
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() =>
                                handleDeleteDay(item.breakIndex, item.dayIndex)
                              }
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                px: 3,
                borderRadius: 3,
                background: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
                border: "2px dashed #bdbdbd",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#757575",
                  fontStyle: "italic",
                  mb: 1,
                  fontSize: "1.1rem",
                }}
              >
                No breaks scheduled
              </Typography>
              <Typography variant="body2" sx={{ color: "#9e9e9e" }}>
                Select days and times to add break schedules
              </Typography>
            </Box>
          )}
        </LocalizationProvider>
      </DialogContent>
      <Divider sx={{ borderColor: "#e0e0e0" }} />
      <DialogActions
        sx={{
          p: 1,
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            color: "#fff",
            fontWeight: 600,
            textTransform: "none",
            px: 3,
            borderRadius: 3,
            fontSize: "1rem",
          }}
        >
          ✓ Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BreakDialog;