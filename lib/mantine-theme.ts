import {
  createTheme,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from "@mantine/core";

/** Sky → cobalt scale. Shade 3 is --brand, shade 5 is --brand-2. */
const brand: MantineColorsTuple = [
  "#e0f2fe",
  "#bae6fd",
  "#7dd3fc",
  "#38bdf8",
  "#0ea5e9",
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
  "#1e40af",
  "#1e3a8a",
];

/** Navy field. 0 text, 2 muted, 4 borders, 6 cards, 7 page, 8 inset. */
const dark: MantineColorsTuple = [
  "#eef3ff",
  "#c5d4ec",
  "#9aafd0",
  "#3a4f78",
  "#2a3a5c",
  "#1a2744",
  "#121a33",
  "#0b1224",
  "#070d1c",
  "#040814",
];

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    "--mantine-color-anchor": "#38bdf8",
  },
  light: {},
  dark: {
    "--mantine-color-anchor": "#38bdf8",
    "--mantine-color-error": "#f87171",
    "--mantine-color-placeholder": "#9aafd0",
  },
});

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 5,
  autoContrast: false,
  cursorType: "pointer",
  defaultRadius: "md",
  fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  fontFamilyMonospace:
    "var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace",
  headings: {
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
    fontWeight: "650",
  },
  defaultGradient: { from: "#38bdf8", to: "#3b82f6", deg: 135 },
  colors: { brand, dark },
  white: "#eef3ff",
  black: "#041018",
  radius: {
    xs: "4px",
    sm: "8px",
    md: "10px",
    lg: "16px",
    xl: "24px",
  },
  components: {
    Button: {
      defaultProps: { radius: "md" },
    },
    ActionIcon: {
      defaultProps: { radius: "md", variant: "subtle", color: "gray" },
    },
    Modal: {
      defaultProps: {
        centered: true,
        radius: "lg",
        overlayProps: { backgroundOpacity: 0.6, blur: 4 },
      },
      styles: {
        content: {
          background: "var(--grad-surface)",
          border: "1px solid var(--line)",
          boxShadow: "0 24px 64px -20px rgba(0,0,0,0.75)",
        },
        header: { background: "transparent" },
        title: { fontWeight: 600, color: "var(--text)" },
      },
    },
    Tooltip: {
      defaultProps: { openDelay: 0, radius: "md", multiline: true },
      styles: {
        tooltip: {
          background: "var(--bg-soft)",
          color: "var(--text)",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-sm)",
          maxWidth: "20rem",
        },
      },
    },
    Menu: {
      styles: {
        dropdown: {
          background: "var(--bg-soft)",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-sm)",
        },
      },
    },
    Switch: {
      defaultProps: { color: "brand", withThumbIndicator: false },
    },
    Checkbox: {
      defaultProps: { color: "brand", radius: "xs" },
    },
    Alert: {
      defaultProps: { radius: "md", variant: "light" },
    },
    Badge: {
      defaultProps: { radius: "xl" },
    },
  },
});
