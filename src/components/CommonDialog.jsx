import React from "react";
import { Dialog, Box, Typography, Button } from "@mui/material";

const CommonDialog = (props) => {
  return (
    <Dialog fullWidth={props.fullWidth} open={props.open} onClose={props.onClose} sx={{...props.sx, borderRadius:"15px !important",}}   >
      <Box sx={{ m: 2, ...props.sx }}>
        {props.title && (
          <Typography
            sx={{
              p: 1.5,
              mb: 1,
             
              backgroundColor: "rgb(241, 241, 241)",
              borderRadius: 2,
              fontWeight: 500,
            }}
          >
            {props.title}
          </Typography>
        )}

        {props.children}

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            mr:1,
            mt:2
          }}
        >
          <Button
            onClick={props.onClose}
            sx={{ textTransform: "none",mr:1 }}
          >
            {props.cancelLabel}
          </Button>
          {props.onSave && (
            <Button
              variant="contained"
              sx={{  textTransform: "none" }}
              onClick={props.onSave}
            >
              {props.saveLabel}
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

export default CommonDialog;
