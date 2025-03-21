import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { themeColors } from "./theme-config";

// Utility function that merges Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Theme-specific button variants
export const getButtonVariantClasses = (variant: string = 'default') => {
  const variants = {
    default: `bg-[${themeColors.primary}] hover:bg-[${themeColors.primaryDark}] text-white`,
    secondary: `bg-[${themeColors.secondary}] hover:bg-[${themeColors.secondaryDark}] text-white`,
    accent: `bg-[${themeColors.accent}] hover:bg-[${themeColors.accentDark}] text-white`,
    outline: `border border-[${themeColors.primary}] text-[${themeColors.primary}] hover:bg-[${themeColors.primary}] hover:text-white`,
    ghost: `text-[${themeColors.primary}] hover:bg-[${themeColors.primary}] hover:bg-opacity-10`,
    destructive: `bg-[${themeColors.error}] hover:bg-[#d32f2f] text-white`,
    success: `bg-[${themeColors.success}] hover:bg-[#388e3c] text-white`,
    warning: `bg-[${themeColors.warning}] hover:bg-[#ef6c00] text-white`,
    link: `text-[${themeColors.primary}] underline underline-offset-4 hover:text-[${themeColors.primaryDark}]`,
  };
  
  return variants[variant as keyof typeof variants] || variants.default;
};

// Theme-specific card variants
export const getCardVariantClasses = (variant: string = 'default') => {
  const variants = {
    default: "bg-white border border-gray-200",
    primary: `bg-[${themeColors.primary}] text-white`,
    secondary: `bg-[${themeColors.secondary}] text-white`,
    accent: `bg-[${themeColors.accent}] text-white`,
    outline: `border-2 border-[${themeColors.primary}]`,
    ghost: "bg-gray-50",
  };
  
  return variants[variant as keyof typeof variants] || variants.default;
};

// Theme-specific text color classes
export const getTextColorClasses = (variant: string = 'default') => {
  const variants = {
    default: `text-[${themeColors.text.primary}]`,
    secondary: `text-[${themeColors.text.secondary}]`,
    disabled: `text-[${themeColors.text.disabled}]`,
    primary: `text-[${themeColors.primary}]`,
    accent: `text-[${themeColors.accent}]`,
    light: `text-[${themeColors.text.light}]`,
    success: `text-[${themeColors.success}]`,
    error: `text-[${themeColors.error}]`,
    warning: `text-[${themeColors.warning}]`,
    info: `text-[${themeColors.info}]`,
  };
  
  return variants[variant as keyof typeof variants] || variants.default;
};

// Theme-specific background color classes
export const getBackgroundColorClasses = (variant: string = 'default') => {
  const variants = {
    default: `bg-[${themeColors.background.main}]`,
    alt: `bg-[${themeColors.background.alt}]`,
    card: `bg-[${themeColors.background.card}]`,
    primary: `bg-[${themeColors.primary}]`,
    primaryLight: `bg-[${themeColors.primaryLight}]`,
    secondary: `bg-[${themeColors.secondary}]`,
    secondaryLight: `bg-[${themeColors.secondaryLight}]`,
    accent: `bg-[${themeColors.accent}]`,
    accentLight: `bg-[${themeColors.accentLight}]`,
  };
  
  return variants[variant as keyof typeof variants] || variants.default;
};

// Generate gradient background styles
export const getGradientBackgroundStyle = (variant: string = 'primary') => {
  const gradients = {
    primary: themeColors.gradient.primary,
    secondary: themeColors.gradient.secondary,
    accent: themeColors.gradient.accent,
  };
  
  return { backgroundImage: gradients[variant as keyof typeof gradients] || gradients.primary };
}; 