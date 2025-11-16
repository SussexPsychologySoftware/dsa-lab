import {ExperimentDefinition, TaskDefinition} from "@/types/experimentConfig";
import {
    AudioQuestion,
    ParagraphDisplay,
    SurveyComponent
} from "@/types/surveyQuestions";
import {daysBetween, phase2Days} from "@/utils/configHelpers";

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

const demographics: SurveyComponent[] = [
    {
        key: 'age',
        type: "text",
        inputType: 'numeric',
        question: 'What is your age?',
        required: true,
    },
    {
        key: 'gender',
        type: 'radio',
        question: 'What is your gender?',
        // TODO: add difference between label and value {label: value}, or auto capilatise first letter?
        options: ['Male', 'Female', 'Other or prefer to self describe', 'Prefer not to say'],
        required: true,
    },
    {
        key: 'selfDescribeGender',
        type: 'text',
        question: 'Describe your gender',
        conditions: [
            {key: 'gender', value: 'Other or prefer to self describe'},
        ],
        required: true
    },
    {
        key: 'Ethnicity',
        type: 'select',
        question: 'What is your ethnicity?',
        options: ethnicitiesList,
        multiple: false,
        required: true,
    },
]

const morningSleepDiary: SurveyComponent[] = [
    {
        key: 'time_went_bed',
        question: 'Time I went to bed last night',
        type: "time",
        default: '22:00',
        required: true,
    },
    {
        key: 'time_got_out_bed',
        question: 'Time I got out of bed this morning',
        type: 'time',
        default: '08:00',
        required: true,
    },
    {
        key: 'hours_in_bed',
        question: 'Hours spent in bed last night',
        type: "text",
        inputType: 'numeric',
        default: '0',
        required: true
    },
    {
        key: 'number_awakenings',
        question: 'Number of awakenings last night',
        type: "text",
        inputType: 'numeric',
        default: '0',
        required: true
    },
    {
        key: 'time_awake',
        question: 'Total time awake last night',
        type: 'lengthOfTime',
        default: '00:00',
        required: true
    },
    {
        key: 'how long fall asleep',
        question: 'How long I took to fall asleep last night',
        type: 'lengthOfTime',
        default: '00:00',
        required: true
    },
    {
        key: 'medicines',
        question: "Medicines taken last night to improve sleep",
        type: "text",
        multiline: true,
    },
    {
        key: 'alertness',
        type: 'radio',
        question: 'How alert did I feel when I got up this morning',
        options: ['Alert', 'Alert but a little tired', 'Sleepy'],
        required: true
    }
]

const eveningSleepDiary: SurveyComponent[] = [
    {
        key: 'caffeinated',
        question: 'Number of caffeinated drinks (coffee, tea, cola) and time when I had them today',
        type: "text",
        multiline: true,
    },
    {
        key: 'alcoholic',
        question: 'Number of alcoholic drinks (beer, wine, liquor) and time when I had them today',
        type: "text",
        multiline: true,
    },
    {
        key: 'naptimes',
        question: 'Naptimes and lengths today',
        type: "text",
        multiline: true,
    },
    {
        key: 'exercise',
        question: 'Exercise times and lengths today',
        type: "text",
        multiline: true,
    },
    {
        key: 'sleepiness',
        question: 'How sleepy did I feel during the day today?',
        type: 'radio',
        options: ['So sleepy I had to struggle to stay awake during much of the day',
            'Somewhat tired', 'Fairly alert', 'Alert'],
        required: true
    }
]

