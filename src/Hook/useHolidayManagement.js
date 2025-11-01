// pages/xyz/components/hooks/useHolidayManagement.js
import { useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
  setHolidays,
  deleteHoliday,
} from "@/redux/store/slices/calendarSlice";
import {
  selectHolidays,
  selectWeekSchedule,
} from "@/redux/store/selectors/calendarSelectors";
import { holidayValidationSchema } from "@/utils/validation";

export const useHolidayManagement = () => {
  const dispatch = useDispatch();
  const holidays = useSelector(selectHolidays);
  const weekSchedule = useSelector(selectWeekSchedule);

  const [editingHolidayIndex, setEditingHolidayIndex] = useState(null);
  const [editHolidayData, setEditHolidayData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Sort holidays by date and time
  const sortedHolidays = useMemo(() => {
    return [...holidays].sort((a, b) => {
      const dateA = dayjs(a.date);
      const dateB = dayjs(b.date);
      if (dateA.isSame(dateB, "day")) {
        const timeA = dayjs(a.startTime, "HH:mm");
        const timeB = dayjs(b.startTime, "HH:mm");
        return timeA.isBefore(timeB) ? -1 : 1;
      }
      return dateA.isBefore(dateB) ? -1 : 1;
    });
  }, [holidays]);

  const handleStartHolidayInlineEdit = useCallback((index, holiday) => {
    setEditingHolidayIndex(index);
    setEditHolidayData({
      date: holiday.date ? dayjs(holiday.date) : null,
      startTime: holiday.startTime
        ? dayjs(`2000-01-01 ${holiday.startTime}`)
        : null,
      endTime: holiday.endTime
        ? dayjs(`2000-01-01 ${holiday.endTime}`)
        : null,
    });
    setFieldErrors({});
  }, []);

  const handleCancelHolidayInlineEdit = useCallback(() => {
    setEditingHolidayIndex(null);
    setEditHolidayData(null);
    setFieldErrors({});
  }, []);

  const handleSaveHolidayInlineEdit = useCallback(async () => {
    if (editingHolidayIndex !== null && editHolidayData) {
      try {
        setFieldErrors({});

        const dataToValidate = {
          date: editHolidayData.date,
          startTime: editHolidayData.startTime,
          endTime: editHolidayData.endTime,
        };

        await holidayValidationSchema.validate(dataToValidate, {
          context: {
            existingHolidays: holidays.filter(
              (_, index) => index !== editingHolidayIndex
            ),
            weekSchedule,
          },
          abortEarly: false,
        });

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
        if (error.name === "ValidationError" && error.inner) {
          const newErrors = {};
          error.inner.forEach((err) => {
            newErrors[err.path] = err.message;
          });
          setFieldErrors(newErrors);
        }
      }
    }
  }, [
    editingHolidayIndex,
    editHolidayData,
    holidays,
    weekSchedule,
    dispatch,
  ]);

  const handleDeleteHoliday = useCallback(
    (index) => {
      dispatch(deleteHoliday(index));
    },
    [dispatch]
  );

  const updateHolidayField = useCallback((field, value) => {
    setEditHolidayData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  return {
    sortedHolidays,
    editingHolidayIndex,
    editHolidayData,
    fieldErrors,
    handleStartHolidayInlineEdit,
    handleCancelHolidayInlineEdit,
    handleSaveHolidayInlineEdit,
    handleDeleteHoliday,
    updateHolidayField,
  };
};