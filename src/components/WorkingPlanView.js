"use client";
import React from "react";
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

const WorkingPlanView = ({ disabled = false, slotErrors = {} }) => {
  const dispatch = useDispatch();

  // ✅ Redux selectors
  const weekSchedule = useSelector((state) => state.calendar.weekSchedule);
  const selectedServices = useSelector(
    (state) => state.calendar.selectedServices
  );
  const selectedSpecialities = useSelector(
    (state) => state.calendar.selectedSpecialities
  );

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
  };
   const getDaySlots = (dayName) => {
    const dayData = weekSchedule.find((d) => d.day === dayName);
    return dayData ? dayData.slots : [];
  };

  const handleSlotChange = (day, slotId, field, value) => {
    dispatch({
      type: "calendar/updateSlotInDay",
      payload: { day, slotId, field, value },
    });
  };

  // ✅ Get slots for a specific day
  const getSlotErrors = (day, slotId) => {
    const dayErrors = slotErrors[day];
    if (!dayErrors) return {};

    return dayErrors[slotId] || {};
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
          {days.map((day) => {
            const daySlots = getDaySlots(day.full);
            const hasDayErrors =
              slotErrors[day.full] &&
              Object.keys(slotErrors[day.full]).length > 0;

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
                      disabled={disabled}
                      onClick={() => handleAddSlot(day.full)}
                      sx={{
                        bgcolor: "#1e88e5",
                        color: "white",
                        width: 36,
                        height: 36,
                        "&:hover": {
                          bgcolor: "#1565c0",
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
                      {daySlots.map((slot) => {
                        const errors = getSlotErrors(day.full, slot.id);
                        return (

                        <Box
                          key={slot.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          {/* Start Time */}
                          <TimePicker
                            sx={{ ".MuiButtonBase-root": { padding: "0px" } }}
                            disabled={disabled}
                            label="Start Time"
                            value={slot.start ? dayjs(slot.start) : null}
                            onChange={(newVal) =>
                              handleSlotChange(
                                day.full,
                                slot.id,
                                "start",
                                newVal
                              )
                            }
                            slotProps={{
                              textField: { size: "small", sx: { width: 140 }, error: !!errors.startTime,
                                      helperText: errors.startTime || " ", },
                            }}
                          />

                          {/* End Time */}
                          <TimePicker
                            disabled={disabled}
                            label="End Time"
                            value={slot.end ? dayjs(slot.end) : null}
                            onChange={(newVal) =>
                              handleSlotChange(day.full, slot.id, "end", newVal)
                            }
                            slotProps={{
                              textField: { size: "small", sx: { width: 140 },   error: !!errors.endTime,
                                      helperText: errors.endTime || " ", },
                            }}
                          />

                          {/* Service Type */}
                          <TextField
                            select
                            disabled={disabled}
                            label="Service Type"
                            size="small"
                            sx={{ width: 180 }}
                            value={slot.serviceType || ""}
                            error={!!errors.serviceType}
                                helperText={errors.serviceType || " "}
                            onChange={(e) =>
                              handleSlotChange(
                                day.full,
                                slot.id,
                                "serviceType",
                                e.target.value
                              )
                            }
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

                          {/* Speciality */}
                          {/* <TextField
                            select
                            disabled={disabled}
                            label="Speciality"
                            size="small"
                            sx={{ width: 160 }}
                            value={slot.speciality || ""}
                             error={!!errors.speciality}
                                helperText={errors.speciality || " "}
                            onChange={(e) =>
                              handleSlotChange(
                                day.full,
                                slot.id,
                                "speciality",
                                e.target.value
                              )
                            }
                          >
                            {selectedSpecialities.map((sp) => (
                              <MenuItem key={sp.type} value={sp.type}>
                                {sp.type}
                              </MenuItem>
                            ))}
                          </TextField> */}

                          {/* Delete Button */}
                          <Tooltip title="Delete Slot" arrow>
                            <IconButton
                              size="small"
                              disabled={disabled}
                              onClick={() =>
                                handleDeleteSlot(day.full, slot.id)
                              }
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
                        )
          })}
                    </Stack>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default WorkingPlanView;
