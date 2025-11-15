import {Text, View, StyleSheet, Pressable, ScrollView, ColorValue, Dimensions} from "react-native";
import React, {useEffect, useState} from "react";
import {LAB, LCH, RGB} from "@/types/colours";
import {useExperiment} from "@/context/ExperimentContext";
import {DataService} from "@/services/data/DataService";
import MunsellChip from "@/components/DSA/MunsellChip";
import {SafeAreaView} from "react-native-safe-area-context";
import {StatusBar} from "expo-status-bar";
import Debug from "@/components/debug/Debug";
import DebugButtons from "@/components/debug/DebugButtons";
// Return selected colour,
// overthinking, maybe just pass in the update and toggle functions? horizontal?

interface TestColour {
    RGB: RGB,
    description: string
}


interface Trial {
    response: {
        RGB: RGB;
        LAB: LAB;
    }
    startingColour: LCH;
    rt: number;
}


export default function ShowTrialDataScreen() {
    const { displayState, getTaskFilename } = useExperiment();
    const [trialData, setTrialData] = useState<Trial[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const testData: RGB[] = [
        {r:255, g:255, b:255},
        {r:255, g:0, b:0},
        {r:50, g:0, b:0},
        {r:100, g:0, b:0},
        {r:150, g:0, b:0},
        {r:200, g:0, b:0},
        {r:0, g:255, b:0},
        {r:0, g:50, b:0},
        {r:0, g:100, b:0},
        {r:0, g:150, b:0},
        {r:0, g:200, b:0},
        {r:0, g:0, b:255},
        {r:0, g:0, b:50},
        {r:0, g:0, b:100},
        {r:0, g:0, b:150},
        {r:0, g:0, b:200},
        {r:255, g:255, b:0},
    ];

    const RGB2rgb = (rgb: RGB) => {
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }
    const [backgroundColour, setBackgroundColour] = useState<ColorValue>(RGB2rgb(testData[0]));
    const [infoData, setInfoData] = useState<Record<string, any>>({});

    useEffect(() => {
        const loadPreviousData = async () => {
            try {
                // Consent
                const infoFilename = getTaskFilename('setup')
                if(!infoFilename) return null;
                const participantInfo = await DataService.getData(infoFilename)
                if (participantInfo === null) return null;
                // const consentDataFiltered = Object.fromEntries(
                //     Object.entries(infoData).filter(([_, v]) => v)
                // )
                setInfoData(participantInfo);
                // Trials
                const trialsFilename = getTaskFilename('adjust')
                if(!trialsFilename) return null;
                const data = await DataService.getData(trialsFilename)
                if (data === null) return null;
                setTrialData(data.responses);

            } catch (error) {
                console.error('Error loading trial data:', error);
            }
        };

        void loadPreviousData();
    }, [getTaskFilename]); // Empty dependency array means this runs once on mount


    const handlePress = (responseColour: RGB, selectedIndex: number) => {
        setBackgroundColour(RGB2rgb(responseColour));
        setSelectedIndex(selectedIndex);
    }

    function DisplayColourButton({index, RGB, targetColour, displayIndex}: {index: number, RGB: RGB, targetColour?: string, displayIndex?: number }) {
        return (
            <Pressable
                style={[
                    styles.trialSelector,
                    selectedIndex===index && {backgroundColor: backgroundColour},
                    {borderColor: backgroundColour}
                ]}
                onPress={()=>handlePress(RGB, index)}>
                <Text
                    style={[
                        styles.text,
                        {color: backgroundColour},
                        selectedIndex===index && {color: 'black'},
                    ]}
                >
                    {displayIndex??index}) {RGB.r}, {RGB.g}, {RGB.b} {targetColour && `| ${targetColour}`}
                </Text>
            </Pressable>
        )
    }

    return (
        <SafeAreaView
            style={styles.container}
        >
            <StatusBar style={'dark'}/>
            <View style={styles.munsellChip}>
                <MunsellChip
                    color={backgroundColour}
                />
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={[styles.trialList, {borderColor: backgroundColour}]}
                contentContainerStyle={[styles.trialListContent, {borderColor: backgroundColour}]}
            >
                    <Text
                        selectable={true}
                        style={[styles.text, {color: backgroundColour}, styles.participantInfo]}>
                        Info: {JSON.stringify(infoData,null,1)}
                    </Text>
                    <Text style={[styles.text, {color: backgroundColour}]}>TEST COLOURS</Text>
                    {
                        testData.map((item, index) =>{
                            return(
                                <DisplayColourButton
                                    key={`test-${index}`}
                                    index={index}
                                    RGB={item}
                                    displayIndex={index+1}
                                />)
                        })
                    }
                    <Text style={[styles.text,{color: backgroundColour}]}>TRIAL DATA</Text>
                    { trialData &&
                        trialData.map((item, index) => {
                            // console.log(item);
                            return(
                                <DisplayColourButton
                                    key={`trial-${index}`}
                                    index={index+testData.length}
                                    RGB={item.response.RGB} //item.RGB
                                    displayIndex={index+1}
                                />
                            )

                        })
                    }
                <DebugButtons buttonRowStyle={{flexDirection: 'column'}}/>
                </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'black',
        flexDirection: 'row',
    },
    participantInfo: {
        marginVertical: 10
    },
    trialList: {
        flex: 1,
    },
    trialListContent: {
        maxWidth: 120,// 255.length()*3
        //(Dimensions.get('window').width/2)-(100/2), //(screenWidth/2) - (munsell_chip_width/2) -(padding+margin)
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 10,
        borderWidth: 1,
        padding: 5,
    },
    trialSelector: {
        borderRadius: 10,
        borderWidth: 1,
        // borderColor: "lightgrey",
        padding: 5,
        paddingVertical: 15,
        width: '100%'
    },
    selectedTrial: {
        // backgroundColor: "darkgrey",
    },
    text: {
        fontFamily: 'ui-monospace',
        // fontVariant: ['tabular-nums'],
        fontSize: 9,
        fontWeight: "bold",
        color: "lightgrey",
    },
    munsellChip: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // width: "100%",
        // height: "100%",
        // flex: 1,
        alignItems: "center",
        justifyContent: "center",
        // borderWidth: 1,
        // borderColor: "blue",
    }

});

