import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";

const CommonCard = (props) => {
  return (
    <Card
      sx={{
        m: 0.1,
        boxShadow: 3,
        borderRadius: 2,
        boxSizing: "border-box",
        boxShadow: "rgba(90, 114, 123, 0.11) 0px 7px 30px 0px",
        border: "1px solid rgba(0, 0, 0, 0.12)",
        ...props.sx,
      }}
    >
      <CardContent
        sx={{
          padding: "9px !important",
          backgroundColor: "rgb(255, 255, 255)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "rgb(241, 241, 241)",

            borderRadius: "6px",
            alignItems: "center",
          }}
        >
          {props.title && (
            <Typography
              sx={{
                p: 0.2,
                m: 1,
                fontSize: "1rem",
                fontFamily: "Nunito, sans-serif",
                fontWeight: 500,
                lineHeight: 1.5,
              }}
              // variant="h5"
              component="div"
              gutterBottom
            >
              {props.title}
            </Typography>
          )}
          {props.actions && (
            <CardActions>
              {props.actions.map((action, index) => (
                <Button
                  key={index}
                  sx={{
                    textTransform: "none",
                    "&.Mui-disabled": {
                      backgroundColor: "rgba(0, 0, 0, 0.26) !important",
                      color: "white !important",
                      opacity: 0.7,
                    },
                  }}
                  size="small"
                  variant={action.variant || "text"}
                  // color={action.color || "primary"}
                  onClick={action.onClick}
                  disabled={action.disabled || false}
                >
                  {action.label}
                </Button>
              ))}
            </CardActions>
          )}
        </Box>
        {props.children}
      </CardContent>
    </Card>
  );
};

export default CommonCard;
