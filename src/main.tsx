import { ParallaxProvider } from 'react-scroll-parallax';
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./styles/theme";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ParallaxProvider>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </ParallaxProvider>
  </StrictMode>
);
