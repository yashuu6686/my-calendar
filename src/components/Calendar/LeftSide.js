"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Divider,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";

// Components
import ServiceSelection from "./ServiceSelection";
import SpecialitySelection from "./SpecialitySelection";
import WorkingPlanView from "./WorkingPlanView";
import Break from "./Break";
import Holiday from "./Holiday";
import AddServiceDialog from "./AddServiceDialog";

// Hooks
import { useCalendarValidation } from "@/Hook/useCalendarValidation";

// Redux
import {
  setEditingSlot,
  setForm,
  setSelectedDays,
  addBreak,
  addHoliday,
  setIsCalendarPublished,
  setIsEditMode,
  setLoading,
  setApiError,
  setApiSuccess,
  clearApiMessages,
  createDoctorCalendar,
} from "@/redux/store/slices/calendarSlice";

import {
  selectSelectedServices,
  selectSelectedSpecialities,
  selectWeekSchedule,
  selectBreaks,
  selectHolidays,
  selectIsLoading,
} from "@/redux/store/selectors/calendarSelectors";

import { generateCalendarPayload } from "@/utils/payload";

function LeftSide() {
  const dispatch = useDispatch();

  // Redux state
  const selectedServices = useSelector(selectSelectedServices);
  const selectedSpecialities = useSelector(selectSelectedSpecialities);
  const weekSchedule = useSelector(selectWeekSchedule);
  const breaks = useSelector(selectBreaks);
  const holidays = useSelector(selectHolidays);
  const isLoading = useSelector(selectIsLoading);

  const {
    isCalendarPublished,
    isEditMode,
    editingSlot,
    breakSelectedDays,
    startTime,
    endTime,
    holidayValues,
    holidayEditIndex,
    editIndex,
    apiError,
    apiSuccess,
  } = useSelector((state) => state.calendar);

  // Local state
  const [step, setStep] = useState(1);
  const [openAddService, setOpenAddService] = useState(false);

  // Validation hook
  const {
    slotErrors,
    breakErrors,
    holidayErrors,
    validateAllSlots,
    validateBreaks,
    validateHolidays,
    clearSlotErrors,
  } = useCalendarValidation();

  // Handle API messages
  useEffect(() => {
    if (apiSuccess) {
      setTimeout(() => dispatch(clearApiMessages()), 3000);
    }
  }, [apiSuccess, dispatch]);

  useEffect(() => {
    if (apiError) {
      setTimeout(() => dispatch(clearApiMessages()), 5000);
    }
  }, [apiError, dispatch]);

  // API functions
  const publishCalendarToAPI = async (payload) => {
    try {
      dispatch(setLoading(true));
      await new Promise((resolve) => setTimeout(resolve, 1500));
      dispatch(setApiSuccess("Calendar published successfully!"));
      dispatch(setLoading(false));
      return { success: true };
    } catch (error) {
      dispatch(setApiError("Failed to publish calendar"));
      dispatch(setLoading(false));
      return { success: false };
    }
  };

  const updateCalendarToAPI = async (payload) => {
    try {
      dispatch(setLoading(true));
      await new Promise((resolve) => setTimeout(resolve, 1500));
      dispatch(setApiSuccess("Calendar updated successfully!"));
      dispatch(setLoading(false));
      return { success: true };
    } catch (error) {
      dispatch(setApiError("Failed to update calendar"));
      dispatch(setLoading(false));
      return { success: false };
    }
  };

  const handleLogValues = () => {
    if (breakSelectedDays.length > 0 && startTime && endTime) {
      const newBreak = {
        days: breakSelectedDays,
        startTime: dayjs(startTime).format("HH:mm"),
        endTime: dayjs(endTime).format("HH:mm"),
      };
      dispatch(addBreak(newBreak));
    }
  };

  const logHolidayValues = () => {
    if (
      holidayValues.date &&
      holidayValues.startTime &&
      holidayValues.endTime
    ) {
      const newHoliday = {
        date: dayjs(holidayValues.date).format("YYYY-MM-DD"),
        startTime: dayjs(holidayValues.startTime).format("HH:mm"),
        endTime: dayjs(holidayValues.endTime).format("HH:mm"),
      };
      dispatch(addHoliday(newHoliday));
    }
  };

  const handleSubmit = async () => {
    // Handle editing slot
    if (editingSlot) {
      clearSlotErrors();

      const { hasInvalidSlots } = await validateAllSlots(
        weekSchedule,
        selectedServices
      );

      if (hasInvalidSlots) {
        return;
      }

      dispatch(setEditingSlot(null));
      dispatch(setForm({}));
      dispatch(setSelectedDays([]));
      alert("Slot updated successfully!");
      return;
    }

    // Step 1: Validate slots
    if (step === 1) {
      clearSlotErrors();

      const hasSlots = weekSchedule.some((day) => day.slots.length > 0);

      if (!hasSlots) {
        alert("Please add at least one time slot before proceeding.");
        return;
      }

      const { hasInvalidSlots } = await validateAllSlots(
        weekSchedule,
        selectedServices
      );

      if (hasInvalidSlots) {
        return;
      }

      setStep(2);
    }
    // Step 2: Validate breaks/holidays and publish
    else if (step === 2) {
      const hasHolidayData =
        holidayValues.date || holidayValues.startTime || holidayValues.endTime;
      const hasBreakData =
        breakSelectedDays.length > 0 || startTime || endTime;

      let validationFailed = false;

      // Validate breaks
      if (hasBreakData) {
        const { isValid } = await validateBreaks(
          breakSelectedDays,
          startTime,
          endTime,
          breaks,
          editIndex
        );
        if (!isValid) validationFailed = true;
      }

      // Validate holidays
      if (hasHolidayData) {
        const { isValid } = await validateHolidays(
          holidayValues,
          holidays,
          holidayEditIndex,
          weekSchedule
        );
        if (!isValid) validationFailed = true;
      }

      if (validationFailed) {
        return;
      }

      // Save breaks and holidays
      handleLogValues();
      logHolidayValues();

      dispatch(setIsCalendarPublished(true));
      dispatch(setIsEditMode(false));
      dispatch(setForm({}));
      dispatch(setSelectedDays([]));
      dispatch(setEditingSlot(null));

      const payload = generateCalendarPayload({
        selectedServices,
        selectedSpecialities,
        weekSchedule,
        breaks,
        holidays,
        breakSelectedDays,
        startTime,
        endTime,
        holidayValues,
      });

      console.log("📦 Generated Payload:", payload);

      let result;
      if (isCalendarPublished) {
        result = await updateCalendarToAPI(payload);
      } else {
        result = await publishCalendarToAPI(payload);
      }

      if (result.success) {
        dispatch(setIsCalendarPublished(true));
        dispatch(setIsEditMode(false));
        dispatch(setForm({}));
        dispatch(setSelectedDays([]));
        dispatch(setEditingSlot(null));
        dispatch(createDoctorCalendar());
        setStep(1);
      }

      setStep(1);
    }
  };

  const isFieldsDisabled = isCalendarPublished && !isEditMode;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 4,
        height: "107vh !important",
        overflowY: "auto",
        top: 0,
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        msOverflowStyle: "none",
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <CircularProgress size={60} sx={{ color: "#fff", mb: 2 }} />
          <Typography
            sx={{ color: "#fff", fontSize: "1.2rem", fontWeight: 600 }}
          >
            {isCalendarPublished
              ? "🔄 Updating Calendar..."
              : "📅 Publishing Calendar..."}
          </Typography>
        </Box>
      )}

      {apiError && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            bgcolor: "#ffebee",
            borderRadius: 2,
            border: "1px solid #ef5350",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography
            sx={{ color: "#c62828", fontWeight: 600, fontSize: "0.9rem" }}
          >
            ⚠️ {apiError}
          </Typography>
        </Box>
      )}

      <Box>
        {(step === 1 || step === 3) && (
          <Box>
            <Box
              sx={{
                background:
                  "linear-gradient(135deg, #227fdbff 0%, #3285e3ff 0%)",
                p: 1,
                borderRadius: 3,
                mb: 2,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: "white",
                  fontWeight: 200,
                  letterSpacing: 0.2,
                }}
              >
                My Calendar
              </Typography>
            </Box>
            <Divider sx={{ my: 2, borderColor: "#bbdefb" }} />

            <ServiceSelection
              isFieldsDisabled={isFieldsDisabled}
              onAddServiceClick={() => setOpenAddService(true)}
            />

            <Divider sx={{ my: 2, borderColor: "#bbdefb" }} />

            <SpecialitySelection isFieldsDisabled={isFieldsDisabled} />

            <Divider sx={{ my: 2, borderColor: "#bbdefb" }} />

            <WorkingPlanView slotErrors={slotErrors} />
          </Box>
        )}

        {step === 2 && (
          <>
            <Break errors={breakErrors} />
            <Divider sx={{ my: 2, borderColor: "#bbdefb" }} />
            <Holiday errors={holidayErrors} />
          </>
        )}

        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "end" }}>
            {isCalendarPublished && !isEditMode && (
              <Button
                variant="contained"
                onClick={() => dispatch(setIsEditMode(true))}
                sx={{ mr: 1 }}
              >
                ✏️ Edit
              </Button>
            )}
            {step === 2 && (
              <Button
                variant="outlined"
                sx={{
                  mr: 0.5,
                  borderRadius: 2.5,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
                onClick={() => setStep(1)}
              >
                Back
              </Button>
            )}
            {(!isCalendarPublished || isEditMode) && (
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  background:
                    "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  borderRadius: 2.5,
                  fontSize: "1rem",
                }}
              >
                {editingSlot
                  ? "Update"
                  : step === 1
                  ? "Next"
                  : isCalendarPublished
                  ? "Update Calendar"
                  : "Publish Calendar"}
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <AddServiceDialog
        open={openAddService}
        onClose={() => setOpenAddService(false)}
      />
    </Paper>
  );
}

export default LeftSide;