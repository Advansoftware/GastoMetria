import React from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { tw } from '@/utils/tailwind';

export interface ModernButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
}

export function ModernButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onPress,
  ...props
}: ModernButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Base classes for button
  const getButtonStyle = () => {
    const baseStyle = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: 12,
    };

    // Size variants
    const sizeStyles = {
      sm: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 32 },
      md: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
      lg: { paddingHorizontal: 24, paddingVertical: 16, minHeight: 48 },
      xl: { paddingHorizontal: 32, paddingVertical: 20, minHeight: 56 }
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: colors.primary,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
      },
      secondary: {
        backgroundColor: colors.secondary,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      destructive: {
        backgroundColor: colors.error,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
      }
    };

    // Disabled state
    const disabledStyle = disabled ? { opacity: 0.5 } : {};

    // Full width
    const widthStyle = fullWidth ? { width: '100%' as const } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...disabledStyle,
      ...widthStyle,
    };
  };

  // Text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return colors.primary;
      case 'destructive':
        return colors.onError;
      case 'secondary':
        return colors.onSecondary;
      case 'primary':
      default:
        return colors.onPrimary;
    }
  };

  // Text size based on button size
  const getTextStyle = () => {
    const sizeStyles = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
      xl: { fontSize: 20 }
    };

    return {
      fontWeight: '600' as const,
      textAlign: 'center' as const,
      color: getTextColor(),
      ...sizeStyles[size],
    };
  };

  // Icon size based on button size
  const getIconSize = () => {
    const iconSizes = {
      sm: 16,
      md: 20,
      lg: 24,
      xl: 28
    };
    return iconSizes[size];
  };

  // Icon color based on variant
  const getIconColor = () => {
    return getTextColor();
  };

  const handlePress = (event: any) => {
    if (disabled || loading) return;
    onPress?.(event);
  };

  return (
    <Pressable
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getIconColor()} 
          style={{ marginRight: leftIcon ? 8 : 0 }}
        />
      ) : (
        leftIcon && (
          <MaterialIcons
            name={leftIcon}
            size={getIconSize()}
            color={getIconColor()}
            style={{ marginRight: 8 }}
          />
        )
      )}

      <Text style={getTextStyle()}>
        {children}
      </Text>

      {!loading && rightIcon && (
        <MaterialIcons
          name={rightIcon}
          size={getIconSize()}
          color={getIconColor()}
          style={{ marginLeft: 8 }}
        />
      )}
    </Pressable>
  );
}

// Export com nome compatível
export const Button = ModernButton;
