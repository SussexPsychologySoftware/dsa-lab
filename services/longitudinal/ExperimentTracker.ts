import * as Notifications from "expo-notifications";
import {ExperimentDisplayState, ExperimentState, TaskDisplayStatus, NullableStringRecord} from "@/types/trackExperimentState";
import {DataService} from "@/services/data/DataService";
import {experimentDefinition} from "@/config/experimentDefinition";
import {TaskDefinition} from "@/types/experimentConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ConditionAssignment} from "@/services/ConditionAssignment";
import * as Device from 'expo-device';
import {getNestedValue} from "@/utils/dotNotation";

// ============ State Management ============
// EXPERIMENT TRACKER - this saves and calculates states for display
// Experiment Context deals with reacty style setting and getting of live states whilst app is open
// TODO: some of this is a bit high level - maybe needs to be split into 'diary study'  and 'todo list' and 'experiment state' etc?
export class ExperimentTracker {
    private static readonly STORAGE_KEY = 'experimentState'; // Storage
    private static readonly TEST_MINUS_DAYS_FROM_START = 0; // NEEDS 2 to get 1 day diff?

    // ============ START EXPERIMENT ============

    private static createInitialState(
        participantId: string,
        assignedCondition?: string | string[],
        deviceInfo?: Record<string, any>
    ): ExperimentState {

        const emptyTaskStates = Object.fromEntries(
            experimentDefinition.tasks.map((task, index)=> {
                return [task.id, null];
            })
        );

        const emptyNotificationTimes = Object.fromEntries(
            experimentDefinition.tasks
                .filter(task => task.notification)
                .map((task, index)=> {
                    return [task.id, task.notification?.default_time ?? null];
                })
        );

        const baseState = {
            startDate: new Date().toISOString(),
            participantId,
            tasksLastCompletionDate: emptyTaskStates,
            notificationTimes: emptyNotificationTimes,
            sendData: experimentDefinition.send_data ?? true,
            participantVariables: deviceInfo ? { device: deviceInfo } : {}
        };

        if(experimentDefinition.conditions && assignedCondition !== undefined) {
            if (Array.isArray(assignedCondition)) {
                // It's a repeated measures experiment TODO: this sort of makes conditionType redundant then?
                return {
                    ...baseState,
                    conditionType: 'repeated',
                    repeatedMeasuresConditionOrder: assignedCondition
                };
            } else {
                // It's an independent measures experiment
                return {
                    ...baseState,
                    conditionType: 'independent',
                    assignedCondition: assignedCondition
                };
            }
        } else {
            return baseState
        }

    }

    static generateRandomID(length: number)  {
        let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXZ';
        let id = '';
        for (let i = 0; i < length; i++) {
            id += (characters[Math.floor(Math.random() * characters.length)]);
        }
        return id
    }

    static async startExperiment(
        participantId?: string,
        overrideCondition?: string | string[]
    ): Promise<ExperimentState> {

        if(!participantId) {
            participantId = this.generateRandomID(16);
        }

        let assignedCondition: string | string[] | undefined = undefined;
        if (overrideCondition) {
            // An override was passed in (e.g., for testing or a specific link)
            assignedCondition = overrideCondition;
        } else if(experimentDefinition.conditions){
            // No override, so fetch the condition using the definition
            const condDef = experimentDefinition.conditions;
            assignedCondition = await ConditionAssignment.getCondition(
                condDef.conditions,
                condDef.repeatedMeasures,
                condDef.datapipe_id
            );
        }
        const deviceInfo = await this.getParticipantDeviceInfo();
        const initialState = this.createInitialState(participantId, assignedCondition, deviceInfo);

        await this.saveState(initialState)
        void this.sendParticipantInfo(initialState, deviceInfo);
        return initialState;
    }

