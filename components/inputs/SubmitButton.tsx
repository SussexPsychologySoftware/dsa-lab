import React, {useState} from 'react'
import {Text, StyleSheet, Pressable} from 'react-native'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function SubmitButton({ text, disabledText, disabled, onPress, style, cooldown=0, textStyle, icon, iconColor, disabledStyle } : { text: string, disabledText?: string, disabled?: boolean, onPress: () => void | Promise<void>, style?: object, cooldown?: number, textStyle?: object, icon?: string, iconColor?: string, disabledStyle?: object }) {
    const [pressExecuting, setPressExecuting] = useState(false); // Define pressExecuting state

    const handlePress = async () => {
        // This makes the disabled function a little tighter but not air-tight
            // Good for if the function wants to e.g. prevent multiple submissions
            // Consider the debouncing function in parent if looking to stop multiple presses quicker
        if (pressExecuting) return;
        setPressExecuting(true);
        try {
            await onPress(); // Just doesn't do anything if synchronous function
        } catch (error) {
            console.error('Error executing press: ', error);
        } finally {
            if (cooldown > 0) {
                setTimeout(() => {
                    setPressExecuting(false);
                }, cooldown);
            } else {
            setPressExecuting(false);
        }
        }
    };

    const disabledOrExecuting = disabled || pressExecuting;

    return(
        <Pressable
            disabled={disabled}
            onPress={handlePress}
            style={[
                styles.button,
                style,
                disabledOrExecuting && styles.disabled,
                disabledOrExecuting && disabledStyle
            ]}
        >
            {icon &&
                <FontAwesome6
                    name={icon}
                    size={30}
                    color={iconColor??'black'}
                />
            }
            <Text
                style={[
                    styles.text,
                    textStyle,
                    disabledOrExecuting && disabledStyle
                ]}
            >
                { disabledOrExecuting ? (disabledText??text) : text}
            </Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'lightgrey',
        color: 'black',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignSelf: 'center',
        flexDirection: 'row',
        columnGap: 8,
        // justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabled: {
        backgroundColor: 'grey'
    }
})

