import {useCallback, useEffect, useState} from "react";
import { LCH } from "@/types/colours";
import {Text} from "react-native";
import FullscreenView from "@/components/layout/FullscreenView";
import {useLockOrientation} from "@/hooks/useLockOrientation";
import {useTrials} from "@/hooks/useTrials";
import {globalStyles} from "@/styles/appStyles";
import ChangeBackground from "@/components/DSA/ChangeBackground";
import {useLocalSearchParams} from "expo-router";
import {useExperiment} from "@/context/ExperimentContext";
import {experimentDefinition} from "@/config/experimentDefinition";
import * as ScreenOrientation from "expo-screen-orientation";

export default function AdjustColourScreen() {
    useLockOrientation()
    // Get task def
    const { submitTaskData } = useExperiment();
    const { taskId } = useLocalSearchParams<{ taskId: string }>();
    const taskDefinition = experimentDefinition.tasks.find(t => t.id === taskId);

    const [isSubmitting, setIsSubmitting] = useState(false);
    // CREATE THE TRIALS
    const [trials, setTrials] = useState<Record<string, object>[]>([]);

    useEffect(() => {
        const N_TRIALS = 12

        const getRandomStartingColour = ():LCH => {
            return {
                l: 85,
                c: 20*Math.random(),
                h: Math.floor(Math.random() * 360)
            }
        }

        const createTrialsArray= () => {
            const trials = [];
            for(let h=0; h<N_TRIALS; h++){
                const startingColour = getRandomStartingColour();
                // Push like this so responses store as 'startingColour: {l,c,h}'
                trials.push({startingColour})
            }
            return trials
        }

        const trialsArray = createTrialsArray();
        // console.log(trialsArray);
        setTrials(trialsArray)
    }, []);

    const onSubmit = useCallback(async (responses: Record<string, any>[]) => {
        setIsSubmitting(true);
        if (taskDefinition) {
            // Unlock async here and wait a bit to avoid race condition renderer crash when moving to next page
            await ScreenOrientation.unlockAsync()
            await new Promise(resolve => setTimeout(resolve, 300));
            await submitTaskData(taskDefinition, responses);
        } else {
            console.error("Unable to save responses: ", {taskDefinition});
        }
        setIsSubmitting(false);
    }, [submitTaskData, taskDefinition]);

    const {
        handleEndTrial,
        currentTrial,
        isTaskFinished,
        responses,
        inISI
    } = useTrials(trials, onSubmit, 400);

    if (isTaskFinished) {
        return (
            <FullscreenView>
                <Text style={globalStyles.standardText}>
                    Task Complete! Thank you.
                    {JSON.stringify(responses, null, 2)}
                </Text>
            </FullscreenView>
        );
    }

    if (!currentTrial) {
        return (
            <FullscreenView>
                <Text style={globalStyles.standardText}>
                    Loading...
                </Text>
            </FullscreenView>
        );
    }

    // if (inISI) {
    //     return (
    //         <FullscreenView
    //             style={{alignItems: "center", justifyContent: "center"}}
    //         >
    //             <Text style={{color:'white', fontSize: 50, textAlign: 'center'}}>+</Text>
    //
    //         </FullscreenView>
    //     )
    // }

    return(
        <FullscreenView>
            {
                inISI ?
                    null
                    :
                <ChangeBackground
                    startColour={currentTrial.startingColour}
                    onSubmit={async (LAB, RGB) => await handleEndTrial({LAB, RGB})}
                    submitting={isSubmitting}
                />
            }
            <Text>{JSON.stringify(currentTrial)}</Text>
        </FullscreenView>
       );
}

