import { StyleSheet } from 'react-native';

// Sistema de cores baseado no Tailwind CSS
const colors = {
  // Grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  // Blues
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
  },
  // Greens
  green: {
    500: '#22c55e',
    600: '#16a34a',
  },
  // Reds
  red: {
    500: '#ef4444',
    600: '#dc2626',
  },
  // Primary colors
  primary: '#3b82f6',
  secondary: '#6b7280',
};

// Sistema de spacing baseado no Tailwind CSS
const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

// Função para criar estilos responsivos
export const tw = (classNames: string) => {
  const styles: any = {};
  
  const classes = classNames.split(' ');
  
  classes.forEach(className => {
    // Flex
    if (className === 'flex') styles.display = 'flex';
    if (className === 'flex-1') styles.flex = 1;
    if (className === 'flex-row') styles.flexDirection = 'row';
    if (className === 'flex-col') styles.flexDirection = 'column';
    if (className === 'items-center') styles.alignItems = 'center';
    if (className === 'items-start') styles.alignItems = 'flex-start';
    if (className === 'items-end') styles.alignItems = 'flex-end';
    if (className === 'justify-center') styles.justifyContent = 'center';
    if (className === 'justify-between') styles.justifyContent = 'space-between';
    if (className === 'justify-start') styles.justifyContent = 'flex-start';
    if (className === 'justify-end') styles.justifyContent = 'flex-end';
    
    // Background colors
    if (className.startsWith('bg-')) {
      const colorName = className.replace('bg-', '');
      if (colorName === 'white') styles.backgroundColor = '#ffffff';
      if (colorName === 'black') styles.backgroundColor = '#000000';
      if (colorName.includes('gray-')) {
        const shade = colorName.split('-')[1];
        styles.backgroundColor = colors.gray[shade as keyof typeof colors.gray];
      }
      if (colorName.includes('blue-')) {
        const shade = colorName.split('-')[1];
        styles.backgroundColor = colors.blue[shade as keyof typeof colors.blue];
      }
    }
    
    // Text colors
    if (className.startsWith('text-')) {
      const colorName = className.replace('text-', '');
      if (colorName === 'white') styles.color = '#ffffff';
      if (colorName === 'black') styles.color = '#000000';
      if (colorName.includes('gray-')) {
        const shade = colorName.split('-')[1];
        styles.color = colors.gray[shade as keyof typeof colors.gray];
      }
      if (colorName.includes('blue-')) {
        const shade = colorName.split('-')[1];
        styles.color = colors.blue[shade as keyof typeof colors.blue];
      }
      if (colorName.includes('green-')) {
        const shade = colorName.split('-')[1];
        styles.color = colors.green[shade as keyof typeof colors.green];
      }
      if (colorName.includes('red-')) {
        const shade = colorName.split('-')[1];
        styles.color = colors.red[shade as keyof typeof colors.red];
      }
      
      // Text sizes
      if (colorName === 'xs') styles.fontSize = 12;
      if (colorName === 'sm') styles.fontSize = 14;
      if (colorName === 'base') styles.fontSize = 16;
      if (colorName === 'lg') styles.fontSize = 18;
      if (colorName === 'xl') styles.fontSize = 20;
      if (colorName === '2xl') styles.fontSize = 24;
      if (colorName === '3xl') styles.fontSize = 30;
    }
    
    // Padding and margin
    const paddingMatch = className.match(/^p-(\d+)$/);
    if (paddingMatch) {
      const value = spacing[paddingMatch[1] as keyof typeof spacing];
      styles.padding = value;
    }
    
    const marginMatch = className.match(/^m-(\d+)$/);
    if (marginMatch) {
      const value = spacing[marginMatch[1] as keyof typeof spacing];
      styles.margin = value;
    }
    
    // Specific padding/margin directions
    const pxMatch = className.match(/^px-(\d+)$/);
    if (pxMatch) {
      const value = spacing[pxMatch[1] as keyof typeof spacing];
      styles.paddingHorizontal = value;
    }
    
    const pyMatch = className.match(/^py-(\d+)$/);
    if (pyMatch) {
      const value = spacing[pyMatch[1] as keyof typeof spacing];
      styles.paddingVertical = value;
    }
    
    const mxMatch = className.match(/^mx-(\d+)$/);
    if (mxMatch) {
      const value = spacing[mxMatch[1] as keyof typeof spacing];
      styles.marginHorizontal = value;
    }
    
    const myMatch = className.match(/^my-(\d+)$/);
    if (myMatch) {
      const value = spacing[myMatch[1] as keyof typeof spacing];
      styles.marginVertical = value;
    }
    
    // Font weights
    if (className === 'font-normal') styles.fontWeight = '400';
    if (className === 'font-medium') styles.fontWeight = '500';
    if (className === 'font-semibold') styles.fontWeight = '600';
    if (className === 'font-bold') styles.fontWeight = '700';
    
    // Text alignment
    if (className === 'text-center') styles.textAlign = 'center';
    if (className === 'text-left') styles.textAlign = 'left';
    if (className === 'text-right') styles.textAlign = 'right';
    
    // Border radius
    if (className === 'rounded') styles.borderRadius = 4;
    if (className === 'rounded-md') styles.borderRadius = 6;
    if (className === 'rounded-lg') styles.borderRadius = 8;
    if (className === 'rounded-xl') styles.borderRadius = 12;
    if (className === 'rounded-2xl') styles.borderRadius = 16;
    if (className === 'rounded-3xl') styles.borderRadius = 24;
    if (className === 'rounded-full') styles.borderRadius = 9999;
    
    // Shadows
    if (className === 'shadow-sm') {
      styles.shadowColor = '#000';
      styles.shadowOffset = { width: 0, height: 1 };
      styles.shadowOpacity = 0.05;
      styles.shadowRadius = 2;
      styles.elevation = 1;
    }
    if (className === 'shadow') {
      styles.shadowColor = '#000';
      styles.shadowOffset = { width: 0, height: 2 };
      styles.shadowOpacity = 0.1;
      styles.shadowRadius = 4;
      styles.elevation = 2;
    }
    if (className === 'shadow-lg') {
      styles.shadowColor = '#000';
      styles.shadowOffset = { width: 0, height: 4 };
      styles.shadowOpacity = 0.15;
      styles.shadowRadius = 8;
      styles.elevation = 4;
    }
    
    // Width and height
    if (className === 'w-full') styles.width = '100%';
    if (className === 'h-full') styles.height = '100%';
    
    // Position
    if (className === 'absolute') styles.position = 'absolute';
    if (className === 'relative') styles.position = 'relative';
  });
  
  return StyleSheet.create({ style: styles }).style;
};

export { colors, spacing };
