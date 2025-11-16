import { StyleSheet, Pressable } from "react-native";
import {setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus} from 'expo-audio';
import {useEffect, useRef} from "react";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

// Example using multiple sources:
// const [playing, setPlaying] = useState<string|null>('')
// <View style={{flexDirection: 'row', gap: 10}}>
//     <AudioPlayer
//         audioSource={require('../assets/sounds/sound1.mp3')}
//         isPlaying={playing === 'sound1'}
//         onPress={() => setPlaying(playing === 'sound1' ? null : 'sound1')}
//     />
//     <AudioPlayer
//         audioSource={require('../assets/sounds/sound2.mp3')}
//         isPlaying={playing === 'sound2'}
//         onPress={() => setPlaying(playing === 'sound2' ? null : 'sound2')}
//     />
// </View>

interface AudioProps {
    audioSource: number,
    isPlaying: boolean,
    resetOnPause?: boolean,
    onPress: ()=>void,
    onFinish?: () => void,
    volume?: number,
    style?: object,
    disabled?: boolean,
    getDuration?: (duration:number) => number
}

export default function Audio({
                                  audioSource,
                                  isPlaying,
                                  onPress,
                                  resetOnPause,
                                  onFinish,
                                  volume,
                                  style,
                                  disabled,
                                  getDuration }: AudioProps) {
    // Note: audioSource is not loaded inside the component as this needs to be known at runtime, dynamic requires not allowed in RN
    // Volume works well with a slider if required dynamic setting
    // TODO: add volume controls? maybe separate component
    const isDisabled = !audioSource || disabled;
    const player = useAudioPlayer(audioSource);

    // Sync player play/pause state with prop
    useEffect(() => {
        const playAudio = async () => {
            try {
                if (isPlaying) {
                    try {
                        await setAudioModeAsync({
                            playsInSilentMode: true,
                            shouldPlayInBackground: true,
                        });
                    } catch (error) {
                        console.warn("Failed to set audio mode", error);
                    }
                    player.play();
                } else {
                    player.pause();
                    // Reset when pausing if resetOnPause is true
                    if(resetOnPause) {
                        await player.seekTo(0);
                    }
                }
            } catch (error) {
                console.error('Audio playback error:', error);
            }
        };

        void playAudio();
    }, [isPlaying, player, resetOnPause]);


    // AUDIO PLAYER STATUS ------------------
    const { didJustFinish, currentTime, duration } = useAudioPlayerStatus(player);
    // Make sure onFinish() only runs once but tracking it's function reference
    const onFinishedRef = useRef(onFinish);
    useEffect(() => { // Keep updated with last callback on every render
        onFinishedRef.current = onFinish;
    }, [onFinish]);

    useEffect(() => {
        if (didJustFinish && onFinishedRef.current) {
            onFinishedRef.current();
        }
    }, [didJustFinish]);

    useEffect(() => {
        if(getDuration){
            getDuration(duration)
        }
    }, [duration, getDuration]);

    useEffect(() => {
        player.volume = volume??1;
    }, [player, volume])

    const handlePlayPause = () => {
        onPress();
    };

    return (
        <Pressable
            disabled={isDisabled}
            onPress={isDisabled ? undefined : handlePlayPause}
            style={[
                styles.player,
                isDisabled && styles.disabled,
                style
            ]}
        >
            <FontAwesome6
                name={isPlaying ? 'pause' : 'play'}
                size={30}
                color="black"
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    player: {
        width: 100,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: 'lightgrey',
        borderRadius: 10,
    },
    disabled: {
        backgroundColor: 'grey',
    }
});
