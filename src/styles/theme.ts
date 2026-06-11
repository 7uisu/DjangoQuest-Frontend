import { PaletteMode } from "@mui/material";
import { createTheme } from "@mui/material/styles";

export const createAppTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#256d4f",
        light: "#3f8c6b",
        dark: "#174834",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#315a7d",
        light: "#4d7599",
        dark: "#203c54",
        contrastText: "#ffffff",
      },
      success: {
        main: "#2e7d57",
      },
      warning: {
        main: "#b7791f",
      },
      background: {
        default: mode === "light" ? "#f6f8fb" : "#101820",
        paper: mode === "light" ? "#ffffff" : "#17212b",
      },
      text: {
        primary: mode === "light" ? "#1f2933" : "#edf2f7",
        secondary: mode === "light" ? "#5f6f7f" : "#a8b4c2",
      },
      divider: mode === "light" ? "#d8e0e8" : "#2b3a48",
    },
    shape: {
      borderRadius: 6,
    },
    typography: {
      fontFamily:
        '"Inter", "Roboto", "Helvetica Neue", Arial, system-ui, sans-serif',
      h1: { fontWeight: 700, letterSpacing: 0 },
      h2: { fontWeight: 700, letterSpacing: 0 },
      h3: { fontWeight: 700, letterSpacing: 0 },
      h4: { fontWeight: 700, letterSpacing: 0 },
      h5: { fontWeight: 650, letterSpacing: 0 },
      h6: { fontWeight: 650, letterSpacing: 0 },
      button: { textTransform: "none", fontWeight: 650 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: "none",
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: "1px solid",
            borderColor: mode === "light" ? "#d8e0e8" : "#2b3a48",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });

export default createAppTheme("light");
