"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Chip,
  Stack,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const days = [
  { short: "Sun", full: "Sunday" },
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
];

const WorkingPlanView = ({ slotErrors = {}, clearSlotError }) => {
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);

  const dispatch = useDispatch();

  // ✅ Redux selectors
  const weekSchedule = useSelector((state) => state.calendar.weekSchedule);
  const selectedServices = useSelector(
    (state) => state.calendar.selectedServices
  );
  const { isCalendarPublished, isEditMode } = useSelector(
    (state) => state.calendar
  );
  const isFieldsDisabled = isCalendarPublished && !isEditMode;

  // ✅ Dispatch handlers
  const handleAddSlot = (day) => {
    const newSlot = {
      id: Date.now(),
      start: null,
      end: null,
      serviceType: "",
      speciality: "",
    };

    dispatch({
      type: "calendar/addSlotToDay",
      payload: { day, slot: newSlot },
    });
  };

  const handleDeleteSlot = (day, slotId) => {
    dispatch({
      type: "calendar/removeSlotFromDay",
      payload: { day, slotId },
    });
    dispatch({ type: "calendar/updateEvents" });
  };

  const getDaySlots = (dayName) => {
    const dayData = weekSchedule.find((d) => d.day === dayName);
    return dayData ? dayData.slots : [];
  };

  // ✅ IMPROVED: Clear error immediately on ANY change
  const handleSlotChange = (day, slotId, field, value) => {
    // First, clear the error IMMEDIATELY
    if (clearSlotError) {
      let errorField = field;
      if (field === "start") errorField = "startTime";
      if (field === "end") errorField = "endTime";
      clearSlotError(day, slotId, errorField);
    }

    // Then update the value
    dispatch({
      type: "calendar/updateSlotInDay",
      payload: { day, slotId, field, value },
    });
  };

  // ✅ NEW: Handle onChange for immediate error clearing (for TextField)
  const handleServiceTypeChange = (day, slotId, value) => {
    // Clear error first
    if (clearSlotError) {
      clearSlotError(day, slotId, "serviceType");
    }
    // Then update value
    handleSlotChange(day, slotId, "serviceType", value);
  };

  // ✅ NEW: Handle TimePicker change with immediate error clearing
  const handleTimeChange = (day, slotId, field, value) => {
    // Clear error immediately
    if (clearSlotError) {
      const errorField = field === "start" ? "startTime" : "endTime";
      clearSlotError(day, slotId, errorField);
    }
    // Then update value
    dispatch({
      type: "calendar/updateSlotInDay",
      payload: { day, slotId, field, value },
    });
  };

  // ✅ Get slot errors properly
  const getSlotErrors = (day, slotId) => {
    if (!slotErrors || !slotErrors[day]) {
      return {};
    }
    const dayErrors = slotErrors[day];
    if (!dayErrors || !dayErrors[slotId]) {
      return {};
    }
    return dayErrors[slotId];
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* Header */}
        <Box
          sx={{
            background: "rgb(198, 228, 251)",
            p: 1,
            borderRadius: 3,
            border: "1px solid #90caf9",
            mb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#1565c0",
              fontWeight: 400,
            }}
          >
            Working Plan
          </Typography>
        </Box>

        {/* Days Container */}
        <Box>
          {days.map((day, index) => {
            const daySlots = getDaySlots(day.full);

            return (
              <Paper
                key={day.short}
                elevation={0}
                sx={{
                  mb: 1.5,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid #e3f2fd",
                }}
              >
                {/* Day Header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "#f5f9ff",
                    px: 2,
                    py: 1,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: "1rem",
                        color: "#1565c0",
                      }}
                    >
                      {day.full}
                    </Typography>

                    {daySlots.length > 0 && (
                      <Chip
                        label={`${daySlots.length} slot${
                          daySlots.length > 1 ? "s" : ""
                        }`}
                        size="small"
                        sx={{
                          bgcolor: "#e3f2fd",
                          color: "#1565c0",
                          fontWeight: 500,
                          height: 24,
                        }}
                      />
                    )}
                  </Stack>

                  <Tooltip title="Add New Slot" arrow placement="left">
                    <IconButton
                      size="small"
                      disabled={isFieldsDisabled}
                      onClick={() => handleAddSlot(day.full)}
                      sx={{
                        bgcolor: "#1172BA",
                        color: "white",
                        width: 36,
                        height: 36,
                        "&:hover": {
                          bgcolor: "#1172BA",
                          transform: "rotate(90deg)",
                        },
                        "&:disabled": {
                          bgcolor: "#90caf9",
                          color: "white",
                        },
                        transition: "all 0.3s",
                      }}
                    >
                      <AddCircleOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Slots Content */}
                <Box sx={{ p: 2 }}>
                  {daySlots.length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#90a4ae",
                        textAlign: "center",
                        fontStyle: "italic",
                      }}
                    >
                      No slots added yet. Click + to add a slot.
                    </Typography>
                  ) : (
                    <Stack spacing={2}>
                      {daySlots.map((slot, slotIndex) => {
                        const errors = getSlotErrors(day.full, slot.id);

                        return (
                          <React.Fragment key={slot.id}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                mb: 1.5,
                              }}
                            >
                              {/* Row 1: Service Type & Delete */}
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <TextField
                                  fullWidth
                                  select
                                  disabled={isFieldsDisabled}
                                  label="Service Type"
                                  sx={{
                                    mr: 1,
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 3,
                                    },
                                  }}
                                  value={slot.serviceType || ""}
                                  error={!!errors.serviceType}
                                  helperText={errors.serviceType || ""}
                                  onChange={(e) =>
                                    handleServiceTypeChange(
                                      day.full,
                                      slot.id,
                                      e.target.value
                                    )
                                  }
                                  // ✅ NEW: Clear error on focus/input
                                  onKeyDown={() => {
                                    if (clearSlotError && errors.serviceType) {
                                      clearSlotError(
                                        day.full,
                                        slot.id,
                                        "serviceType"
                                      );
                                    }
                                  }}
                                >
                                  {selectedServices.map((s) => (
                                    <MenuItem key={s.type} value={s.type}>
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                      >
                                        <span>{s.type}</span>
                                        <Chip
                                          label={`${s.time}m`}
                                          size="small"
                                          sx={{
                                            height: 20,
                                            fontSize: "0.7rem",
                                            bgcolor: "#e3f2fd",
                                            color: "#1565c0",
                                          }}
                                        />
                                      </Stack>
                                    </MenuItem>
                                  ))}
                                </TextField>
                                <Tooltip title="Delete Slot">
                                  <IconButton
                                    size="small"
                                    disabled={isFieldsDisabled}
                                    onClick={() => {
                                      setSlotToDelete({
                                        day: day.full,
                                        slotId: slot.id,
                                      });
                                      setErrorDialogOpen(true);
                                    }}
                                    sx={{
                                      color: "#d32f2f",
                                      bgcolor: "#ffebee",
                                      width: 36,
                                      height: 36,
                                      "&:hover": {
                                        bgcolor: "#ffcdd2",
                                        transform: "scale(1.1)",
                                      },
                                      "&:disabled": {
                                        bgcolor: "#fce4ec",
                                        color: "#e57373",
                                      },
                                      transition: "all 0.2s",
                                    }}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>

                              {/* Row 2: Start & End Time */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                  mt: 2,
                                }}
                              >
                                {/* Start Time */}
                                <TimePicker
                                  disabled={isFieldsDisabled}
                                  label="Start Time"
                                  value={slot.start ? dayjs(slot.start) : null}
                                  onChange={(newVal) =>
                                    handleTimeChange(
                                      day.full,
                                      slot.id,
                                      "start",
                                      newVal
                                    )
                                  }
                                  slotProps={{
                                    textField: {
                                      error: !!errors.startTime,
                                      helperText: errors.startTime || "",
                                      // ✅ NEW: Clear error on focus
                                      onFocus: () => {
                                        if (
                                          clearSlotError &&
                                          errors.startTime
                                        ) {
                                          clearSlotError(
                                            day.full,
                                            slot.id,
                                            "startTime"
                                          );
                                        }
                                      },
                                      sx: {
                                        "& .MuiFormHelperText-root": {
                                          marginLeft: "0px",
                                          marginRight: "0px",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                          borderRadius: 2.5,
                                          boxShadow:
                                            "0 2px 8px rgba(25, 118, 210, 0.12)",
                                          "&:hover fieldset": {
                                            borderColor: "#1976d2",
                                          },
                                          "&.Mui-focused fieldset": {
                                            borderColor: "#1976d2",
                                            borderWidth: 2,
                                          },
                                        },
                                        "& .MuiInputLabel-root.Mui-focused": {
                                          color: "#1976d2",
                                        },
                                        ".MuiPickersInputBase-root": {
                                          boxShadow:
                                            "inset 4px 2px 8px rgba(95, 157, 231, .48), inset -4px -2px 8px #fff",
                                          borderRadius: 3,
                                        },
                                      },
                                    },
                                  }}
                                />

                                {/* End Time */}
                                <TimePicker
                                  disabled={isFieldsDisabled}
                                  label="End Time"
                                  value={slot.end ? dayjs(slot.end) : null}
                                  onChange={(newVal) =>
                                    handleTimeChange(
                                      day.full,
                                      slot.id,
                                      "end",
                                      newVal
                                    )
                                  }
                                  slotProps={{
                                    textField: {
                                      error: !!errors.endTime,
                                      helperText: errors.endTime || "",
                                      // ✅ NEW: Clear error on focus
                                      onFocus: () => {
                                        if (clearSlotError && errors.endTime) {
                                          clearSlotError(
                                            day.full,
                                            slot.id,
                                            "endTime"
                                          );
                                        }
                                      },
                                      sx: {
                                        "& .MuiFormHelperText-root": {
                                          marginLeft: "0px",
                                          marginRight: "0px",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                          borderRadius: 2.5,
                                          boxShadow:
                                            "0 2px 8px rgba(25, 118, 210, 0.12)",
                                          "&:hover fieldset": {
                                            borderColor: "#1976d2",
                                          },
                                          "&.Mui-focused fieldset": {
                                            borderColor: "#1976d2",
                                            borderWidth: 2,
                                          },
                                        },
                                        "& .MuiInputLabel-root.Mui-focused": {
                                          color: "#1976d2",
                                        },
                                        ".MuiPickersInputBase-root": {
                                          boxShadow:
                                            "inset 4px 2px 8px rgba(95, 157, 231, .48), inset -4px -2px 8px #fff",
                                          borderRadius: 3,
                                        },
                                      },
                                    },
                                  }}
                                />
                              </Box>
                            </Box>

                            {/* Divider after each slot except the last */}
                            {slotIndex < daySlots.length - 1 && (
                              <Divider sx={{ border: "1px solid #e3f2fd" }} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </Stack>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 360 },
        }}
      >
        <DialogTitle
          sx={{ backgroundColor: "#1976d2", p: "10px", color: "white", mb: 1 }}
        >
          <Typography sx={{ ml: 1 }}>Confirmation</Typography>
        </DialogTitle>

        <DialogContent>
          <Typography mt={1}>
            Are you sure you want to delete this slot?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ pr: 2, pb: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setErrorDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{
              "&:hover": {
                backgroundColor: "error",
              },
            }}
            onClick={() => {
              if (slotToDelete) {
                handleDeleteSlot(slotToDelete.day, slotToDelete.slotId);
                setSlotToDelete(null);
              }
              setErrorDialogOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default WorkingPlanView;
