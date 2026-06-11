/**
 * Premium E-Commerce Theme
 * Indigo/Violet palette, modern card-based design
 */

export const Colors = {
  light: {
    primary: '#004ac6',
    primaryDark: '#003ea8',
    primaryLight: '#dbe1ff',
    primaryGlow: 'rgba(0, 74, 198, 0.08)',
    secondary: '#fb923c',
    secondaryLight: '#ffdcc5',
    background: '#f7f9fb',
    card: '#ffffff',
    backgroundElement: '#f2f4f6',
    backgroundSelected: '#eceef0',
    backgroundGlass: 'rgba(255, 255, 255, 0.72)',
    text: '#191c1e',
    textSecondary: '#434655',
    textTertiary: '#737686',
    danger: '#ba1a1a',
    dangerLight: '#ffdad6',
    success: '#2e7d32',
    successLight: '#e8f5e9',
    warning: '#ed6c02',
    warningLight: '#fff3e0',
    info: '#0288d1',
    infoLight: '#e1f5fe',
    error: '#dc2626',
    errorLight: '#fef2f2',
    star: '#f59e0b',
    starLight: '#fef3c7',
    border: '#c3c6d7',
    tint: '#004ac6',
    icon: '#434655',
    tabIconDefault: '#737686',
    tabIconSelected: '#004ac6',
    gradientStart: '#004ac6',
    gradientEnd: '#2563eb',
    gradientAccent: '#fb923c',
    shadow: 'rgba(0, 0, 0, 0.05)',
    shadowDark: 'rgba(0, 0, 0, 0.1)',
  },
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
  eight: 80,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  marginMobile: 20,
  gutterMobile: 16,
};

export const FontSize = {
  display: 32,
  hero: 32,
  heading: 24,
  subheading: 20,
  price: 18,
  bodyLg: 16,
  body: 14,
  caption: 12,
  small: 12,
  tiny: 10,
  headlineXl: 32,
  headlineLg: 24,
  headlineMd: 20,
  bodyMd: 14,
  labelLg: 14,
  labelSm: 12,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 28,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 12,
  },
  glow: {
    shadowColor: '#004ac6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
  },
};

export const CategoryTints = [
  '#dbe1ff',
  '#ffdcc5',
  '#e8f5e9',
  '#fff3e0',
  '#f3e8ff',
  '#fce7f3',
  '#e0f2fe',
  '#ffe4e6',
];

export const CategoryIcons: Record<string, string> = {
  'Điện thoại': 'phone-portrait-outline',
  'Laptop': 'laptop-outline',
  'Phụ kiện': 'headset-outline',
  'Tablet': 'tablet-portrait-outline',
};
