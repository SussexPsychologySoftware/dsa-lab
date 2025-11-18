import {
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    StyleSheet, RefreshControl
} from 'react-native';
import { SafeAreaView} from "react-native-safe-area-context";
import {StatusBar, StatusBarStyle} from 'expo-status-bar';
import {colours} from "@/styles/appStyles";
import Debug from "@/components/debug/Debug";
import React from "react";
import {experimentDefinition} from "@/config/experimentDefinition";

export const StandardView = ({
                                 children,
                                 keyboardBehavior = Platform.OS === 'ios' ? 'padding' : undefined,
                                 statusBarStyle = 'inverted',
                                    // NOTE: keyboard avoiding view causes a lot of issues -
                                    // height on ios helps with orientation changes, and undefined for android stops a flicker on surveys
                                 headerShown = true,
                                 safeAreaStyle,
                                 keyboardAvoidingViewStyle,
                                 contentContainerStyle,
                                 scrollViewStyle,
                                 refreshState,
                                 refreshing,
                                 debug,
                                 innerContainer
                              }:
                              {
                                  children?: any,
                                  statusBarStyle?: StatusBarStyle,
                                  keyboardBehavior?: 'padding'|'height'|'position',
                                  headerShown?: boolean,
                                  safeAreaStyle?: object,
                                  keyboardAvoidingViewStyle?: object,
                                  contentContainerStyle?: object,
                                  scrollViewStyle?: object,
                                  refreshState?: () => Promise<void>,
                                  refreshing?: boolean,
                                  debug?: boolean,
                                  innerContainer?: object
                              }) => {

    return (
        <ScrollView
            style={[styles.outerContainer, styles.scrollView, scrollViewStyle]}
            contentContainerStyle={[styles.scrollViewContentContainer, contentContainerStyle]}
            // keyboardShouldPersistTaps="handled"
            // keyboardDismissMode='on-drag' // dismiss keyboard on drag
            refreshControl={refreshState &&
                <RefreshControl
                    refreshing={refreshing??false}
                    onRefresh={refreshState}
                    tintColor="#fff" // For iOS
                    colors={['#fff']} // For Android
                />
            }
        >
            <SafeAreaView
                style={[styles.safeArea, safeAreaStyle]}
                // Deal with padding manually as component a little broken
                edges={headerShown ? ['left', 'right'] : ['top', 'left', 'right','bottom']}
            >
                <StatusBar style={statusBarStyle}/>
                {/*TODO: Note KeyboardAvoidingView should probably be the outer wrapper*/}
                <KeyboardAvoidingView
                    behavior={keyboardBehavior}
                    style={[styles.keyboardAvoidingView, styles.innerContainer, keyboardAvoidingViewStyle, innerContainer]}
                >
                    {/*<TouchableWithoutFeedback onPress={Keyboard.dismiss}>*/}
                    {children}
                    {experimentDefinition.debug && debug !== false && <Debug/> }
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        backgroundColor: colours.background,
        minHeight: '100%', //or flexGrow: 1?
        maxWidth: '100%',
        // borderWidth: 1,
        // borderColor: 'blue',
        flex: 1,
    },
    scrollViewContentContainer: {
        // Pad inner content so scroll bar is pushed to right name of screen
        paddingHorizontal: '3%',
        // paddingBottom: 20,
        // flex: 1,
    },
    scrollView: {
        // flex: 1,
        // borderColor: 'red',
        // borderWidth: 1,
    },
    safeArea: {
        minHeight: '100%',
        width: '100%',
        // borderColor: 'blue',
        // borderWidth: 1,
    },
    keyboardAvoidingView: {
    },
    innerContainer: {
        // borderColor: 'red',
        // borderWidth: 1,
        // flex: 1,
    }
})
