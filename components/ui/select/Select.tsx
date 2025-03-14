import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, ScrollView, TextStyle, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { MenuItemProps } from './MenuItem';

interface SelectProps {
  value: any;
  onChange: (value: any) => void;
  label?: string;
  children: React.ReactElement<MenuItemProps> | React.ReactElement<MenuItemProps>[];
  variant?: 'standard' | 'outlined' | 'filled';
  error?: boolean;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  label,
  children,
  variant = 'outlined',
  error = false,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');

  React.useEffect(() => {
    // Encontrar o label do item selecionado
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.props.value === value) {
        setSelectedLabel(child.props.label);
      }
    });
  }, [value, children]);

  const getSelectStyle = () => {
    const baseStyle = [styles.select];
    
    if (disabled) {
      baseStyle.push(styles.disabled);
      return baseStyle;
    }

    switch (variant) {
      case 'filled':
        baseStyle.push(styles.filled);
        if (open) baseStyle.push(styles.filledOpen);
        break;
      case 'standard':
        baseStyle.push(styles.standard);
        if (open) baseStyle.push(styles.standardOpen);
        break;
      default: // outlined
        baseStyle.push(styles.outlined);
        if (open) baseStyle.push(styles.outlinedOpen);
    }

    if (error) {
      baseStyle.push(styles.error);
    }

    return baseStyle;
  };

  const getLabelStyle = () => {
    const baseStyle: Array<ViewStyle | TextStyle> = [styles.labelBase];

    if (error) {
      baseStyle.push(styles.errorLabel);
    }

    if (disabled) {
      baseStyle.push(styles.disabledLabel);
    }

    switch (variant) {
      case 'filled':
        baseStyle.push(styles.filledLabel);
        break;
      case 'standard':
        baseStyle.push(styles.standardLabel);
        break;
      default:
        baseStyle.push(styles.outlinedLabel);
    }

    return baseStyle;
  };

  return (
    <>
      <Pressable
        style={getSelectStyle()}
        onPress={() => !disabled && setOpen(true)}
      >
        <View style={styles.selectContent}>
          {label && <Text style={getLabelStyle()}>{label}</Text>}
          <Text style={[
            styles.selectedText,
            disabled && styles.disabledText
          ]}>{selectedLabel}</Text>
          <MaterialIcons
            name={open ? 'arrow-drop-up' : 'arrow-drop-down'}
            size={24}
            color={disabled ? '#1C1B1F61' : error ? '#B3261E' : '#6750A4'}
          />
        </View>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setOpen(false)}
        >
          <View style={styles.menuContainer}>
            <ScrollView>
              {React.Children.map(children, (child) => {
                if (React.isValidElement<MenuItemProps>(child)) {
                  return React.cloneElement(child, {
                    ...child.props,
                    onSelect: (value: any) => {
                      onChange(value);
                      setOpen(false);
                    },
                    isSelected: child.props.value === value,
                  });
                }
                return child;
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

type Styles = {
  // View styles
  select: ViewStyle;
  outlined: ViewStyle;
  outlinedOpen: ViewStyle;
  filled: ViewStyle;
  filledOpen: ViewStyle;
  standard: ViewStyle;
  standardOpen: ViewStyle;
  error: ViewStyle;
  disabled: ViewStyle;
  selectContent: ViewStyle;
  modalOverlay: ViewStyle;
  menuContainer: ViewStyle;
  
  // Text styles
  outlinedLabel: TextStyle;
  filledLabel: TextStyle;
  standardLabel: TextStyle;
  errorLabel: TextStyle;
  disabledLabel: TextStyle;
  disabledText: TextStyle;
  selectedText: TextStyle;
  labelBase: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  // View styles
  select: {
    minHeight: 56,
    justifyContent: 'center',
    borderRadius: 4,
    position: 'relative',
    backgroundColor: '#FFF', // Adicionado fundo branco ao select
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#79747E',
    backgroundColor: 'transparent',
  },
  outlinedOpen: {
    borderColor: '#6750A4',
    borderWidth: 1,
  },
  filled: {
    backgroundColor: '#E7E0EC',
    borderBottomWidth: 1,
    borderBottomColor: '#79747E',
    borderWidth: 0,
  },
  filledOpen: {
    backgroundColor: '#F7F2FA',
    borderBottomColor: '#6750A4',
    borderBottomWidth: 2,
  },
  standard: {
    borderBottomWidth: 1,
    borderBottomColor: '#79747E',
    borderWidth: 0,
  },
  standardOpen: {
    borderBottomWidth: 2,
    borderBottomColor: '#6750A4',
  },
  error: {
    borderColor: '#B3261E',
  },
  disabled: {
    backgroundColor: '#1C1B1F1F',
    borderColor: '#1C1B1F61',
    borderBottomColor: '#1C1B1F61',
  },
  selectContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#FFF',
    borderRadius: 4,
    width: '80%',
    maxHeight: '70%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  // Text styles
  outlinedLabel: {
    color: '#6750A4',
    fontSize: 12,
    backgroundColor: 'transparent', // Removido fundo branco
    paddingHorizontal: 4,
    marginHorizontal: -4, // Compensar o padding
    marginTop: -2, // Ajuste fino para posicionamento
  },
  filledLabel: {
    color: '#49454F',
    fontSize: 12,
    backgroundColor: 'transparent',
  },
  standardLabel: {
    color: '#49454F',
    fontSize: 12,
    backgroundColor: 'transparent',
  },
  errorLabel: {
    color: '#B3261E',
    fontSize: 12,
  },
  disabledLabel: {
    color: '#1C1B1F61',
    fontSize: 12,
  },
  disabledText: {
    color: '#1C1B1F61',
    fontSize: 16,
  },
  selectedText: {
    flex: 1,
    fontSize: 16,
    color: '#1C1B1F',
    paddingVertical: 8,
    marginRight: 8,
    marginTop: 8,
  },
  labelBase: {
    position: 'absolute',
    top: 8,
    left: 16,
    fontSize: 12,
    color: '#6750A4',
    backgroundColor: 'transparent', // Removido fundo branco
    paddingHorizontal: 4,
    zIndex: 1,
  },
});

export default Select;