const blockQuestionnaire: SurveyComponent[] = [
    {
        key: 'PHQ-8',
        type: 'likertGrid',
        name: 'PHQ-8',
        question: 'How often have you been bothered by the following over the past 4 days?',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        statements: ['Little interest or pleasure in doing things?', 'Feeling down, depressed, or hopeless?',
            'Trouble falling or staying asleep, or sleeping too much?', 'Feeling tired or having little energy?',
            'Poor appetite or overeating?',
            'Feeling bad about yourself — or that you are a failure or have let yourself or your family down?',
            'Trouble concentrating on things, such as reading the newspaper or watching television?',
            'Moving or speaking so slowly that other people could have noticed? Or so fidgety or restless that you have been moving a lot more than usual?'
        ],
        required: true
    },
    {
        key: 'GAD-7',
        type: 'likertGrid',
        name: 'GAD-7',
        question: 'Over the last 4 days, how often have you been bothered by the following problems?',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        statements: ['Feeling nervous, anxious, or on edge?', 'Not being able to stop or control worrying?',
            'Worrying too much about different things?', 'Trouble relaxing?', 'Being so restless that it is hard to sit still?',
            'Becoming easily annoyed or irritable?', 'Feeling afraid as if something awful might happen?'],
        required: true
    },
    {
        key: 'PROMIS_SD-SF_1-4',
        type: 'likertGrid',
        name: 'PROMIS SD-SF Q1-4',
        question: 'In the past 4 days...',
        options: ['Not at all', 'A little bit', 'Somewhat', 'Quite a bit', 'Very much'],
        statements: ['My sleep was restless','I was satisfied with my sleep','My sleep was refreshing',
            'I had difficulty falling asleep'
        ],
        required: true
    },
    {
        key: 'PROMIS_SD-SF_5-7',
        type: 'likertGrid',
        name: 'PROMIS SD-SF Q5-7',
        question: 'In the past 4 days...',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
        statements: ['I had trouble staying asleep', 'I had trouble sleeping', 'I got enough sleep'],
        required: true
    },
    {
        key: 'PROMIS_SD-SF_8',
        type: 'likertGrid',
        name: 'PROMIS SD-SF Q8',
        question: 'In the past 4 days...',
        options: ['Very poor', 'Poor', 'Fair', 'Good', 'Very good'],
        statements: ['My sleep quality was'],
        required: true
    },
    {
        key: 'PROMIS_SRI-SF',
        type: 'likertGrid',
        name: 'PROMIS SRI-SF',
        question: 'In the past 4 days...',
        options: ['Not at all', 'A little bit', 'Somewhat', 'Quite a bit', 'Very much'],
        statements: ['I had a hard time getting things done because I was sleepy', 'I felt alert when I woke up',
            'I felt tired', 'I had problems during the day because of poor sleep',
            'I had a hard time concentrating because of poor sleep', 'I felt irritable because of poor sleep',
            'I was sleepy during the daytime', 'I had trouble staying awake during the day'],
        required: true
    },
    {
        key: 'MOSS-SS_1',
        type: 'radio', // Could be radio tbf
        question: 'How long did it usually take for you to fall asleep during the past 4 days?',
        options: ['0–15 minutes', '16–30 minutes', '31–45 minutes', '46–60 minutes', '>60 minutes'],
        required: true
    },
    {
        key: 'MOS-SS_Q2',
        question: 'On average, how many hours did you sleep each night during the past 4 days?',
        placeholder: 'Hours Slept',
        type: 'text',
        inputType: 'numeric',
        required: true
    }
]

const expectanciesQuestionnaire: SurveyComponent[] = [
    {
        key: 'CEQ_1',
        type: 'likertSingle',
        question: 'At this point, how logical does the current intervention seem to you?',
        options: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        labels: ['Not at all logical', 'Somewhat logical', 'Very logical'],
        required: true
    },
    {
        key: 'CEQ_2',
        type: 'likertSingle',
        question: 'At this point, how successfully do you think this treatment will be in improving your sleep?',
        options: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        labels: ['Not at all useful','Somewhat useful', 'Very useful'],
        required: true
    },
    {
        key: 'CEQ_3',
        type: 'likertSingle',
        question: 'How confident would you be in recommending this treatment to a friend who experiences similar sleep problems?',
        options: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        labels: ['Not at all confident', 'Somewhat confident', 'Very confident'],
        required: true
    },
    {
        key: 'CEQ_4',
        type: 'slider',
        // TODO: can be slider - pass in units suffix argument
        question: 'By the end of the treatment period (4 days), how much improvement in your sleep symptoms do you think will occur?',
        min:0,
        max:100,
        step:10,
        units:'%',
        showValue: true,
        default: 0,
        required: true
        // type: 'likertGrid',
        // options: ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'],
        // oneWordPerLine: true
    },
    {
        key: 'set2_instructions', // note these are needed to cut down on unnecessary rerenders in react
        type: 'paragraph',
        title: 'Set 2',
        text: 'For this set, close your eyes for a few moments, and try to identify what you really feel about the ' +
            'intervention and its likely success. Then answer the following questions:',
        containerStyle: {
            borderTopWidth: 3,
            marginTop: 10,
            paddingTop: 10,
            borderBottomWidth: 3,
            paddingBottom: 15
        }
    },
    {
        key: 'CEQ_5',
        type: 'likertSingle',
        question: 'At this point, how much do you really feel that this audio tone will help you to improve your sleep?',
        options: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        labels: ['Not at all', 'Somewhat', 'Very much'],
        required: true
    },
    {
        key: 'CEQ_6',
        type: 'slider',
        question: 'By the end of the treatment period (4 days), how much improvement in your sleep do you really feel will occur?',
        min:0,
        max:100,
        step:10,
        units:'%',
        showValue: true,
        default: 0,
        required: true
        // options: ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'],
        // oneWordPerLine: true
    },
]

