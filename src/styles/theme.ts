import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "'Pixelify Sans', sans-serif",
  },
  palette: {
    primary: {
      main: "#7FD8D4", // Change to match your color theme
    },
    background: {
      default: "#1a1a1a",
    },
  },
});

export default theme;