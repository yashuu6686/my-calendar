// src/components/Calendar/ServiceSelection.js
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Button } from "@mui/material";
import CommonButton from "@/components/CommonButton";
import { toggleService } from "@/redux/store/slices/calendarSlice";
import {
  selectAllServices,
  selectSelectedServices,
} from "@/redux/store/selectors/calendarSelectors";

function ServiceSelection({ isFieldsDisabled, onAddServiceClick }) {
  const dispatch = useDispatch();
  const dataOfService = useSelector(selectAllServices);
  const selectedServices = useSelector(selectSelectedServices);

  return (
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
          onClick={onAddServiceClick}
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
  );
}

export default ServiceSelection;