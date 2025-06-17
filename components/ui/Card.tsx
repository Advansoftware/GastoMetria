import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { tw } from '@/utils/tailwind';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Card({ 
  children, 
  variant = 'default',
  padding = 'md',
  style,
  ...props
}: CardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const getCardStyle = () => {
    const baseStyle = tw('rounded-xl');

    // Variant styles with theme-aware colors
    const variantStyles = {
      default: { backgroundColor: colors.surfaceContainer },
      elevated: [
        { backgroundColor: colors.surfaceContainer }, 
        {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.15,
          shadowRadius: 8,
          elevation: 4,
        }
      ],
      outlined: [
        { backgroundColor: colors.surfaceContainer },
        {
          borderWidth: 1,
          borderColor: colors.border,
        }
      ],
      ghost: { backgroundColor: 'transparent' }
    };

    // Padding styles
    const paddingStyles = {
      none: {},
      sm: tw('p-2'),
      md: tw('p-4'),
      lg: tw('p-6'),
      xl: tw('p-8')
    };

    return [
      baseStyle,
      variantStyles[variant],
      paddingStyles[padding],
      style
    ];
  };

  return (
    <View
      style={getCardStyle()}
      {...props}
    >
      {children}
    </View>
  );
}
