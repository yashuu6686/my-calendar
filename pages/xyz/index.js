"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
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
} from "@mui/material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import LeftSide from "../../src/components/LeftSide";
import { useDispatch, useSelector } from "react-redux";

import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Delete, Edit } from "@mui/icons-material";
import {
  breakValidationSchema,
  holidayValidationSchema,
} from "../../src/validation/validation.js";
import * as yup from "yup";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { TextField, Chip } from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";

import {
  setEditingSlot,
  setForm,
  setSelectedDays,
  setOpenDialog,
  setStartTime,
  setBreaks,
  setEndTime,
  setHolidays,
  deleteHoliday,
  updateEvents,
} from "@/redux/store/slices/calendarSlice";

const localizer = momentLocalizer(moment);

export default function CalendarMerge() {
  const router = useRouter();

  const dispatch = useDispatch();
  const events = useSelector((state) => state.calendar.events);
  const openDialog = useSelector((state) => state.calendar.openDialog);
  const breaks = useSelector((state) => state.calendar.breaks);
  const weekSchedule = useSelector((state) => state.calendar.weekSchedule);
  const holidays = useSelector((state) => state.calendar.holidays);
  const isCalendarPublished = useSelector(
    (state) => state.calendar.isCalendarPublished
  );
  const isEditMode = useSelector((state) => state.calendar.isEditMode);

  const [editingHolidayIndex, setEditingHolidayIndex] = useState(null);
  const [editHolidayData, setEditHolidayData] = useState(null);

  const handleShowValues = () => {
    dispatch(setOpenDialog(true));
  };

  const handleCloseDialog = () => {
    dispatch(setOpenDialog(false));
  };

  const [open, setOpen] = useState(false);
  const [holidayOpen, setHolidayOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  // Add this state in your component
  const [editingBreakIndex, setEditingBreakIndex] = useState(null);
  const [editBreakData, setEditBreakData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleEdit = () => {
    if (!selectedEvent) return;

    const eventDay = moment(selectedEvent.start).format("dddd"); // Get day name
    const daySchedule = weekSchedule.find((d) => d.day === eventDay);

    if (daySchedule) {
      const slot = daySchedule.slots.find((s) => s.id === selectedEvent.id);

      if (slot) {
        // Set the form data
        dispatch(
          setForm({
            serviceType: slot.serviceType,
            speciality: slot.speciality,
            startTime: dayjs(slot.start.toDate()),
            endTime: dayjs(slot.end.toDate()),
          })
        );

        // Set selected days (just the current day for editing)
        dispatch(setSelectedDays([eventDay]));
        dispatch(setStartTime(slot.start));
        dispatch(setEndTime(slot.end));

        dispatch(
          setEditingSlot({
            id: slot.id,
            days: [eventDay],
            originalSlot: slot,
          })
        );
        // Close the event details dialog
        handleClose();

        // You might want to scroll to the LeftSide component or highlight it
        console.log("Editing slot:", {
          id: slot.id,
          serviceType: slot.serviceType,
          speciality: slot.speciality,
          startTime: slot.start.format("HH:mm"),
          endTime: slot.end.format("HH:mm"),
        });
      }
    }
  };

  useEffect(() => {
    console.log("📊 Selected Event Data:", selectedEvent);
  }, [selectedEvent]);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setOpen(true);
  };
  const getServiceDetails = () => {
    if (!selectedEvent?.title) {
      return { serviceType: "No title", speciality: "N/A" };
    }

    // "Video Call - General" => ["Video Call", "General"]
    const parts = selectedEvent.title.split(" - ");
    return {
      serviceType: parts[0] || "No title",
      speciality: parts[1] || "N/A",
    };
  };

  const { serviceType, speciality } = getServiceDetails();

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
  };

  const isFieldsDisabled = isCalendarPublished && !isEditMode;

  const handleSaveInlineEdit = async () => {
    if (editingBreakIndex !== null && editBreakData) {
      try {
        // ✅ Clear previous errors
        setFieldErrors({});

        const [actualBreakIndex, dayIndex] = editingBreakIndex
          .split("-")
          .map(Number);

        const breakItem = breaks[actualBreakIndex];
        const editedDay = breakItem.days[dayIndex];

        const newStartTime = editBreakData.startTime
          ? dayjs(editBreakData.startTime).format("HH:mm")
          : breakItem.startTime;
        const newEndTime = editBreakData.endTime
          ? dayjs(editBreakData.endTime).format("HH:mm")
          : breakItem.endTime;

        // ✅ Prepare data for validation
        const dataToValidate = {
          breakSelectedDays: [editedDay],
          startTime:
            editBreakData.startTime ||
            dayjs(`2000-01-01 ${breakItem.startTime}`),
          endTime:
            editBreakData.endTime || dayjs(`2000-01-01 ${breakItem.endTime}`),
        };

        // ✅ Create a temporary breaks array for validation (excluding current break being edited)
        const breaksForValidation = breaks
          .map((b, idx) => {
            if (idx === actualBreakIndex) {
              // Remove the day being edited from this break
              return {
                ...b,
                days: b.days.filter((d, dIdx) => dIdx !== dayIndex),
              };
            }
            return b;
          })
          .filter((b) => b.days.length > 0);

        console.log("🔍 Validating break edit:", {
          editingBreakIndex: actualBreakIndex,
          editedDay,
          newStartTime,
          newEndTime,
          breaksForValidation,
        });

        // ✅ Validate using yup schema
        await breakValidationSchema.validate(dataToValidate, {
          context: {
            breaks: breaksForValidation,
            editIndex: actualBreakIndex,
          },
          abortEarly: false,
        });

        console.log("✅ Validation passed, updating break");

        // ✅ Create a deep copy of breaks array (IMMUTABLE UPDATE)
        const updated = breaks.map((b, idx) => {
          if (idx === actualBreakIndex) {
            // Create a copy of the break item and its days array
            return {
              ...b,
              days: [...b.days],
            };
          }
          return { ...b, days: [...b.days] };
        });

        const currentBreak = updated[actualBreakIndex];

        // Check if time changed
        const timeChanged =
          newStartTime !== breakItem.startTime ||
          newEndTime !== breakItem.endTime;

        if (timeChanged && currentBreak.days.length > 1) {
          // ✅ Remove this day from the current break item (now it's safe to splice)
          currentBreak.days.splice(dayIndex, 1);

          // Create a new break item with the edited day and new times
          updated.push({
            days: [editedDay],
            startTime: newStartTime,
            endTime: newEndTime,
          });
        } else if (timeChanged && currentBreak.days.length === 1) {
          // If only one day, just update the times
          updated[actualBreakIndex] = {
            ...currentBreak,
            startTime: newStartTime,
            endTime: newEndTime,
          };
        }
        // If time didn't change, no update needed

        // ✅ Dispatch the updated breaks
        dispatch(setBreaks(updated));
        setEditingBreakIndex(null);
        setEditBreakData(null);
        setFieldErrors({});

        console.log("✅ Break updated successfully");
      } catch (error) {
        console.log("❌ Break validation failed:", error);

        // ✅ Handle validation errors
        if (error.name === "ValidationError" && error.inner) {
          const newErrors = {};
          error.inner.forEach((err) => {
            newErrors[err.path] = err.message;
          });
          setFieldErrors(newErrors);
          console.log("Break validation errors:", newErrors);
        }
      }
    }
  };

  
  const handleDeleteDay = (breakIndex, dayIndex) => {
    const updated = breaks.map((b, idx) => ({
      ...b,
      days: [...b.days],
    }));

    const breakItem = updated[breakIndex];

    // Now it's safe to splice
    breakItem.days.splice(dayIndex, 1);

    // Remove the entire break if no days left
    const finalUpdated = updated.filter((b) => b.days.length > 0);

    dispatch(setBreaks(finalUpdated));
  };

  const handleCancelInlineEdit = () => {
    setEditingBreakIndex(null);
    setEditBreakData(null);
  };

  const handleStartInlineEdit = (index, breakItem) => {
    setEditingBreakIndex(index);
    setEditBreakData({
      days: breakItem.days,
      startTime: breakItem.startTime
        ? dayjs(`2000-01-01 ${breakItem.startTime}`)
        : null,
      endTime: breakItem.endTime
        ? dayjs(`2000-01-01 ${breakItem.endTime}`)
        : null,
    });
    setFieldErrors({});
  };
  const handleSaveHolidayInlineEdit = async () => {
    if (editingHolidayIndex !== null && editHolidayData) {
      try {
        // Clear previous error
        setFieldErrors({});

        // Prepare the data for validation
        const dataToValidate = {
          date: editHolidayData.date,
          startTime: editHolidayData.startTime,
          endTime: editHolidayData.endTime,
        };

        // Validate using yup schema with context (exclude current holiday being edited)
        await holidayValidationSchema.validate(dataToValidate, {
          context: {
            existingHolidays: holidays.filter(
              (_, index) => index !== editingHolidayIndex
            ),
            weekSchedule,
          },
          abortEarly: false, // Get all validation errors
        });

        // If validation passes, update the holiday
        const updated = [...holidays];
        updated[editingHolidayIndex] = {
          date: editHolidayData.date
            ? dayjs(editHolidayData.date).format("YYYY-MM-DD")
            : null,
          startTime: editHolidayData.startTime
            ? dayjs(editHolidayData.startTime).format("HH:mm")
            : null,
          endTime: editHolidayData.endTime
            ? dayjs(editHolidayData.endTime).format("HH:mm")
            : null,
        };
        dispatch(setHolidays(updated));
        setEditingHolidayIndex(null);
        setEditHolidayData(null);
        setFieldErrors({});
      } catch (error) {
        // Handle validation error
        if (error.name === "ValidationError" && error.inner) {
          const newErrors = {};
          error.inner.forEach((err) => {
            newErrors[err.path] = err.message;
          });
          setFieldErrors(newErrors);
        }
      }
    }
  };

  const handleCancelHolidayInlineEdit = () => {
    setEditingHolidayIndex(null);
    setEditHolidayData(null);
  };

  const handleStartHolidayInlineEdit = (index, holiday) => {
    setEditingHolidayIndex(index);
    setEditHolidayData({
      date: holiday.date ? dayjs(holiday.date) : null,
      startTime: holiday.startTime
        ? dayjs(`2000-01-01 ${holiday.startTime}`)
        : null,
      endTime: holiday.endTime ? dayjs(`2000-01-01 ${holiday.endTime}`) : null,
    });
  };

  const handleDeleteHoliday = (index) => {
    dispatch(deleteHoliday(index));
  };

  const eventStyleGetter = () => ({
    style: {
      backgroundColor: "#b3e5fc",
      border: "1px solid #0288d1",
      color: "black",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center !important",
      marginLeft: "0px",
      cursor: isFieldsDisabled ? "not-allowed" : "pointer", // ✅ Change cursor
      opacity: isFieldsDisabled ? 0.7 : 1, // ✅ Reduce opacity when disabled
      pointerEvents: isFieldsDisabled ? "none" : "auto",
    },
  });

  return (
    <Box bgcolor="#f9fafb" p={1}>
      <Grid container spacing={1}>
        <Grid item xs={12} md={3.5} lg={3} size={{ md: 4 }}>
          <LeftSide />
        </Grid>
        <Grid item xs={12} md={8.5} lg={9} size={{ md: 8 }}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 4,
              // border: "2px solid #e3f2fd",
              // background: "linear-gradient(to bottom, #ffffff 0%, #f8fbff 100%)",
              // boxShadow: "0 8px 32px rgba(25, 118, 210, 0.08)",
              "& .rbc-calendar": {
                backgroundColor: "transparent",
              },
              "& .rbc-header": {
                backgroundColor: "#e3f2fd",
                color: "#1565c0",
                fontWeight: 600,
                fontSize: "1rem",
                padding: "16px 8px",
                borderBottom: "2px solid #90caf9",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              },
              "& .rbc-today": {
                backgroundColor: "#f0f7ff",
              },
              "& .rbc-time-slot": {
                borderTop: "1px solid #e3f2fd",
              },
              "& .rbc-time-column": {
                "& .rbc-timeslot-group": {
                  borderLeft: "2px solid #e3f2fd",
                },
              },
              "& .rbc-current-time-indicator": {
                backgroundColor: "#1976d2",
                height: 3,
              },
              "& .rbc-day-slot .rbc-time-slot": {
                borderTop: "1px solid #f0f7ff",
              },
              "& .rbc-time-header-content": {
                borderLeft: "2px solid #e3f2fd",
              },
              "& .rbc-toolbar": {
                backgroundColor: "#e3f2fd",
                padding: "16px 20px",
                borderRadius: "12px",
                marginBottom: "24px",
                border: "2px solid #90caf9",
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.1)",
                "& button": {
                  color: "#1976d2",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  padding: "8px 20px",
                  borderRadius: "10px",
                  border: "2px solid transparent",
                  transition: "all 0.3s ease",
                  backgroundColor: "white",
                  marginLeft: "8px",
                  "&:hover": {
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "2px solid #1565c0",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                  },
                  "&.rbc-active": {
                    backgroundColor: "#1976d2",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                    border: "2px solid #1565c0",
                  },
                },
                "& .rbc-toolbar-label": {
                  color: "#1565c0",
                  fontWeight: 700,
                  fontSize: "1.3rem",
                  letterSpacing: "0.5px",
                },
              },
              "& .rbc-event-label": {
                display: "none",
              },
              "& .rbc-day-bg": {
                transition: "background-color 0.3s ease",
                "&:hover": {
                  backgroundColor: "#f8fbff",
                },
              },
            }}
          >
            <Calendar
              localizer={localizer}
              events={events}
              defaultView="week"
              views={["day", "week", "month", "agenda"]}
              onSelectEvent={handleEventClick}
              style={{ height: "190vh" }}
              eventPropGetter={eventStyleGetter}
              components={{
                toolbar: (toolbarProps) => (
                  <Box
                    sx={{
                      backgroundColor: "#e3f2fd",
                      padding: "16px 20px",
                      borderRadius: "12px",
                      marginBottom: "24px",
                      border: "2px solid #90caf9",
                      boxShadow: "0 4px 12px rgba(25, 118, 210, 0.1)",
                    }}
                  >
                    {/* Top Row: Navigation + View Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      {/* Left: Today, Back, Next */}
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          onClick={() => toolbarProps.onNavigate("TODAY")}
                          sx={{
                            color: "#1976d2",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            padding: "8px 20px",
                            borderRadius: "10px",
                            border: "2px solid transparent",
                            transition: "all 0.3s ease",
                            backgroundColor: "white",
                            textTransform: "none",
                            "&:hover": {
                              backgroundColor: "#1976d2",
                              color: "white",
                              border: "2px solid #1565c0",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                            },
                          }}
                        >
                          Today
                        </Button>
                        <Button
                          onClick={() => toolbarProps.onNavigate("PREV")}
                          sx={{
                            color: "#1976d2",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            padding: "8px 20px",
                            borderRadius: "10px",
                            border: "2px solid transparent",
                            transition: "all 0.3s ease",
                            backgroundColor: "white",
                            textTransform: "none",
                            "&:hover": {
                              backgroundColor: "#1976d2",
                              color: "white",
                              border: "2px solid #1565c0",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                            },
                          }}
                        >
                          Back
                        </Button>
                        <Button
                          onClick={() => toolbarProps.onNavigate("NEXT")}
                          sx={{
                            color: "#1976d2",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            padding: "8px 20px",
                            borderRadius: "10px",
                            border: "2px solid transparent",
                            transition: "all 0.3s ease",
                            backgroundColor: "white",
                            textTransform: "none",
                            "&:hover": {
                              backgroundColor: "#1976d2",
                              color: "white",
                              border: "2px solid #1565c0",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                            },
                          }}
                        >
                          Next
                        </Button>
                      </Box>

                      {/* Center: Label */}
                      <Typography
                        sx={{
                          color: "#1565c0",
                          fontWeight: 700,
                          fontSize: "1.3rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {toolbarProps.label}
                      </Typography>

                      {/* Right: View Buttons (Day, Week, Month, Agenda) */}
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {["day", "week", "month"].map((view) => (
                          <Button
                            key={view}
                            onClick={() => toolbarProps.onView(view)}
                            sx={{
                              color: "#1976d2",
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              padding: "8px 16px",
                              borderRadius: "10px",
                              border: "2px solid transparent",
                              transition: "all 0.3s ease",
                              backgroundColor:
                                toolbarProps.view === view
                                  ? "#1172BA"
                                  : "white",
                              color:
                                toolbarProps.view === view
                                  ? "white"
                                  : "#1976d2",
                              textTransform: "capitalize",
                              "&:hover": {
                                backgroundColor: "#1976d2",
                                color: "white",
                                border: "2px solid #1565c0",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                              },
                            }}
                          >
                            {view}
                          </Button>
                        ))}
                      </Box>
                    </Box>

                    {/* Bottom Row: Holiday & Break Buttons */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 2,
                        pt: 2,
                        borderTop: "1px solid #90caf9",
                      }}
                    >
                      <Button
                        disabled={isFieldsDisabled}
                        variant="contained"
                        sx={{
                          // background:
                          //   "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          padding: "8px 24px",
                          borderRadius: "10px",
                          textTransform: "none",
                          // boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                          "&:hover": {
                            // background:
                            //   "linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)",
                            transform: "translateY(-2px)",
                            // boxShadow: "0 6px 16px rgba(76, 175, 80, 0.4)",
                          },
                          transition: "all 0.3s ease",
                        }}
                        onClick={handleShowValues}
                      >
                        Break
                      </Button>
                      <Button
                        disabled={isFieldsDisabled}
                        variant="contained"
                        sx={{
                          // background:
                          //   "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          padding: "8px 24px",
                          borderRadius: "10px",
                          textTransform: "none",
                          // boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
                          "&:hover": {
                            // background:
                            //   "linear-gradient(135deg, #f57c00 0%, #e65100 100%)",
                            transform: "translateY(-2px)",
                            // boxShadow: "0 6px 16px rgba(255, 152, 0, 0.4)",
                          },
                          transition: "all 0.3s ease",
                        }}
                        onClick={() => setHolidayOpen(true)}
                      >
                        Holiday
                      </Button>
                    </Box>
                  </Box>
                ),
              }}
            />
          </Paper>
        </Grid>
      </Grid>
      {/*This is for the preview page dailog box*/}
      <Dialog
        open={open}
        onClose={handleClose}
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
            onClick={handleEdit}
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
                  background:
                    "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
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
                  background:
                    "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
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
                    // p: 1.5,
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
                    // p: 1,
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
            onClick={handleClose}
            sx={{
              color: "#1976d2",
              fontWeight: 500,
              textTransform: "none",
              px: 3,
              border: "1px solid #1976d2",
              "&:hover": {
                // backgroundColor: "#e3f2fd",
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
              // background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              // boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              // "&:hover": {
              //   background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
              //   boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
              //   transform: "translateY(-1px)",
              // },
              // transition: "all 0.2s ease-in-out",
            }}
          >
            Preview
          </Button>
        </DialogActions>
      </Dialog>
      {/* This is the break dailog*/}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
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
          {/* <Box
            sx={{
              width: 35,
              height: 35,
              borderRadius: "50%",
              // background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              // boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
            }}
          >
            ⏰
          </Box> */}
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#2c3e50" }}>
            {" "}
            Break Details{" "}
          </Typography>
        </DialogTitle>
        <Divider sx={{ borderColor: "#e0e0e0" }} />
        <DialogContent sx={{ px: 2, py: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {breaks.length > 0 ? (
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
                    {(() => {
                      // Sort breaks by day order, then by start time
                      const dayOrder = [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                      ];
                      const sortedBreaks = breaks
                        .flatMap((breakItem, breakIndex) =>
                          breakItem.days.map((day, dayIndex) => ({
                            ...breakItem,
                            day,
                            breakIndex,
                            dayIndex,
                          }))
                        )
                        .sort((a, b) => {
                          const dayA = dayOrder.indexOf(a.day);
                          const dayB = dayOrder.indexOf(b.day);
                          if (dayA !== dayB) return dayA - dayB;
                          // Same day, sort by start time
                          const timeA =
                            dayjs(a.startTime).hour() * 60 +
                            dayjs(a.startTime).minute();
                          const timeB =
                            dayjs(b.startTime).hour() * 60 +
                            dayjs(b.startTime).minute();
                          return timeA - timeB;
                        });

                      return sortedBreaks.map((item, sortedIndex) => (
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
                          {/* ✅ Single Day Column */}
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
                          {/* ✅ Start Time Column */}
                          <TableCell sx={{ py: 1.5, textAlign: "center" }}>
                            {editingBreakIndex ===
                            `${item.breakIndex}-${item.dayIndex}` ? (
                              <TimePicker
                                sx={{
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
                                }}
                                value={editBreakData?.startTime}
                                onChange={(newValue) => {
                                  setEditBreakData({
                                    ...editBreakData,
                                    startTime: newValue,
                                  });
                                  if (fieldErrors.startTime) {
                                    const { startTime, ...rest } = fieldErrors;
                                    setFieldErrors(rest);
                                  }
                                }}
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
                                  ? dayjs(item.startTime, "HH:mm").format(
                                      "hh:mm A"
                                    )
                                  : "Not set"}
                              </Typography>
                            )}
                          </TableCell>
                          {/* ✅ End Time Column */}
                          <TableCell sx={{ py: 1.5, textAlign: "center" }}>
                            {editingBreakIndex ===
                            `${item.breakIndex}-${item.dayIndex}` ? (
                              <TimePicker
                                value={editBreakData?.endTime}
                                onChange={(newValue) => {
                                  setEditBreakData({
                                    ...editBreakData,
                                    endTime: newValue,
                                  });
                                  if (fieldErrors.endTime) {
                                    const { endTime, ...rest } = fieldErrors;
                                    setFieldErrors(rest);
                                  }
                                }}
                                sx={{
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
                                  ? dayjs(item.endTime, "HH:mm").format(
                                      "hh:mm A"
                                    )
                                  : "Not set"}
                              </Typography>
                            )}
                          </TableCell>
                          {/* ✅ Actions Column */}
                          <TableCell
                            align="center"
                            sx={{ py: 1.5, textAlign: "center" }}
                          >
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
                                  onClick={() =>
                                    handleSaveInlineEdit(
                                      item.breakIndex,
                                      item.dayIndex
                                    )
                                  }
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
                                    handleDeleteDay(
                                      item.breakIndex,
                                      item.dayIndex
                                    )
                                  }
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
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
                  background:
                    "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
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
                  {" "}
                  Select days and times to add break schedules{" "}
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
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              px: 3,
              borderRadius: 3,
              fontSize: "1rem",
              transition: "all 0.3s ease",
            }}
          >
            ✓ Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* This is the holiday dailog*/}
      <Dialog
        open={holidayOpen}
        onClose={() => setHolidayOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
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
          {/* <Box
            sx={{
              width: 35,
              height: 35,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
            }}
          >
            🏖️
          </Box> */}
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#2c3e50" }}>
            Holiday Details
          </Typography>
        </DialogTitle>

        <Divider sx={{ borderColor: "#e0e0e0" }} />

        <DialogContent sx={{ px: 2, py: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {holidays.length > 0 ? (
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
                    {[...holidays]
                      .sort((a, b) => {
                        const dateA = dayjs(a.date);
                        const dateB = dayjs(b.date);

                        // ✅ Same date → sort by start time
                        if (dateA.isSame(dateB, "day")) {
                          const timeA = dayjs(a.startTime, "HH:mm");
                          const timeB = dayjs(b.startTime, "HH:mm");
                          return timeA.isBefore(timeB) ? -1 : 1;
                        }

                        // ✅ Otherwise sort by date
                        return dateA.isBefore(dateB) ? -1 : 1;
                      })
                      .map((holiday, index) => (
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
                                }}
                                value={editHolidayData?.date}
                                onChange={(newValue) => {
                                  setEditHolidayData({
                                    ...editHolidayData,
                                    date: newValue,
                                  });
                                  if (fieldErrors.date) {
                                    const { date, ...rest } = fieldErrors;
                                    setFieldErrors(rest);
                                  }
                                }}
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
                                }}
                                value={editHolidayData?.startTime}
                                onChange={(newValue) => {
                                  setEditHolidayData({
                                    ...editHolidayData,
                                    startTime: newValue,
                                  });
                                  if (fieldErrors.startTime) {
                                    const { startTime, ...rest } = fieldErrors;
                                    setFieldErrors(rest);
                                  }
                                }}
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
                                }}
                                value={editHolidayData?.endTime}
                                onChange={(newValue) => {
                                  setEditHolidayData({
                                    ...editHolidayData,
                                    endTime: newValue,
                                  });
                                  if (fieldErrors.endTime) {
                                    const { endTime, ...rest } = fieldErrors;
                                    setFieldErrors(rest);
                                  }
                                }}
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
                          <TableCell
                            align="center"
                            sx={{ py: 1.5, textAlign: "center" }}
                          >
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
                  background:
                    "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
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
            onClick={() => setHolidayOpen(false)}
            variant="contained"
            sx={{
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              px: 3,
              borderRadius: 3,
              fontSize: "1rem",
              // boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4)",
              // transition: "all 0.3s ease",
            }}
          >
            ✓ Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
