import { Text, type TextProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { tw } from '@/utils/tailwind';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'secondary' | 'tertiary';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];

  const getColor = () => {
    if (lightColor && effectiveTheme === 'light') return lightColor;
    if (darkColor && effectiveTheme === 'dark') return darkColor;
    
    switch (type) {
      case 'title':
      case 'subtitle':
      case 'defaultSemiBold':
        return colors.onSurface;
      case 'link':
        return colors.primary;
      case 'secondary':
        return colors.textSecondary;
      case 'tertiary':
        return colors.textTertiary;
      default:
        return colors.text;
    }
  };

  const getTypeClasses = () => {
    switch (type) {
      case 'title':
        return 'text-3xl font-bold leading-8';
      case 'subtitle':
        return 'text-xl font-bold';
      case 'defaultSemiBold':
        return 'text-base leading-6 font-semibold';
      case 'link':
        return 'text-base leading-7';
      case 'secondary':
        return 'text-sm leading-5';
      case 'tertiary':
        return 'text-xs leading-4';
      default:
        return 'text-base leading-6';
    }
  };

  return (
    <Text
      style={[tw(getTypeClasses()), { color: getColor() }, style]}
      {...rest}
    />
  );
}


