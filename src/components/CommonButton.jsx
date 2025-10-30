import { Button } from "@mui/material";
import Image from "next/image";
import React from "react";

function CommonButton(props) {
  return (
    <Button
      isSelected={props.isSelected}
      onClick={props.onClick}
      disabled={props.disabled}
      sx={{
        ...props.sx,
        width: "105px",
        height: "65px",
        m: "3px",
        padding: "10px !important ",
        // minWidth:"100px",
        // mt: "5px",
        display: "flex",
        flexDirection: "column",
        border: props.isSelected
          ? "2px solid #1a82d2f6"
          : "1px solid #1172ba80",
        boxShadow: props.isSelected
          ? "rgba(0, 0, 0, 0.1) 0px 6px 12px"
          : "none",
        "&.Mui-disabled": {
          border: "2px solid rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      {props.src && (
        <Image
          src={props.src}
          width={30}
          height={25}
          style={{ objectFit: "contain" }}
          alt={props.text || "button"}
        />
      )}
      {props.children}
    </Button>
  );
}

export default CommonButton;
