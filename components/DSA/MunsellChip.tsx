import React from 'react';
import {View, StyleSheet, ColorValue} from 'react-native';

export default function MunsellChip({ color, height, width }: { color: ColorValue, height?: number, width?: number }) {
    return (
        <View style={styles.chipContainer}>
            <View style={
                    [
                        styles.mainRect,
                        {
                            backgroundColor: color,
                            height: height ?? 120,
                            width: width ?? 100,
                        }
                    ]
                }
            />
            <View style={
                    [
                        styles.tab,
                        {
                            backgroundColor: color,
                            // Allow tab size control too?
                        }
                    ]
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    chipContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        // borderWidth: 1,
        // borderColor: 'white'
    },
    mainRect: {
        width: 100,
        height: 120,
        borderRadius: 10,
    },
    tab: {
        // Position this -20px *above* the main rectangle's top edge
        top: -10,
        width: 45,
        height: 50,
        // Use border radius to shape the tab
        borderRadius: 10,
    }
});
