"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Divider,
  Paper,
  Button,
  TextField,
  MenuItem,
  Checkbox,
  ListItemText,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Chip,
} from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import * as yup from "yup";
import CommonButton from "@/components/CommonButton";
import Break from "./Break";
import Holiday from "./Holiday";
import {
  addServiceSchema,
  breakValidationSchema,
  holidayValidationSchema,
} from "@/utils/validation";

// Redux actions
import {
  toggleService,
  toggleSpeciality,
  addNewService,
  setSelectedDays,
  setBreakSelectedDays,
  setForm,
  setStartTime,
  setEndTime,
  addSlot,
  setEditingSlot,
  addBreak,
  addHoliday,
  setIsCalendarPublished,
  setIsEditMode,
  setLoading,
  setApiError,
  setApiSuccess,
  clearApiMessages,
  updateEvents,
  setBreaks,
  setHolidays,
  setHolidayValues,
  setEditIndex,
  setHolidayEditIndex,
  createDoctorCalendar,
  //  updateEvents,
} from "@/redux/store/slices/calendarSlice";

// Redux selectors
import {
  selectAllServices,
  selectSelectedServices,
  selectSpecialities,
  selectSelectedSpecialities,
  selectWeekSchedule,
  selectForm,
  selectSelectedDays,
  selectBreaks,
  selectHolidays,
  selectIsLoading,
} from "@/redux/store/slices/calendarSlice";
import { generateCalendarPayload } from "@/utils/payload";
import WorkingPlanView from "./WorkingPlanView";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function LeftSide() {
  const dispatch = useDispatch();

  // Redux state
  const dataOfService = useSelector(selectAllServices);
  const selectedServices = useSelector(selectSelectedServices);
  const specialities = useSelector(selectSpecialities);
  const selectedSpecialities = useSelector(selectSelectedSpecialities);
  const weekSchedule = useSelector(selectWeekSchedule);
  const form = useSelector(selectForm);
  const selectedDays = useSelector(selectSelectedDays);
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
  const [slotErrors, setSlotErrors] = useState({});
  const [errors, setErrors] = useState({});
  const [holidayErrors, setHolidayErrors] = useState({});
  const [breakErrors, setBreakErrors] = useState({});
  const [step, setStep] = useState(1);
  const [pendingSlots, setPendingSlots] = useState([]);
  const [openAddService, setopenAddService] = useState(false);
  const [newServiceData, setNewServiceData] = useState({
    name: "",
    duration: "",
    type: "",
  });
  const [addServiceError, setAddServiceError] = useState({});

  // Validation schema for slots
  // const slotSchema = yup.object().shape({
  //   serviceType: yup.string().required("Service type is required"),
  //   // speciality: yup.string().required("Speciality is required"),
  //   startTime: yup.mixed().required("Start time is required"),
  //   endTime: yup
  //     .mixed()
  //     .required("End time is required")
  //     .test("is-after", "End time must be after start time", function (value) {
  //       const { startTime } = this.parent;
  //       return value && startTime
  //         ? dayjs(value).isAfter(dayjs(startTime))
  //         : true;
  //     })
  //     .test(
  //       "minimum-duration",
  //       "Slot duration must be at least the service duration",
  //       function (endTime) {
  //         const { startTime, serviceType } = this.parent;
  //         if (!startTime || !endTime || !serviceType) return true;

  //         const selectedService = dataOfService.find(
  //           (s) => s.type === serviceType
  //         );
  //         if (!selectedService) return true;

  //         const requiredMinutes = selectedService.time;
  //         const start = dayjs(startTime);
  //         const end = dayjs(endTime);
  //         const slotDurationMinutes = end.diff(start, "minute");

  //         if (slotDurationMinutes < requiredMinutes) {
  //           return this.createError({
  //             message: `Please select valid Start Time & End Time.`,
  //           });
  //         }

  //         return true;
  //       }
  //     )
  //     .test(
  //       "no-overlap",
  //       "This time slot is already booked.",
  //       function (endTime) {
  //         const { startTime } = this.parent;
  //         if (!startTime || !endTime || !selectedDays.length) return true;

  //         const newStart = dayjs(startTime);
  //         const newEnd = dayjs(endTime);

  //         return !selectedDays.some((day) => {
  //           const dayData = weekSchedule.find((d) => d.day === day);
  //           return dayData?.slots.some((slot) => {
  //             if (editingSlot && slot.id === editingSlot.id) {
  //               return false;
  //             }
  //             return (
  //               newStart.isBefore(dayjs(slot.end)) &&
  //               newEnd.isAfter(dayjs(slot.start))
  //             );
  //           });
  //         });
  //       }
  //     ),
  // });

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
            const { startTime, serviceType } = this.parent;
            if (!startTime || !endTime || !serviceType) return true;

            const selectedService = selectedServices.find((s) => s.type === serviceType);
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
    

  // Update slot action (add this to Redux slice if not present)
  const updateSlot = (days, slotId, updatedSlot) => {
    dispatch({
      type: "calendar/updateSlot",
      payload: { days, slotId, updatedSlot },
    });
  };

  // API functions (implement these based on your backend)
  const publishCalendarToAPI = async (payload) => {
    try {
      dispatch(setLoading(true));
      // Replace with actual API call
      // const response = await fetch('/api/calendar/publish', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });

      // Simulated API call
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
      // Replace with actual API call
      // const response = await fetch('/api/calendar/update', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });

      // Simulated API call
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

  // const generateCalendarPayload = () => {
  //   return {
  //     services: selectedServices,
  //     specialities: selectedSpecialities,
  //     weekSchedule: weekSchedule,
  //     breaks: breaks,
  //     holidays: holidays,
  //   };
  // };

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

  const handleAddService = async () => {
    try {
      setAddServiceError({});

      await addServiceSchema.validate(newServiceData, { abortEarly: false });

      dispatch(
        addNewService({
          serviceName: newServiceData.name,
          duration: newServiceData.duration,
          serviceType: newServiceData.type,
        })
      );

      setNewServiceData({ name: "", duration: "", type: "" });
      handleClose();
      alert("Service added successfully!");
    } catch (err) {
      if (err.inner) {
        const newErrors = {};
        err.inner.forEach((e) => {
          newErrors[e.path] = e.message;
        });
        setAddServiceError(newErrors);
      }
    }
  };

  const handleFieldChange = (field, value) => {
    setNewServiceData({ ...newServiceData, [field]: value });

    if (addServiceError[field]) {
      setAddServiceError({ ...addServiceError, [field]: "" });
    }
  };

  const handleClose = () => {
    setNewServiceData({ name: "", duration: "", type: "" });
    setopenAddService(false);
  };

  // const handleSubmit = async () => {
  //   if (step === 1 || editingSlot) {
  //     try {
  //       setErrors({});
  //       await slotSchema.validate(form, { abortEarly: false });

  //       const newSlot = {
  //         start: form.startTime,
  //         end: form.endTime,
  //         serviceType: form.serviceType,
  //         speciality: form.speciality,
  //         days: selectedDays,
  //       };

  //       if (editingSlot) {
  //         updateSlot(selectedDays, editingSlot.id, newSlot);
  //         dispatch(setEditingSlot(null));
  //         dispatch(setForm({}));
  //         dispatch(setSelectedDays([]));
  //         alert("Slot updated successfully!");
  //       } else {
  //         setPendingSlots((prev) => [...prev, { id: Date.now(), ...newSlot }]);
  //         setStep(2);
  //       }
  //     } catch (err) {
  //       if (err.inner) {
  //         const newErrors = {};
  //         err.inner.forEach((e) => {
  //           newErrors[e.path] = e.message;
  //         });
  //         setErrors(newErrors);
  //       }
  //     }
  //   } // Replace your step 2 validation in handleSubmit with this:
  //   else if (step === 2) {
  //     setErrors({});
  //     setHolidayErrors({});
  //     setBreakErrors({});

  //     const hasHolidayData =
  //       holidayValues.date || holidayValues.startTime || holidayValues.endTime;
  //     const hasBreakData = breakSelectedDays.length > 0 || startTime || endTime;

  //     let validationFailed = false;

  //     // ✅ Validate BREAKS first
  //     if (hasBreakData) {
  //       try {
  //         console.log("🔍 Validating Break...");
  //         console.log("Break Selected Days:", breakSelectedDays);
  //         console.log("Start Time:", startTime);
  //         console.log("End Time:", endTime);
  //         console.log("Existing Breaks:", breaks);
  //         console.log("Edit Index:", editIndex);

  //         await breakValidationSchema.validate(
  //           {
  //             breakSelectedDays,
  //             startTime,
  //             endTime,
  //           },
  //           {
  //             abortEarly: false,
  //             context: {
  //               breaks: breaks,
  //               editIndex: editIndex,
  //             },
  //           }
  //         );

  //         console.log("✅ Break validation passed!");
  //       } catch (breakErr) {
  //         validationFailed = true;
  //         console.log("❌ Break validation failed:", breakErr);

  //         if (breakErr.inner) {
  //           const newBreakErrors = {};
  //           breakErr.inner.forEach((e) => {
  //             newBreakErrors[e.path] = e.message;
  //           });
  //           setBreakErrors(newBreakErrors);
  //           console.log("Break Errors:", newBreakErrors);

  //           // ✅ Show first error message
  //           const firstError = Object.values(newBreakErrors)[0];
  //           // alert("Break validation failed: " + firstError);
  //         } else {
  //           // ✅ Handle single error
  //           // alert("Break validation failed: " + breakErr.message);
  //         }
  //       }
  //     }

  //     // ✅ Validate HOLIDAYS
  //     if (hasHolidayData) {
  //       try {
  //         console.log("🔍 Validating Holiday...");
  //         console.log("Holiday Values:", holidayValues);
  //         console.log("Existing Holidays:", holidays);
  //         console.log("Holiday Edit Index:", holidayEditIndex);

  //         // ✅ IMPORTANT: Filter out the holiday being edited
  //         const existingHolidaysForValidation =
  //           holidayEditIndex !== null && holidayEditIndex !== undefined
  //             ? holidays.filter((_, index) => index !== holidayEditIndex)
  //             : holidays;

  //         await holidayValidationSchema.validate(
  //           {
  //             date: holidayValues.date,
  //             startTime: holidayValues.startTime,
  //             endTime: holidayValues.endTime,
  //           },
  //           {
  //             abortEarly: false,
  //             context: {
  //               existingHolidays: existingHolidaysForValidation,
  //               weekSchedule,
  //             },
  //           }
  //         );

  //         console.log("✅ Holiday validation passed!");
  //       } catch (holidayErr) {
  //         validationFailed = true;
  //         console.log("❌ Holiday validation failed:", holidayErr);

  //         if (holidayErr.inner) {
  //           const newHolidayErrors = {};
  //           holidayErr.inner.forEach((e) => {
  //             newHolidayErrors[e.path] = e.message;
  //           });
  //           setHolidayErrors(newHolidayErrors);
  //           console.log("Holiday Errors:", newHolidayErrors);

  //           // ✅ Show first error message
  //           const firstError = Object.values(newHolidayErrors)[0];
  //           // alert("Holiday validation failed: " + firstError);
  //         } else {
  //           // ✅ Handle single error
  //           // alert("Holiday validation failed: " + holidayErr.message);
  //         }
  //       }
  //     }

  //     // ✅ Stop if validation failed
  //     if (validationFailed) {
  //       console.log("❌ Validation failed, stopping submission");
  //       return;
  //     }

  //     // ✅ Check for slot conflicts
  //     const hasConflict = pendingSlots.some((slot) => {
  //       return slot.days.some((day) => {
  //         const dayData = weekSchedule.find((d) => d.day === day);
  //         return dayData?.slots.some((existing) => {
  //           return (
  //             dayjs(slot.start).isBefore(dayjs(existing.end)) &&
  //             dayjs(slot.end).isAfter(dayjs(existing.start))
  //           );
  //         });
  //       });
  //     });

  //     if (hasConflict) {
  //       alert(
  //         "Some slots overlap with already booked slots. Please adjust before publishing."
  //       );
  //       setStep(1);
  //       return;
  //     }

  //     // ✅ Add all pending slots
  //     pendingSlots.forEach((slot) => {
  //       dispatch(
  //         addSlot({
  //           days: slot.days,
  //           startTime: slot.start,
  //           endTime: slot.end,
  //           serviceType: slot.serviceType,
  //           speciality: slot.speciality,
  //         })
  //       );
  //     });
  //     dispatch(updateEvents());

  //     // ✅ Save breaks and holidays (this will add them to Redux state)
  //     handleLogValues();
  //     logHolidayValues();

  //     // ✅ Update calendar state
  //     dispatch(setIsCalendarPublished(true));
  //     dispatch(setIsEditMode(false));
  //     setPendingSlots([]);
  //     dispatch(setForm({}));
  //     dispatch(setSelectedDays([]));
  //     dispatch(setEditingSlot(null));

  //     const payload = generateCalendarPayload({
  //       selectedServices,
  //       selectedSpecialities,
  //       weekSchedule,
  //       breaks,
  //       holidays,
  //       breakSelectedDays,
  //       startTime,
  //       endTime,
  //       holidayValues,
  //     });

  //     console.log("📦 Generated Payload:", payload);

  //     // ✅ Call API
  //     setTimeout(async () => {
  //       let result;
  //       if (isCalendarPublished) {
  //         console.log("🔄 Updating calendar...");
  //         result = await updateCalendarToAPI(payload);
  //       } else {
  //         console.log("📅 Publishing new calendar...");
  //         result = await publishCalendarToAPI(payload);
  //       }

  //       if (result.success) {
  //         dispatch(setIsCalendarPublished(true));
  //         dispatch(setIsEditMode(false));
  //         setPendingSlots([]);
  //         dispatch(setForm({}));
  //         dispatch(setSelectedDays([]));
  //         dispatch(setEditingSlot(null));
  //         dispatch(createDoctorCalendar());
  //         setStep(1);
  //       } else {
  //         console.error("❌ API call failed, staying on step 2");
  //       }
  //     }, 600);

  //     setStep(1);
  //   }
  // };

  const handleSubmit = async () => {
  // ✅ Handle EDITING SLOT case FIRST (before step logic)
  if (editingSlot) {
    // Clear previous errors
    setErrors({});
    setSlotErrors({});
    
    // Build errors for the slots being edited
    let hasInvalidSlots = false;
    const newSlotErrors = {};
    
    
    // Validate all slots in weekSchedule
    for (const dayData of weekSchedule) {
      for (const slot of dayData.slots) {
        try {
          await singleSlotSchema.validate(
            {
              startTime: slot.start,
              endTime: slot.end,
              serviceType: slot.serviceType,
            },
            { abortEarly: false }
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
            newSlotErrors[dayData.day][slot.id][err.path || 'general'] = err.message;
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
                newSlotErrors[dayData.day][slot1.id].endTime = "Time slots overlap";
                newSlotErrors[dayData.day][slot2.id].endTime = "Time slots overlap";
              }
            }
          }
        }
      }
    }
    
    if (hasInvalidSlots) {
      setSlotErrors(newSlotErrors);
      const firstErrorDay = Object.keys(newSlotErrors)[0];
      if (firstErrorDay) {
        const firstSlotErrors = Object.values(newSlotErrors[firstErrorDay])[0];
        const firstErrorField = Object.keys(firstSlotErrors)[0];
        const firstErrorMessage = firstSlotErrors[firstErrorField];
        // alert(`Validation Error on ${firstErrorDay}: ${firstErrorMessage}`);
      }
      return;
    }
    
    // ✅ If validation passes, update events and clear editing state
    dispatch(updateEvents());
    dispatch(setEditingSlot(null));
    dispatch(setForm({}));
    dispatch(setSelectedDays([]));
    setSlotErrors({});
    alert("Slot updated successfully!");
    return; // ✅ IMPORTANT: Stop here, don't go to step 2
  }
  
  // ✅ NOW handle step 1 (adding new slots)
  if (step === 1) {
    setErrors({});
    setSlotErrors({});
    
    const hasSlots = weekSchedule.some(day => day.slots.length > 0);
    
    if (!hasSlots) {
      alert("Please add at least one time slot before proceeding.");
      return;
    }
    
    let hasInvalidSlots = false;
    const newSlotErrors = {};
    
    // const singleSlotSchema = yup.object().shape({
    //   serviceType: yup.string().required("Service type is required"),
    //   startTime: yup.mixed().required("Start time is required"),
    //   endTime: yup
    //     .mixed()
    //     .required("End time is required")
    //     .test("is-after", "End time must be after start time", function (value) {
    //       const { startTime } = this.parent;
    //       return value && startTime ? dayjs(value).isAfter(dayjs(startTime)) : true;
    //     })
    //     .test(
    //       "minimum-duration",
    //       "Slot duration must be at least the service duration",
    //       function (endTime) {
    //         const { startTime, serviceType } = this.parent;
    //         if (!startTime || !endTime || !serviceType) return true;

    //         const selectedService = selectedServices.find((s) => s.type === serviceType);
    //         if (!selectedService) return true;

    //         const requiredMinutes = parseInt(selectedService.time);
    //         const start = dayjs(startTime);
    //         const end = dayjs(endTime);
    //         const slotDurationMinutes = end.diff(start, "minute");

    //         if (slotDurationMinutes < requiredMinutes) {
    //           return this.createError({
    //             message: `Min ${requiredMinutes} mins needed`,
    //           });
    //         }
    //         return true;
    //       }
    //     ),
    // });
    
    // Validate each slot
    for (const dayData of weekSchedule) {
      for (const slot of dayData.slots) {
        try {
          await singleSlotSchema.validate(
            {
              startTime: slot.start,
              endTime: slot.end,
              serviceType: slot.serviceType,
            },
            { abortEarly: false }
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
            newSlotErrors[dayData.day][slot.id][err.path || 'general'] = err.message;
          }
        }
      }
      
      // Check overlaps
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
                newSlotErrors[dayData.day][slot1.id].endTime = "Time slots overlap";
                newSlotErrors[dayData.day][slot2.id].endTime = "Time slots overlap";
              }
            }
          }
        }
      }
    }
    
    if (hasInvalidSlots) {
      setSlotErrors(newSlotErrors);
      const firstErrorDay = Object.keys(newSlotErrors)[0];
      if (firstErrorDay) {
        // const firstSlotErrors = Object.values(newSlotErrors[firstErrorDay])[0];
        // const firstErrorField = Object.keys(firstSlotErrors)[0];
        // const firstErrorMessage = firstSlotErrors[firstErrorField];
        // alert(`Validation Error on ${firstErrorDay}: ${firstErrorMessage}`);
      }
      return;
    }
    
    setSlotErrors({});
    setStep(2); // Move to step 2 for breaks/holidays
    
  } else if (step === 2) {
    // Your existing step 2 code remains the same...
    setErrors({});
    setHolidayErrors({});
    setBreakErrors({});

    const hasHolidayData =
      holidayValues.date || holidayValues.startTime || holidayValues.endTime;
    const hasBreakData = breakSelectedDays.length > 0 || startTime || endTime;

    let validationFailed = false;

    if (hasBreakData) {
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
      } catch (breakErr) {
        validationFailed = true;
        if (breakErr.inner) {
          const newBreakErrors = {};
          breakErr.inner.forEach((e) => {
            newBreakErrors[e.path] = e.message;
          });
          setBreakErrors(newBreakErrors);
        }
      }
    }

    if (hasHolidayData) {
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
      } catch (holidayErr) {
        validationFailed = true;
        if (holidayErr.inner) {
          const newHolidayErrors = {};
          holidayErr.inner.forEach((e) => {
            newHolidayErrors[e.path] = e.message;
          });
          setHolidayErrors(newHolidayErrors);
        }
      }
    }

    if (validationFailed) {
      return;
    }

    dispatch(updateEvents());
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

    // setTimeout(async () => {
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
    // }, 600);

    setStep(1);
  }
};
  const handleChange = (field, value) => {
    dispatch(setForm({ ...form, [field]: value }));
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const isFieldsDisabled = isCalendarPublished && !isEditMode;
  const allSelected = selectedDays.length === days.length;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 4,
        height: "107vh !important", // limit container height
        overflowY: "auto",
        // border: "2px solid black",
        // position: "sticky",
        top: 0,
        scrollbarWidth: "none", // Firefox
    "&::-webkit-scrollbar": {
      display: "none", // Chrome, Safari, Edge
    },
    msOverflowStyle: "none",

        // background: "linear-gradient(to bottom, #ffffff 0%, #f8fbff 100%)",
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
            // zIndex: 9999,
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

            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "rgb(198, 228, 251)",
                  p: "10px",
                  borderRadius: 3,
                  border: "1px solid #90caf9",
                  mb: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "#1565c0",
                    fontWeight: 400,
                  }}
                >
                  Service Type
                </Typography>
                <Button
                  disabled={isFieldsDisabled}
                  variant="contained"
                  onClick={() => setopenAddService(true)}
                  sx={{
                    textTransform: "none",
                    background: "#1172BA",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    px: 1,
                  }}
                >
                  Add Service
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                {dataOfService.map((item, i) => {
                  const isSelected = selectedServices.some(
                    (s) => s.type === item.type
                  );
                  return (
                    <CommonButton
                      disabled={isFieldsDisabled}
                      key={i}
                      src={item.img}
                      isSelected={isSelected}
                      onClick={() => dispatch(toggleService(item))}
                      sx={{
                        textTransform: "none",
                        border: isSelected
                          ? "2px solid #1976d2"
                          : "1px solid #bbdefb",
                        boxShadow: isSelected
                          ? "0 4px 16px rgba(25, 118, 210, 0.25)"
                          : "0 2px 8px rgba(0, 0, 0, 0.08)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 6px 20px rgba(25, 118, 210, 0.3)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: isSelected ? "#1565c0" : "#1565c0",
                        }}
                      >
                        {item.type}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.65rem",
                          color: isSelected ? "#1976d2" : "#1976d2",
                        }}
                      >
                        {item.time} Minutes
                      </Typography>
                    </CommonButton>
                  );
                })}
              </Box>
            </Box>

            <Divider sx={{ my: 2, borderColor: "#bbdefb" }} />

            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  background: "rgb(198, 228, 251)",
                  p: 1,
                  borderRadius: 3,
                  border: "1px solid #90caf9",
                  mb: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "#1565c0",
                    fontWeight: 400,
                  }}
                >
                  Specialities
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                {specialities.map((item, i) => {
                  const isSelected = selectedSpecialities.some(
                    (s) => s.type === item.type
                  );
                  return (
                    <CommonButton
                      disabled={isFieldsDisabled}
                      key={i}
                      src={item.img}
                      isSelected={isSelected}
                      onClick={() => dispatch(toggleSpeciality(item))}
                      sx={{
                        textTransform: "none",
                        border: isSelected
                          ? "2px solid #1976d2"
                          : "1px solid #bbdefb",
                        boxShadow: isSelected
                          ? "0 4px 16px rgba(25, 118, 210, 0.25)"
                          : "0 2px 8px rgba(0, 0, 0, 0.08)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 6px 20px rgba(25, 118, 210, 0.3)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: isSelected ? "#1565c0" : "#1565c0",
                        }}
                      >
                        {item.type}
                      </Typography>
                    </CommonButton>
                  );
                })}
              </Box>
            </Box>

            <Divider sx={{ my: 2, borderColor: "#bbdefb" }} />

            {/* <Box
              sx={{
                background: "rgb(198, 228, 251)",
                p: 1,
                borderRadius: 3,
                border: "1px solid #90caf9",
                mb: 2,
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

            <Box>
              <Autocomplete
                multiple
                sx={{".MuiAutocomplete-inputRoot":{paddingRight:"15px !important"}}}
                disableCloseOnSelect
                disabled={isFieldsDisabled && !editingSlot}
                options={["Select All", ...days]}
                value={selectedDays}
                onChange={(event, newValue) => {
                  if (newValue.includes("Select All")) {
                    if (allSelected) {
                      dispatch(setSelectedDays([]));
                    } else {
                      dispatch(setSelectedDays(days));
                    }
                  } else {
                    dispatch(setSelectedDays(newValue));
                  }
                }}
                renderOption={(props, option, { selected }) => {
                  if (option === "Select All") {
                    return (
                      <li {...props} key="select-all">
                        <Checkbox
                          indeterminate={
                            selectedDays.length > 0 &&
                            selectedDays.length < days.length
                          }
                          checked={allSelected}
                          sx={{
                            color: "#1976d2",
                            "&.Mui-checked": { color: "#1976d2" },
                          }}
                        />
                        <ListItemText primary="Select All" />
                      </li>
                    );
                  }

                  return (
                    <li {...props} key={option}>
                      <Checkbox
                        disabled={isFieldsDisabled}
                        checked={selected}
                        sx={{
                          color: "#1976d2",
                          "&.Mui-checked": { color: "#1976d2" },
                        }}
                      />
                      <ListItemText primary={option} />
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Days"
                    fullWidth
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2.5,
                        "&:hover fieldset": { borderColor: "#1976d2" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#1976d2",
                          borderWidth: 2,
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#1976d2" },
                      "& .MuiAutocomplete-input": {
          minWidth: "0 !important",
          width: "0 !important",
          // padding: "0 !important",
        },
                    }}
                  />
                )}
                // ✅ Add custom chip styling here
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      sx={{
                        background:
                          "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        // borderRadius: "9px",

                        padding: "2px 0px",
                        "& .MuiChip-deleteIcon": {
                          color: "white",
                          "&:hover": {
                            color: "white",
                          },
                        },
                        // "&:hover": {
                        //   background:
                        //     "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
                        // },
                      }}
                    />
                  ))
                }
                getOptionLabel={(option) => option}
              />

              <TextField
                disabled={isFieldsDisabled}
                select
                label="Service Type"
                name="serviceType"
                value={form?.serviceType || ""}
                onChange={(e) => handleChange("serviceType", e.target.value)}
                fullWidth
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
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
                }}
                error={!!errors.serviceType}
                helperText={errors.serviceType}
              >
                {selectedServices.map((s) => (
                  <MenuItem
                    key={s.type}
                    value={s.type}
                    disabled={isFieldsDisabled}
                  >
                    {s.type} ({s.time} Min)
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                disabled={isFieldsDisabled}
                select
                label="Speciality"
                name="speciality"
                value={form?.speciality || ""}
                onChange={(e) => handleChange("speciality", e.target.value)}
                fullWidth
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
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
                }}
                error={!!errors.speciality}
                helperText={errors.speciality}
              >
                {selectedSpecialities.map((sp) => (
                  <MenuItem
                    key={sp.type}
                    value={sp.type}
                    disabled={isFieldsDisabled}
                  >
                    {sp.type}
                  </MenuItem>
                ))}
              </TextField>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <TimePicker
                    disabled={isFieldsDisabled}
                    label="Start Time"
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2.5,
                        boxShadow: "0 2px 8px rgba(25, 118, 210, 0.12)",
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
                    value={form?.startTime || null}
                    onChange={(val) => handleChange("startTime", val)}
                    slotProps={{
                      textField: {
                        error: !!errors.startTime,
                        helperText: errors.startTime,
                      },
                    }}
                  />
                  <TimePicker
                    disabled={isFieldsDisabled}
                    label="End Time"
                    value={form?.endTime || null}
                    sx={{
                      flex: 1,
                      ".MuiPickersInputBase-root": {
                        boxShadow:
                          "inset 4px 2px 8px rgba(95, 157, 231, .48), inset -4px -2px 8px #fff",
                        borderRadius: 3,
                      },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2.5,
                        boxShadow: "0 2px 8px rgba(25, 118, 210, 0.12)",
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
                    }}
                    onChange={(val) => handleChange("endTime", val)}
                    slotProps={{
                      textField: {
                        error: !!errors.endTime,
                        helperText: errors.endTime,
                      },
                    }}
                  />
                </Box>
              </LocalizationProvider>
            </Box> */}
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

      {/* Add Service Dialog */}
      <Dialog
        open={openAddService}
        onClose={handleClose}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(25, 118, 210, 0.15)",
          },
        }}
      >
        <Box
          sx={{
            backgroundColor: "#f5f5f5",
            borderBottom: "1px solid #e0e0e0",
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <DialogTitle sx={{ p: 0, fontSize: "1.5rem", fontWeight: 600 }}>
            Add Service
          </DialogTitle>
        </Box>

        <DialogContent sx={{ p: 3, mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              value={newServiceData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              error={!!addServiceError.name}
              helperText={addServiceError.name}
              label="Service Name"
              variant="outlined"
              placeholder="Enter service name"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  "&:hover fieldset": {
                    borderColor: "#1976d2",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1976d2",
                  },
                },
              }}
            />

            <TextField
              select
              label="Select Duration"
              value={newServiceData.duration}
              onChange={(e) => handleFieldChange("duration", e.target.value)}
              error={!!addServiceError.duration}
              helperText={addServiceError.duration}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
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
              }}
            >
              {[15, 30, 45, 60].map((min) => (
                <MenuItem key={min} value={min}>
                  {min} minutes
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Service Type"
              value={newServiceData.type}
              onChange={(e) => handleFieldChange("type", e.target.value)}
              error={!!addServiceError.type}
              helperText={addServiceError.type}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
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
              }}
            >
              {["Home Visit", "Video Call", "Clinic Visit"].map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Box>
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
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddService}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 4,
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default LeftSide;
