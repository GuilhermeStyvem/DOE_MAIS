import { Platform } from "react-native";

export const colors = {
  maroon: "#7A0F16",
  blood: "#B3161F",
  bloodBright: "#E11D2E",
  bloodSoft: "#F5A3A9",
  bg: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceMuted: "#FDF3F3",
  ink: "#1A1A1A",
  inkSoft: "#5C5C5C",
  inkFaint: "#9A9A9A",
  line: "#ECECEC",
} as const;

export const spacing = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
  xxl: 72,
};

export const type = {
  display: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" }),
  body: Platform.select({ ios: "System", android: "sans-serif", default: "System" }),
};

// Gradientes centralizados
export const markGradient = [colors.bloodBright, colors.blood] as const;
export const topGradient = [colors.maroon, colors.blood, colors.bloodBright] as const;
export const heroGradient = [colors.maroon, colors.blood, colors.bloodBright] as const;
export const waveGradient = [colors.bloodBright, colors.blood] as const;
export const trustGradient = [colors.maroon, colors.blood] as const;