import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import {ExperimentDefinition, TaskDefinition} from '@/types/experimentConfig';
import {ExperimentDisplayState, ExperimentState, NullableStringRecord} from '@/types/trackExperimentState';
import { experimentDefinition } from '@/config/experimentDefinition';
import {ExperimentTracker} from "@/services/longitudinal/ExperimentTracker";
import { DataService } from '@/services/data/DataService';
import {router} from "expo-router";
import {Alert} from "react-native";
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import {NotificationService} from "@/services/NotificationService";
import {RoutingService} from "@/services/RoutingService";

// Define context type
interface ExperimentContextType {
    // Experiment info
    definition: ExperimentDefinition;         // The static config
    state: ExperimentState | null;            // The core stored state
    displayState: ExperimentDisplayState | null; // The calculated display state
    // Expose action specific states
    isLoading: boolean;                       // For loading screens
    isActionLoading: boolean;
    actionError: string | null;
    refreshing: boolean;

    // Functions to change experiment state
    startExperiment: (participantId?: string, condition?: string) => Promise<void>;

    getTaskFilename: (taskId: string, day?: number) => string | undefined;
    completeTask: (taskId: string) => Promise<ExperimentDisplayState>;
    submitTaskData: (taskDefinition: TaskDefinition, data: any) => Promise<void>;

    resetTaskCompletion: () => Promise<void>;
    stopExperiment: () => Promise<void>;
    confirmAndStopExperiment: () => void;
    // manuallyFinishExperiment: () => Promise<void>;

    loadExperimentState: () => Promise<void>;

    updateNotificationTimes: (times: NullableStringRecord) => Promise<void>;
    updateSendData: (sendData: boolean) => Promise<void>;
    setParticipantVariable: (key: string, value: any) => Promise<void>;

    refreshState: () => Promise<void>;
}

// init context as undefined
const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

// Easy way to use this context here, gives custom error
export function useExperiment() {
    const context = useContext(ExperimentContext);
    if (context === undefined) {
        throw new Error('useExperiment must be used within an ExperimentProvider');
    }
    return context;
}

