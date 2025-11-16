import { TaskDefinition, NotificationDefinition } from "@/types/experimentConfig";

// STORED INFO ON PARTICIPANT STATE ********
export type NullableStringRecord = Record<string, string|null>

interface BaseExperimentState {
    startDate: string; // ISO string
    participantId?: string;
    sendData?: boolean;
    tasksLastCompletionDate: NullableStringRecord;
    notificationTimes: NullableStringRecord;
    participantVariables?: Record<string, any>;
    experimentEnded?: boolean; // Add this to persist experiment ended quicker?
    forceSendData?: boolean; // Add this to allow forcing sending data despite any delays.
}

// Change here to allow for no condition
interface IndependentMeasuresState extends BaseExperimentState {
    conditionType: 'independent';
    assignedCondition: string;
}

interface RepeatedMeasuresState extends BaseExperimentState {
    conditionType: 'repeated';
    repeatedMeasuresConditionOrder: string[];
}

export type ExperimentState = IndependentMeasuresState | RepeatedMeasuresState | BaseExperimentState;

// FOR DISPLAY STATE **************
export interface TaskDisplayStatus {
    definition: TaskDefinition;
    isAllowed: boolean;
    completed: boolean; // Let's make this non-optional for clarity
}

export interface scheduledNotification {
    definition: NotificationDefinition,
    time: string, // or date? going to be serialised
}

export interface ExperimentDisplayState {
    participantId: string;
    experimentDay: number; // Day 0, 1, 2, etc.
    currentCondition?: string;
    currentConditionIndex?: number;
    isExperimentComplete: boolean;
    allTasksCompleteToday: boolean;
    tasks: TaskDisplayStatus[];
    notifications?: scheduledNotification[]
}
