import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Pressable } from 'react-native';

interface ButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    variant?: 'text' | 'outlined' | 'contained';
    color?: 'default' | 'primary' | 'secondary';
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, onPress, variant = 'text', color = 'primary', disabled = false }) => {
    const getButtonStyle = () => {
        switch (variant) {
            case 'outlined':
                return [styles.outlinedButton, color === 'primary' ? styles.primaryOutlined : color === 'secondary' ? styles.secondaryOutlined : styles.defaultOutlined];
            case 'contained':
                return [styles.containedButton, color === 'primary' ? styles.primaryContained : color === 'secondary' ? styles.secondaryContained : styles.defaultContained];
            default:
                return styles.textButton;
        }
    };

    const getButtonTextStyle = () => {
        switch (variant) {
            case 'contained':
                return styles.containedText;
            case 'outlined':
            case 'text':
                return color === 'primary' ? styles.primaryText : color === 'secondary' ? styles.secondaryText : styles.defaultText;
        }
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                getButtonStyle(),
                disabled && styles.disabledButton,
                pressed && styles.pressedButton
            ]}
            onPress={onPress}
            disabled={disabled}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.12)' }}
        >
            <Text style={[styles.buttonText, getButtonTextStyle(), disabled && styles.disabledText]}>
                {children}
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 64,
        height: 36, // Ajustado para 36 para melhor proporção
    },
    textButton: {
        backgroundColor: 'transparent',
    },
    outlinedButton: {
        borderWidth: 1,
    },
    containedButton: {
        elevation: 2,
    },
    primaryContained: {
        backgroundColor: '#6750A4', // Material You primary
    },
    secondaryContained: {
        backgroundColor: '#B58392', // Material You secondary
    },
    defaultContained: {
        backgroundColor: '#E7E0EC', // Material You surface variant
    },
    primaryOutlined: {
        borderColor: '#6750A4',
    },
    secondaryOutlined: {
        borderColor: '#B58392',
    },
    defaultOutlined: {
        borderColor: '#79747E', // Material You outline
    },
    pressedButton: {
        opacity: 0.9,
    },
    disabledButton: {
        opacity: 0.38,
        elevation: 0,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.1,
        textTransform: 'uppercase',
        lineHeight: 20, // Adicionado lineHeight para melhor centralização vertical
    },
    containedText: {
        color: '#FFFFFF',
    },
    defaultText: {
        color: '#1C1B1F', // Material You on surface
    },
    primaryText: {
        color: '#6750A4',
    },
    secondaryText: {
        color: '#B58392',
    },
    disabledText: {
        color: 'rgba(28, 27, 31, 0.38)', // Material You disabled text
    },
});

export default Button;