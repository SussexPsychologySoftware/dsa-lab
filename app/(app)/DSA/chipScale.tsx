import {StyleSheet} from "react-native";
import {useCallback, useState} from "react";
import {useExperiment} from "@/context/ExperimentContext";
import MunsellChip from "@/components/DSA/MunsellChip";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";
import AdjustColourButton from "@/components/DSA/AdjustColourButton";
import SubmitButton from "@/components/inputs/SubmitButton";
import {experimentDefinition} from "@/config/experimentDefinition";
import {useLocalSearchParams} from "expo-router";

export interface ChipDimensions {
    height: number;
    width: number;
}
const colour = '#00FF00'
const buttonSize = 50

export default function ShowTrialDataScreen() {
    const { submitTaskData } = useExperiment();
    const { taskId } = useLocalSearchParams<{ taskId: string }>();
    const taskDefinition = experimentDefinition.tasks.find(t => t.id === taskId);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [height, setHeight] = useState(90);
    const [width, setWidth] = useState(80);
    const insets = useSafeAreaInsets();

    const handleSubmit = useCallback(async () => {
        if(isSubmitting) return
        try{
            setIsSubmitting(true);
            if (taskDefinition) {
                const chipDimensions: ChipDimensions = {height, width}
                await submitTaskData(taskDefinition, chipDimensions);
            } else {
                throw new Error("No task def.");
            }
        } catch (e) {
            console.error("Filed to submit screen size:", e);
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, taskDefinition, submitTaskData, height, width]);

    return (
        <SafeAreaView
            style={styles.container}
        >
            <StatusBar style={'dark'}/>
            <AdjustColourButton
                style={[
                    styles.button,
                    styles.top,
                    { top: insets.top }
                ]}
                text='+'
                colour={colour}
                disabled={false}
                onPress={()=>{
                    setHeight(height+1);
                }}
            />
            <AdjustColourButton
                style={[
                    styles.button,
                    styles.left,
                    { left: insets.left }
                ]}
                text='-'
                colour={colour}
                disabled={false}
                onPress={()=>{
                    setWidth(width-1);
                }}
            />
            <MunsellChip
                height={height}
                width={width}
                color={colour}
            />
            <SubmitButton
                text='Confirm'
                disabled={isSubmitting}
                cooldown={500}
                onPress={async () => await handleSubmit()}
                style={[
                    styles.submitButton,
                    {bottom: insets.bottom + buttonSize + 10},
                ]}
                textStyle={styles.submitButtonText}
            />
            <AdjustColourButton
                style={[
                    styles.button,
                    styles.right,
                    { right: insets.right }
                ]}
                text='+'
                colour={colour}
                disabled={false}
                onPress={()=>{
                    setWidth(width+1);
                }}
            />
            <AdjustColourButton
                style={[
                    styles.button,
                    styles.bottom,
                    { bottom: insets.bottom }
                ]}
                text='-'
                colour={colour}
                disabled={false}
                onPress={()=>{
                    setHeight(height-1);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'black',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        // borderColor: colour,
        position: 'absolute',
        height: buttonSize,
        width: buttonSize,
        margin: 0,
        zIndex: 99,
    },
    top: {},
    bottom: {},
    left: {},
    right: {},
    munsellChip: {
        justifyContent: 'center',
    },
    submitButton: {
        position: 'absolute',
        borderColor: colour,
        borderWidth: 1,
        backgroundColor: 'black'
    },
    submitButtonText: {
        color: colour,
        fontWeight: 'bold',
    }
});

