// src/redux/store/selectors/calendarSelectors.js
import { createSelector } from '@reduxjs/toolkit';
import moment from 'moment';
import dayjs from 'dayjs';

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
// BASIC SELECTORS (Direct state access)
// =====================================================
export const selectAllServices = (state) => state.calendar.dataOfService;
export const selectSelectedServices = (state) => state.calendar.selectedServices;
export const selectSpecialities = (state) => state.calendar.specialities;
export const selectSelectedSpecialities = (state) => state.calendar.selectedSpecialities;
export const selectWeekSchedule = (state) => state.calendar.weekSchedule;
export const selectForm = (state) => state.calendar.form;
export const selectSelectedDays = (state) => state.calendar.selectedDays;
export const selectBreaks = (state) => state.calendar.breaks;
export const selectHolidays = (state) => state.calendar.holidays;
export const selectIsLoading = (state) => state.calendar.isLoading;
export const selectBreakSelectedDays = (state) => state.calendar.breakSelectedDays;
export const selectStartTime = (state) => state.calendar.startTime;
export const selectEndTime = (state) => state.calendar.endTime;
export const selectEditingSlot = (state) => state.calendar.editingSlot;
export const selectIsCalendarPublished = (state) => state.calendar.isCalendarPublished;
export const selectIsEditMode = (state) => state.calendar.isEditMode;
export const selectApiError = (state) => state.calendar.apiError;
export const selectApiSuccess = (state) => state.calendar.apiSuccess;
export const selectHolidayValues = (state) => state.calendar.holidayValues;
export const selectEditIndex = (state) => state.calendar.editIndex;
export const selectHolidayEditIndex = (state) => state.calendar.holidayEditIndex;

// =====================================================
// MEMOIZED SELECTORS (Computed/Derived values)
// =====================================================

/**
 * ✅ Compute calendar events from weekSchedule
 * This replaces the need to store events in Redux state
 * Events are auto-computed whenever weekSchedule changes
 */
export const selectEvents = createSelector(
  [selectWeekSchedule],
  (weekSchedule) => {
    const newEvents = [];
    
    weekSchedule.forEach((item) => {
      const base = getNextDayOfWeek(dayToNumber[item.day]);
      
      item.slots.forEach((slot) => {
        // ✅ Validate slot has required data
        if (!slot.start || !slot.end) {
          console.warn(`⚠️ Invalid slot detected for ${item.day}:`, slot);
          return;
        }
        
        // ✅ Extract date from dayjs or Date object
        let slotStart, slotEnd;
        
        // Handle dayjs objects
        if (dayjs.isDayjs(slot.start)) {
          slotStart = slot.start.toDate();
        } 
        // Handle Date objects
        else if (slot.start instanceof Date) {
          slotStart = slot.start;
        } 
        // Handle dayjs internal format
        else if (slot.start.$d) {
          slotStart = slot.start.$d;
        } 
        else {
          console.warn(`⚠️ Cannot parse start time for slot:`, slot);
          return;
        }
        
        // Same for end time
        if (dayjs.isDayjs(slot.end)) {
          slotEnd = slot.end.toDate();
        } else if (slot.end instanceof Date) {
          slotEnd = slot.end;
        } else if (slot.end.$d) {
          slotEnd = slot.end.$d;
        } else {
          console.warn(`⚠️ Cannot parse end time for slot:`, slot);
          return;
        }
        
        newEvents.push({
          id: slot.id,
          title: `${slot.serviceType} - ${slot.speciality || 'N/A'}`,
          start: base
            .clone()
            .set({ 
              hour: slotStart.getHours(), 
              minute: slotStart.getMinutes() 
            })
            .toDate(),
          end: base
            .clone()
            .set({ 
              hour: slotEnd.getHours(), 
              minute: slotEnd.getMinutes() 
            })
            .toDate(),
        });
      });
    });
    
    return newEvents;
  }
);

/**
 * ✅ Get slots for a specific day
 * Usage: const slots = useSelector(state => selectDaySlots(state, 'Monday'))
 */
export const selectDaySlots = createSelector(
  [selectWeekSchedule, (_, day) => day],
  (weekSchedule, day) => {
    const dayData = weekSchedule.find((d) => d.day === day);
    return dayData ? dayData.slots : [];
  }
);

/**
 * ✅ Check if any slots exist across all days
 */
export const selectHasSlots = createSelector(
  [selectWeekSchedule],
  (weekSchedule) => weekSchedule.some(day => day.slots.length > 0)
);

/**
 * ✅ Get total number of slots across all days
 */
