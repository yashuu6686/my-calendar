// pages/xyz/components/hooks/useBreakManagement.js
import { useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { setBreaks } from "@/redux/store/slices/calendarSlice";
import { selectBreaks } from "@/redux/store/selectors/calendarSelectors";
import { breakValidationSchema } from "@/utils/validation";

const dayOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const useBreakManagement = () => {
  const dispatch = useDispatch();
  const breaks = useSelector(selectBreaks);

  const [editingBreakIndex, setEditingBreakIndex] = useState(null);
  const [editBreakData, setEditBreakData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Sort breaks by day order and time
  const sortedBreaks = useMemo(() => {
    return breaks
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
        const timeA =
          dayjs(a.startTime).hour() * 60 + dayjs(a.startTime).minute();
        const timeB =
          dayjs(b.startTime).hour() * 60 + dayjs(b.startTime).minute();
        return timeA - timeB;
      });
  }, [breaks]);

  const handleStartInlineEdit = useCallback((index, breakItem) => {
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
  }, []);

  const handleCancelInlineEdit = useCallback(() => {
    setEditingBreakIndex(null);
    setEditBreakData(null);
    setFieldErrors({});
  }, []);

  const handleSaveInlineEdit = useCallback(async () => {
    if (editingBreakIndex !== null && editBreakData) {
      try {
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

        const dataToValidate = {
          breakSelectedDays: [editedDay],
          startTime:
            editBreakData.startTime ||
            dayjs(`2000-01-01 ${breakItem.startTime}`),
          endTime:
            editBreakData.endTime || dayjs(`2000-01-01 ${breakItem.endTime}`),
        };

        const breaksForValidation = breaks
          .map((b, idx) => {
            if (idx === actualBreakIndex) {
              return {
                ...b,
                days: b.days.filter((d, dIdx) => dIdx !== dayIndex),
              };
            }
            return b;
          })
          .filter((b) => b.days.length > 0);

        await breakValidationSchema.validate(dataToValidate, {
          context: {
            breaks: breaksForValidation,
            editIndex: actualBreakIndex,
          },
          abortEarly: false,
        });

        const updated = breaks.map((b, idx) => {
          if (idx === actualBreakIndex) {
            return { ...b, days: [...b.days] };
          }
          return { ...b, days: [...b.days] };
        });

        const currentBreak = updated[actualBreakIndex];
        const timeChanged =
          newStartTime !== breakItem.startTime ||
          newEndTime !== breakItem.endTime;

        if (timeChanged && currentBreak.days.length > 1) {
          currentBreak.days.splice(dayIndex, 1);
          updated.push({
            days: [editedDay],
            startTime: newStartTime,
            endTime: newEndTime,
          });
        } else if (timeChanged && currentBreak.days.length === 1) {
          updated[actualBreakIndex] = {
            ...currentBreak,
            startTime: newStartTime,
            endTime: newEndTime,
          };
        }

        dispatch(setBreaks(updated));
        setEditingBreakIndex(null);
        setEditBreakData(null);
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
  }, [editingBreakIndex, editBreakData, breaks, dispatch]);

  const handleDeleteDay = useCallback(
    (breakIndex, dayIndex) => {
      const updated = breaks.map((b, idx) => ({
        ...b,
        days: [...b.days],
      }));

      const breakItem = updated[breakIndex];
      breakItem.days.splice(dayIndex, 1);

      const finalUpdated = updated.filter((b) => b.days.length > 0);
      dispatch(setBreaks(finalUpdated));
    },
    [breaks, dispatch]
  );

  const updateBreakField = useCallback((field, value) => {
    setEditBreakData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  return {
    sortedBreaks,
    editingBreakIndex,
    editBreakData,
    fieldErrors,
    handleStartInlineEdit,
    handleCancelInlineEdit,
    handleSaveInlineEdit,
    handleDeleteDay,
    updateBreakField,
  };
};