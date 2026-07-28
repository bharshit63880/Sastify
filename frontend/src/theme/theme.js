import { alpha, createTheme } from "@mui/material/styles";

const paletteByMode = {
  light: {
    page: "#f7f8fc",
    surface: "#ffffff",
    raised: "#ffffff",
    text: "#12162a",
    secondaryText: "#5f667c",
    border: "#dde1ec",
  },
  dark: {
    page: "#0b1020",
    surface: "#12182b",
    raised: "#182039",
    text: "#f7f8ff",
    secondaryText: "#aab2ca",
    border: "#2b3551",
  },
};

export const createSastifyTheme = (mode = "light") => {
  const colors = paletteByMode[mode] || paletteByMode.light;
  const primary = "#6d4aff";
  const secondary = "#1f5eff";

  return createTheme({
    palette: {
      mode,
      primary: { main: primary, contrastText: "#ffffff" },
      secondary: { main: secondary, contrastText: "#ffffff" },
      background: { default: colors.page, paper: colors.surface },
      text: { primary: colors.text, secondary: colors.secondaryText },
      divider: colors.border,
      success: { main: mode === "dark" ? "#45d39a" : "#16865f" },
      warning: { main: mode === "dark" ? "#ffc761" : "#a96500" },
      error: { main: mode === "dark" ? "#ff7a96" : "#c83e62" },
      info: { main: mode === "dark" ? "#66c7ff" : "#1677bd" },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
      h1: { fontWeight: 750, lineHeight: 1.05, letterSpacing: "-0.045em" },
      h2: { fontWeight: 720, lineHeight: 1.1, letterSpacing: "-0.035em" },
      h3: { fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em" },
      button: { fontWeight: 650, textTransform: "none", letterSpacing: "-0.01em" },
      body1: { lineHeight: 1.65 },
      body2: { lineHeight: 1.55 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: colors.page, color: colors.text },
          "*, *::before, *::after": { boxSizing: "border-box" },
          ":focus-visible": { outline: `3px solid ${alpha(primary, 0.42)}`, outlineOffset: 3 },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            minHeight: 42,
            borderRadius: 999,
            paddingInline: 18,
            transition: "transform 160ms ease, background-color 200ms ease, border-color 200ms ease",
            "&:active": { transform: "scale(.98)" },
            "&.Mui-focusVisible": { boxShadow: `0 0 0 4px ${alpha(primary, 0.22)}` },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: alpha(colors.raised, mode === "dark" ? 0.72 : 0.9),
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: primary,
              borderWidth: 2,
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            color: colors.text,
            backgroundColor: colors.surface,
            backgroundImage: "none",
            borderColor: colors.border,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            border: `1px solid ${colors.border}`,
            boxShadow: mode === "dark" ? "0 18px 48px rgba(0,0,0,.3)" : "0 18px 48px rgba(31,38,75,.09)",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 28,
            border: `1px solid ${colors.border}`,
            boxShadow: "0 32px 90px rgba(5,8,20,.34)",
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 10,
            padding: "8px 11px",
            fontSize: 12,
            backgroundColor: mode === "dark" ? "#f7f8ff" : "#12162a",
            color: mode === "dark" ? "#12162a" : "#ffffff",
          },
        },
      },
    },
  });
};

export const theme = createSastifyTheme("light");
export default theme;
