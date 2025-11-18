import {StyleSheet, Text, View} from "react-native";
import {colours, globalStyles} from "@/styles/appStyles";


function ParagraphText({text, textStyle}: {text: string, textStyle?: object}) {
    return (
        <Text
            style={[
                globalStyles.standardText,
                styles.text,
                textStyle
            ]}
            selectable={true}
        >
            {text}
        </Text>
    )
}

export default function Paragraph({ text, title, containerStyle, textStyle, titleStyle }: { text?: string|string[], title?: string, containerStyle?: object, textStyle?: object, titleStyle?: object}) {
    return (
        <View style={[
            styles.container,
            containerStyle
        ]}>
            {title &&
                <Text
                    style={[
                        globalStyles.sectionTitle,
                        styles.title,
                        titleStyle
                    ]}
                >
                    {title}
                </Text>
            }

            {
                text && (
                    Array.isArray(text) ?
                        text.map((p, index) => (
                            <ParagraphText
                                key={`paragraph-${index}`}
                                text={p}
                                textStyle={[
                                    styles.paragraph,
                                    index === text.length-1 && styles.lastParagraph,
                                    textStyle
                                ]}
                            />
                        )) :
                        <ParagraphText
                            text={text}
                            textStyle={textStyle}
                        />
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // borderColor: 'rgba(0,122,255,.4)',
        borderColor: colours.primary,//
        // borderColor: 'rgba(255, 255, 255, .5)',

        // SOME GOOD STYLING TO CONSIDER:
        // borderTopWidth: 3,
        // marginTop: 10,
        // paddingTop: 10,
        //
        // borderBottomWidth: 3,
        // paddingBottom: 15
    },
    title: {
        paddingTop: 0,
        // backgroundColor: colours.primary,
        color: colours.primary,
        // textDecorationLine: 'underline'
    },
    text: {
        // fontStyle: "italic",
        // borderWidth: 1,
    },
    paragraph: {
        marginBottom: 11
    },
    lastParagraph: {
        marginBottom: 0
    }
});
