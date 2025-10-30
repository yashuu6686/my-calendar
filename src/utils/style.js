"use client";

import { BorderBottom } from "@mui/icons-material";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

// Step 1: Base theme
const baseTheme = createTheme({
  palette: {
    primary: {
      main: "#1172BA",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#9c27b0",
      contrastText: "#fffff",
    },
    error: {
      main: "#e41608ff",
    },
    action: {
      main: "#fffff",
      color: "#ffffff",
      // hover: "rgb(198, 228, 251)",
      color: "#fffff",
      backgroundColor: "#4414d4ff",
      // borderRadius: "8px 8px 0 0",
      boxShadow:
        "inset 4px 2px 8px rgba(95, 157, 231, .48), inset -4px -2px 8px #fff",
    },
  },
});

const theam = createTheme(baseTheme, {
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          "&.MuiButton-containedError:hover": {
            backgroundColor: baseTheme.palette.action.backgroundColor,
            color: baseTheme.palette.action.color,
          },
          "&.MuiButton-containedSecondary:hover": {
            backgroundColor: baseTheme.palette.action.backgroundColor,
            color: baseTheme.palette.action.color,
          },
          "&.MuiButton-containedPrimary:hover": {
            backgroundColor: baseTheme.palette.action.backgroundColor,
            color: baseTheme.palette.action.color,
          },
          "&.MuiButton-containedSuccess:hover": {
            backgroundColor: baseTheme.palette.action.backgroundColor,
            color: baseTheme.palette.action.color,
          },
          "&.MuiButton-containedInfo:hover": {
            backgroundColor: baseTheme.palette.action.hover,
            color: baseTheme.palette.action.color,
          },
          "&.MuiButton-containedWarning:hover": {
            backgroundColor: baseTheme.palette.action.backgroundColor,
            color: baseTheme.palette.action.color,
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          width: "100%",
          height: "100%px",
          aligItems:"center",
          borderRadius: "20px",
          backgroundColor: baseTheme.palette.main,
          boxShadow: baseTheme.palette.action.boxShadow,
        },
      },
    },

    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: baseTheme.palette.action.backgroundColor,
          height: "100%",
          width: "100%",
          boxShadow: baseTheme.palette.action.boxShadow,
          "&:hover": {
            backgroundColor: baseTheme.palette.action.backgroundColor,
          },
        },
        input: {
          padding: "12px 14px",
          fontSize: "16px",
        },
      },
    },

    MuiInput: {
      styleOverrides: {
        root: {
          width: "100%",
          height: "100%",
          boxShadow: baseTheme.palette.action.boxShadow,
          borderStyle: "none",
        },
        input: {
          padding: "12px 14px",
          fontSize: "16px",
        },
      },
    },

    MuiSwitch: {
      styleOverrides: {
        root: {
          width: "60px !important",
          height: "30px !important",
          margin: "3px",
          padding: 0,
          display: "flex",
          "& .MuiSwitch-switchBase": {
            padding: 2,
            margin: "3px",
            "&.Mui-checked": {
              marginLeft: "-13px",
              marginTop: "3px",
              transform: "translateX(46px)",
              color: "#fff",
              "& + .MuiSwitch-track": {
                backgroundColor: "#1172ba",
                opacity: 1,
                "&::before": {
                  content: '"Yes"',
                  left: 11,
                  color: "#fff",
                },
                "&::after": {
                  content: '"No"',
                  right: 10,
                  color: "transparent",
                },
              },
            },
          },
          "& .MuiSwitch-thumb": {
            width: 20,
            height: 20,
            borderRadius: "50%",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          },
          "& .MuiSwitch-track": {
            borderRadius: 19,
            backgroundColor: "#ccc",
            opacity: 1,
            position: "relative",
            "&::before, &::after": {
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 14,
              fontWeight: 600,
            },
            "&::before": {
              content: '"Yes"',
              left: 10,
              color: "transparent",
            },
            "&::after": {
              content: '"No"',
              right: 10,
              color: "#fff",
            },
          },
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        root: {
          color: baseTheme.palette.action.color,
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: "#fffff",
          "&:hover": {
            backgroundColor: baseTheme.palette.action.hover,
            color: "#fffff",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          display: "none",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontSize: "16px",
          fontWeight: 500,
          color: "black",
          minHeight: 48,
          "&.Mui-selected": {
            fontWeight: 500,
            backgroundColor: baseTheme.palette.action.backgroundColor,
            color: "#ffffff",
            borderRadius: baseTheme.palette.action.borderRadius,
            borderBottomRadius: baseTheme.palette.action.borderBottomRadius,
          },
        },
      },
    },
    // MuiToggleButtonGroup: {
    //   styleOverrides: {
    //     root: {},
    //   },
    // },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          width: "100px",
          border: "none",
          borderRadius: "17px !important",
          textTransform: "none",
          "&.Mui-selected": {
            backgroundColor: "#1172BA !important",
            color: "#fff",
            fontWeight: "bold",
            hover:"none"
          },
          "&:not(.Mui-selected)": {
            color: "rgba(0,0,0,0.6)",
          },
          "&.Mui-selected:hover": {
            backgroundColor: baseTheme.palette.action.backgroundColor,
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          // margin: "3px",
          // padding: "5px",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "2px",
        },
      },
    },
  },
});

// export default style;


export default function ThemeRegistry({ children }) {
  return (
    <ThemeProvider theme={theam}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
