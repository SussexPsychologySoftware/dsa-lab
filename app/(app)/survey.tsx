import {View, StyleSheet, Text, Button} from "react-native";
import SubmitButton from "@/components/inputs/SubmitButton";
import {StandardView} from "@/components/layout/StandardView";
import {globalStyles} from "@/styles/appStyles";
import {useSurvey} from "@/hooks/useSurvey";
import Survey from "@/components/survey/Survey";
import {Stack, useLocalSearchParams} from 'expo-router';
import {useExperiment} from "@/context/ExperimentContext";
import {SurveyTaskDefinition, TaskDefinition} from "@/types/experimentConfig";
import {useCallback, useEffect} from "react";
import ExperimentInfo from "@/components/debug/ExperimentInfo";
import {useProcessTaskDefinition} from "@/hooks/useProcessTaskDefinition";
import {experimentDefinition} from "@/config/experimentDefinition";
import {getNestedValue, hasNestedKey} from "@/utils/dotNotation";

export default function SurveyScreen() {
    // This is a typical screen setup (view layer),
        // Separation of concerns: orchestrates getting data from useExperiment, passing to useSurvey, when to submit, what to do after
    const { taskId } = useLocalSearchParams<{ taskId: string }>();
    // TODO: (small) concern user could be on task when day ticks over and survey will be recorded for that next day...
    //    FIX: pipe experimentDay as local search param, send to submitTaskData -> getTaskFilename
    const { submitTaskData, displayState, getTaskFilename, updateSendData, setParticipantVariable } = useExperiment();

    // LOAD TASK AND SURVEY INFO -------
    // Note to avoid useProcessTaskDefinition load directly with:
        //let taskDefinition = definition.tasks.find(t => t.id === taskId);

    const {taskDefinition, isProcessingTask, taskProcessingError} = useProcessTaskDefinition(taskId);
    const surveyFilename = taskId ? getTaskFilename(taskId) : undefined;
    const questions = (taskDefinition && taskDefinition.id === taskId && taskDefinition.type === 'survey')
        ? (taskDefinition as SurveyTaskDefinition).questions
        : undefined;
    const surveyTitle = taskDefinition?.name || "Survey";
    // Display state used for submission
    const taskDisplayState = displayState
        ? displayState.tasks.find(t => t.definition.id === taskId)
        : undefined;

    // SUBMISSION -------
    // TODO: not include state && here as a hacky fix so if participant is reset we don't try get task filename for null state

    const onSubmit = useCallback(async (responses: object) => {
        if (!taskDefinition) {
            console.error("Unable to save responses: ", {taskDefinition});
            return;
        }

        const runStateActions = async (taskDefinition: TaskDefinition) => {
            if (taskDefinition.on_submit_actions) {
                for (const action of taskDefinition.on_submit_actions) {
                    // We can use your existing dot-notation helpers if response_key can be nested
                    // For this simple case, direct lookup is fine:
                    if (!hasNestedKey(responses, action.response_key)) {
                        console.log(`${action.response_key} not found in responses`)
                        return
                    }
                    const responseValue = getNestedValue(responses, action.response_key);
                    let conditionMet = true;
                    if(action.operator && action.compare_value) { // If no action or operator then run anyway
                        if (action.operator === '=') {
                            conditionMet = (responseValue === action.compare_value);
                        } else if (action.operator === '!=') {
                            conditionMet = (responseValue !== action.compare_value);
                        }
                    }
                    if (conditionMet) {
                        if (action.action === 'set_send_data') {
                            // Call the function from useExperiment
                            await updateSendData(action.payload ?? conditionMet); // if no payload use conditionMet
                        } else if (action.action === 'set_participant_variable') {
                            // TODO: how to actually use these variables?
                            // If no payload value set then use responseValue.
                            await setParticipantVariable(action.payload.key, action.payload.value===undefined ? responseValue : action.payload.value);
                        }
                    }
                }
            }
        }

        await runStateActions(taskDefinition);
        await submitTaskData(taskDefinition, responses);
    }, [setParticipantVariable, submitTaskData, taskDefinition, updateSendData]);

    const {
        responses,
        updateResponses,
        handleSurveySubmit,
        warning,
        isSubmitting,
        progress,
        resetSurvey,
        invalidQuestions,
        isLoading // Get the loading state from the hook
    } = useSurvey(questions, onSubmit, surveyFilename);

    useEffect(() => {
        const autoSubmitOnFirstCompletion = async () => {
            if (!isSubmitting && !taskDisplayState?.completed && taskDefinition?.autosumbit_on_complete && progress === 100) {
                await handleSurveySubmit();
            }
        };

        // Call the async function
        void autoSubmitOnFirstCompletion();
    }, [isSubmitting, handleSurveySubmit, progress, taskDefinition?.autosumbit_on_complete, taskDisplayState?.completed])

    // Handle loading state - restoring responses or new task id loaded
    if (isLoading || isProcessingTask || taskDefinition?.id !== taskId) {
        return (
            <StandardView>
                <Text style={globalStyles.pageTitle}>Loading Survey...</Text>
            </StandardView>
        )
    }

    // RENDER INCORRECT DATA STATES -------
    if (!questions || taskProcessingError) {
        return (
            <StandardView>
                <Text style={globalStyles.pageTitle}>Error</Text>
                <Text style={globalStyles.standardText}>Survey configuration could not be found for task ID: {taskId}</Text>
            </StandardView>
        );
    }

    // RENDER COMPONENT -------
    return (
        <StandardView
            headerShown={true}
            innerContainer={styles.inputsContainer}
        >
            <Survey
                key={taskId} // Note using a key here forces react to tear down the survey and recreate when taskId changes.
                questions={questions}
                responses={responses}
                updateResponses={updateResponses}
                handleSurveySubmit={handleSurveySubmit}
                warning={warning}
                isSubmitting={isSubmitting}
                // progress={progress}
                invalidQuestions={invalidQuestions}
                />
                <Stack.Screen
                    options={{
                        title: surveyTitle,
                        headerRight: taskDefinition.skippable ?
                            () => <Button onPress={async () => await submitTaskData(taskDefinition,'skipped')} title="Skip" />
                        : undefined,
                    }}
                />
            <SubmitButton
                onPress={() => {resetSurvey()}}
                text={"Reset Survey"}
                disabledText={"Resetting..."}
                disabled={false}
            />

            { experimentDefinition.debug &&
                <ExperimentInfo
                    object={responses}
                    objectTitle={'Survey Responses'}
                    showExperimentDefinition={false}
                    showExperimentState={false}
                    showDisplayState={false}
                    showQueue={false}
                />
            }
        </StandardView>
    );
}

const styles = StyleSheet.create({
    inputsContainer: {
        gap: 10,
        marginTop: 10,
    },
});
