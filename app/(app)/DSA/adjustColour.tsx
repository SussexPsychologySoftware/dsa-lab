import {useCallback, useEffect, useState} from "react";
import { LCH } from "@/types/colours";
import FullscreenView from "@/components/layout/FullscreenView";
import {useLockOrientation} from "@/hooks/useLockOrientation";
import {useTrials} from "@/hooks/useTrials";
import ChangeBackground from "@/components/DSA/ChangeBackground";
import {useLocalSearchParams} from "expo-router";
import {useExperiment} from "@/context/ExperimentContext";
import {experimentDefinition} from "@/config/experimentDefinition";
import * as ScreenOrientation from "expo-screen-orientation";
import {ExperimentTracker} from "@/services/longitudinal/ExperimentTracker";
import {DataService} from "@/services/data/DataService";
import {ChipDimensions} from "@/app/(app)/DSA/chipScale";

export default function AdjustColourScreen() {
    useLockOrientation()
    // Get task def
    const { submitTaskData, getTaskFilename } = useExperiment();
    const { taskId } = useLocalSearchParams<{ taskId: string }>();
    const taskDefinition = experimentDefinition.tasks.find(t => t.id === taskId);
    const [chipDimensions, setChipDimensions] = useState<ChipDimensions|null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    // CREATE THE TRIALS
    const [trials, setTrials] = useState<Record<string, object>[]>([]);

    useEffect(() => {
        // run effects on mount

        // CREATE TRIALS======
        const createTrialsArray= () => {
            const N_TRIALS = 12
            const trials = [];
            for(let h=0; h<N_TRIALS; h++){
                const startingColour = {
                    l: 85,
                    c: 20*Math.random(),
                    h: Math.floor(Math.random() * 360)
                };
                // Push like this so responses store as 'startingColour: {l,c,h}'
                trials.push({startingColour})
            }
            return trials
        }
        const trialsArray = createTrialsArray();
        setTrials(trialsArray)
    }, []);

    useEffect(() => {
        const loadChipDimensions = async() => {
            const dimensionsFilename = getTaskFilename('chipDimensions')
            if(!dimensionsFilename) return null;
            const data = await DataService.getData(dimensionsFilename)
            if(!data) {
                console.error('No chip dimensions set')
                return null;
            }
            const chipDimensions = data.responses as ChipDimensions;
            if(!chipDimensions) return;
            setChipDimensions(chipDimensions)
        }
        void loadChipDimensions();
    }, [getTaskFilename]);

    const onSubmit = useCallback(async (responses: Record<string, any>[]) => {
        if(isSubmitting) return
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
    }, [isSubmitting, submitTaskData, taskDefinition]);

    const {
        handleEndTrial,
        currentTrial,
        isTaskFinished,
        inISI
    } = useTrials(trials, onSubmit, 400);

    // TODO: should probably make this a controlled component using the responses[currentTrialIndex]??
    return(
        <FullscreenView>
            {
                chipDimensions && currentTrial && !isSubmitting && !isTaskFinished && !inISI &&
                <ChangeBackground
                    chipDimensions={chipDimensions}
                    startColour={currentTrial.startingColour}
                    onSubmit={async (LAB, RGB) => await handleEndTrial({LAB, RGB})}
                    submitting={isSubmitting}
                />
            }
        </FullscreenView>
    );
}

