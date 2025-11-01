// src/components/Calendar/hooks/useCalendarValidation.js
import { useState } from "react";
import dayjs from "dayjs";
import * as yup from "yup";
import {
  breakValidationSchema,
  holidayValidationSchema,
} from "@/utils/validation";

export const useCalendarValidation = () => {
  const [slotErrors, setSlotErrors] = useState({});
  const [breakErrors, setBreakErrors] = useState({});
  const [holidayErrors, setHolidayErrors] = useState({});

  // Single slot validation schema
  const singleSlotSchema = yup.object().shape({
    serviceType: yup.string().required("Service type is required"),
    startTime: yup.mixed().required("Start time is required"),
    endTime: yup
      .mixed()
      .required("End time is required")
      .test("is-after", "End time must be after start time", function (value) {
        const { startTime } = this.parent;
        return value && startTime ? dayjs(value).isAfter(dayjs(startTime)) : true;
      })
      .test(
        "minimum-duration",
        "Slot duration must be at least the service duration",
        function (endTime) {
          const { startTime, serviceType, selectedServices } = this.options.context;
          if (!startTime || !endTime || !serviceType) return true;

          const selectedService = selectedServices.find(
            (s) => s.type === serviceType
          );
          if (!selectedService) return true;

          const requiredMinutes = parseInt(selectedService.time);
          const start = dayjs(startTime);
          const end = dayjs(endTime);
          const slotDurationMinutes = end.diff(start, "minute");

          if (slotDurationMinutes < requiredMinutes) {
            return this.createError({
              message: `Min ${requiredMinutes} mins needed`,
            });
          }
          return true;
        }
      ),
  });

  // Validate all slots in weekSchedule
  const validateAllSlots = async (weekSchedule, selectedServices) => {
    let hasInvalidSlots = false;
    const newSlotErrors = {};

    for (const dayData of weekSchedule) {
      for (const slot of dayData.slots) {
        try {
          await singleSlotSchema.validate(
            {
              startTime: slot.start,
              endTime: slot.end,
              serviceType: slot.serviceType,
            },
            {
              abortEarly: false,
              context: { selectedServices },
            }
          );
        } catch (err) {
          hasInvalidSlots = true;
          if (!newSlotErrors[dayData.day]) {
            newSlotErrors[dayData.day] = {};
          }
          if (!newSlotErrors[dayData.day][slot.id]) {
            newSlotErrors[dayData.day][slot.id] = {};
          }
          if (err.inner) {
            err.inner.forEach((e) => {
              newSlotErrors[dayData.day][slot.id][e.path] = e.message;
            });
          } else {
            newSlotErrors[dayData.day][slot.id][err.path || "general"] =
              err.message;
          }
        }
      }

      // Check for overlapping slots within the same day
      if (dayData.slots.length > 1) {
        for (let i = 0; i < dayData.slots.length; i++) {
          for (let j = i + 1; j < dayData.slots.length; j++) {
            const slot1 = dayData.slots[i];
            const slot2 = dayData.slots[j];

            if (slot1.start && slot1.end && slot2.start && slot2.end) {
              const start1 = dayjs(slot1.start);
              const end1 = dayjs(slot1.end);
              const start2 = dayjs(slot2.start);
              const end2 = dayjs(slot2.end);

              if (start1.isBefore(end2) && end1.isAfter(start2)) {
                hasInvalidSlots = true;
                if (!newSlotErrors[dayData.day]) {
                  newSlotErrors[dayData.day] = {};
                }
                if (!newSlotErrors[dayData.day][slot1.id]) {
                  newSlotErrors[dayData.day][slot1.id] = {};
                }
                if (!newSlotErrors[dayData.day][slot2.id]) {
                  newSlotErrors[dayData.day][slot2.id] = {};
                }
                newSlotErrors[dayData.day][slot1.id].endTime =
                  "Time slots overlap";
                newSlotErrors[dayData.day][slot2.id].endTime =
                  "Time slots overlap";
              }
            }
          }
        }
      }
    }

    setSlotErrors(newSlotErrors);
    return { hasInvalidSlots, slotErrors: newSlotErrors };
  };

  // Validate breaks
  const validateBreaks = async (
    breakSelectedDays,
    startTime,
    endTime,
    breaks,
    editIndex
  ) => {
    try {
      await breakValidationSchema.validate(
        {
          breakSelectedDays,
          startTime,
          endTime,
        },
        {
          abortEarly: false,
          context: {
            breaks: breaks,
            editIndex: editIndex,
          },
        }
      );
      setBreakErrors({});
      return { isValid: true, errors: {} };
    } catch (breakErr) {
      if (breakErr.inner) {
        const newBreakErrors = {};
        breakErr.inner.forEach((e) => {
          newBreakErrors[e.path] = e.message;
        });
        setBreakErrors(newBreakErrors);
        return { isValid: false, errors: newBreakErrors };
      }
      return { isValid: false, errors: {} };
    }
  };

  // Validate holidays
  const validateHolidays = async (
    holidayValues,
    holidays,
    holidayEditIndex,
    weekSchedule
  ) => {
    try {
      const existingHolidaysForValidation =
        holidayEditIndex !== null && holidayEditIndex !== undefined
          ? holidays.filter((_, index) => index !== holidayEditIndex)
          : holidays;

      await holidayValidationSchema.validate(
        {
          date: holidayValues.date,
          startTime: holidayValues.startTime,
          endTime: holidayValues.endTime,
        },
        {
          abortEarly: false,
          context: {
            existingHolidays: existingHolidaysForValidation,
            weekSchedule,
          },
        }
      );
      setHolidayErrors({});
      return { isValid: true, errors: {} };
    } catch (holidayErr) {
      if (holidayErr.inner) {
        const newHolidayErrors = {};
        holidayErr.inner.forEach((e) => {
          newHolidayErrors[e.path] = e.message;
        });
        setHolidayErrors(newHolidayErrors);
        return { isValid: false, errors: newHolidayErrors };
      }
      return { isValid: false, errors: {} };
    }
  };

  const clearSlotErrors = () => setSlotErrors({});
  const clearBreakErrors = () => setBreakErrors({});
  const clearHolidayErrors = () => setHolidayErrors({});

  return {
    slotErrors,
    breakErrors,
    holidayErrors,
    validateAllSlots,
    validateBreaks,
    validateHolidays,
    clearSlotErrors,
    clearBreakErrors,
    clearHolidayErrors,
  };
};