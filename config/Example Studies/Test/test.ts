import {ExperimentDefinition} from "@/types/experimentConfig";
import {SurveyQuestion} from "@/types/surveyQuestions";

const ethnicitiesList = {
    'Asian or Asian British': [
        'Indian',
        'Pakistani',
        'Bangladeshi',
        'Chinese',
        'Any other Asian background',
    ],
    'Black, African, Caribbean or Black British': [
        'African',
        'Caribbean',
        'Any other Black, African or Caribbean background',
    ],
    'Mixed': [
        'Mixed or multiple ethnic groups',
        'White and Black Caribbean',
        'White and Black African',
        'White and Asian',
        'Any other Mixed or multiple ethnic background'
    ],
    'White': [
        'White English, Welsh, Scottish, Northern Irish or British',
        'White Irish',
        'White Gypsy or Irish Traveller',
        'White Roma',
        'Any other White background',
    ],
    'Other ethnic group': [
        'Arab',
        'Any other ethnic group',
    ]
}


const ExampleSurveyQuestions: SurveyQuestion[] = [
    {
        key: 'age',
        question: 'What is your age?',
        required: true,
        type: "text",
    },
    {
        key: 'gender',
        question: 'What is your gender?',
        type: 'radio',
        // TODO: add difference between label and value {label: value}, or auto capilatise first letter?
        options: ['Male', 'Female', 'Other or prefer to self describe', 'Prefer not to say'],
    },
    {
        key: 'selfDescribeGender',
        question: 'Describe your gender',
        type: 'text',
        conditions: [
            {key: 'gender', value: 'Other or prefer to self describe'},
        ],
        required: true
    },
    {
        key: 'Ethnicity',
        question: 'What is your ethnicity?',
        type: 'select',
        options: ethnicitiesList,
        multiple: false,
    },
    {
        key: 'localTime',
        question: 'What is the time where you are now?',
        type: "time",
        required: true,
    },
    {
        key: 'multilineTextInput',
        question: "Tell us about yourself",
        type: "text",
        multiline: true,
        placeholder: "Say as much as you like...",
    },
    {
        key: 'consent',
        question: '',
        label: 'Do you consent to take part in this experiment?',
        type: 'checkbox',
        required: false,
    },
    {
        key: 'content',
        question: 'On a scale of 0-1, how content are you?',
        type: 'slider',
        default: .5,
        min: 0,
        max: 1,
        step: .1,
        labels: ['Content', 'Neither content nor uncontent', 'Uncontent']
    },
    {
        key: 'confidence',
        question: 'How confident would you be in recommending this treatment to a friend who experiences similar problems?',
        options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        labels: ['Not at all confident', 'Very confident'],
        type: 'likertSingle'
    },
    {
        key: 'phq8',
        type: 'likertGrid',
        name: 'PHQ-8',
        required: false,
        question: 'Over the last 4 days have you felt...',
        statements: [
            'Little interest or pleasure in doing things?',
            'Feeling down, depressed, or hopeless?',
            'Trouble falling or staying asleep, or sleeping too much?',
            'Feeling tired or having little energy?',
            'Poor appetite or overeating?',
            'Feeling bad about yourself, or that you are a failure or have let yourself or your family down?',
            'Trouble concentrating on things, such as reading the newspaper or watching television?',
            'Moving or speaking so slowly that other people could have noticed? Or so fidgety or restless that you have been moving a lot more than usual?'
        ],
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    }
];

export const testExperiment: ExperimentDefinition = {
    name: 'Experiment',
    total_days: 0,
    cutoff_hour: 4,
    debug: true,
    autoroute: true,
    end_text: `Thank you for your participation in this study.
    
Please contact me at [email] with any further queries.`,
    conditions: {
        conditions: ['control', 'monaural', 'binaural'],
        repeatedMeasures: true,
        datapipe_id: 'dOS0nQ93xCSV',
        increase_on_days: [2,6,10]
    },
    // blocks: {
    //     names: [],
    //     baseline_length: 2, //days
    //     n_days_per_block: 3, // nullable
    // },
    // end_when: '', // function??
    tasks: [
        {
            id: 'surveyExample',
            name: 'Defined survey',
            type: 'survey',
            prompt: 'Here it is:',
            questions: [    {
                key: 'content',
                question: 'On a scale of 0-1, how content are you?',
                type: 'slider',
                default: .5,
                min: 0,
                max: 1,
                step: .1,
                labels: ['Content', 'Neither content nor uncontent', 'Uncontent']
            }],
            show_on_days: [0,1,2,3],
            datapipe_id: 'dOS0nQ93xCSV',
            show_for_conditions: [],
            allow_edit: true,
            notification: {
                prompt: 'Daily survey:',
            },
            // required: true,
            // optional fields
            // showWhen: (context: object) => {
            //     const { day, condition, block, dayInBlock } = context;
            //     return day > 2 && condition !== 'baseline' && dayInBlock < 3;
            // },
            // availableFrom: '06:00',
            // availableUntil: '12:00',
            // reminder: true,
            // deadlineWarning: '11:30',
            // conditional_on_tasks: ['eveningDiary']
            // allow_edit: true
        },
        // {
        //     type: 'screen',
        //     id: 'surveyExample2',
        //     name: 'Example Survey Custom screen',
        //     prompt: 'Here it is:',
        //     path_to_screen: '/surveyExample',
        //     show_on_days: [0, 1, 2, 3],
        //     datapipe_id: 'dOS0nQ93xCSV',
        //     show_for_conditions: ['control'], //only show if condition is 'control'
        //     allow_edit: true,
        //     notification: {
        //         prompt: 'Other survey:',
        //         default_time: '12:30',
        //     }
        // }
    ]
}
