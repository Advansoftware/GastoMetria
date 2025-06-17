import React, { useState, useRef } from 'react';
import { 
  TextInput, 
  Text, 
  View, 
  TextInputProps, 
  Animated,
  Pressable
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { tw } from '@/utils/tailwind';

interface ModernInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'outlined' | 'filled' | 'underlined';
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  className?: string;
}

export function ModernInput({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'outlined',
  size = 'md',
  required = false,
  className = '',
  onFocus,
  onBlur,
  value,
  ...props
}: ModernInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleFocus = (event: any) => {
    setIsFocused(true);
    animateLabel(true);
    onFocus?.(event);
  };

  const handleBlur = (event: any) => {
    setIsFocused(false);
    if (!hasValue) {
      animateLabel(false);
    }
    onBlur?.(event);
  };

  const handleChangeText = (text: string) => {
    setHasValue(!!text);
    if (text && !hasValue) {
      animateLabel(true);
    } else if (!text && hasValue) {
      animateLabel(false);
    }
    props.onChangeText?.(text);
  };

  const animateLabel = (focused: boolean) => {
    Animated.timing(labelAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Container classes
  const getContainerClasses = () => {
    const baseClasses = ['relative'];

    const sizeClasses = {
      sm: 'mb-3',
      md: 'mb-4',
      lg: 'mb-5'
    };

    return [
      ...baseClasses,
      sizeClasses[size],
      className
    ].filter(Boolean).join(' ');
  };

  // Input container classes
  const getInputContainerClasses = () => {
    const baseClasses = ['flex-row items-center'];

    const variantClasses = {
      outlined: `border-2 rounded-xl ${
        error 
          ? 'border-red-500' 
          : isFocused 
            ? 'border-blue-500' 
            : 'border-gray-300 dark:border-gray-600'
      } bg-white dark:bg-gray-800`,
      filled: `rounded-xl ${
        error 
          ? 'bg-red-50 dark:bg-red-900/20' 
          : 'bg-gray-100 dark:bg-gray-700'
      }`,
      underlined: `border-b-2 ${
        error 
          ? 'border-red-500' 
          : isFocused 
            ? 'border-blue-500' 
            : 'border-gray-300 dark:border-gray-600'
      } bg-transparent`
    };

    const sizeClasses = {
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-5 py-4'
    };

    return [
      ...baseClasses,
      variantClasses[variant],
      sizeClasses[size]
    ].filter(Boolean).join(' ');
  };

  // Input classes
  const getInputClasses = () => {
    const baseClasses = ['flex-1 text-gray-900 dark:text-white'];

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };

    return [
      ...baseClasses,
      sizeClasses[size]
    ].join(' ');
  };

  // Label classes
  const getLabelClasses = () => {
    const baseClasses = ['font-medium'];

    const colorClasses = error 
      ? 'text-red-500' 
      : isFocused 
        ? 'text-blue-500' 
        : 'text-gray-700 dark:text-gray-300';

    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    };

    return [
      ...baseClasses,
      colorClasses,
      sizeClasses[size]
    ].join(' ');
  };

  const getIconSize = () => {
    const iconSizes = {
      sm: 18,
      md: 20,
      lg: 24
    };
    return iconSizes[size];
  };

  const getIconColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return colors.textSecondary;
  };

  return (
    <View style={tw(getContainerClasses())}>
      {/* Label */}
      {label && (
        <Text style={tw(`${getLabelClasses()} mb-1`)}>
          {label}
          {required && <Text style={tw("text-red-500 ml-1")}>*</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View style={tw(getInputContainerClasses())}>
        {/* Left Icon */}
        {leftIcon && (
          <MaterialIcons
            name={leftIcon}
            size={getIconSize()}
            color={getIconColor()}
            style={{ marginRight: 8 }}
          />
        )}

        {/* Text Input */}
        <TextInput
          style={tw(getInputClasses())}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          placeholderTextColor={colors.textTertiary}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <Pressable onPress={onRightIconPress}>
            <MaterialIcons
              name={rightIcon}
              size={getIconSize()}
              color={getIconColor()}
              style={{ marginLeft: 8 }}
            />
          </Pressable>
        )}
      </View>

      {/* Helper Text */}
      {(hint || error) && (
        <Text 
          style={tw(`text-xs mt-1 ${
            error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
          }`)}
        >
          {error || hint}
        </Text>
      )}
    </View>
  );
}
