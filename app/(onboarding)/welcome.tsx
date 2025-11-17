import React, {useState} from 'react';
import {Text, StyleSheet, TextInput, View} from 'react-native';
import { StandardView } from '@/components/layout/StandardView';
import { useExperiment } from '@/context/ExperimentContext';
import { router } from 'expo-router';
import SubmitButton from "@/components/inputs/SubmitButton";
import {experimentDefinition} from "@/config/experimentDefinition";
import {globalStyles} from "@/styles/appStyles";

export default function WelcomeScreen() {
    const { startExperiment, isActionLoading, actionError } = useExperiment();
    const [passphrase, setPassphrase] = useState<string>('');

    const handleStart = async () => {
        try {
            await startExperiment(); // Optionally pass in participant id and condition here if you want to set them yourself.
            // Navigate to the main app home screen
            router.replace('/');
        } catch (error) {
            // Note: error is now handled and set in the context
            console.error("Failed to start experiment:", error);
        }
    };

    return (
        <StandardView
            innerContainer={styles.container}
            headerShown={false}
            statusBarStyle={'light'}
            debug={false}
        >
                <Text style={[globalStyles.pageTitle]}>
                    Welcome
                </Text>
                {experimentDefinition.passphrase &&
                    <TextInput
                        autoFocus={true}
                        autoCapitalize='none'
                        autoCorrect={false}
                        autoComplete='off'
                        spellCheck={false}
                        value={passphrase}
                        placeholder={'Enter passphrase'}
                        placeholderTextColor='grey'
                        style={globalStyles.input}
                        onChangeText={setPassphrase}
                        returnKeyType='done'
                    />
                }
                <SubmitButton
                    text={isActionLoading ? "Starting..." : "Start Experiment"}
                    onPress={handleStart}
                    disabled={isActionLoading || (!!experimentDefinition.passphrase && passphrase !== experimentDefinition.passphrase)}
                />
                {actionError && (
                    <Text style={{ color: 'red', textAlign: 'center' }}>
                        {actionError}
                    </Text>
                )}
        </StandardView>
    );
}

const styles = StyleSheet.create({
    container: {
        // minHeight: '100%',
        gap: 30,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,

        // borderWidth: 1,
        borderColor: 'blue',
    },
});
