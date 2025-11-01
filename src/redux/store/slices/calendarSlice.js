import { createAsyncThunk, createSlice, nanoid, createSelector } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import moment from "moment";
import {
  video,
  home,
  clinic,
  nuro,
  gen,
  ortho,
  tooth,
  cardio,
} from "../../../utils/index";
import axios from "axios";

// =====================================================
// ASYNC THUNK
// =====================================================
export const createDoctorCalendar = createAsyncThunk(
  "calendar/createDoctorCalendar",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState().calendar;

      const payload = {
        routeName: "createDoctorCalendar",
        createdByKeyIdentifier: "DO",
        keyIdentifier: "DO",
        createdBy: "6673c2800c262f2a80430cc6",
        masterProfileId: "6673c2800c262f2a80430cc6",
        timezone: "America/New_York",
        advanceBookingDays: 15,
        checkInTime: 60,
        specialties: state.selectedSpecialities.map((s) => ({
          _id: s._id,
          name: s.type,
          keyIdentifier: s.keyIdentifier || "GN",
          imageUrl: s.imageUrl || "",
        })),
        services: state.selectedServices.map((s) => ({
          keyIdentifier:
            s.type === "Video Call"
              ? "VC"
              : s.type === "Home Visit"
              ? "HV"
              : "CV",
          duration: Number(s.time),
          name: s.type,
          addressId:
            s.type === "Clinic Visit" ? "65f42bc48bbf7b96f8837f23" : null,
        })),
        availability: state.weekSchedule.map((dayObj) => ({
          day: dayObj.day,
          breaks: state.breaks
            .filter((b) => b.days?.includes(dayObj.day))
            .map((b) => ({
              breakStartTime: b.startTime
                ? dayjs(`2025-01-01T${b.startTime}`).isValid()
                  ? dayjs(`2025-01-01T${b.startTime}`).format("hh:mm A")
                  : b.startTime
                : null,
              breakEndTime: b.endTime
                ? dayjs(`2025-01-01T${b.endTime}`).isValid()
                  ? dayjs(`2025-01-01T${b.endTime}`).format("hh:mm A")
                  : b.endTime
                : null,
            })),
          services: dayObj.slots.map((slot) => ({
            keyIdentifier:
              slot.serviceType === "Video Call"
                ? "VC"
                : slot.serviceType === "Home Visit"
                ? "HV"
                : "CV",
            name: slot.serviceType,
            startTime: slot.start
              ? dayjs(slot.start).format("HH:mm A")
              : "00:00",
            endTime: slot.end
              ? dayjs(slot.end).format("HH:mm A")
              : "00:00",
          })),
        })),
        holidays: state.holidays.map((h) => ({
          date: h.date ? dayjs(h.date).format("YYYY-MM-DD") : null,
          startTime: h.startTime
            ? dayjs(`2025-01-01T${h.startTime}`).isValid()
              ? dayjs(`2025-01-01T${h.startTime}`).format("hh:mm A")
              : h.startTime
            : "12:00 AM",
          endTime: h.endTime
            ? dayjs(`2025-01-01T${h.endTime}`).isValid()
              ? dayjs(`2025-01-01T${h.endTime}`).format("hh:mm A")
              : h.endTime
            : "12:00 AM",
        })),
      };

      console.log("🟢 Generated Payload:", payload);

      const response = await axios.post(
        `https://devapi.dequity.technology/createDoctorCalendar`,
        payload
      );
      const safeData = JSON.parse(JSON.stringify(response.data));
      return safeData;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// =====================================================
// HELPER FUNCTIONS
// =====================================================
const dayToNumber = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const getNextDayOfWeek = (dayNum) => {
  const now = moment();
  const currentDay = now.day();
  let daysToAdd = dayNum - currentDay;
  if (daysToAdd < 0) daysToAdd += 7;
  return now.clone().add(daysToAdd, "days");
};

// =====================================================
// INITIAL STATE (✅ OPTIMIZED - Removed redundant fields)
// =====================================================
const initialState = {
  // Services & Specialities
  dataOfService: [
    { img: video, type: "Video Call", time: "15" },
    { img: home, type: "Home Visit", time: "90" },
    { img: clinic, type: "Clinic Visit", time: "15" },
  ],
  specialities: [
    { img: nuro, type: "Neurologist" },
    { img: gen, type: "General" },
    { img: ortho, type: "Orthopaedic" },
    { img: tooth, type: "Dental" },
    { img: cardio, type: "Cardiology" },
  ],
  selectedServices: [],
  selectedSpecialities: [],

  // Calendar Data (✅ weekSchedule is source of truth, events computed via selector)
  weekSchedule: Object.keys(dayToNumber).map((day) => ({
    day,
    slots: [],
  })),

  // Form & Selection
  selectedDays: [],
  breakSelectedDays: [],
  form: {},
  editingSlot: null,

  // Time
  startTime: null,
  endTime: null,

  // Breaks & Holidays
  breaks: [],
  holidays: [],
  holidayValues: {
    date: null,
    startTime: null,
    endTime: null,
  },
  editIndex: null,
  holidayEditIndex: null,

  // UI State
  isCalendarPublished: false,
  isEditMode: false,

  // API State
  calendarId: null,
  isLoading: false,
  apiError: null,
  apiSuccess: null,
};

// =====================================================
// CALENDAR SLICE
// =====================================================
const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    // ===== SERVICE & SPECIALITY ACTIONS =====
    toggleService: (state, action) => {
      const service = action.payload;
      const exists = state.selectedServices.some(
        (s) => s.type === service.type
      );
      if (exists) {
        state.selectedServices = state.selectedServices.filter(
          (s) => s.type !== service.type
        );
      } else {
        state.selectedServices.push(service);
      }
    },

    toggleSpeciality: (state, action) => {
      const speciality = action.payload;
      const exists = state.selectedSpecialities.some(
        (s) => s.type === speciality.type
      );
      if (exists) {
        state.selectedSpecialities = state.selectedSpecialities.filter(
          (s) => s.type !== speciality.type
        );
      } else {
        state.selectedSpecialities.push(speciality);
      }
    },

    addNewService: (state, action) => {
      const { serviceName, duration, serviceType } = action.payload;
      const newService = {
        img:
          serviceType === "Video Call"
            ? video
            : serviceType === "Home Visit"
            ? home
            : clinic,
        type: serviceName,
        time: duration.toString(),
      };
      state.dataOfService.push(newService);
    },

    // ===== DAYS SELECTION =====
    setSelectedDays: (state, action) => {
      state.selectedDays = action.payload;
    },

    setBreakSelectedDays: (state, action) => {
      state.breakSelectedDays = action.payload;
    },

    // ===== FORM ACTIONS =====
    setForm: (state, action) => {
      state.form = action.payload;
    },

    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
    },

    resetForm: (state) => {
      state.form = {};
    },

    // ===== TIME ACTIONS =====
    setStartTime: (state, action) => {
      state.startTime = action.payload;
    },

    setEndTime: (state, action) => {
      state.endTime = action.payload;
    },

    // ===== SLOT ACTIONS =====
    addSlot: (state, action) => {
      const { days, startTime, endTime, serviceType, speciality } =
        action.payload;

      const service = state.selectedServices.find(
        (s) => s.type === serviceType
      );
      const duration = service ? parseInt(service.time) : 15;
      const newSlotId = nanoid();

      state.weekSchedule = state.weekSchedule.map((item) =>
        days.includes(item.day)
          ? {
              ...item,
              slots: [
                ...item.slots,
                {
                  id: newSlotId,
                  start: dayjs(startTime),
                  end: dayjs(endTime),
                  serviceType,
                  speciality,
                  isDummy: false,
                  duration,
                },
              ],
            }
          : item
      );
    },

    addSlotToDay: (state, action) => {
      const { day, slot } = action.payload;
      state.weekSchedule = state.weekSchedule.map((item) =>
        item.day === day
          ? {
              ...item,
              slots: [...item.slots, slot],
            }
          : item
      );
    },

    removeSlotFromDay: (state, action) => {
      const { day, slotId } = action.payload;
      state.weekSchedule = state.weekSchedule.map((item) =>
        item.day === day
          ? {
              ...item,
              slots: item.slots.filter((slot) => slot.id !== slotId),
            }
          : item
      );
    },

    updateSlotInDay: (state, action) => {
      const { day, slotId, field, value } = action.payload;
      state.weekSchedule = state.weekSchedule.map((item) =>
        item.day === day
          ? {
              ...item,
              slots: item.slots.map((slot) => {
                if (slot.id === slotId) {
                  const updatedSlot = { ...slot, [field]: value };

                  // ✅ If serviceType is being updated, also update duration
                  if (field === "serviceType") {
                    const service = state.selectedServices.find(
                      (s) => s.type === value
                    );
                    updatedSlot.duration = service
                      ? parseInt(service.time)
                      : 15;
                  }

                  return updatedSlot;
                }
                return slot;
              }),
            }
          : item
      );
    },

    setEditingSlot: (state, action) => {
      state.editingSlot = action.payload;
    },

    // ===== BREAK ACTIONS =====
    addBreak: (state, action) => {
      const newBreak = action.payload;
      if (state.editIndex !== null) {
        state.breaks[state.editIndex] = newBreak;
        state.editIndex = null;
      } else {
        state.breaks.push(newBreak);
      }
      state.breakSelectedDays = [];
      state.startTime = null;
      state.endTime = null;
    },

    setBreaks: (state, action) => {
      state.breaks = action.payload;
    },

    setEditIndex: (state, action) => {
      state.editIndex = action.payload;
    },

    // ===== HOLIDAY ACTIONS =====
    addHoliday: (state, action) => {
      const newHoliday = action.payload;
      if (state.holidayEditIndex !== null) {
        state.holidays[state.holidayEditIndex] = newHoliday;
        state.holidayEditIndex = null;
      } else {
        state.holidays.push(newHoliday);
      }
      state.holidayValues = { date: null, startTime: null, endTime: null };
    },

    setHolidays: (state, action) => {
      state.holidays = action.payload;
    },

    deleteHoliday: (state, action) => {
      const index = action.payload;
      state.holidays = state.holidays.filter((_, i) => i !== index);
    },

    setHolidayValues: (state, action) => {
      state.holidayValues = action.payload;
    },

    setHolidayEditIndex: (state, action) => {
      state.holidayEditIndex = action.payload;
    },

    // ===== UI STATE =====
    setIsCalendarPublished: (state, action) => {
      state.isCalendarPublished = action.payload;
    },

    setIsEditMode: (state, action) => {
      state.isEditMode = action.payload;
    },

    // ===== API STATE =====
    setCalendarId: (state, action) => {
      state.calendarId = action.payload;
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setApiError: (state, action) => {
      state.apiError = action.payload;
    },

    setApiSuccess: (state, action) => {
      state.apiSuccess = action.payload;
    },

    clearApiMessages: (state) => {
      state.apiError = null;
      state.apiSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDoctorCalendar.pending, (state) => {
        state.isLoading = true;
        state.apiError = null;
        state.apiSuccess = null;
      })
      .addCase(createDoctorCalendar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.apiSuccess = "Doctor calendar created successfully!";
        state.calendarId = action.payload?.calendarId || null;
      })
      .addCase(createDoctorCalendar.rejected, (state, action) => {
        state.isLoading = false;
        state.apiError = action.payload || "Failed to create calendar.";
      });
  },
});

