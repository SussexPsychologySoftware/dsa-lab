import {colours, globalStyles } from "@/styles/appStyles";
import {ExperimentDefinition, TaskDefinition} from "@/types/experimentConfig";
import {
    AudioQuestion,
    DisplayCondition,
    ParagraphDisplay,
    SurveyComponent,
    SurveyDataType
} from "@/types/surveyQuestions";

const setupSurvey: SurveyComponent[] = [
    {
        key: 'participantCode',
        type: 'text',
        question: 'Enter participant code:',
        required: true
    },
    {
        key: 'familiarity',
        type: 'radio',
        question: 'Device familiarity:',
        options: [
            'Familiar',
            'Unfamiliar',
        ],
        required: true,
    },
];

const confirmSettingsSurvey: SurveyComponent[] = [
    {
        key: 'doNotDisturb',
        question: '',
        type: "checkbox",
        label: "Have you set your phone to 'Do Not Disturb'?'",
        required: true
    }
]

const sectionTitleStyle = {
    paddingBottom: 0,
    marginBottom: -20,
    color: colours.primary,
}

const mainSurvey: SurveyComponent[] = [
    // --- Device Section ---
    {
        key: 'deviceSectionTitle',
        type: 'paragraph',
        title: 'About your device:',
        // titleStyle: sectionTitleStyle,
    },
    {
        key: 'make',
        type: 'text',
        question: 'What make is your phone?',
        required: true,
    },
    {
        key: 'model',
        type: 'text',
        question: 'What model is your phone?',
        required: true,
    },
    {
        key: 'os',
        type: 'radio',
        question: 'Does your phone run on Android or iOS (Apple iPhone)?',
        options: ['Android', 'iOS'],
        required: true,
    },
    {
        key: 'trueTone',
        type: 'radio',
        question: 'Does your phone have True Tone?',
        options: ['Yes', 'No', "Don't know"],
        conditions: [
            { key: 'os', value: 'iOS' },
        ],
        required: true,
    },
    {
        key: 'trueToneOn',
        type: 'radio',
        question: 'Did your phone have True Tone on during the task?',
        options: ['Yes', 'No', "Don't know"],
        conditions: [
            { key: 'trueTone', value: 'Yes' },
        ],
        required: true,
    },
    {
        key: 'filter',
        type: 'radio',
        question: "Do you use a 'blue light filter' app (e.g. f.lux, Twilight, Iris) or setting (e.g. Night Shift on iOS or Eye Comfort Shield on Android)?",
        options: ['Yes', 'No', "Don't know"],
        required: true,
    },
    {
        key: 'filterOn',
        type: 'radio',
        question: 'Was the “blue light filter” switched on when you completed the task?',
        options: ['Yes', 'No', "Don't know"],
        conditions: [
            { key: 'filter', value: 'Yes' },
        ],
        required: true,
    },
    {
        key: 'mode',
        type: 'radio',
        question: 'What mode do you generally use your phone in?',
        options: ['Dark mode', 'Light mode', 'Don’t know', 'Other'],
        required: true,
    },
    {
        key: 'brightness',
        type: 'radio',
        question: 'Does your phone adjust brightness automatically?',
        options: ['Yes', 'No', 'Don’t know'],
        required: true,
    },
    {
        key: 'colour',
        type: 'radio',
        question: 'Does your phone adjust colour automatically?',
        options: ['Yes', 'No', 'Don’t know'],
        required: true,
    },
    {
        key: 'accessibility',
        type: 'radio',
        question: 'Did you have any display accessibility settings on during the task?',
        options: ['Yes', 'No', 'Don’t know'],
        required: true,
    },
    {
        key: 'months',
        type: "text",
        inputType: 'numeric',
        question: 'How long have you had this phone for? (months)',
        required: true,
    },
    {
        key: 'hours',
        type: "text",
        inputType: 'numeric',
        question: 'Approximately how many hours per day do you spend using this phone?',
        required: true,
    },
    {
        key: 'filters',
        type: "text",
        multiline: true,
        question: "Please describe any other filter apps, adjustments or display settings that you use on your device (if there are none, or you just used default settings please state 'none')",
        required: true,
    },

    // --- Surroundings Section ---
    {
        key: 'surroundingsSectionTitle',
        type: 'paragraph',
        title: 'About your surroundings: ',
        // titleStyle: sectionTitleStyle,
    },
    {
        key: 'location',
        type: 'radio',
        question: 'Where are you currently?',
        options: ['At home', 'On campus'],
        required: true,
    },
    {
        key: 'room',
        type: 'text',
        question: 'What room are you in?',
        conditions: [
            { key: 'location', value: 'On campus' },
        ],
        required: true,
    },
    {
        key: 'lighting',
        type: 'radio',
        question: 'What is the lighting like where you are sitting?',
        options: ['Completely natural', 'Majority natural', 'Majority artificial', 'Completely artificial'],
        required: true,
    },

    // --- Demographics Section ---
    {
        key: 'demographicsSectionTitle',
        type: 'paragraph',
        title: 'About you: ',
        // titleStyle: sectionTitleStyle,
    },
    {
        key: 'age',
        type: "text",
        inputType: 'numeric',
        question: 'What is your age in years?',
        required: true,
    },
    {
        key: 'gender',
        type: 'radio',
        question: 'What is your gender?',
        options: ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Prefer to self describe'],
        required: true,
    },
    {
        key: 'genderSelfDescriptionText',
        type: 'text',
        question: 'Self describe your gender:',
        conditions: [
            { key: 'gender', value: 'Prefer to self describe' },
        ],
        required: true,
    },
    {
        key: 'colourDeficiency',
        type: 'radio',
        question: 'Have you ever been diagnosed with a colour vision deficiency ("colour blindness")?',
        options: ['Yes', 'No', 'Not sure'],
        required: true,
    },
];

