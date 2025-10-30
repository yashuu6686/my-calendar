import dayjs from "dayjs";

/**
 * Generate a payload for calendar publishing using both Redux + local UI state
 */
export const generateCalendarPayload = ({
  selectedServices,
  selectedSpecialities,
  weekSchedule,
  breaks,
  holidays,
  pendingSlots = [],
  breakSelectedDays = [],
  startTime,
  endTime,
  holidayValues = {},
}) => {
  // ✅ Merge pending slots into existing week schedule
  const updatedWeekSchedule = weekSchedule.map((dayItem) => {
    const additionalSlots = pendingSlots
      .filter((slot) => slot.days.includes(dayItem.day))
      .map((slot) => ({
        start: dayjs(slot.start).format("HH:mm"),
        end: dayjs(slot.end).format("HH:mm"),
        serviceType: slot.serviceType,
        speciality: slot.speciality,
      }));

    return {
      ...dayItem,
      slots: [
        ...dayItem.slots.map((s) => ({
          ...s,
          start: dayjs(s.start).format("HH:mm"),
          end: dayjs(s.end).format("HH:mm"),
        })),
        ...additionalSlots,
      ],
    };
  });

  // ✅ Merge any unsaved breaks
  const updatedBreaks = [
    ...breaks,
    ...(breakSelectedDays.length && startTime && endTime
      ? [
          {
            days: breakSelectedDays,
            startTime: dayjs(startTime).format("HH:mm"),
            endTime: dayjs(endTime).format("HH:mm"),
          },
        ]
      : []),
  ];

  // ✅ Merge any unsaved holidays
  const updatedHolidays = [
    ...holidays,
    ...(holidayValues?.date
      ? [
          {
            date: dayjs(holidayValues.date).format("YYYY-MM-DD"),
            startTime: holidayValues.startTime
              ? dayjs(holidayValues.startTime).format("HH:mm")
              : null,
            endTime: holidayValues.endTime
              ? dayjs(holidayValues.endTime).format("HH:mm")
              : null,
          },
        ]
      : []),
  ];

  return {
    services: selectedServices.map((s) => s.type),
    specialities: selectedSpecialities.map((s) => s.type),
    weekSchedule: updatedWeekSchedule,
    breaks: updatedBreaks,
    holidays: updatedHolidays,
  };
};