    static async getParticipantDeviceInfo(): Promise<Record<string, any>> {
        const deviceType = await Device.getDeviceTypeAsync();
        let deviceTypeString = '';
        switch(deviceType) {
            case 0: deviceTypeString = 'UNKNOWN'; break;
            case 1: deviceTypeString = 'PHONE'; break;
            case 2: deviceTypeString = 'TABLET'; break;
            case 3: deviceTypeString = 'DESKTOP'; break;
            case 4: deviceTypeString = 'TV'; break;
            default: deviceTypeString = 'NOT_FOUND'; break;
        }

        const isRooted = await Device.isRootedExperimentalAsync();

        return {
            brand: Device.brand,
            androidDesignName: Device.designName,
            modelId: Device.modelId,
            manufacturer: Device.manufacturer,
            modelName: Device.modelName,
            osBuildId: Device.osBuildId,
            osName: Device.osName,
            osVersion: Device.osVersion,
            productName: Device.productName,
            deviceYearClass: Device.deviceYearClass,
            totalMemory: Device.totalMemory,
            isDevice: Device.isDevice,
            isRooted: isRooted,
            deviceType: deviceTypeString // <-- This is the key you'll check
        };
    }

    static async sendParticipantInfo(
        state: ExperimentState,
        device: Record<string, any>
    ) {

        const condition = ('conditionType' in state)
            ? (state.conditionType === 'independent' ? state.assignedCondition : state.repeatedMeasuresConditionOrder)
            : undefined;

        const participantInfo: Record<string,any> = {
            participantId: state.participantId,
            startDate: state.startDate,
            condition,
            device
        };

        const infoFilename = `${state.participantId}_participantInfo`;

        await DataService.saveData(
            participantInfo,
            infoFilename,
            experimentDefinition.participant_info_datapipe_id // If not defined, just saves
        );
    }

    // ============ STOP EXPERIMENT ============
    static async endExperiment(displayState: ExperimentDisplayState){
        const state = await this.getState();
        if (!state) return null;
        state.experimentEnded = true;
        state.forceSendData = true
        await this.saveState(state);

        const newDisplayState = {
            ...displayState,
            isExperimentComplete: true
        };

        await Notifications.cancelAllScheduledNotificationsAsync();
        console.debug({state, displayState: newDisplayState});
        return {state, displayState: newDisplayState}
    }

     static async stopExperiment(): Promise<void> {
        // TODO: resetExperiment() also needed?
        // await DataService.deleteData(this.STORAGE_KEY)
         await AsyncStorage.clear() // risky - maybe use AsyncStorage.multiRemove() for multiple keys instead?
         await Notifications.cancelAllScheduledNotificationsAsync();
    }

    // ============ SET STATE ============

    private static async saveState(state: ExperimentState): Promise<void> {
        if (this.TEST_MINUS_DAYS_FROM_START > 0) {
            state.startDate = this.testAddDaysToDate(state.startDate, this.TEST_MINUS_DAYS_FROM_START);
        }
        await DataService.setData(this.STORAGE_KEY, state);
    }

    static async updateNotificationTimes(times: NullableStringRecord): Promise<ExperimentState | null> {
        const state = await this.getState();
        if (!state) return null;

        state.notificationTimes = times; // Overwrite with the new object

        await this.saveState(state); // Persist the change
        return state;
    }

    static async setParticipantVariable(key: string, value: any): Promise<ExperimentState | null> {
        const state = await this.getState();
        if (!state) return null;

        if (!state.participantVariables) {
            state.participantVariables = {};
        }
        state.participantVariables[key] = value;

        await this.saveState(state);
        return state;
    }

    static async resetTasks(): Promise<ExperimentState | null> {
        const state = await this.getState();
        if (!state) return null;

        // Get the correct initial empty task state
        // Update the state
        state.tasksLastCompletionDate = Object.fromEntries(
            experimentDefinition.tasks.map((task) => [task.id, ''])
        );

        await this.saveState(state); // Persist the change
        return state;
    }

    // ============ GET STATE ============

    private static testAddDaysToDate(date: string, days: number){
        if(date === '') return ''
        const date_test = new Date(date);
        date_test.setDate(new Date(date_test).getDate() + days)
        return date_test.toISOString();
    }

    static async getState(): Promise<ExperimentState|null> {
        const state = await DataService.getData(this.STORAGE_KEY);
        if (!state) return null
        // add some functions
        return state;
    }