const setVolumeTask: SurveyComponent[] = [
    {
        key: 'instructions',
        type: 'paragraph',
        text: ['So that we can keep volume consistent throughout our experiment, we need you to adjust the volume on your phone and in the app.',
            'Please put your headphones on and ensure they are connected to your phone via bluetooth.',
            "Set your device's volume using the buttons on the side of your phone to approximately 50% (around halfway), and then adjust the slider so that the audio clip is barely audible.",
            'This will be the maximum volume available later.'],
        containerStyle: {marginTop: -25}
    },
    {
        key: 'setVolumeQuestion',
        type: 'audio',
        question: '',
        file: require('../../../assets/sounds/monaural.mp3'),
        default: false, // autoplay
        volume: .5,
        volumeControls: true
    }
]

// -=*#*=- LISTEN TO AUDIO TASK -=*#*=-
const audioSurveyInstructions: ParagraphDisplay = {
    key: 'instructions',
    type: 'paragraph',
    text: ['Connect your headphones and press play when you are ready to begin playing your nightly sleep audio.',
        'Please do not exceed 50% volume on your device. Please make sure your phone is plugged in or has enough battery to last the night.'],
};

// Define the base settings for all audio component -  Omit to create a type excluding the parts that will change
const audioSurveyBase: Omit<AudioQuestion, 'key' | 'file'> = {
    type: 'audio',
    question: '',
    required: true,
    default: false, // autoplay
    overwrite_parameter_from_storage: [{
        parameter: 'volume',
        task_id: 'setVolume',
        response_key: 'setVolumeQuestion.volume'
    }]
};

const audioSurveyControl: SurveyComponent[] = [
    audioSurveyInstructions,
    {
        ...audioSurveyBase,
        key: 'audioControl',
        file: require('../../../assets/sounds/control.mp3')
    }
];

const audioSurveyMonaural: SurveyComponent[] = [
    audioSurveyInstructions,
    {
        ...audioSurveyBase,
        key: 'audioMonaural',
        file: require('../../../assets/sounds/monaural.mp3')
    }
];

const audioSurveyBinaural: SurveyComponent[] = [
    audioSurveyInstructions,
    {
        ...audioSurveyBase,
        key: 'audioBinaural',
        file: require('../../../assets/sounds/binaural.mp3')
    }
];


// -=*#*=- CONFIG -=*#*=-

const phaseMap: Record<string, number[]> = {
    'baseline': [0, 1],
    'block_1': [2, 3, 4, 5],
    'block_2': [6, 7, 8, 9],
    'block_3': [10, 11, 12, 13],
    'post-test': [14]
};

// TODO: task templates are a good idea... maybe it's own interface? would work well in a UI
const audioTaskTemplate: TaskDefinition = { // must be defined below phase2Days
    id: '',
    type: 'survey',
    name: 'Sleep Audio',
    prompt: 'Listen to daily audio:',
    questions: [],
    show_on_days: phase2Days(['block_1','block_2','block_3'],phaseMap),
    datapipe_id: 'Qhvh0bwJZ83v',
    show_for_conditions: [],
    allow_edit: false,
    autosumbit_on_complete: true
}

