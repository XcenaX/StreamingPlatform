import "./styles/main.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { HostProvider } from "./contexts/HostContext";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9147ff',
    },
    background: {
      default: '#0e0e10',
      paper: '#1f1f23',
    },
  },
  typography: {
    fontFamily: '"Manrope", "Inter", "Arial", sans-serif'
  },
});


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <HostProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </HostProvider>
    </ThemeProvider>
  </React.StrictMode>
);
