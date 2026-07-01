import type { ThemeConfig } from "antd";

/**
 * Токены дизайна:
 * — фон: глубокий тёплый тёмно-синий (#0F1729 / #0B1220)
 * — поверхности: #161F36 / #1E2A47
 * — акцент: мягкий индиго #6C8CFF — основной интерактивный цвет
 * — тёплый акцент: #FFB86B — используется точечно (бейджи, предупреждения)
 * — текст: #EDF1FA основной / #93A0C2 вторичный
 * — крупные скругления (16 / 12 / 10) и мягкие тени вместо жёстких рамок
 */
export const palette = {
  bgBase: "#0B1220",
  bgLayout: "#0F1729",
  surface: "#161F36",
  surfaceElevated: "#1E2A47",
  border: "#28365A",
  primary: "#6C8CFF",
  primaryHover: "#86A1FF",
  warm: "#FFB86B",
  success: "#4ADE80",
  danger: "#FF6B6B",
  textPrimary: "#EDF1FA",
  textSecondary: "#93A0C2",
};

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: palette.primary,
    colorBgBase: palette.bgBase,
    colorBgLayout: palette.bgLayout,
    colorBgContainer: palette.surface,
    colorBgElevated: palette.surfaceElevated,
    colorBorder: palette.border,
    colorBorderSecondary: palette.border,
    colorText: palette.textPrimary,
    colorTextSecondary: palette.textSecondary,
    colorSuccess: palette.success,
    colorError: palette.danger,
    colorWarning: palette.warm,
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 10,
    fontFamily:
      "'Manrope', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 15,
  },
  components: {
    Layout: {
      bodyBg: palette.bgLayout,
      headerBg: "transparent",
      siderBg: palette.surface,
    },
    Card: {
      colorBgContainer: palette.surface,
      borderRadiusLG: 18,
    },
    Button: {
      borderRadius: 12,
      controlHeight: 42,
      fontWeight: 600,
    },
    Input: {
      borderRadius: 12,
      controlHeight: 42,
    },
    Modal: {
      borderRadiusLG: 18,
    },
    Notification: {
      borderRadiusLG: 16,
    },
  },
};