const audioTest: TaskDefinition = {
        id: 'testAudio',
        type: 'survey',
        name: 'Test Audio',
        prompt: 'Test Audio',
        questions: [
            {
                key: 'audioTest',
                type: 'audio',
                file: require('../../../assets/sounds/test_sound.mp3'),
                question: '',
                default: false, // autoplay
                overwrite_parameter_from_storage: [{
                    parameter: 'volume',
                    task_id: 'setVolume',
                    response_key: 'setVolumeQuestion.volume'
                }],
                required: true
            }
        ],
        autosumbit_on_complete: true
    }

export const soundSleepDefinition: ExperimentDefinition = {
    name: 'Sound Sleep',
    debug: true,
    passphrase: 'suss3x',
    total_days: 14,
    cutoff_hour: 4, // TODO: maybe use hours and mins, day_cutoff_time: '04:32'
    participant_info_datapipe_id: 'Qhvh0bwJZ83v',
    conditions: {
        conditions: ['control', 'monaural', 'binaural'],
        repeatedMeasures: true,
        datapipe_id: 'Qhvh0bwJZ83v',
        increase_on_days: phase2Days(['block_2','block_3'],phaseMap,0) //Increase on first day of block 2 and 3
    },
    tasks: [
        {
            id: 'demographics',
            type: 'survey',
            name: 'Demographics',
            prompt: 'Please provide us with your demographic information:',
            questions: demographics,
            show_on_days: [0],
            datapipe_id: 'Qhvh0bwJZ83v',
            show_for_conditions: [], // all
            allow_edit: true,
        },
        {
            id: 'setVolume',
            type: 'survey',
            name: 'Set Volume',
            prompt: 'Set Audio Volume',
            questions: setVolumeTask,
            show_on_days: [0],
            datapipe_id: 'Qhvh0bwJZ83v',
            show_for_conditions: [],
            allow_edit: true,
        },
        {
            id: 'notifications',
            type: 'screen',
            path_to_screen: '/settings',
            name: 'Set notification times',
            prompt: 'Setup reminders:',
            show_on_days: [0],
            datapipe_id: 'Qhvh0bwJZ83v',
            show_for_conditions: [],
            allow_edit: false,
        },
        {
            id: 'morningSleepDiary',
            type: 'survey',
            name: 'Morning Sleep Diary',
            prompt: 'Just woke up?',
            questions: morningSleepDiary,
            show_on_days: daysBetween(1,14),
            datapipe_id: 'Qhvh0bwJZ83v',
            show_for_conditions: [], // all
            allow_edit: true,
            notification: {
                prompt: 'Morning sleep diary reminder:',
                default_time: '09:00'
            }
        },
        {
            id: 'blockQuestionnaire',
            type: 'survey',
            name: 'Questionnaire',
            prompt: 'Complete this survey:',
            questions: blockQuestionnaire,
            show_on_days: phase2Days(['baseline','block_1','block_2','block_3','post-test'],phaseMap,0),
            datapipe_id: 'Qhvh0bwJZ83v',
            show_for_conditions: [], //all
            allow_edit: true,
        },
        {
            id: 'expectancies',
            type: 'survey',
            name: 'Expectancies',
            prompt: 'Complete this survey regarding your last session:',
            questions: expectanciesQuestionnaire,
            show_on_days: phase2Days(['block_1','block_2','block_3'],phaseMap,1),
            datapipe_id: 'Qhvh0bwJZ83v',
            show_for_conditions: [], //all
            allow_edit: true,
        },
        {
            id: 'eveningSleepDiary',
            type: 'survey',
            name: 'Evening Sleep Diary',
            prompt: 'Going to bed?',
            questions: eveningSleepDiary,
            show_on_days: daysBetween(0,13),
            datapipe_id: 'Qhvh0bwJZ83v',
            show_for_conditions: [], //all
            allow_edit: true,
            notification: {
                prompt: 'Evening sleep diary reminder:',
                default_time: '22:00'
            },
        },
        {
            ...audioTaskTemplate,
            id: 'audioTaskControl',
            questions: audioSurveyControl,
            show_for_conditions: ['control'],
        },
        {
            ...audioTaskTemplate,
            id: 'audioSurveyMonaural',
            questions: audioSurveyMonaural,
            show_for_conditions: ['monaural'],
        },
        {
            ...audioTaskTemplate,
            id: 'audioTaskBinaural',
            questions: audioSurveyBinaural,
            show_for_conditions: ['binaural'],
        },
    ]
}
