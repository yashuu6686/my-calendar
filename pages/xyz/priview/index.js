"use client";
import { Grid, Paper, Box, Typography, Chip } from "@mui/material";
import React, { useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { useSelector } from "react-redux";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

function Preview() {
  const localizer = momentLocalizer(moment);
  const weekSchedule = useSelector(state => state.calendar.weekSchedule);

  const generateTimeSlots = (start, end, intervalMinutes) => {
    const slots = [];
    let current = moment(start);
    while (current.isBefore(end)) {
      const next = moment(current).add(intervalMinutes, "minutes");
      if (next.isAfter(end)) break;
      slots.push({ start: current.toDate(), end: next.toDate() });
      current = next;
    }
    return slots;
  };

  const previewEvents = useMemo(() => {
    const divided = [];
    const today = moment().startOf("day");
    const next7Days = Array.from({ length: 7 }, (_, i) =>
      today.clone().add(i, "days")
    );

    next7Days.forEach((day) => {
      const weekDayName = day.format("dddd");
      const schedule = weekSchedule.find((s) => s.day === weekDayName);
      if (!schedule) return;

      schedule.slots.forEach((slot) => {
        const start = day
          .clone()
          .set({ hour: slot.start.hour(), minute: slot.start.minute() });
        const end = day
          .clone()
          .set({ hour: slot.end.hour(), minute: slot.end.minute() });

        const intervalMinutes = slot.duration || 15;
      const intervals = generateTimeSlots(start, end, intervalMinutes);

        intervals.forEach((i) => {
          divided.push({
            title: "",
            start: i.start,
            end: i.end,
            color: "#1c95f1ff",
             serviceType: slot.serviceType, // ✅ Add service type for reference
          duration: intervalMinutes
          });
        });
      });
    });

    return divided;
  }, [weekSchedule]);

  const eventStyleGetter = () => ({
    style: {
      backgroundColor: "#e3f2fd",
      border: "2px solid #1976d2",
      borderRadius: "12px",
      color: "#000",
      boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      transition: "all 0.3s ease",
    },
  });

  const totalSlots = previewEvents.length;
  const uniqueDays = new Set(
    previewEvents.map((e) => moment(e.start).format("YYYY-MM-DD"))
  ).size;

  return (
    <Box
      sx={{
        bgcolor: "#f9fafb",
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Grid container spacing={3}>
        {/* Header Section */}
        {/* <Grid item xs={12}>
          <Box
            sx={{
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              borderRadius: 4,
              p: 3,
              boxShadow: "0 8px 32px rgba(25, 118, 210, 0.25)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: 3,
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CalendarMonthIcon
                  sx={{ fontSize: 40, color: "white" }}
                />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  Calendar Preview
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.9)",
                    mt: 0.5,
                  }}
                >
                  View your scheduled availability for the upcoming week
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Chip
                icon={<EventAvailableIcon sx={{ color: "white !important" }} />}
                label={`${totalSlots} Available Slots`}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  px: 1,
                  py: 2.5,
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              />
              <Chip
                icon={<CalendarMonthIcon sx={{ color: "white !important" }} />}
                label={`${uniqueDays} Active Days`}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  px: 1,
                  py: 2.5,
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              />
            </Box>
          </Box>
        </Grid> */}

        {/* Calendar Section */}
        <Grid item size={{md:12}} md={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              background: "linear-gradient(to bottom, #ffffff 0%, #f8fbff 100%)",
              border: "2px solid #e3f2fd",
              boxShadow: "0 8px 32px rgba(25, 118, 210, 0.08)",
              "& .rbc-calendar": {
                backgroundColor: "transparent",
              },
              "& .rbc-header": {
                backgroundColor: "#e3f2fd",
                color: "#1565c0",
                fontWeight: 600,
                fontSize: "1rem",
                padding: "16px 8px",
                borderBottom: "2px solid #1976d2",
                borderRadius: "8px 8px 0 0",
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
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "24px",
                border: "2px solid #90caf9",
                "& button": {
                  color: "#1976d2",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "2px solid transparent",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "2px solid #1565c0",
                  },
                  "&.rbc-active": {
                    backgroundColor: "#1976d2",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                  },
                },
              },
              "& .rbc-event": {
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0 6px 16px rgba(25, 118, 210, 0.3)",
                  backgroundColor: "#bbdefb",
                  borderColor: "#1565c0",
                },
              },
            }}
          >
            <Calendar
              localizer={localizer}
              events={previewEvents}
              defaultView="week"
              views={["week"]}
              eventPropGetter={eventStyleGetter}
              // style={{ height: "100vh" }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Preview;