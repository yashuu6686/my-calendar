export const data = [
  { type: "Day" },
  { type: "Start Time" },
  { type: "End Time" },
  { type: "Actions" },
];
export const holidayData = [
  { type: "Date" },
  { type: "Start Time" },
  { type: "End Time" },
  { type: "Actions" },
];

export const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const timePickers = [
  {
    label: "Start Time",
    field: "startTime",
    // width: "100%",
   
  },
  {
    label: "End Time",
    field: "endTime",
    // width: "100%",
    mr: 0.5,
  },
];

export const serviceOptions = [
  "Video Call (15 Minutes)",
  "Clinic Visit (30 Minutes)",
  "Home Visit (90 Minutes)",
];

export const holidayPickers = [
  {
    label: "Start Time",
    field: "startTime",
    width: "281px",
    mr: "9px",
  },
  {
    label: "End Time",
    field: "endTime",
    width: "283px",
    // mr: 0.5,
  },
];

export { default as video } from "../../public/Video_Call_Service.png";
export { default as clinic } from "../../public/Clinic_Visit_Service.png";
export { default as home } from "../../public/Home_Visit_Service.webp";
export { default as tooth } from "../../public/tooth 1.png";
export { default as gen } from "../../public/General.png";
export { default as nuro } from "../../public/Neurologist.png";
export { default as ortho } from "../../public/Orthopaedic.png";
export { default as cardio } from "../../public/cardiology.png";

// export { default as WorkingPlan } from "./WorkingPlan";
// export { default as Specialitie } from "./Specialitie";
// export { default as AdvanceBooking } from "./AdvanceBooking";
// export { default as AppointmentBooking } from "./AppointmentBooking";
// export { default as Break } from "./Break";
// export { default as Holidays } from "./Holidays";
