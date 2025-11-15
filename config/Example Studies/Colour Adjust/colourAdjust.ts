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
        key: 'onPhone',
        type: 'radio',
        question: 'Are you completing this study on your phone?',
        options: ['Yes', 'No'],
        required: true,
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

export const debriefSurvey: SurveyComponent[] = [
    {
        key: 'debriefTitle',
        type: 'paragraph',
        text: [
            'Yesesvi Konakanchi & Dr. John Maule',
            'Statistical Perception Lab, University of Sussex'
        ],
        textStyle: { fontStyle: 'italic', textAlign: 'center' }
    },
    {
        key: 'debriefBody',
        type: 'paragraph',
        text: [
            'It has been shown that we build up specific memory for the colours of familiar objects. Hansen et al. (2006) showed that people perceive a grey banana as slightly yellow, illustrating that perceptual experience (e.g. seeing many bananas over your lifetime) influences our expectations about the world.',
            'Adults spend on average over 6 hours every day using screens (Kemp, 2023). This means that for over 1/3rd of our waking hours we are seeing an interacting with a virtual world - one in which the visual properties are quite different from those of the real world. Screens constrain the range of colours which we see, and different screens will do this slightly differently. Past research has shown that the perception of white is affected by whether the incoming stimulus is perceived to be a screen or a real material surface (Wei, Chen, & Luo, 2018). However, it is an open and unexplored question if people can form priors to the colours rendered on familiar displays. This project is investigating how familiar people become with a screen that they use frequently, and ultimately whether this affects their perception of colour on that screen.',
            'Digital screens are rows of pixels, each containing subpixels with red, green and blue, primaries (figure 1). Different combinations of these primaries means your screen can display a continuous range of colours. This is called the gamut. The range of colours which your screen can display is smaller than the range of colours in the real-world, and yet we generally do not notice this reduction in colour for images representing the real world. Due to technology differences, different displays have different gamuts. This means that the representation of colour on one screen does not necessarily match that on another (see figure 2). Red for one screen can be very different from the red of another.',
            "The experiment you have just taken part in uses a psychophysical paradigm called the method of adjustment. Observers complete trials where they can adjust a stimulus to meet a certain criterion according to their own perception. We are gathering settings of unique hues (red, green, yellow and blue) (Hurvich & Jameson, 1957) and of unique white (Bosten et al., 2015). These are measures of subjective colour appearance. At the same time we are gathering measurements of a sub-sample of participants' phones to help us better characterise the variation across devices. We are also measuring the ambient lighting at your desks. From the data we will analyse whether colour settings are determined more strongly by the immediate environment or by your prior knowledge of your device display.",
            "If participants have priors for their own devices, their colour adjustments would be closer to their device's RGB colours than to each other's settings (which come from shared environments and culture).",
            'Since we expect to obtain a large sample of data (approx. N=300-400) we will have high statistical power to detect effects. The size of the sample also means we will be able to explore further the individual differences. We will use clustering techniques such as k-means clustering to identify groups of participants with similar colour settings, and see whether they have things in common like phone manufacturer or operating system.',
            'The results may illustrate the power of implicit learning and suggest that we understand virtual worlds via our experiences of the real world. It would suggest implicit understanding of how screens work, even in the absence of explicit knowledge or training.',
            'Colour and vision scientists would need to think hard about what it means to present stimuli on a screen – are participants making judgements of the colour/stimulus alone, or through a lens of expectation about how displays warp the visual experience? It would emphasise the importance of not doing colour-critical work "by eye" and the need for robust calibration in the design industry, and display manufacturers will be interested in the time-scale over which people adapt to a new display technology.',
            'In line with open science practices, we have pre-registered the design and analyses for this study, prior to gathering the data.'
        ],
    },
    {
        key: 'colourSpaceImage',
        type: 'picture',
        file: require('../../../assets/images/colour_space.png'),
        caption: 'Figure 1 - Depicts the pixel and sub-pixel distribution from a screen. The combinations of the light produced by the sub pixels are responsible for image formation on screens.',
    },
    {
        key: 'screensImage',
        type: 'picture',
        file: require('../../../assets/images/screens.jpg'),
        caption: 'Figure 2 - This diagram shows the rendering capabilities of different screens each represented by a different triangle. The colours inside the triangle can be produced by the screen – the colours outside are physically possible but cannot be produced by the screen.',
    },
    {
        key: 'debriefReferences',
        type: 'paragraph',
        title: 'References',
        text: [
            'Hansen, T., Olkkonen, M., Walter, S., & Gegenfurtner, K. R. (2006). Memory modulates color appearance. Nature Neuroscience, 9(11), 1367-1368. https://doi.org/10.1038/nn1794',
            'Wei, M., Chen, S., & Luo, M. R. (2018, November). Effect of stimulus luminance and adapting luminance on viewing mode and display white appearance. In Color and Imaging Conference (Vol. 26, pp. 308-312). Society for Imaging Science and Technology.',
            'Hurvich, L. M., & Jameson, D. (1957). An opponent-process theory of color vision. Psychological review, 64(6p1), 384.',
            'Bosten, J. M., Beer, R. D., & MacLeod, D. I. A. (2015). What is white?. Journal of vision, 15(16), 5-5.',
            'Kemp, S. (2023, January 26). Digital 2023: Global Overview Report. DataReportal. https://datareportal.com/reports/digital-2023-global-overview-report'
        ],
        textStyle: { fontSize: 14, lineHeight: 20 } // Approximating reference style
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
