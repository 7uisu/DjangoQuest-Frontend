import { ParallaxProvider } from 'react-scroll-parallax';

import { createRoot } from "react-dom/client";
import { AppThemeProvider } from "./styles/ThemeModeProvider";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ParallaxProvider>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </ParallaxProvider>
);