    static async updateSendData(sendData: boolean): Promise<ExperimentState | null> {
        const state = await this.getState();
        if (!state) return null;

        state.sendData = sendData;

        await this.saveState(state); // Persist the change
        return state;
    }

    static async getSendDataState() {
        const state = await this.getState();
        if (!state) return null;
        return state.sendData ?? true;
    }

    static async updateForceSendData(forceSend: boolean): Promise<ExperimentState | null> {
        const state = await this.getState();
        if (!state) return null;

        state.forceSendData = forceSend;

        await this.saveState(state); // Persist the change
        return state;
    }

    static async getForceSendDataState() {
        const state = await this.getState();
        if (!state) return null;
        return state.forceSendData ?? false; // or ignoreTimestamps
    }

    // ============ TASK MANAGER ============

    // Need function to create daily tasks list
    // Separate function to refresh daily tasks list
    static getTaskDefinition(taskId: string): TaskDefinition | undefined {
        return experimentDefinition.tasks.find(t => t.id === taskId);
    }

    static filterPendingTasks(experimentDay: number, condition?: string): TaskDefinition[] {
        return experimentDefinition.tasks.filter(task => {
            // Check day schedule
            const showOnDay = !task.show_on_days || task.show_on_days.length === 0 || task.show_on_days.includes(experimentDay);
            // Check condition schedule
            const showForCondition = !condition || !task.show_for_conditions || task.show_for_conditions.length === 0 || task.show_for_conditions.includes(condition);
            return showOnDay && showForCondition;
        });
    }

    static calculateTaskDisplayStatuses(visibleTasks: TaskDefinition[],
                                        state: ExperimentState): TaskDisplayStatus[] {
        const displayStatuses: TaskDisplayStatus[] = [];
        let allPreviousRequiredTasksComplete = true;

        for (const taskDef of visibleTasks) {
            const taskCompletionDate = state.tasksLastCompletionDate[taskDef.id];
            const taskCompleted = taskCompletionDate ? this.happenedToday(taskCompletionDate) : false;

            // TODO: things like this need to be centralised as an action generally.
            let shouldSkip = false;
            if (taskDef.skip_if && !taskCompleted) { // Only check if not already complete
                const { state_key, operator, compare_value } = taskDef.skip_if
                try {
                    // Use getNestedValue to check the ExperimentState
                    const stateValue = getNestedValue(state, state_key);

                    if (stateValue !== undefined) {
                        let conditionMet = false;
                        if (operator === '=') {
                            conditionMet = (stateValue === compare_value);
                        } else if (operator === '!=') {
                            conditionMet = (stateValue !== compare_value);
                        }
                        // TODO: Add other operators (>, <, etc.)
                        if (conditionMet) {
                            shouldSkip = true;
                        }
                    } else {
                        console.warn(`skip_if: state_key "${state_key}" not found in ExperimentState.`);
                    }
                } catch (e) {
                    console.error(`Error processing skip_if for task ${taskDef.id}:`, e);
                }
            }

            const isCompleted = taskCompleted || shouldSkip;
            const isAllowed = (allPreviousRequiredTasksComplete && !isCompleted) ||
                (isCompleted && taskDef.allow_edit === true && !shouldSkip); // Don't allow edit for a skipped task

            console.log({isAllowed, isCompleted})
            // Task is allowed if all previous required tasks are done
            displayStatuses.push({
                definition: taskDef, // Just pass the whole definition
                isAllowed: isAllowed,
                completed: isCompleted,
            });

            // Update for next iteration
            if (!isCompleted) {
                allPreviousRequiredTasksComplete = false;
            }
        }

        return displayStatuses;
    }

