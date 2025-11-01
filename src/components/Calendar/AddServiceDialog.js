// src/components/Calendar/AddServiceDialog.js
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import { addNewService } from "@/redux/store/slices/calendarSlice";
import { addServiceSchema } from "@/utils/validation";

function AddServiceDialog({ open, onClose }) {
  const dispatch = useDispatch();
  const [newServiceData, setNewServiceData] = useState({
    name: "",
    duration: "",
    type: "",
  });
  const [addServiceError, setAddServiceError] = useState({});

  const handleFieldChange = (field, value) => {
    setNewServiceData({ ...newServiceData, [field]: value });
    if (addServiceError[field]) {
      setAddServiceError({ ...addServiceError, [field]: "" });
    }
  };

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
      onClose();
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

  const handleCloseDialog = () => {
    setNewServiceData({ name: "", duration: "", type: "" });
    setAddServiceError({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
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
          onClick={handleCloseDialog}
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
  );
}

export default AddServiceDialog;