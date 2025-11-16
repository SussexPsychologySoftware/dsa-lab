import {useEffect, useState} from "react";
import {useExperiment} from "@/context/ExperimentContext";
import {SurveyTaskDefinition, TaskDefinition} from "@/types/experimentConfig";
import {SurveyComponent} from '@/types/surveyQuestions'
import {DataService} from "@/services/data/DataService";
import {getNestedValue, hasNestedKey} from "@/utils/dotNotation";

/**
 * This hook fetches the raw task definition and processes any
 * dynamic properties, like 'overwrite_parameter_from_storage'.
 */
export function useProcessTaskDefinition(taskId?: string) {
    // TODO: why not just pass the task def in here?
    const { definition, getTaskFilename } = useExperiment();

    // Find the original, unprocessed task definition
    const originalTaskDef = definition.tasks.find(t => t.id === taskId);

    const [taskDefinition, setTaskDefinition] = useState<TaskDefinition | undefined>(undefined);
    const [isProcessingTask, setIsProcessingTask] = useState(true);
    const [taskProcessingError, setTaskProcessingError] = useState<string | null>(null);

    useEffect(() => {
        if (!getTaskFilename) { // incase not ready on first render
            return;
        }
        const processTask = async () => {
            if (!originalTaskDef) {
                setTaskDefinition(undefined);
                setIsProcessingTask(false);
                if (taskId) {
                    setTaskProcessingError(`Task definition not found for ID: ${taskId}`);
                }
                return;
            }

            // Create a deep copy to avoid mutating the original config
            const newTaskDef = JSON.parse(JSON.stringify(originalTaskDef));

            // Only process SurveyTaskDefinitions with questions
            if (newTaskDef.type === 'survey' && (newTaskDef as SurveyTaskDefinition).questions) {
                const questions = (newTaskDef as SurveyTaskDefinition).questions;

                await Promise.all(questions.map(async (question: SurveyComponent) => {
                    // Check if the question is an input type and has the overwrite property
                    if ('overwrite_parameter_from_storage' in question && question.overwrite_parameter_from_storage) {
                        for (const params of question.overwrite_parameter_from_storage) {
                            try {
                                const storageFilename = getTaskFilename(params.task_id, params.day); //TODO: TRIES TO RUN THIS
                                if (!storageFilename) {
                                    console.warn(`Could not construct filename for storage_taskId: ${params.task_id}`);
                                    continue; // Skip this one
                                }
                                console.log({storageFilename})
                                const storedDataFull = await DataService.getData(storageFilename);
                                if(!storedDataFull) {
                                    console.warn(`DataService: Could not find ${params.response_key} in ${storedDataFull} for ${question.key}, params: ${params}`);
                                    continue
                                }
                                const storedData = storedDataFull.responses;
                                if (storedData && typeof storedData === 'object' && hasNestedKey(storedData, params.response_key)) {
                                    (question as any)[params.parameter] = getNestedValue(storedData, params.response_key)
                                } else {
                                    console.warn(`DataService: Could not find ${params.response_key} in ${storedData} for ${question.key}, params: ${params}`);
                                }
                            } catch (e) {
                                console.error(`Failed to process overwrite_parameter_from_storage for ${question.key}`, e);
                            }
                        }
                    }
                }));
            }

            // Set the new, processed task definition
            setTaskDefinition(newTaskDef);
            setIsProcessingTask(false);
        };

        void processTask();
    }, [getTaskFilename, originalTaskDef, taskId]); // Re-run if the original task definition changes

    return {
        taskDefinition,
        isProcessingTask,
        taskProcessingError
    };
}