// Component to wrap the app root in.
export function ExperimentProvider({ children }: { children: ReactNode }) {
    // States containing experiment info
    const [state, setState] = useState<ExperimentState | null>(null);
    const [displayState, setDisplayState] = useState<ExperimentDisplayState | null>(null);
    // Current action progress states
    // const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    // Pull in experiment definition
    const definition = experimentDefinition;

    const loadExperimentState = useCallback(async () => {
        // console.log(`loadExperimentState CALLED at: ${new Date().toLocaleTimeString()}`); // <-- ADD THIS
        try {
            // TODO: why not load the state directly from the context???
            let experimentState = await ExperimentTracker.getState();
            if (experimentState) {
                const newDisplayState = ExperimentTracker.calculateDisplayState(experimentState);
                setState(experimentState);
                setDisplayState(newDisplayState);
            } else { // If no state found set to null and AppGate will redirect to onboarding
                setState(null);
                setDisplayState(null);
            }
        } catch (error) {
            console.error("Error loading experiment status:", error);
            // Let the hook handle errors, or setActionError here
            // Also set to null on error
            setState(null);
            setDisplayState(null);
        }
        // NO 'finally' block with setIsLoading
    }, []); // Empty dependency array is fine

    const { refreshing, refresh, loading } = useAutoRefresh({
        onRefresh: loadExperimentState, // Pass the function directly
        refreshOnMount: true,
        refreshOnFocus: false, // Not sure this does anything from within the context?
        refreshOnAppActive: false, // App brought to foreground - not true inside context or surveys will get cleared
        scheduledRefreshHour: definition.cutoff_hour,
    });

    useEffect(() => {
        if (state && displayState) {
            // Re-sync all notifications when app loads - "fire-and-forget" background task
            NotificationService.scheduleAllNotifications(state).catch(err => {
                console.error("Failed to sync notifications on load:", err);
            });
        }
    }, [state, displayState]); // Runs once when state is loaded

    // Navigate if experiment completed
    useEffect(() => {
        // Don't navigate while loading/refreshing or no display state
        if (loading || !displayState) {
            return;
        }

        if (displayState.isExperimentComplete) {
            router.replace('/end');
        }
    }, [displayState, loading]);

    const startExperiment = useCallback(async (participantId?: string, overrideCondition?: string) => {
        setIsActionLoading(true);
        setActionError(null);
        try {
            const initialState = await ExperimentTracker.startExperiment(participantId, overrideCondition);
            const initialDisplayState = ExperimentTracker.calculateDisplayState(initialState);
            setState(initialState);
            setDisplayState(initialDisplayState);
        } catch (e: any) {
            console.error("Failed to start experiment:", e);
            setActionError(e.message || "Failed to start experiment");
        } finally {
            setIsActionLoading(false);
        }
    }, []);

    const updateNotificationTimes = useCallback(async (times: NullableStringRecord) => {
        setIsActionLoading(true);
        setActionError(null);
        try {
            const newState = await ExperimentTracker.updateNotificationTimes(times);
            // TODO: await NotificationService.scheduleNotifications() - should maybe take in state or times instead?
            // or should updateNotificationTimes take in the Notification

            if (newState) {
                await NotificationService.scheduleAllNotifications(newState);
                // new calculateDisplayState function uses new times to build the displayState.notifications array.
                const newDisplayState = ExperimentTracker.calculateDisplayState(newState);
                setState(newState);
                setDisplayState(newDisplayState);
            } else {
                throw new Error("No state found to update.");
            }
        } catch (e: any) {
            console.error("Failed to update notification times:", e);
            setActionError(e.message || "Failed to update notification times");
            throw e; // Re-throw so the settings screen can catch it
        } finally {
            setIsActionLoading(false);
        }
    }, []); // No dependencies needed, tracker gets its own state

    const updateSendData = async (sendData: boolean) => {
        const newState = await ExperimentTracker.updateSendData(sendData);
        if (newState) {
            setState(newState); // Update the live React state
        }
    };

    const setParticipantVariable = async (key: string, value: any) => {
        // TODO: this could expose the state and displayState to arbitrary updates, allows setting condition, sendData, etc.
        const newState = await ExperimentTracker.setParticipantVariable(key, value);
        if (newState) {
            setState(newState); // Update the live React state
        }
    };

    const getTaskFilename = useCallback((taskId: string, day?: number): string | undefined => {
        // Note this is a 'getter' - I could probably pass taskDef in but just relying on taskId is more portable.
        if (!state || !displayState) {
            console.warn(`Cannot get filename: state is not ready. ${taskId}, ${day?.toString()}`);
            return undefined;
        }

        const { participantId } = state;
        const taskDefinition = definition.tasks.find(t => t.id === taskId);
        if (!taskDefinition) {
            console.error(`Cannot get filename: Task definition for ${taskId} not found.`);
            return undefined;
        } else if (!participantId) {
            console.error(`Cannot get filename: No participant ID. Task ID: ${taskId}`);
            return undefined;
        }

        // Note day should be specified if looking up data from previous days.
        // Only add day to filename if task due to show on more than one day.
        const { experimentDay } = displayState;
        if(day && experimentDay > day) console.warn(`Construct filename: Note day parameter ${day} exceeds current day ${experimentDay}`)
        if(!day) {
            const numberOfDaysToShow = taskDefinition.show_on_days ?? [];
            day = numberOfDaysToShow.length > 1 ? experimentDay : undefined;
        }

        return ExperimentTracker.constructFilename(taskId, participantId, day);

    }, [state, displayState, definition]);

    const completeTask = useCallback(async (taskId: string) => {
        setIsActionLoading(true); // Show loading
        setActionError(null);

        try {
            // set to complete - note set tasks completed returns entire new state
            const newState = await ExperimentTracker.setTaskCompleted(taskId);
            // Get new display state
            const newDisplayState = ExperimentTracker.calculateDisplayState(newState);
            // Set states
            setState(newState);
            setDisplayState(newDisplayState);
            // fire-and-forget cancel notification
            NotificationService.cancelNotificationForToday(taskId).catch(err => {
                console.error("Failed to cancel notification:", err);
            });
            return newDisplayState;
        } catch (e: any) {
            console.error("Failed to complete task:", e);
            setActionError(e.message || "Failed to complete task");
            // ensure the promise rejects on failure, submitTaskData then catch.
            throw e;
        } finally {
            setIsActionLoading(false);
        }
    }, []);

    const submitTaskData = useCallback(async (
        taskDefinition: TaskDefinition,
        data: any,
    ) => {
        // Direct State-Reading Action for calling API - Saves data, records task completion, cancels notifications
        // Note: Error state only set on failure - but useSurvey has own isSubmitting, isActionLoading not set
        // TODO: should use isActionLoading instead?
        setActionError(null);
        // The dependency array ensures these are always fresh.
        if (!state || displayState === null) {
            const err = "Cannot submit data: no experiment state found.";
            console.error(err);
            setActionError(err);
            throw new Error(err);
        }

        const { id: taskId, datapipe_id, allow_edit } = taskDefinition; // Messy on taskId
        // Conditionally set the datapipe_id to undefined if consent is withdrawn
        // const finalDatapipeId = state.sendData ?? true ? datapipe_id : undefined;

        const filename = getTaskFilename(taskId);
        const { participantId } = state;

        if (!filename) {
            const err = `Failed to construct filename for task ${taskId}.`;
            console.error(err);
            setActionError(err);
            throw new Error(err);
        }

        // Add metadata to files
        let dataAndMetadata: Record<string, any> = {
            participantId,
            // timestamp: new Date().toISOString(),
            taskId: taskId,
            responses: data // TODO: consider that data.responses needs to be extracted everywhere if not placing them at top level
        };

        if(experimentDefinition.total_days && experimentDefinition.total_days > 0) {
            dataAndMetadata = {
                ...dataAndMetadata,
                day: displayState.experimentDay
            }
        }

        if(experimentDefinition.conditions) {
            dataAndMetadata = {
                ...dataAndMetadata,
                condition: displayState.currentCondition
            }
        }

        try {
            let sendAfterTime: string|undefined = undefined;
            if (allow_edit) {
                const sendTime = new Date();
                // Set time to the cutoff hour today
                sendTime.setHours(definition.cutoff_hour||0, 0, 0, 0);
                if (new Date() >= sendTime) { // if past today's cutoff, schedule for tomorrow
                    sendTime.setDate(sendTime.getDate() + 1);
                }
                // sendTime is now the next upcoming cutoff time
                sendAfterTime = sendTime.toISOString();
            }
            await DataService.saveData(dataAndMetadata, filename, datapipe_id, sendAfterTime);
            const newDisplayState = await completeTask(taskId);

            // ROUTING ---***
            if(newDisplayState) {
                if (newDisplayState.isExperimentComplete) {
                    router.replace('/end');
                    return;
                } else if (definition.autoroute) {
                    // Find the next available task
                    const nextTask = newDisplayState.tasks.find(
                        task => !task.completed && task.isAllowed
                    );
                    if (nextTask) {
                        const href = RoutingService.getTaskHref(nextTask.definition);
                        router.replace(href);
                        return
                    }
                }
            }
            router.replace('/')
        } catch (e) {
            console.error("Failed to submit task data:", e);
            setActionError(`Failed to submit data\n${e}`);
            throw e; // Re-throw so useSurvey's 'handleSurveySubmit' can catch it
        }
    }, [state, displayState, getTaskFilename, completeTask, definition]);

    const resetTaskCompletion = useCallback(async () => {
        setIsActionLoading(true);
        setActionError(null);
        try {
            const newState = await ExperimentTracker.resetTasks();
            if (newState) {
                // Recalculate the display state
                const newDisplayState = ExperimentTracker.calculateDisplayState(newState);
                setState(newState);
                setDisplayState(newDisplayState);
            } else {
                throw new Error("No state found to reset.");
            }
        } catch (e: any) {
            console.error("Failed to reset tasks:", e); // Corrected error
            setActionError(e.message || "Failed to reset tasks"); // Corrected error
        } finally {
            setIsActionLoading(false);
        }
    }, []); // No dependencies needed as the tracker handles getting the state

    const stopExperiment = useCallback(async () => {
        setIsActionLoading(true);
        setActionError(null);
        try {
            // NOTE: creates a minor race condition - if state is null and a screen calls e.g. getFilename then returns warning
            // Could try implement isResettingParticipant state here to handle, but atm not an issue.
            // Can also just check for null state in any page
            setState(null);
            setDisplayState(null);
            await ExperimentTracker.stopExperiment();
        } catch (e: any) {
            console.error("Failed to stop experiment:", e);
            setActionError(e.message || "Failed to stop experiment");
        } finally {
            setIsActionLoading(false);
        }
        // App gate should automatically redirect to welcome page
    }, []);

    const confirmAndStopExperiment = useCallback(() => {
        Alert.alert(
            'WARNING',
            "Experiment progress will be reset. Are you sure?",
            [
                {
                    text: 'Reset experiment',
                    onPress: () => void stopExperiment(),
                    style: "destructive"
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    }, [stopExperiment]); // Add dependency

    // TODO: for debugging and participant manually ending experiment on last day, finish this:
    // const forceSendData = useCallback(async () => {
    //     //
    // }, [])
    //
    // const manuallyFinishExperiment = useCallback(async () => {
    //         const newDisplayState = {...displayState, isExperimentComplete: true};
    //         // setDisplayState(newDisplayState)
    // }, [displayState])

    // Create object to pass to context
    const value: ExperimentContextType = {
        isLoading: loading,
        loadExperimentState,
        definition,
        state,
        displayState,
        refreshState: refresh,
        refreshing,
        startExperiment,
        getTaskFilename,
        completeTask,
        submitTaskData,
        resetTaskCompletion,
        updateNotificationTimes,
        updateSendData,
        setParticipantVariable,
        stopExperiment,
        confirmAndStopExperiment,
        isActionLoading,
        actionError,
    };

    // return provider
    return (
        <ExperimentContext.Provider value={value}>
            {children}
        </ExperimentContext.Provider>
    );
}
