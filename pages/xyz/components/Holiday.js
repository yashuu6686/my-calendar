import { Box, Typography } from "@mui/material";
import {
  DesktopDatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useSelector, useDispatch } from 'react-redux';
import { setHolidayValues } from '@/redux/store/slices/calendarSlice';

function Holiday({ errors = {} }) {
  const dispatch = useDispatch();
  const holidayValues = useSelector(state => state.calendar.holidayValues);
  const holidayEditIndex = useSelector(state => state.calendar.holidayEditIndex);

  return (
    <Box>
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
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {holidayEditIndex !== null ? "Edit Holiday" : "Holiday"}
        </Typography>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* Date Picker */}
        <DesktopDatePicker
          minDate={dayjs().startOf("day")}
          label="Select Date *"
          
          value={holidayValues.date}
          onChange={(newValue) =>
             dispatch(setHolidayValues({ ...holidayValues, date: newValue }))
          }
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!errors.date,
              helperText: errors.date,
            
              margin: "normal",
              sx: {
                mt:1,
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
              },
            },
          }}
        />

        {/* Time Pickers */}
        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <TimePicker
            label="Start Time"
            value={holidayValues.startTime}
            onChange={(val) =>
              dispatch(setHolidayValues({ ...holidayValues, startTime: val }))
            }
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors.startTime,
                helperText: errors.startTime,
                sx: {
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
                },
              },
            }}
          />
          <TimePicker
            label="End Time"
            value={holidayValues.endTime}
            onChange={(val) =>
              dispatch(setHolidayValues({ ...holidayValues, endTime: val }))
            }
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors.endTime,
                helperText: errors.endTime,
                sx: {
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
                },
              },
            }}
          />
        </Box>

        <Typography
          sx={{
            color: "#757575",
            display: "block",
            mt: 1,
            fontSize: "0.875rem",
            fontStyle: "italic",
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}

export default Holiday;
