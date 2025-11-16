import {StyleSheet, View, Text} from 'react-native';
import {globalStyles, colours} from "@/styles/appStyles";
import React from "react";
import {displayOnlyTypes, SurveyComponent, SurveyQuestion} from '@/types/surveyQuestions';
import RadioList from "@/components/inputs/RadioList";
import TimePicker from "@/components/inputs/TimePicker";
import LikertGrid from "@/components/survey/LikertGrid";
import SubmitButton from "@/components/inputs/SubmitButton";
import Tickbox from "@/components/inputs/Tickbox";
import Range from "@/components/inputs/Range";
import Select from "@/components/inputs/Select";
import LikertSingle from "@/components/inputs/LikertSingle";
import TimeInput from "@/components/inputs/TimeInput";
import Paragraph from "@/components/display/Paragraph";
import AudioPlayer from "@/components/media/AudioPlayer";
import Picture from "@/components/media/Picture";
import Textbox from "@/components/inputs/Textbox";

interface SurveyProps {
    questions: SurveyComponent[];
    responses: Record<string, any>;
    updateResponses: (key: string, answer: any, nestedKey?: string) => void;
    handleSurveySubmit?: () => Promise<boolean>;
    warning?: string;
    isSubmitting?: boolean;
    progress?: number;
    invalidQuestions?: Set<string>;
}

