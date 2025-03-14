import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export interface MenuItemProps extends React.ComponentProps<typeof Pressable> {
  label: string;
  value: any;
  onSelect?: (value: any) => void;
  isSelected?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ label, value, onSelect, isSelected, ...props }) => {
  return (
    <Pressable
      {...props}
      style={[styles.menuItem, isSelected && styles.selectedItem]}
      onPress={() => onSelect?.(value)}
    >
      <Text style={[styles.menuItemText, isSelected && styles.selectedItemText]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    padding: 16,
    minHeight: 48,
    justifyContent: 'center',
  },
  selectedItem: {
    backgroundColor: 'rgba(103, 80, 164, 0.08)',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1C1B1F',
  },
  selectedItemText: {
    color: '#6750A4',
  },
});

export default MenuItem;