     static updateCondition(state: ExperimentState, experimentDay: number) {
        // TODO handling of no condition a bit messy...
        if(!('conditionType' in state) || !experimentDefinition.conditions) return {currentCondition: undefined, currentConditionIndex: undefined}; // has no conditions
        let currentCondition: string;
        let currentConditionIndex: number = 0;
        const { conditions } = experimentDefinition;

        switch (state.conditionType) {
            case 'independent':
                currentCondition = state.assignedCondition;
                currentConditionIndex = 0;
                break;

            case 'repeated':
                if (!("increase_on_days" in conditions)) {
                    // This is a state/definition mismatch, a serious error
                    console.error("Experiment state is 'repeated', but definition is not!");
                    currentCondition = 'error_condition';
                    break; // Or throw
                }

                const { increase_on_days } = conditions;
                const { repeatedMeasuresConditionOrder } = state; // No '?' needed
                // Slightly too clever here - true for each element that matches condition, and length is then conditionIndex
                currentConditionIndex = increase_on_days.filter(day => experimentDay >= day).length;
                if (currentConditionIndex >= repeatedMeasuresConditionOrder.length) {
                    // TODO: note sticking with end of array allows for different lengths of conditions, but looping would be a different design type.
                    currentConditionIndex = repeatedMeasuresConditionOrder.length - 1;
                }
                currentCondition = repeatedMeasuresConditionOrder[currentConditionIndex];
                break;
        }

        return { currentCondition, currentConditionIndex };
    }

    static calculateDisplayState(state: ExperimentState): ExperimentDisplayState {
        const experimentDay = this.calculateDaysPassed(state.startDate);
        const {currentCondition, currentConditionIndex} = this.updateCondition(state, experimentDay);
        // Get tasks that should show today
        const visibleTasks = this.filterPendingTasks(experimentDay, currentCondition);
        // Calculate display status for each visible task
        const taskDisplayStatuses = this.calculateTaskDisplayStatuses(visibleTasks, state);

        const allTasksCompleteToday = taskDisplayStatuses.every(t => t.completed)
        const anyTasksEditable = visibleTasks.some(t => t.allow_edit);
        return {
            participantId: state.participantId??'NO_ID',
            experimentDay,
            currentCondition,
            currentConditionIndex,
            isExperimentComplete: this.hasExperimentEnded(state, allTasksCompleteToday && anyTasksEditable),
            allTasksCompleteToday,
            tasks: taskDisplayStatuses
        };
    }

    static hasExperimentEnded(state: ExperimentState, noRemainingTasks: boolean): boolean {
        const today = this.calculateDaysPassed(state.startDate);
        const totalDays = experimentDefinition.total_days
        // Note: if they didn't include a total_days then study doesn't end on it's basis ever
        const noDaysFinished = totalDays===undefined && noRemainingTasks
        const longitudinalFinished = totalDays!==undefined && ((today>totalDays) || (noRemainingTasks && today===totalDays))
        return longitudinalFinished || noDaysFinished
    }

    // ============ Task Completion Recording ============
    static async setTaskCompleted(taskId: string): Promise<ExperimentState> {
        const state = await this.getState();
        if(!state) throw new Error("No state found to update.");
        state.tasksLastCompletionDate[taskId] = new Date().toISOString();
        await this.saveState(state);
        return state;
    }

    static constructFilename(taskId: string, participantID: string, day?: number): string {
        // TODO: should this be somewhere else?
        let filename = `${participantID}_${taskId}`
        if (day !== null && day !== undefined) {
            // For longitudinal tasks
            return `${filename}_${day}`;
        }
        return filename;
    }

    // ============ Date Utilities ===========
    static calculateDaysPassed(eventDate: string): number {
        if (!eventDate) return -1; // -1 should be treated as incorrect - known as a 'sentinel value'
        const parsed = new Date(eventDate); // UTC ISO → local time, i.e. same in UK as NZ
        const now = new Date();

        // Adjust both dates to previous day if before cutoff hour, then normalize to midnight
        [now, parsed].forEach(date => {
            if (date.getHours() < (experimentDefinition.cutoff_hour||0)) {
                date.setDate(date.getDate() - 1);
            }
            date.setHours(0, 0, 0, 0);
        });

        return Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));
    }

    static async getDaysSinceStart(): Promise<number|null> {
        const state = await this.getState();
        if(!state) return null
        return this.calculateDaysPassed(state.startDate);
    }

    static happenedToday(dateString: string): boolean {
        return this.calculateDaysPassed(dateString) === 0;
    }

}
