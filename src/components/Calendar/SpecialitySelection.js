// src/components/Calendar/SpecialitySelection.js
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";
import CommonButton from "@/components/CommonButton";
import { toggleSpeciality } from "@/redux/store/slices/calendarSlice";
import {
  selectSpecialities,
  selectSelectedSpecialities,
} from "@/redux/store/selectors/calendarSelectors";

function SpecialitySelection({ isFieldsDisabled }) {
  const dispatch = useDispatch();
  const specialities = useSelector(selectSpecialities);
  const selectedSpecialities = useSelector(selectSelectedSpecialities);

  return (
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
  );
}

export default SpecialitySelection;