// =====================================================
// ACTIONS EXPORT
// =====================================================
export const {
  toggleService,
  toggleSpeciality,
  addNewService,
  setSelectedDays,
  setBreakSelectedDays,
  setForm,
  updateFormField,
  resetForm,
  setStartTime,
  setEndTime,
  addSlot,
  setEditingSlot,
  addBreak,
  setBreaks,
  setEditIndex,
  addHoliday,
  setHolidays,
  deleteHoliday,
  setHolidayValues,
  setHolidayEditIndex,
  setIsCalendarPublished,
  setIsEditMode,
  setCalendarId,
  setLoading,
  setApiError,
  setApiSuccess,
  clearApiMessages,
  updateSlotInDay,
  removeSlotFromDay,
  addSlotToDay,
} = calendarSlice.actions;

// =====================================================
// BASIC SELECTORS
// =====================================================
// export const selectAllServices = (state) => state.calendar.dataOfService;
// export const selectSelectedServices = (state) => state.calendar.selectedServices;
// export const selectSpecialities = (state) => state.calendar.specialities;
// export const selectSelectedSpecialities = (state) => state.calendar.selectedSpecialities;
// export const selectWeekSchedule = (state) => state.calendar.weekSchedule;
// export const selectForm = (state) => state.calendar.form;
// export const selectSelectedDays = (state) => state.calendar.selectedDays;
// export const selectBreaks = (state) => state.calendar.breaks;
// export const selectHolidays = (state) => state.calendar.holidays;
// export const selectIsLoading = (state) => state.calendar.isLoading;
// export const selectBreakSelectedDays = (state) => state.calendar.breakSelectedDays;
// export const selectStartTime = (state) => state.calendar.startTime;
// export const selectEndTime = (state) => state.calendar.endTime;
// export const selectEditingSlot = (state) => state.calendar.editingSlot;
// export const selectIsCalendarPublished = (state) => state.calendar.isCalendarPublished;
// export const selectIsEditMode = (state) => state.calendar.isEditMode;

