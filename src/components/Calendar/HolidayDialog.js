// pages/xyz/components/HolidayDialog.js
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
import { DatePicker } from "@mui/x-date-pickers";
import { Delete, Edit, Check, Close } from "@mui/icons-material";
import dayjs from "dayjs";
import { useHolidayManagement } from "@/Hook/useHolidayManagement";

function HolidayDialog({ open, onClose, holidayManagement }) {
  const {
    sortedHolidays,
    editingHolidayIndex,
    editHolidayData,
    fieldErrors,
    handleStartHolidayInlineEdit,
    handleCancelHolidayInlineEdit,
    handleSaveHolidayInlineEdit,
    handleDeleteHoliday,
    updateHolidayField,
  } = holidayManagement;

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
          Holiday Details
        </Typography>
      </DialogTitle>

      <Divider sx={{ borderColor: "#e0e0e0" }} />

      <DialogContent sx={{ px: 2, py: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {sortedHolidays.length > 0 ? (
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
                      }}
                      align="center"
                    >
                      📅 Date
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                      align="center"
                    >
                      🕐 Start Time
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                      align="center"
                    >
                      🕐 End Time
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                      align="center"
                    >
                      ⚙️ Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sortedHolidays.map((holiday, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        borderTop: "1px solid #e0e0e0",
                        textAlign: "center",
                      }}
                    >
                      {/* Date Column */}
                      <TableCell
                        sx={{
                          py: 1.5,
                          padding: "5px",
                          textAlign: "center",
                        }}
                      >
                        {editingHolidayIndex === index ? (
                          <DatePicker
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2.5,
                                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.12)",
                              },
                            }}
                            value={editHolidayData?.date}
                            onChange={(newValue) =>
                              updateHolidayField("date", newValue)
                            }
                            slotProps={{
                              textField: {
                                error: !!fieldErrors.date,
                                helperText: fieldErrors.date,
                                size: "small",
                              },
                            }}
                          />
                        ) : (
                          <Chip
                            label={
                              holiday.date
                                ? dayjs(holiday.date).format("MMM DD, YYYY")
                                : "No Date"
                            }
                            size="small"
                            sx={{
                              background:
                                "linear-gradient(135deg, #227fdbff 0%, #3285e3ff 0%)",
                              color: "white",
                              fontWeight: 600,
                              fontSize: "0.8rem",
                            }}
                          />
                        )}
                      </TableCell>

                      {/* Start Time Column */}
                      <TableCell
                        sx={{
                          py: 1.5,
                          padding: "5px",
                          textAlign: "center",
                        }}
                      >
                        {editingHolidayIndex === index ? (
                          <TimePicker
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2.5,
                                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.12)",
                              },
                            }}
                            value={editHolidayData?.startTime}
                            onChange={(newValue) =>
                              updateHolidayField("startTime", newValue)
                            }
                            slotProps={{
                              textField: {
                                size: "small",
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
                            {holiday.startTime
                              ? dayjs(holiday.startTime, "HH:mm").format(
                                  "hh:mm A"
                                )
                              : "Full Day"}
                          </Typography>
                        )}
                      </TableCell>

                      {/* End Time Column */}
                      <TableCell
                        sx={{
                          py: 1.5,
                          padding: "5px",
                          textAlign: "center",
                        }}
                      >
                        {editingHolidayIndex === index ? (
                          <TimePicker
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2.5,
                                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.12)",
                              },
                            }}
                            value={editHolidayData?.endTime}
                            onChange={(newValue) =>
                              updateHolidayField("endTime", newValue)
                            }
                            slotProps={{
                              textField: {
                                size: "small",
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
                            {holiday.endTime
                              ? dayjs(holiday.endTime, "HH:mm").format(
                                  "hh:mm A"
                                )
                              : "Full Day"}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Actions Column */}
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        {editingHolidayIndex === index ? (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 0.5,
                              justifyContent: "center",
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={handleSaveHolidayInlineEdit}
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
                              onClick={handleCancelHolidayInlineEdit}
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
                                handleStartHolidayInlineEdit(index, holiday)
                              }
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteHoliday(index)}
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
                🏖️ No holidays scheduled
              </Typography>
              <Typography variant="body2" sx={{ color: "#9e9e9e" }}>
                Add holidays from the left panel
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

export default HolidayDialog;