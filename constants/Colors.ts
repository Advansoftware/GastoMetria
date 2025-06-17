/**
 * Modern color system based on Material You and best practices
 */

export const Colors = {
  light: {
    // Background
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceVariant: '#F1F3F4',
    surfaceContainer: '#FFFFFF',
    
    // Text
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    onSurface: '#1A1A1A',
    onSurfaceVariant: '#374151',
    
    // Primary brand colors
    primary: '#2563EB',
    primaryContainer: '#EBF4FF',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#1E40AF',
    
    // Secondary colors
    secondary: '#059669',
    secondaryContainer: '#ECFDF5',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#047857',
    
    // Accent colors
    accent: '#8B5CF6',
    accentContainer: '#F3F4F6',
    
    // Status colors
    success: '#10B981',
    successContainer: '#ECFDF5',
    onSuccess: '#FFFFFF',
    onSuccessContainer: '#047857',
    warning: '#F59E0B',
    warningContainer: '#FFFBEB',
    onWarning: '#FFFFFF',
    onWarningContainer: '#92400E',
    error: '#EF4444',
    errorContainer: '#FEF2F2',
    onError: '#FFFFFF',
    onErrorContainer: '#DC2626',
    
    // Interactive elements
    interactive: '#3B82F6',
    interactiveHover: '#2563EB',
    
    // Borders and dividers
    border: '#E5E7EB',
    borderSecondary: '#F3F4F6',
    divider: '#F1F3F4',
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowStrong: 'rgba(0, 0, 0, 0.15)',
    
    // Tab navigation
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#2563EB',
    tabBackground: '#FFFFFF',
  },
  dark: {
    // Background
    background: '#0F0F0F',
    surface: '#1A1A1A',
    surfaceVariant: '#262626',
    surfaceContainer: '#1F1F1F',
    
    // Text
    text: '#FFFFFF',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#D1D5DB',
    
    // Primary brand colors
    primary: '#60A5FA',
    primaryContainer: '#1E3A8A',
    onPrimary: '#0F172A',
    onPrimaryContainer: '#DBEAFE',
    
    // Secondary colors
    secondary: '#34D399',
    secondaryContainer: '#064E3B',
    onSecondary: '#0F172A',
    onSecondaryContainer: '#A7F3D0',
    
    // Accent colors
    accent: '#A78BFA',
    accentContainer: '#374151',
    
    // Status colors
    success: '#34D399',
    successContainer: '#064E3B',
    onSuccess: '#0F172A',
    onSuccessContainer: '#A7F3D0',
    warning: '#FBBF24',
    warningContainer: '#92400E',
    onWarning: '#0F172A',
    onWarningContainer: '#FDE68A',
    error: '#F87171',
    errorContainer: '#7F1D1D',
    onError: '#0F172A',
    onErrorContainer: '#FCA5A5',
    
    // Interactive elements
    interactive: '#60A5FA',
    interactiveHover: '#3B82F6',
    
    // Borders and dividers
    border: '#374151',
    borderSecondary: '#4B5563',
    divider: '#374151',
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowStrong: 'rgba(0, 0, 0, 0.5)',
    
    // Tab navigation
    tabIconDefault: '#6B7280',
    tabIconSelected: '#60A5FA',
    tabBackground: '#1A1A1A',
  },
};

export type ColorScheme = keyof typeof Colors;
