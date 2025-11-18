import {
    InputAccessoryView,
    Keyboard,
    Platform,
    Pressable,
    TextInput,
    View,
    Text,
    KeyboardTypeOptions, StyleSheet
} from "react-native";
import {globalStyles} from "@/styles/appStyles";
import {useState} from "react";

export default function Textbox({ value, placeholder, onChange, maxLength, multiline, type, style }: {
    value: string,
    placeholder?: string,
    onChange: (text: string) => void,
    maxLength?: number
    multiline?: boolean
    type?: KeyboardTypeOptions;
    style?: object;
}){
    // controlled component, no internal state
    const [inputAccessoryViewID] = useState(() => `input-accessory-${Math.random()}`);

    function extractNumbers(response: string){
        // Remove non-numeric characters
        const onlyNumbers = response.replace(/[^0-9]/g, '');
        // Allow empty string for clearing the input
        if (!onlyNumbers) {
            return ''
        }
        // Convert to number and back to remove leading zeros - prevents "00" but allows "0"
        return String(parseInt(onlyNumbers, 10) || 0);
    }

    function handleInput(response: string) {
        if(type === 'numeric') {
            response = extractNumbers(response);
        }
        onChange(response);
    }

    const showAccessory = Platform.OS === 'ios' && !multiline; // Logic here to keep JSX clean

    return (
        <>
            <TextInput
                multiline={multiline}
                keyboardType={type} // Could just restrict to numeric?
                value={value}
                placeholder={placeholder}
                placeholderTextColor={'grey'}
                style={[globalStyles.input, style]}
                onChangeText={text => handleInput(text)}
                inputAccessoryViewID={showAccessory ? inputAccessoryViewID : undefined}
                maxLength={maxLength}
                disableFullscreenUI={true}
                keyboardAppearance="dark"
                returnKeyType={multiline ? undefined : 'done'} // Note: a little broken on ios so handle manually for now
            />
            { showAccessory &&
                <InputAccessoryView nativeID={inputAccessoryViewID}
                                    style={styles.inputAccessory}
                                    backgroundColor='#c8cbcd'

                >
                    <Pressable
                        onPress={Keyboard.dismiss}
                        style={styles.pressable}
                    >
                        <Text style={styles.text}
                        >
                            Done
                        </Text>
                    </Pressable>
                </InputAccessoryView>
            }
        </>
    )
}

const styles = StyleSheet.create({
    inputAccessory: {
    },
    pressable: {
        alignSelf: 'flex-end',
        // borderWidth: 1,
        // borderColor: 'red',
    },
    text: {
        color: '#007AFF',
        fontSize: 17,
        fontWeight: '500',
        // textAlign: 'right',
        padding: 12
    }

})