export const selectTotalSlots = createSelector(
  [selectWeekSchedule],
  (weekSchedule) => {
    return weekSchedule.reduce((total, day) => total + day.slots.length, 0);
  }
);

/**
 * ✅ Get breaks for a specific day
 * Usage: const breaks = useSelector(state => selectDayBreaks(state, 'Monday'))
 */
export const selectDayBreaks = createSelector(
  [selectBreaks, (_, day) => day],
  (breaks, day) => breaks.filter(b => b.days?.includes(day))
);

/**
 * ✅ Get total number of breaks
 */
export const selectTotalBreaks = createSelector(
  [selectBreaks],
  (breaks) => breaks.length
);

/**
 * ✅ Get holidays for a specific date
 * Usage: const holidays = useSelector(state => selectHolidaysForDate(state, '2025-01-15'))
 */
export const selectHolidaysForDate = createSelector(
  [selectHolidays, (_, date) => date],
  (holidays, date) => {
    const targetDate = dayjs(date).format('YYYY-MM-DD');
    return holidays.filter(h => dayjs(h.date).format('YYYY-MM-DD') === targetDate);
  }
);

/**
 * ✅ Get service by type
 * Usage: const service = useSelector(state => selectServiceByType(state, 'Video Call'))
 */
export const selectServiceByType = createSelector(
  [selectSelectedServices, (_, serviceType) => serviceType],
  (services, serviceType) => services.find(s => s.type === serviceType)
);

/**
 * ✅ Check if a specific service is selected
 * Usage: const isSelected = useSelector(state => selectIsServiceSelected(state, 'Video Call'))
 */
export const selectIsServiceSelected = createSelector(
  [selectSelectedServices, (_, serviceType) => serviceType],
  (services, serviceType) => services.some(s => s.type === serviceType)
);

/**
 * ✅ Check if a specific speciality is selected
 */
export const selectIsSpecialitySelected = createSelector(
  [selectSelectedSpecialities, (_, specialityType) => specialityType],
  (specialities, specialityType) => specialities.some(s => s.type === specialityType)
);

/**
 * ✅ Determine if form fields should be disabled
 * (Published and not in edit mode)
 */
export const selectIsFieldsDisabled = createSelector(
  [selectIsCalendarPublished, selectIsEditMode],
  (isPublished, isEditMode) => isPublished && !isEditMode
);

/**
 * ✅ Get days with slots (days that have at least one slot)
 */
export const selectDaysWithSlots = createSelector(
  [selectWeekSchedule],
  (weekSchedule) => {
    return weekSchedule
      .filter(day => day.slots.length > 0)
      .map(day => day.day);
  }
);

/**
 * ✅ Get days without slots
 */
export const selectDaysWithoutSlots = createSelector(
  [selectWeekSchedule],
  (weekSchedule) => {
    return weekSchedule
      .filter(day => day.slots.length === 0)
      .map(day => day.day);
  }
);

/**
 * ✅ Check if calendar has any data (slots, breaks, or holidays)
 */
export const selectHasCalendarData = createSelector(
  [selectWeekSchedule, selectBreaks, selectHolidays],
  (weekSchedule, breaks, holidays) => {
    const hasSlots = weekSchedule.some(day => day.slots.length > 0);
    return hasSlots || breaks.length > 0 || holidays.length > 0;
  }
);

/**
 * ✅ Get validation state (useful for form validation)
 */
export const selectValidationState = createSelector(
  [
    selectSelectedServices,
    selectSelectedSpecialities,
    selectHasSlots,
  ],
  (services, specialities, hasSlots) => ({
    hasServices: services.length > 0,
    hasSpecialities: specialities.length > 0,
    hasSlots,
    isValid: services.length > 0 && specialities.length > 0 && hasSlots,
  })
);

/**
 * ✅ Get calendar summary (useful for dashboard/overview)
 */
export const selectCalendarSummary = createSelector(
  [
    selectSelectedServices,
    selectSelectedSpecialities,
    selectWeekSchedule,
    selectBreaks,
    selectHolidays,
  ],
  (services, specialities, weekSchedule, breaks, holidays) => {
    const totalSlots = weekSchedule.reduce(
      (total, day) => total + day.slots.length, 
      0
    );
    
    const daysWithSlots = weekSchedule.filter(
      day => day.slots.length > 0
    ).length;
    
    return {
      servicesCount: services.length,
      specialitiesCount: specialities.length,
      totalSlots,
      daysWithSlots,
      totalBreaks: breaks.length,
      totalHolidays: holidays.length,
    };
  }
);