// -=*#*=- DEFINITION -=*#*=-
export const colourAdjuster: ExperimentDefinition = {
    name: 'DSA',
    passphrase: 'lab',
    debug: false,
    send_data: true, //Set this to false at first and only flip back if consent granted to send data.
    autoroute: true,
    participant_info_datapipe_id: 'q2ecSpabQ6nH',
    tasks: [
        {
            id: 'setup',
            type: 'survey',
            name: 'Setup',
            prompt: 'Complete Setup',
            questions: setupSurvey,
            datapipe_id: 'q2ecSpabQ6nH',
        },
        {
            id: 'confirm',
            type: 'survey',
            name: 'Confirm Settings Survey',
            prompt: 'Confirm Settings',
            questions: confirmSettingsSurvey,
            // TODO: DON'T SEND DATA IF NO CONSENT GRANTED.
        },
        {
            id: 'adjust',
            type: 'screen',
            path_to_screen: '/DSA/adjustColour',
            name: 'Task',
            prompt: 'Complete task',
            datapipe_id: '4s7WE6aDDG5Y',
            // TODO
            // overwrite_parameters_on_load: [{
            //     parameter: 'datapipe_id',
            //     task_id: 'consent',
            //     response_key: 'consent',
            //     // if response is 'I would like to continue without my data being recorded.' then false
            // }]
        },
        {
            id: 'survey',
            type: 'survey',
            name: 'Survey',
            prompt: 'Complete Survey',
            questions: mainSurvey,
            datapipe_id: '4s7WE6aDDG5Y',
            skippable: true,
            skip_if: {
                state_key: 'participantVariables.device.deviceType',
                operator: '!=',
                compare_value: 'PHONE'
            }
        },
        {
            id: 'test',
            type: 'screen',
            path_to_screen: '/DSA/showTrialData',
            name: 'Test Responses',
            prompt: 'Go to testing screen',
        },
    ]
}

// datapipe consent: PivGLj2cDZ2w
// datapipe responses: BpmHD6x0s5m9