// // =====================================================
// // MEMOIZED SELECTORS (✅ OPTIMIZED)
// // =====================================================

// // ✅ Compute events from weekSchedule (no duplication in state!)
// export const selectEvents = createSelector(
//   [selectWeekSchedule],
//   (weekSchedule) => {
//     const newEvents = [];
    
//     weekSchedule.forEach((item) => {
//       const base = getNextDayOfWeek(dayToNumber[item.day]);
      
//       item.slots.forEach((slot) => {
//         // ✅ Handle both dayjs objects and Date objects
//         if (!slot.start || !slot.end) {
//           console.warn(`Invalid slot detected for ${item.day}:`, slot);
//           return;
//         }
        
//         // ✅ Extract date from dayjs or Date object
//         let slotStart, slotEnd;
        
//         if (dayjs.isDayjs(slot.start)) {
//           slotStart = slot.start.toDate();
//         } else if (slot.start instanceof Date) {
//           slotStart = slot.start;
//         } else if (slot.start.$d) {
//           slotStart = slot.start.$d;
//         } else {
//           console.warn(`Cannot parse start time for slot:`, slot);
//           return;
//         }
        
//         if (dayjs.isDayjs(slot.end)) {
//           slotEnd = slot.end.toDate();
//         } else if (slot.end instanceof Date) {
//           slotEnd = slot.end;
//         } else if (slot.end.$d) {
//           slotEnd = slot.end.$d;
//         } else {
//           console.warn(`Cannot parse end time for slot:`, slot);
//           return;
//         }
        
