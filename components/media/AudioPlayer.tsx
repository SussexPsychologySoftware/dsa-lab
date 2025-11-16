import { View, StyleSheet } from "react-native";
import Audio from "@/components/media/Audio"; // Adjust path
import Range from "@/components/inputs/Range"; // Adjust path

// This component now combines Audio and Range
interface Props {
    audioSource: number;
    isPlaying: boolean;
    onPress: () => void;
    volume?: number;
    onVolumeChange?: (newVolume: number) => void,
    onFinish?: () => void;
    disabled?: boolean;
    resetOnPause?: boolean;
    onTimeChange?: (newTime: number) => void,
}
export default function AudioPlayer({audioSource, onPress, isPlaying, volume=1, onVolumeChange, onFinish, disabled, resetOnPause } : Props) {
    return (
        <View style={styles.container}>
            <Audio
                disabled={disabled}
                audioSource={audioSource}
                isPlaying={isPlaying}
                onPress={onPress}
                onFinish={onFinish}
                volume={volume}
                resetOnPause={resetOnPause}
            />
            { onVolumeChange &&
                <Range
                    value={volume}
                    min={0}
                    max={1}
                    onChange={onVolumeChange} // Update the volume state
                    style={styles.volumeSlider}
                    showValue={false}
                />
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        gap: 10, // Adds space between the button and slider
    },
    volumeSlider: {
        width: 200, // Just an example
        height: 30,
    },
});
