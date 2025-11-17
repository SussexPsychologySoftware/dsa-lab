// TODO: move this into trackExperimentState and rename to experiment.ts
import {SurveyComponent, SurveyDataType} from "@/types/surveyQuestions";


export interface NotificationDefinition {
    prompt?: string;
    default_time?: string;
    // repeat_daily: true;
}

export interface TaskNotification extends NotificationDefinition {
    taskId: string;
}

interface OverwriteData {
    // on_start_overwrite_data
    // on_finish_save_as
    source: 'task'|'state' // if task use createFilename, else just use storage key
    storage_key: string; // 'experimentState'
    day?: number; // optional if using repeating survey

    item_key: string; // The key within the data returned from storage key

    // Storing in current object or to somewhere else?
    save_key: string; // The thing to overwrite in the current data - overwrite if existing or create new.
}

// TODO: what is it I actually need right now? To turn off sending data for whole experiment
// Can do overwrite parameters options at task level and change datapipe_id?

interface StateUpdateActionBase {
    // TODO: risky I guess, but in future this should just expose the entire state, displayState, etc.
    response_key: string; // Looks up a value in the survey's 'responses' object
    operator?: '=' | '!=' | '<' | '<=' | '>' | '>=' | '|' | '&' ; // The comparison to run
    compare_value?: SurveyDataType;
    action: 'set_send_data' | 'set_participant_variable'; // The action to take if the comparison is true // TODO: add here
    payload?: any; // The value to pass to that action - defaults to value of response_key
}

interface UpdateSendDataAction extends StateUpdateActionBase {
    action: 'set_send_data';
    payload?: boolean; // Defaults to value of 'conditionMet' by comparing response to value using operator
}

interface SetParticipantVariableAction extends StateUpdateActionBase {
    action: 'set_participant_variable';
    payload: {
        key: string; // What to store it under - TODO: for a more generic state setter this could be hoisted to the ActionBase
        value?: any; // if not included, is the value stored in response_key
    };
}

type StateUpdateAction = UpdateSendDataAction | SetParticipantVariableAction // TODO: add more here

export interface SkipAction {
    state_key: string;
    operator: '=' | '!=' | '<' | '<=' | '>' | '>=';
    compare_value: SurveyDataType;
}

interface TaskDefinitionBasic {
    id: string;
    name: string;
    prompt?: string;
    show_on_days?: number[]; // Empty array means show all days
    show_for_conditions?: string[]; // Empty array means show for all conditions
    datapipe_id?: string;
    allow_edit?: boolean; // TODO: change to allow_once
    params?: Record<string, any>; // other stuff to pass in
    type: 'survey' | 'screen' | 'web';
    notification?: NotificationDefinition;
    autosumbit_on_complete?: boolean;
    on_submit_actions?: StateUpdateAction[];
    skip_if?: SkipAction;
    skippable?: boolean;
    // overwrite_parameters_on_load?: OverwriteDataOptions[] // TODO: something like this could work?

    // Other ideas
    // required: true,
    // showWhen?: (context: object) => {
    //     const { day, condition, block, dayInBlock } = context;
    //     return day > 2 && condition !== 'baseline' && dayInBlock < 3;
    // },
    // availableFrom?: '06:00',
    // availableUntil?: '12:00',
    // reminder?: true,
    // deadlineWarning?: '11:30',
    // conditional_on_tasks?: ['eveningDiary']
}

// Export type tasks for use in each screen displaying that type
export interface SurveyTaskDefinition extends TaskDefinitionBasic {
    type: 'survey',
    questions: SurveyComponent[],
}

export interface ScreenTaskDefinition extends TaskDefinitionBasic {
    type: 'screen',
    path_to_screen: string;
}

export interface WebTaskDefinition extends TaskDefinitionBasic {
    type: 'web',
    url: string;
}

export type TaskDefinition = SurveyTaskDefinition | ScreenTaskDefinition | WebTaskDefinition;

// -*#*-*#*- EXPERIMENT -*#*-*#*-

interface IndependentMeasuresCondition {
    conditions: string[];
    datapipe_id?: string;
    repeatedMeasures: boolean;
}

export interface RepeatedMeasuresCondition extends IndependentMeasuresCondition {
    repeatedMeasures: true;
    increase_on_days: number[];
}

type ConditionDefinition = RepeatedMeasuresCondition | IndependentMeasuresCondition

export interface ExperimentDefinition {
    name: string; // Human-readable name
    debug?: boolean;
    passphrase?: string;
    total_days?: number; // Total length of experiment
    cutoff_hour?: number; // Hour (0-23) when "day" switches (e.g., 4 = 4am)
    participant_info_datapipe_id?: string;
    autoroute?: boolean;
    conditions?: ConditionDefinition;
    tasks: TaskDefinition[];
    send_data?: boolean;
    end_text?: string;
    // Other ideas
    // blocks?: {
    //     names: [],
    //     baseline_length: 2, //days
    //     n_days_per_block: 3, // nullable
    // },
    // end_when?: '', // function??
}

