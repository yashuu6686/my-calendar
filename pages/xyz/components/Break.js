"use client";
import {
  Box,
  TextField,
  Typography,
  MenuItem,
  Checkbox,
  Autocomplete,
  ListItemText,
  Chip,
} from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setBreakSelectedDays,
  setStartTime,
  setEndTime,
} from "@/redux/store/slices/calendarSlice";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function Break({ errors = {} }) {
  const dispatch = useDispatch();

  const breakSelectedDays = useSelector(
    (state) => state.calendar.breakSelectedDays
  );
  const startTime = useSelector((state) => state.calendar.startTime);
  const endTime = useSelector((state) => state.calendar.endTime);
  const allSelected = breakSelectedDays.length === days.length;

  return (
    <Box sx={{}}>
      <Box
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
            fontWeight: 600,
          }}
        >
          Break
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Autocomplete
  sx={{ 
    mb: 2, 
    cursor: "pointer",
    ".MuiAutocomplete-inputRoot": {
      paddingRight: "15px !important"
    }
  }}
  multiple
  disableCloseOnSelect
  options={["Select All", ...days]}
  value={breakSelectedDays}
  onChange={(event, newValue) => {
    // Check if "Select All" is clicked
    if (newValue.includes("Select All")) {
      if (breakSelectedDays.length === days.length) {
        // If all were selected, deselect all
        dispatch(setBreakSelectedDays([]));
      } else {
        // Otherwise, select all days (NOT including "Select All" text)
        dispatch(setBreakSelectedDays(days));
      }
    } else {
      // Regular selection
      dispatch(setBreakSelectedDays(newValue));
    }
  }}
  getOptionLabel={(option) => option}
  renderOption={(props, option, { selected }) => {
    const allSelected = breakSelectedDays.length === days.length;
    const isSelectAll = option === "Select All";

    return (
      <li {...props} key={option}>
        <Checkbox
          checked={isSelectAll ? allSelected : selected}
          indeterminate={
            isSelectAll &&
            breakSelectedDays.length > 0 &&
            breakSelectedDays.length < days.length
          }
          sx={{
            color: "#1976d2",
            "&.Mui-checked": {
              color: "#1976d2",
            },
            "&.MuiCheckbox-indeterminate": {
              color: "#1976d2",
            },
          }}
        />
        {option}
      </li>
    );
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Select Days"
      fullWidth
      placeholder={breakSelectedDays.length === 0 ? "Select days" : ""}
      error={!!errors.breakSelectedDays}
      helperText={errors.breakSelectedDays}
      sx={{
        cursor: "pointer",
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
        // ✅ Hide the input field at the bottom
        "& .MuiAutocomplete-input": {
          minWidth: "0 !important",
          width: "0 !important",
          // padding: "0 !important",
        },
      }}
      // ✅ Prevent typing in the input
      inputProps={{
        ...params.inputProps,
        readOnly: true,
      }}
    />
  )}
  // ✅ Custom chip rendering with blue theme
  renderTags={(value, getTagProps) =>
    value.map((option, index) => (
      <Chip
        label={option}
        {...getTagProps({ index })}
        sx={{
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          color: "white",
          fontWeight: 600,
          fontSize: "0.85rem",
          padding: "2px 0px",
          "& .MuiChip-deleteIcon": {
            color: "white",
            "&:hover": {
              color: "white",
            },
          },
        }}
      />
    ))
  }
/>

        {/* Time Pickers */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 1 }}
          >
            <TimePicker
              label="Start Time"
              value={startTime}
              onChange={(val) => dispatch(setStartTime(val))}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.startTime,
                  helperText: errors.startTime,
                  sx: {
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
                  },
                },
              }}
            />
            <TimePicker
              label="End Time"
              value={endTime}
              onChange={(val) => dispatch(setEndTime(val))}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.endTime,
                  helperText: errors.endTime,
                  sx: {
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
                  },
                },
              }}
            />
          </Box>
        </LocalizationProvider>
      </Box>
    </Box>
  );
}

export default Break;
