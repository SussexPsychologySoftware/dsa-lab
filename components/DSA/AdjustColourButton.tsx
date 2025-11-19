import { Text, StyleSheet, Pressable, View, ColorValue } from 'react-native';
import {useState, useRef, useEffect, useCallback} from "react";
import {sizes} from "@/styles/appStyles";

export default function AdjustColourButton({ style, disabled, onPress, text, textStyle, colour}: {style?: object, disabled: boolean, onPress: ()=>void, text?: string, textStyle?: object, colour?: ColorValue}) {

    const [pressed, setPressed] = useState(false);
    const animationFrameRef = useRef<number | null>(null);
    const onPressRef = useRef(onPress);
    useEffect(() => {
        onPressRef.current = onPress;
    }, [onPress]);

    const loop = useCallback(() => {
        if (onPressRef.current) {
            onPressRef.current();
        }        // Request next frame
        animationFrameRef.current = requestAnimationFrame(loop);
    }, []);

    const endPress = () => {
        setPressed(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    };

    const startLongPress = () => {
        if(disabled || animationFrameRef.current) return;
        setPressed(true);
        // Start the loop
        animationFrameRef.current = requestAnimationFrame(loop);
    };

    useEffect(() => {
        // If disabled changes while pressed, stop.
        if(disabled) endPress();
    }, [disabled]);

    // Cleanup on unMount just incase
    useEffect(() => {
        return (): void => {
            endPress();
        };
    }, []);

    return (
        <Pressable
            // key={disabled ? 'disabled' : 'enabled'}
            disabled={disabled}
            onPress={onPress}
            onPressIn={()=>setPressed(true)}
            onLongPress={startLongPress}
            onPressOut={endPress}
            delayLongPress={200}
            style={[
                styles.adjustColourButton,
                style,
                {
                    borderColor: disabled ? 'transparent' : colour??'black',
                    backgroundColor: pressed ? colour??'black' : 'transparent',
                },
            ]}
            // unstable_pressDelay={0}
        >
            <Text style={
                [
                    styles.text,
                    textStyle,
                    {color: disabled ? 'transparent' : colour??'black'}
                ]
            }>
                {text ?? '+'}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    adjustColourButton: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 10,
        height: 50,
        width: 50,
    },
    text: {
        fontSize: sizes.medium,
    }
});