//         newEvents.push({
//           id: slot.id,
//           title: `${slot.serviceType} - ${slot.speciality || 'N/A'}`,
//           start: base
//             .clone()
//             .set({ 
//               hour: slotStart.getHours(), 
//               minute: slotStart.getMinutes() 
//             })
//             .toDate(),
//           end: base
//             .clone()
//             .set({ 
//               hour: slotEnd.getHours(), 
//               minute: slotEnd.getMinutes() 
//             })
//             .toDate(),
//         });
//       });
//     });
    
//     return newEvents;
//   }
// );

// // ✅ Get slots for specific day
// export const selectDaySlots = createSelector(
//   [selectWeekSchedule, (_, day) => day],
//   (weekSchedule, day) => {
//     const dayData = weekSchedule.find((d) => d.day === day);
//     return dayData ? dayData.slots : [];
//   }
// );

// // ✅ Check if any slots exist
// export const selectHasSlots = createSelector(
//   [selectWeekSchedule],
//   (weekSchedule) => weekSchedule.some(day => day.slots.length > 0)
// );

// // ✅ Get breaks for specific day
// export const selectDayBreaks = createSelector(
//   [selectBreaks, (_, day) => day],
//   (breaks, day) => breaks.filter(b => b.days?.includes(day))
// );

// // ✅ Get service by type
// export const selectServiceByType = createSelector(
//   [selectSelectedServices, (_, serviceType) => serviceType],
//   (services, serviceType) => services.find(s => s.type === serviceType)
// );

// // ✅ Get total slot count
// export const selectTotalSlots = createSelector(
//   [selectWeekSchedule],
//   (weekSchedule) => {
//     return weekSchedule.reduce((total, day) => total + day.slots.length, 0);
//   }
// );

// // ✅ Check if fields should be disabled
// export const selectIsFieldsDisabled = createSelector(
//   [selectIsCalendarPublished, selectIsEditMode],
//   (isPublished, isEditMode) => isPublished && !isEditMode
// );

export default calendarSlice.reducer;