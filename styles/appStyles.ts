import { StyleSheet } from 'react-native';

// Simple color and size constants
export const colours = {
    primary: '#007AFF',
    secondary: '#FF6B00', //consider: #FF9500, #FF7F50, #FFA500
    background: '#25292e',
    text: 'lightgrey',
    textLight: '#666666',
    border: 'lightgrey',
    warning: 'red'
};

export const sizes = {
    small: 14,
    medium: 17,
    large: 20,
    title: 26,
    padding: 16,
};

// Global styles
export const globalStyles = StyleSheet.create({
    // CONTAINERS -------
    scrollViewContainer:{
        paddingHorizontal: 15,
        paddingVertical: 20,
        backgroundColor: colours.background,
        minHeight: '100%', //or flexGrow: 1?
        maxWidth: '100%',
    },
    container: {
        backgroundColor: colours.background,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
    },


    // TEXT STYLES ---------------
    pageTitle: {
        fontSize: sizes.title,
        fontWeight: '600',
        color: colours.text,
        textAlign: 'center',
        // paddingVertical: 30,
    },
    sectionTitle: {
        color: colours.text,
        fontSize: sizes.large,
        fontWeight: '500',
        paddingTop: 20,
        paddingBottom: 10,
    },
    whiteText: {
        color: colours.text,
    },
    standardText: {
        color: colours.text,
        fontSize: sizes.medium,
    },
    completeSurveyPrompt: {
        color: colours.text,
        fontSize: sizes.small,
        fontWeight: '300',
        // fontStyle: 'italic',
    },
    question: {
        color: colours.text,
        fontSize: sizes.medium,
        // fontStyle: 'italic',
        fontWeight: '400',
    },
    surveyPrompt: {
        color: colours.text,
        fontSize: sizes.medium,
        fontWeight: 'bold',
        marginTop: 30,
        marginBottom: 15,
        // textAlign: 'center',
    },
    warning: {
        color: colours.warning,
        fontSize: sizes.medium,
        paddingVertical: 10,
    },

    // LAYOUT -----
    center: {
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // INPUTS ----
    input: {
        color: colours.text,
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: 8,
        padding: 10,
        fontSize: sizes.medium,
    },
    inputNoFont: {
        color: colours.text,
        borderWidth: 1,
        borderColor: colours.border,
        borderRadius: 8,
        padding: 10,
    },
    invalidInput: {
        borderColor: '#ff0000',
        borderWidth: 2,
        // backgroundColor: '#ffeeee',
    },

    // DEBUG -------
    debugContainer: {
        gap: 5,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: 'grey',
    },
    debugTitle: {
        marginBottom: 8,
    },
    debugText: {
        color: 'grey',
        fontSize: 14,
    },
});
