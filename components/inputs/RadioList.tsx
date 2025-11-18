import {StyleSheet, View, Text, TouchableOpacity} from 'react-native'
import Radio from "@/components/display/Radio";
import {globalStyles} from "@/styles/appStyles";

export default function RadioList({options, value, onSelect, containerStyle} : { options: string[], value: string, onSelect: (option: string)=>void, containerStyle?: object }) {
    const onOptionPress = (option: string) => {
        onSelect(option);
    }

    return(
        <View style={[containerStyle, styles.container]}>
            {options.map((option, index) => (
                <TouchableOpacity
                    key={option}
                    style={styles.optionContainer}
                    onPress={()=>onOptionPress(option)}
                >
                    <Radio
                        selected={value===option}
                    />
                    <Text
                        style={[
                            globalStyles.standardText,
                            styles.textStyle
                        ]}
                    >
                        {option}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 5,
    },
    optionContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 5,
        // borderWidth: 1,
        // borderColor: 'lightgray',
    },
    textStyle: {
        flex: 1,
    }
})



