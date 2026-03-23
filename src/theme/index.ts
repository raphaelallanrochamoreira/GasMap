export const Colors = {
  primary: '#F97316',
  primaryDark: '#EA6610',
  accent: '#10B981',
  fuel: {
    gasolina: '#F59E0B',
    gasolina_aditivada: '#F97316',
    etanol: '#10B981',
    diesel: '#6366F1',
    diesel_s10: '#8B5CF6',
    gnv: '#3B82F6',
  },
  background: '#0F172A',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  border: '#334155',
  borderLight: '#475569',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  success: '#22C55E',
  warning: '#FBBF24',
  error: '#EF4444',
  info: '#3B82F6',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.55)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;
