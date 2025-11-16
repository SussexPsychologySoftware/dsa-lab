import {Text, StyleSheet, AppState, Pressable, View} from "react-native";
import {StandardView} from "@/components/layout/StandardView";
import ToDoList from "@/components/longitudinal/ToDoList";
import { useExperiment } from "@/context/ExperimentContext";
import SubmitButton from "@/components/inputs/SubmitButton";
import {globalStyles} from "@/styles/appStyles";
import {router, useFocusEffect} from "expo-router";
import React, {useEffect} from "react";
import {RoutingService} from "@/services/RoutingService";
import {useAutoRefresh} from "@/hooks/useAutoRefresh";
import {ExperimentTracker} from "@/services/longitudinal/ExperimentTracker";

export default function Index() {
    const { displayState, isLoading, definition, loadExperimentState, manuallyFinishExperiment } = useExperiment();
    useAutoRefresh({
        onRefresh: loadExperimentState,
        refreshOnMount: false, // Context already did the initial load
        refreshOnFocus: true, // Refresh when navigating to index
        refreshOnAppActive: true, // Refresh on foregrounding (if on index)
        scheduledRefreshHour: definition.cutoff_hour, // Refresh at cutoff (if on index)
    });

    useEffect(() => {
        // Wait until loading is done and we have state
        if (isLoading || !displayState) {
            return;
        }

        // If autoroute is on AND the experiment is NOT complete
        if (definition.autoroute && !displayState.isExperimentComplete) {
            // Find the next available task
            const nextTask = displayState.tasks.find(
                task => !task.completed && task.isAllowed
            );

            if (nextTask) {
                const href = RoutingService.getTaskHref(nextTask.definition);
                router.replace(href);
            }
        }
    }, [isLoading, displayState, definition]); // Run when state loads

    if(isLoading || !displayState) {
        // TODO: put loading spinner
        return (
            <StandardView>
                <Text>Loading experiment...</Text>
            </StandardView>
        );
    }

    return (
        <StandardView
            contentContainerStyle={{margin: 10, paddingTop: 30}}
            headerShown={false}
            statusBarStyle={'light'}
        >
            <Text style={globalStyles.pageTitle}>{definition.total_days ? "Today's activities" : 'Please complete the following tasks:'}</Text>
            {
                definition.total_days!==undefined && // without !== undefined causes Text strings outside component
                <Text style={[globalStyles.standardText, {alignSelf: 'center'}]}>
                    {
                        displayState.experimentDay === definition.total_days ?
                            'Last experiment day' :
                            `Day ${displayState.experimentDay+1} / ${definition.total_days+1}`
                    }
                </Text>
            }

            {
                displayState.allTasksCompleteToday &&
                <Text style={[globalStyles.standardText, styles.allTasksCompleteToday]}>
                    ✓ All activities completed {definition.total_days ? 'for today' : ''}
                </Text>
            }

            {
                displayState.allTasksCompleteToday && displayState.experimentDay === definition.total_days &&
                <View style={styles.finishExperimentCard}>
                    <Text style={[globalStyles.standardText, styles.finishExperimentText]}>
                        Click the button below to submit your responses and finish the experiment
                    </Text>
                    <SubmitButton
                        text={"Submit & Finish Experiment"}
                        disabledText={'Submitting...'}
                        onPress={async()=>{await manuallyFinishExperiment()}}
                        style={styles.finishExperimentButton}
                        textStyle={styles.finishExperimentButtonText}
                    />
                </View>

            }

            <ToDoList
                taskStates={displayState.tasks} // Or pass in entire display state?
                // data={{}} // Could pass experiment info through this?
            />

            {
                definition.tasks.some(t => t.notification) &&
                <>
                    <Text
                        style={[globalStyles.sectionTitle, {alignSelf: 'center'}]}
                    >
                        Settings
                    </Text>
                    <SubmitButton
                        icon='gear'
                        text='Change notification times'
                        onPress={()=>{router.push('/settings')}}
                        cooldown={500}
                        style={{
                            backgroundColor: 'transparent',
                            borderColor: 'white',
                            borderWidth: 1,
                            marginVertical: 15,
                        }}
                        textStyle={{
                            color: 'white',
                        }}
                        iconColor={'white'}
                    />
                </>
            }
            <Text
                style={[
                    globalStyles.standardText,
                    {color:'lightgrey', alignSelf: 'center'}
                ]}
                selectable={true}
            >
                Participant ID: {displayState.participantId}
            </Text>
        </StandardView>
    );
}

const styles = StyleSheet.create({
    allTasksCompleteToday: {
        alignSelf: 'center',
        marginTop: 20,
        borderWidth: 1,
        borderColor: 'green',
        borderRadius: 5,
        padding: 10,
        color: 'green',
        backgroundColor: 'rgba(0, 255, 0, 0.05)',
    },
    finishExperimentCard: {
        alignSelf: 'center',
        borderWidth: 3,
        borderColor: 'yellow',
        // backgroundColor: 'yellow',
        color: 'black',
        borderRadius: 10,
        marginTop: 15,
        paddingVertical: 15,
        paddingHorizontal: 10,
        gap: 10,
        maxWidth: 400
    },
    finishExperimentText: {
        textAlign: 'center',
        color: 'yellow',
        fontWeight: 500
    },
    finishExperimentButton: {
        backgroundColor: 'yellow',
    },
    finishExperimentButtonText: {
        color: 'black',
        textAlign: 'center',
    }
});
