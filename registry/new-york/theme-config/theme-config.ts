// Body Bliss Visio Theme Configuration
// This file defines the color palette and theme variables for the application

export const themeColors = {
  primary: "#6666FF", // Main brand color (violet-blue)
  primaryDark: "#5151CC", // Darker shade of primary
  primaryLight: "#8282FF", // Lighter shade of primary
  
  secondary: "#4287f5", // Secondary color (blue)
  secondaryDark: "#3269c2", // Darker shade of secondary
  secondaryLight: "#6ba5ff", // Lighter shade of secondary
  
  accent: "#7986cb", // Accent color (indigo)
  accentDark: "#5c6bc0", // Darker shade of accent
  accentLight: "#9fa8da", // Lighter shade of accent
  
  success: "#4caf50", // Success color (green)
  warning: "#ff9800", // Warning color (orange)
  error: "#f44336", // Error color (red)
  info: "#2196f3", // Info color (blue)
  
  background: {
    main: "#ffffff", // Main background color
    alt: "#f8f9ff", // Alternative background color
    card: "#ffffff", // Card background color
  },
  
  text: {
    primary: "#333333", // Primary text color
    secondary: "#666666", // Secondary text color
    disabled: "#999999", // Disabled text color
    light: "#ffffff", // Light text color (for dark backgrounds)
  },
  
  border: {
    light: "#e0e0e0", // Light border color
    medium: "#cccccc", // Medium border color
    dark: "#999999", // Dark border color
  },
  
  shadow: {
    small: "0 2px 4px rgba(102, 102, 255, 0.1)",
    medium: "0 4px 8px rgba(102, 102, 255, 0.15)",
    large: "0 8px 16px rgba(102, 102, 255, 0.2)",
    button: "0 4px 10px rgba(102, 102, 255, 0.3)",
  },
  
  gradient: {
    primary: "linear-gradient(135deg, #6666FF 0%, #5151CC 100%)",
    secondary: "linear-gradient(135deg, #4287f5 0%, #3269c2 100%)",
    accent: "linear-gradient(135deg, #7986cb 0%, #5c6bc0 100%)",
  }
};

export const themeConfig = {
  colors: themeColors,
  borderRadius: {
    small: "0.25rem",
    medium: "0.5rem",
    large: "1rem",
    xl: "1.5rem",
    pill: "9999px",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
  },
  transition: {
    fast: "150ms ease-in-out",
    medium: "250ms ease-in-out",
    slow: "350ms ease-in-out",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.25rem",
    xl: "1.5rem",
    xxl: "2rem",
    xxxl: "2.5rem",
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  }
};

export default themeConfig; 