import {View, StyleSheet, Pressable} from "react-native";
import {useCallback, useEffect, useMemo, useState} from "react";
import AdjustColourButton from '@/components/DSA/AdjustColourButton'
import { ColourConverter } from '@/utils/colourConversion';
import { LAB, RGB, LCH } from "@/types/colours";
import SubmitButton from "@/components/inputs/SubmitButton";
import MunsellChip from "@/components/DSA/MunsellChip";
import {ChipDimensions} from "@/app/(app)/DSA/chipScale";

// Return selected colour,
export default function ChangeBackground({ startColour, onSubmit, submitting, chipDimensions }: {startColour: LCH, onSubmit: (colour: LAB, renderedRGB: RGB)=>void, submitting: boolean, chipDimensions: ChipDimensions }) {
    const [responseColour, setResponseColour] = useState<LAB>(()=> ColourConverter.lch2lab(startColour));
    const [aUpperBoundReached, setAUpperBoundReached] = useState(false);
    const [aLowerBoundReached, setALowerBoundReached] = useState(false);
    const [bUpperBoundReached, setBUpperBoundReached] = useState(false);
    const [bLowerBoundReached, setBLowerBoundReached] = useState(false);
    const [hasClickedButton, setHasClickedButton] = useState(true);

    // Derive RGB when needed for display
    const backgroundColour = useMemo(() =>
            ColourConverter.lab2rgb(responseColour),
        [responseColour]
    );

    function increaseLAB(axisKey: 'a'|'b', change: 1|-1, currentResponse: LAB){
        const newLab = { ...currentResponse }; // Copy
        newLab[axisKey] += change; // Mutate
        return newLab; // Return
    }

    function testABChange(lab: LAB, axisKey: 'a'|'b', change: 1|-1){
        const predictedLAB = {...lab} // TODO: these shouldn't be changing in place really?
        // Get predicted value after change in LAB and LCH
        predictedLAB[axisKey] += change // Change relevant value
        const predictedLCH = ColourConverter.lab2lch(predictedLAB) // Convert to lch //TODO: consider rerenders this might cause?
        // Check chroma is within bounds
        // to check abBounds = predictedLAB[axisKey] < -128 || predictedLAB[axisKey] > 127
        return predictedLCH.c < 0 || predictedLCH.c > 20 //c max is 20
    }

    const checkToggleButtons = useCallback((lab: LAB) => {
        setAUpperBoundReached(testABChange(lab,'a',1))
        setALowerBoundReached(testABChange(lab,'a',-1))
        setBLowerBoundReached(testABChange(lab,'b',-1))
        setBUpperBoundReached(testABChange(lab,'b',1))
    }, []);

    useEffect(() => {
        const lab = ColourConverter.lch2lab(startColour);
        setResponseColour(lab);
        // Now, check the bounds for the new colour
        checkToggleButtons(lab);
        setHasClickedButton(false)
    }, [startColour, checkToggleButtons]);

    const handlePress = (axisKey:'a'|'b', change:1|-1) => {
        setHasClickedButton(true)
        setResponseColour(prev => {
            const lab: LAB = increaseLAB(axisKey, change, prev)
            checkToggleButtons(lab)
            return {...lab}
        })
    }

    const handleSubmit = () => {
        // Save data, reset buttons and colour and restart
        if(submitting) return
        try{
            onSubmit(responseColour, backgroundColour)
        } catch (e) {
            console.log(e)
        } finally {
        }
    }

    const selectedRGB = `rgb(${backgroundColour.r}, ${backgroundColour.g}, ${backgroundColour.b})`

    return (
        <View
            style={[
                styles.container,
                // {backgroundColor:  }
            ]}
        >
            <AdjustColourButton
                disabled={aUpperBoundReached}
                onPress={()=>handlePress('a',1)}
                style={styles.top}
                colour={selectedRGB}
                text='R'
            />
            <View
                style={styles.middle}
            >
                <AdjustColourButton
                    disabled={bLowerBoundReached}
                    onPress={()=>handlePress('b',-1)}
                    style={styles.left}
                    text='B'
                    colour={selectedRGB}
                />

                <Pressable
                    onPress={handleSubmit}
                >
                    <MunsellChip
                        color={selectedRGB}
                        height={chipDimensions.height}
                        width={chipDimensions.width}
                    />
                </Pressable>

                <AdjustColourButton
                    disabled={bUpperBoundReached}
                    onPress={()=>handlePress('b',1)}
                    style={styles.right}
                    text='Y'
                    colour={selectedRGB}
                />
            </View>
            <AdjustColourButton
                disabled={aLowerBoundReached}
                onPress={()=>handlePress('a',-1)}
                style={styles.bottom}
                text='G'
                colour={selectedRGB}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
        // maxHeight: "100%",
        // maxWidth: "100%",
        backgroundColor: "black",
        justifyContent: "space-between",
        alignItems: "stretch",
        padding: 10
    },
    top: {
        alignSelf: "center",
    },
    bottom: {
        alignSelf: "center",
    },
    middle: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    left: {
    },
    right: {
    },

    infoAndSubmit: {
        alignItems: "center"
    },
    submitButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        margin: 10,
        borderWidth: 1,
        borderRadius: 10,
    },
    text: {
        fontWeight: "bold",
        color: "black",
    },
    targetColour: {
        fontWeight: "bold",
        fontSize: 30,
        textTransform: 'capitalize'
    },
    submitText: {
        fontSize: 15,
    }
});

