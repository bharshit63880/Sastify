import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: '#6B46C1',
      light: '#927bf5',
      dark: '#4834B0',
      contrastText: '#fff'
    },
    secondary: {
      main: '#FFB6B9',
      light: '#FFE0E3',
      dark: '#FF6F91',
      contrastText: '#fff'
    },
    background: {
      default: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      paper: 'rgba(255,255,255,0.85)'
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626'
    },
    success: {
      main: '#4ade80',
      light: '#bbf7d0',
      dark: '#166534'
    }
  },
  shape: {
    borderRadius: 18
  },
  shadows: [
    "none",
    "0 2px 16px 0 rgba(107,70,193,0.08)",
    ...Array(23).fill("0 4px 32px 0 rgba(107,70,193,0.10)")
  ],
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
    h1: {
      fontSize: "4rem",
      fontWeight: 900,
      letterSpacing: ".05em",
      background: "linear-gradient(90deg, #6B46C1, #FFB6B9)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      "@media (max-width:960px)": { fontSize: "3rem" },
      "@media (max-width:600px)": { fontSize: "2.2rem" },
    },
    h2: {
      fontSize: "2.5rem",
      fontWeight: 800,
      letterSpacing: ".04em",
      "@media (max-width:960px)": { fontSize: "2rem" },
      "@media (max-width:600px)": { fontSize: "1.5rem" },
    },
    h3: {
      fontSize: "2rem",
      fontWeight: 700,
      "@media (max-width:960px)": { fontSize: "1.5rem" },
      "@media (max-width:600px)": { fontSize: "1.2rem" },
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 700,
      "@media (max-width:960px)": { fontSize: "1.2rem" },
      "@media (max-width:600px)": { fontSize: "1rem" },
    },
    h5: {
      fontSize: "1.2rem",
      fontWeight: 600,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
    },
    body2: {
      fontSize: ".97rem",
      fontWeight: 400,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: ".03em"
    }
  },
});

export default theme;