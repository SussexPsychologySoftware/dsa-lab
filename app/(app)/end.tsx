import {Text, View, StyleSheet} from 'react-native';
import {useExperiment} from "@/context/ExperimentContext";
import {globalStyles} from "@/styles/appStyles";
import {StandardView} from "@/components/layout/StandardView";
import {dataQueue} from "@/services/data/dataQueue";
import {useEffect, useState} from "react";
import SubmitButton from "@/components/inputs/SubmitButton";

export default function EndScreen() {
    const { state } = useExperiment();
    const [hasQueue, setHasQueue] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const checkQueue = async () => {
            const queueExists = await dataQueue.hasQueue();
            setHasQueue(queueExists);
        };
        void checkQueue();
    }, []);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await dataQueue.processQueue();
            const queueExists = await dataQueue.hasQueue();
            setHasQueue(queueExists);
            if (!queueExists) {
                // Optional: Give success feedback
                alert("Sync successful! All data has been sent.");
            } else {
                alert("Sync failed. Please check your internet connection and try again.");
            }
        } catch (error) {
            console.error("Error during manual sync:", error);
            alert("An error occurred during sync. Please try again.");
        } finally {
            setIsSyncing(false);
        }
    };

    // TODO: add experimenter contact to config?
    // TODO: Also add button to send all data from clipboard etc whatsapp, email... by some other means

    return (
        <StandardView
            contentContainerStyle={{
                marginVertical: 40,
                gap: 30
            }}
            headerShown={false}
            statusBarStyle={'light'}
        >
            <Text style={globalStyles.standardText}>The experiment is now over - you may contact the experimenter with any further queries.</Text>
            {hasQueue && (
                <View style={styles.syncCard}>
                    <Text style={[globalStyles.standardText, styles.syncWarningText]}>
                        Warning: Some data is waiting to be sent.
                    </Text>
                    <Text style={[globalStyles.standardText, styles.syncInfoText]}>
                        Please connect to the internet and press the button below to submit your final data.
                    </Text>
                    <SubmitButton
                        text={"Sync Final Data"}
                        disabledText={'Syncing...'}
                        onPress={handleSync}
                        disabled={isSyncing}
                        style={styles.syncButton}
                        textStyle={styles.syncButtonText}
                    />
                </View>
            )}
            {!hasQueue && (
                <Text style={[globalStyles.standardText, styles.allSentText]}>
                    ✓ All your data has been successfully submitted.
                </Text>
            )}
            <Text selectable={true} style={globalStyles.standardText}>Your Participant ID is: {state?.participantId}</Text>
        </StandardView>
    );
}

const styles = StyleSheet.create({
    syncCard: {
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: 'orange',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 10,
        gap: 15,
        maxWidth: 400,
        backgroundColor: 'rgba(255, 165, 0, 0.05)',
    },
    syncWarningText: {
        textAlign: 'center',
        color: 'orange',
        fontWeight: 'bold',
        fontSize: 18,
    },
    syncInfoText: {
        textAlign: 'center',
        color: 'white',
    },
    syncButton: {
        backgroundColor: 'orange',
    },
    syncButtonText: {
        color: 'black',
        textAlign: 'center',
    },
    allSentText: {
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: 'green',
        borderRadius: 5,
        padding: 10,
        color: 'green',
        backgroundColor: 'rgba(0, 255, 0, 0.05)',
    }
});
