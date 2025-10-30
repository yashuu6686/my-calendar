import { configureStore } from "@reduxjs/toolkit";
import calendarReducer from "./slices/calendarSlice";

export const store = configureStore({
  reducer: {
    calendar: calendarReducer,
  },
  middleware: (getDefaultMiddleware) =>
   
    getDefaultMiddleware({
         serializableCheck: false,
      serializableCheck: {
        // Ignore these paths in the state for serialization checks
        // (dayjs objects are not serializable)
        ignoredActions: [
          'calendar/setStartTime',
          'calendar/setEndTime',
          'calendar/setForm',
          'calendar/updateFormField',
          'calendar/addSlot',
          'calendar/setHolidayValues',
        ],
        ignoredPaths: [
          'calendar.startTime',
          'calendar.endTime',
          'calendar.form',
          'calendar.holidayValues',
          'calendar.weekSchedule',
        ],
      },
    }),
});

export default store;