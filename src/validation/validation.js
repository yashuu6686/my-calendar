import dayjs from "dayjs";
import * as yup from "yup";

// ✅ Holiday Validation Schema - FIXED
export const holidayValidationSchema = yup.object().shape({
  date: yup
    .mixed()
    .required("Holiday date is required")
    .test("is-valid-date", "Please select a valid date", function (value) {
      return value && dayjs(value).isValid();
    }),

  startTime: yup
    .mixed()
    .nullable()
    .test("valid-if-provided", "Invalid start time", function (value) {
      if (value && !dayjs(value).isValid()) return false;
      return true;
    }),

  endTime: yup
    .mixed()
    .nullable()
    .test(
      "is-after-start",
      "End time must be after start time",
      function (value) {
        const { startTime } = this.parent;
        if (startTime && value) {
          return dayjs(value).isAfter(dayjs(startTime));
        }
        return true;
      }
    )
    .test(
      "both-or-neither",
      "Both start and end time must be provided or left empty",
      function (value) {
        const { startTime } = this.parent;
        if ((startTime && !value) || (!startTime && value)) {
          return false;
        }
        return true;
      }
    )
    .test(
      "no-overlap-with-existing-holidays",
      "This time slot is already booked.",
      function (endTime) {
        const { startTime, date } = this.parent;
        const { existingHolidays } = this.options.context || {};

        if (!date || !startTime || !endTime) {
          return true;
        }

        if (!existingHolidays || existingHolidays.length === 0) {
          return true;
        }

        const newDate = dayjs(date).format("YYYY-MM-DD");
        const newStartTime = dayjs(startTime).format("HH:mm");
        const newEndTime = dayjs(endTime).format("HH:mm");
        
        const newStart = dayjs(`${newDate} ${newStartTime}`, "YYYY-MM-DD HH:mm");
        const newEnd = dayjs(`${newDate} ${newEndTime}`, "YYYY-MM-DD HH:mm");

        const hasOverlap = existingHolidays.some((holiday) => {
          if (!holiday.date || !holiday.startTime || !holiday.endTime) {
            return false;
          }

          const existingDate = dayjs(holiday.date).format("YYYY-MM-DD");

          if (existingDate !== newDate) {
            return false;
          }

          const existingStart = dayjs(`${existingDate} ${holiday.startTime}`, "YYYY-MM-DD HH:mm");
          const existingEnd = dayjs(`${existingDate} ${holiday.endTime}`, "YYYY-MM-DD HH:mm");

          const overlaps = newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart);

          return overlaps;
        });

        return !hasOverlap;
      }
    ),
});

export const breakValidationSchema = yup.object().shape({
  breakSelectedDays: yup
    .array()
    .min(1, "Please select at least one day for break"),
  startTime: yup.mixed().required("Break start time is required"),
  endTime: yup
    .mixed()
    .required("Break end time is required")
    .test("is-after", "End time must be after start time", function (value) {
      const { startTime } = this.parent;
      return value && startTime ? dayjs(value).isAfter(dayjs(startTime)) : true;
    })
    .test(
      "no-overlap-with-existing-breaks",
      "This time slot is already booked.",
      function (endTime) {
        const { startTime, breakSelectedDays } = this.parent;
        const { breaks, editIndex } = this.options.context || {};
        
        console.log("🔍 Break Validation Context:", { 
          breaks, 
          editIndex,
          totalBreaks: breaks?.length 
        });
        
        if (!startTime || !endTime || !breakSelectedDays?.length) return true;

        // ✅ Extract only time (HH:mm) from dayjs objects
        const newStartTime = dayjs(startTime).format("HH:mm");
        const newEndTime = dayjs(endTime).format("HH:mm");
        
        // ✅ Create comparable time objects using today's date
        const today = dayjs().format("YYYY-MM-DD");
        const breakStart = dayjs(`${today} ${newStartTime}`, "YYYY-MM-DD HH:mm");
        const breakEnd = dayjs(`${today} ${newEndTime}`, "YYYY-MM-DD HH:mm");

        console.log("🕒 New Break Time:", newStartTime, "-", newEndTime);

        // ✅ Check overlap for each selected day
        const hasOverlap = breakSelectedDays.some((day) => {
          console.log(`\n📅 Checking overlaps for day: ${day}`);
          
          return breaks.some((existingBreak, index) => {
            // ✅ Skip the break being edited (important!)
            if (editIndex !== null && editIndex !== undefined && index === editIndex) {
              console.log(`⏭️ Skipping break at index ${index} (currently editing)`);
              return false;
            }

            // Only check breaks on the same day
            if (!existingBreak.days.includes(day)) {
              console.log(`⏭️ Break ${index} not on ${day}, skipping`);
              return false;
            }

            if (!existingBreak.startTime || !existingBreak.endTime) {
              console.log(`⚠️ Break ${index} has invalid time, skipping`);
              return false;
            }

            // ✅ Parse existing break times properly
            const existingStart = dayjs(`${today} ${existingBreak.startTime}`, "YYYY-MM-DD HH:mm");
            const existingEnd = dayjs(`${today} ${existingBreak.endTime}`, "YYYY-MM-DD HH:mm");

            console.log(`🔍 Comparing with Break ${index}:`);
            console.log(`  Days: ${existingBreak.days.join(", ")}`);
            console.log(`  Time: ${existingBreak.startTime} - ${existingBreak.endTime}`);

            // ✅ Overlap check
            const overlaps = breakStart.isBefore(existingEnd) && breakEnd.isAfter(existingStart);
            
            console.log(`  breakStart < existingEnd: ${breakStart.isBefore(existingEnd)}`);
            console.log(`  breakEnd > existingStart: ${breakEnd.isAfter(existingStart)}`);
            console.log(`  Result: ${overlaps ? "❌ OVERLAP" : "✅ No overlap"}`);

            if (overlaps) {
              console.log(`\n❌ OVERLAP DETECTED on ${day}!`);
              console.log(`  New: ${newStartTime} - ${newEndTime}`);
              console.log(`  Existing: ${existingBreak.startTime} - ${existingBreak.endTime}`);
            }

            return overlaps;
          });
        });

        console.log("\n📊 Final Validation Result:", hasOverlap ? "FAILED" : "PASSED");

        return !hasOverlap;
      }
    ),
});



export const addServiceSchema = yup.object().shape({
  name: yup
    .string()
    .required("Service name is required")
    .min(3, "Service name must be at least 3 characters")
    .max(50, "Service name must be less than 50 characters"),
  duration: yup
    .number()
    .required("Duration is required")
    .oneOf([15, 30, 45, 90], "Please select a valid duration"),
  type: yup
    .string()
    .required("Service type is required")
    .oneOf(
      ["Home Visit", "Video Call", "Clinic Visit"],
      "Please select a valid service type"
    ),
});