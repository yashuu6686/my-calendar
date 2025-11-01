// pages/xyz/components/CalendarToolbar.js
import React, { memo } from "react";
import { Box, Typography, Button } from "@mui/material";

const CalendarToolbar = memo(
  ({ toolbarProps, isFieldsDisabled, onBreakClick, onHolidayClick }) => (
    <Box
      sx={{
        backgroundColor: "#e3f2fd",
        padding: "16px 20px",
        borderRadius: "12px",
        marginBottom: "24px",
        border: "2px solid #90caf9",
        boxShadow: "0 4px 12px rgba(25, 118, 210, 0.1)",
      }}
    >
      {/* Top Row: Navigation + View Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        {/* Left: Today, Back, Next */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            onClick={() => toolbarProps.onNavigate("TODAY")}
            sx={{
              color: "#1976d2",
              fontWeight: 600,
              fontSize: "0.9rem",
              padding: "8px 20px",
              borderRadius: "10px",
              backgroundColor: "white",
              textTransform: "none",
            }}
          >
            Today
          </Button>
          <Button
            onClick={() => toolbarProps.onNavigate("PREV")}
            sx={{
              color: "#1976d2",
              fontWeight: 600,
              fontSize: "0.9rem",
              padding: "8px 20px",
              borderRadius: "10px",
              backgroundColor: "white",
              textTransform: "none",
            }}
          >
            Back
          </Button>
          <Button
            onClick={() => toolbarProps.onNavigate("NEXT")}
            sx={{
              color: "#1976d2",
              fontWeight: 600,
              fontSize: "0.9rem",
              padding: "8px 20px",
              borderRadius: "10px",
              backgroundColor: "white",
              textTransform: "none",
            }}
          >
            Next
          </Button>
        </Box>

        {/* Center: Label */}
        <Typography
          sx={{
            color: "#1565c0",
            fontWeight: 700,
            fontSize: "1.3rem",
            letterSpacing: "0.5px",
          }}
        >
          {toolbarProps.label}
        </Typography>

        {/* Right: View Buttons */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {["day", "week", "month"].map((view) => (
            <Button
              key={view}
              onClick={() => toolbarProps.onView(view)}
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                padding: "8px 16px",
                borderRadius: "10px",
                backgroundColor:
                  toolbarProps.view === view ? "#1172BA" : "white",
                color: toolbarProps.view === view ? "white" : "#1976d2",
                textTransform: "capitalize",
              }}
            >
              {view}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Bottom Row: Holiday & Break Buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          pt: 2,
          borderTop: "1px solid #90caf9",
        }}
      >
        <Button
          disabled={isFieldsDisabled}
          variant="contained"
          onClick={onBreakClick}
          sx={{
            color: "white",
            fontWeight: 600,
            fontSize: "0.9rem",
            padding: "8px 24px",
            borderRadius: "10px",
            textTransform: "none",
          }}
        >
          Break
        </Button>
        <Button
          disabled={isFieldsDisabled}
          variant="contained"
          onClick={onHolidayClick}
          sx={{
            color: "white",
            fontWeight: 600,
            fontSize: "0.9rem",
            padding: "8px 24px",
            borderRadius: "10px",
            textTransform: "none",
          }}
        >
          Holiday
        </Button>
      </Box>
    </Box>
  )
);

CalendarToolbar.displayName = "CalendarToolbar";

export default CalendarToolbar;