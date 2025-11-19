import React from 'react';
import { Stack } from 'expo-router';
import { experimentDefinition } from '@/config/experimentDefinition';

// This is the layout for the main app screens
// export const unstable_settings = {
//     initialRouteName: '/', // Ensure any route can link back to `/`
// };

export default function AppLayout() {

    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
            <Stack.Screen name="survey" options={{ title: 'Survey', headerShown: !experimentDefinition.autoroute}} />
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
            <Stack.Screen name="end" options={{ headerShown: false }}/>

            <Stack.Screen name="DSA/chipScale" options={{ headerShown: false }}/>
            <Stack.Screen name="DSA/adjustColour" options={{ headerShown: false }}/>
            <Stack.Screen name="DSA/showTrialData" options={{ headerShown: false }}/>
        </Stack>
    );
}