export default function Survey({
                                   questions,
                                   responses,
                                   updateResponses,
                                   handleSurveySubmit,
                                   warning,
                                   isSubmitting,
                                   progress,
                                   invalidQuestions,
                               }: SurveyProps) {
    return (
        <View style={styles.container}>
            {questions.map((question, index) => {
                // Note key is responses object and react component key - index is unreliable due to conditional questions
                const key = question.key || String(index);
                const isInvalid = invalidQuestions?.has(key) ?? false;
                let component;

                // Check for conditional question
                if(question.conditions && question.conditions.length > 0) {
                    let conditionMatched = false
                    for(let i=0; i<question.conditions.length; i++) {
                        const condition = question.conditions[i]
                        if(responses[condition.key] !== undefined && responses[condition.key] === condition.value){
                            conditionMatched = true
                        }
                    }
                    if(!conditionMatched) return null
                }

                // Get input type
                switch (question.type) {
                    case "text":
                        component = <Textbox
                            value={responses[key]}
                            placeholder={question.placeholder}
                            onChange={newValue => updateResponses(key, newValue)}
                            maxLength={question.maxLength}
                            type={question.inputType}
                            multiline={question.multiline}
                        />
                        break;
                    case 'radio':
                        component = <RadioList
                            options={question.options || []}
                            value={responses[key]}
                            onSelect={(newValue: string) => updateResponses(key, newValue)}
                        />;
                        break;
                    case 'time':
                        component = <TimePicker
                            value={responses[key]}
                            onChange={(newValue: string|null) => updateResponses(key, newValue)}
                        />;
                        break;
                    case 'lengthOfTime':
                        component = <TimeInput
                            clock={false}
                            value={responses[key]}
                            onChange={(newValue: string|null) => updateResponses(key, newValue)}
                        />;
                        break;
                    case 'checkbox':
                        // TODO: question should maybe be in the text section?
                        component = <Tickbox
                            checked={responses[key]}
                            text={question.label}
                            onChange={(newValue: boolean) => updateResponses(key, newValue)}
                        />;
                        break;
                    case 'slider':
                        component = <Range
                            value={responses[key]}
                            min={question.min}
                            max={question.max}
                            onChange={(newValue: number) => updateResponses(key, newValue)}
                            step={question.step}
                            showValue={question.showValue}
                            labels={question.labels}
                            units={question.units}
                        />;
                        break;
                    case 'likertSingle':
                        component = <LikertSingle
                            value={responses[key]}
                            options={question.options}
                            labels={question.labels}
                            oneWordPerLine={question.oneWordPerLine}
                            onChange={answer => updateResponses(key, answer)}
                        />
                        break;
                    case 'likertGrid':
                        // Get invalid statements for this grid
                        const invalidStatements = new Set<string>();
                        if (isInvalid && question.statements) {
                            question.statements.forEach((statement, i) => {
                                if (!responses[key]?.[statement]) {
                                    invalidStatements.add(statement);
                                }
                            });
                        }

                        component = <LikertGrid
                            questions={question.statements}
                            options={question.options}
                            responses={responses[key]}
                            headerRepeatInterval={5}
                            onChange={(statementKey: string, answer: string) => {
                                updateResponses(`${key}.${statementKey}`, answer);
                            }}
                            invalidStatements={invalidStatements}
                        />;
                        break;
                    case 'select':
                        component = <Select
                            value={responses[key]}
                            options={question.options}
                            onSelect={newValue => updateResponses(key, newValue)}
                            multiple={question.multiple}
                        />
                        break;
                    case 'audio':
                        component = <AudioPlayer
                                audioSource={question.file}
                                resetOnPause={question.resetOnPause}
                                disabled={responses[key].finished}
                                isPlaying={responses[key].currentlyPlaying}
                                onPress={() => {
                                    if (responses[key].finished) return;
                                    updateResponses(`${key}.currentlyPlaying`, !responses[key].currentlyPlaying);
                                }}
                                onFinish={() => {
                                    if (!responses[key].finished) {
                                        updateResponses(`${key}.currentlyPlaying`, false);
                                        updateResponses(`${key}.finished`, true);
                                    }
                                }}
                                volume={responses[key].volume}
                                onVolumeChange={question.volumeControls ?
                                    (newVolume) => updateResponses(`${key}.volume`, newVolume):
                                    undefined
                                }
                            />
                        break;
                    case 'paragraph':
                        component = <Paragraph
                            text={question.text}
                            title={question.title}
                            containerStyle={question.containerStyle}
                            textStyle={question.textStyle}
                            titleStyle={question.titleStyle}
                        />
                        break;
                    case 'picture':
                        component = <Picture
                            asset={question.file}
                            caption={question.caption}
                            width={question.width}
                            height={question.height}
                            imageStyle={question.imageStyle}
                            captionStyle={question.captionStyle}
                        />
                        break;
                    default:
                        component = <Text>Unsupported question type: {(question as any).type}</Text>;
                }

                // Wrap input in container
                const isInput = !displayOnlyTypes.includes(question.type);
                return (
                    <View key={`question-${key}`} style={[
                        styles.questionContainer,
                        question.conditions && styles.conditionalQuestion,
                        !isInvalid && styles.questionContainerSeparator,
                        isInvalid && globalStyles.invalidInput,
                    ]}>
                        {isInput && (question as SurveyQuestion).question && (
                            <>
                                <Text style={globalStyles.question}>
                                    {(question as SurveyQuestion).question}
                                    {"required" in question && question.required &&
                                        <Text style={[globalStyles.question, {color: colours.secondary}]}>*</Text>
                                    }
                                </Text>

                            </>
                        )}
                        {component}
                    </View>
                );
            })}

            <View style={styles.footerContainer}>
                { progress !== undefined &&
                    <Text style={globalStyles.whiteText}>Progress: {progress.toFixed(0)}%</Text>
                }

                {
                    warning &&
                    <Text style={globalStyles.warning}>{warning}</Text>
                }

                { handleSurveySubmit &&
                    <SubmitButton
                        onPress={async() => {await handleSurveySubmit()}}
                        text={"Submit"}
                        disabledText={"Submitting..."}
                        disabled={isSubmitting ?? false}
                    />
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 25, // TODO: Sometimes looks kinda shit tho
    },
    questionContainer: {
        gap: 10,
        paddingTop: 15, // TODO: Sometimes looks kinda shit tho
        // Put here to keep consisent when invalid or not (questionContainerSeparator colour below)
        borderTopWidth: 2,
        borderWidth: 2,
        borderColor: 'transparent',
        // paddingBottom: 15,
        // borderBottomWidth: 1,
        // borderBottomColor: 'grey',
    },
    questionContainerSeparator: {
        borderTopColor: 'rgba(128, 128, 128,.2)',
    },
    invalidContainer: {
        borderWidth: 2,
        borderColor: '#ff0000',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#ffeeee',
    },
    invalidLabel: {
        color: '#cc0000',
        fontWeight: 'bold',
    },
    footerContainer: {
        gap: 15,
        marginTop: 20,
    },
    conditionalQuestion: {
        marginTop: -5,
        paddingLeft: 10,
        marginLeft: 10,
        borderLeftWidth: 2,
        borderStyle: 'solid',
        borderLeftColor: 'grey',
    }
});
