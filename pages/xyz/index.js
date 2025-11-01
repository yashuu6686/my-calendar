"use client";
import React, { useState, useMemo, useCallback, memo } from "react";
import { Box, Grid, Paper } from "@mui/material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useDispatch, useSelector } from "react-redux";

// Components


// Hooks


// Redux
import {
  selectEvents,
  selectIsFieldsDisabled,
  selectWeekSchedule,
} from "@/redux/store/selectors/calendarSelectors";
import {
  setEditingSlot,
  setForm,
  setSelectedDays,
  setStartTime,
  setEndTime,
} from "@/redux/store/slices/calendarSlice";
import CalendarToolbar from "@/components/Calendar/CalendarToolbar";
import EventDetailsDialog from "@/components/Calendar/EventDetailsDialog";
import BreakDialog from "@/components/Calendar/BreakDialog";
import HolidayDialog from "@/components/Calendar/HolidayDialog";
import { useBreakManagement } from "@/Hook/useBreakManagement";
import { useHolidayManagement } from "@/Hook/useHolidayManagement";
import LeftSide from "@/components/Calendar/LeftSide";

const localizer = momentLocalizer(moment);

function CalendarMerge() {
  const dispatch = useDispatch();

  // Redux state
  const events = useSelector(selectEvents);
  const isFieldsDisabled = useSelector(selectIsFieldsDisabled);
  const weekSchedule = useSelector(selectWeekSchedule);

  // Dialog states
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [openBreakDialog, setOpenBreakDialog] = useState(false);
  const [openHolidayDialog, setOpenHolidayDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Custom hooks for break and holiday management
  const breakManagement = useBreakManagement();
  const holidayManagement = useHolidayManagement();

  // Memoize event style getter
  const eventStyleGetter = useMemo(
    () => () => ({
      style: {
        backgroundColor: "#b3e5fc",
        border: "1px solid #0288d1",
        color: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        cursor: isFieldsDisabled ? "not-allowed" : "pointer",
        opacity: isFieldsDisabled ? 0.7 : 1,
        pointerEvents: isFieldsDisabled ? "none" : "auto",
      },
    }),
    [isFieldsDisabled]
  );

  // Event handlers
  const handleEventClick = useCallback((event) => {
    setSelectedEvent(event);
    setOpenEventDialog(true);
  }, []);

  const handleCloseEventDialog = useCallback(() => {
    setOpenEventDialog(false);
    setSelectedEvent(null);
  }, []);

  const handleEdit = useCallback(() => {
    if (!selectedEvent) return;

    const eventDay = moment(selectedEvent.start).format("dddd");
    const daySchedule = weekSchedule.find((d) => d.day === eventDay);

    if (daySchedule) {
      const slot = daySchedule.slots.find((s) => s.id === selectedEvent.id);

      if (slot) {
        dispatch(
          setForm({
            serviceType: slot.serviceType,
            speciality: slot.speciality,
            startTime: dayjs(slot.start.toDate()),
            endTime: dayjs(slot.end.toDate()),
          })
        );

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

        handleCloseEventDialog();
      }
    }
  }, [selectedEvent, weekSchedule, dispatch, handleCloseEventDialog]);

  return (
    <Box bgcolor="#f9fafb" p={1}>
      <Grid container spacing={1}>
        <Grid size={{ md: 3.1, xs: 12, sm: 12 }}>
          <LeftSide />
        </Grid>
        <Grid size={{ md: 8.9, xs: 12, sm: 12 }}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 4,
              "& .rbc-calendar": { backgroundColor: "transparent" },
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
              "& .rbc-today": { backgroundColor: "#f0f7ff" },
              "& .rbc-event-label": { display: "none" },
            }}
          >
            <Calendar
              localizer={localizer}
              events={events}
              defaultView="week"
              views={["day", "week", "month", "agenda"]}
              onSelectEvent={handleEventClick}
              style={{ height: "100vh" }}
              eventPropGetter={eventStyleGetter}
              components={{
                toolbar: (toolbarProps) => (
                  <CalendarToolbar
                    toolbarProps={toolbarProps}
                    isFieldsDisabled={isFieldsDisabled}
                    onBreakClick={() => setOpenBreakDialog(true)}
                    onHolidayClick={() => setOpenHolidayDialog(true)}
                  />
                ),
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Event Details Dialog */}
      <EventDetailsDialog
        open={openEventDialog}
        onClose={handleCloseEventDialog}
        selectedEvent={selectedEvent}
        onEdit={handleEdit}
      />

      {/* Break Dialog */}
      <BreakDialog
        open={openBreakDialog}
        onClose={() => setOpenBreakDialog(false)}
        breakManagement={breakManagement}
      />

      {/* Holiday Dialog */}
      <HolidayDialog
        open={openHolidayDialog}
        onClose={() => setOpenHolidayDialog(false)}
        holidayManagement={holidayManagement}
      />
    </Box>
  );
}

export default memo(CalendarMerge);