import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from "expo-network";
import {HttpService} from "@/services/data/HttpService";
import {ExperimentTracker} from "@/services/longitudinal/ExperimentTracker";
import { experimentDefinition } from '@/config/experimentDefinition';

const STORAGE_KEY = 'dataQueue';

interface QueueItem {
    data: string,
    name: string,
    datapipeId: string,
    sendAfter?: string
}

class DataQueue {
    private processingPromise: Promise<string> | null = null;

    // *** A PRIVATE GETTER WITH SAFE DEFAULT ***
    private getSendDataState: () => Promise<boolean | null> =
        () => Promise.resolve(experimentDefinition.send_data??null); // Default to true if not set

    private getForceSendDataState: () => Promise<boolean | null> =
        () => Promise.resolve(false); // Default to true if not set

    constructor() {
        this.processingPromise = null;
        this.initNetworkListener();
    }

    public setSendDataStateGetter(getter: () => Promise<boolean | null>) {
        this.getSendDataState = getter;
    }

    public setForceSendDataStateGetter(getter: () => Promise<boolean | null>) {
        this.getForceSendDataState = getter;
    }

    async getQueue(): Promise<QueueItem[]> {
        try {
            const dataString = await AsyncStorage.getItem(STORAGE_KEY);
            return dataString ? JSON.parse(dataString) : []
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async hasQueue(): Promise<boolean> {
        try {
            const queue = await this.getQueue();
            return queue.length > 0;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async clearQueue(): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEY);
    }

    async setQueue(queue: QueueItem[]): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    }

    async addToQueue(data: string, name: string, datapipeId: string, sendAfter?: string): Promise<void> {
        const queue: QueueItem[] = await this.getQueue();
        const queueItem: QueueItem = {
            name,
            data,
            datapipeId,
            sendAfter
        };
        const existingIndex = queue.findIndex(item => item.name === name);
        if (existingIndex !== -1) { // item exists, replace
            queue[existingIndex] = queueItem;
        } else { // if not, push to end of queue
            queue.push(queueItem);
        }
        await this.setQueue(queue);
        // Try to process immediately - might be slight redundant but maybe might as well??
        void this.processQueue();
    }

    // TODO: perhaps a problem with the force send all approach - what if it can't be sent immediately and is sent later instead?
    async processQueue(): Promise<string> {
        // If already processing, return the existing promise
        if (this.processingPromise) {
            return this.processingPromise;
        }

        // Start new processing
        this.processingPromise = this._processQueueInternal();

        try {
            return await this.processingPromise;
        } finally {
            this.processingPromise = null;
        }
    }

    private async _processQueueInternal(): Promise<string> {
        const networkAvailable = await HttpService.isConnectedToInternet()
        if (!networkAvailable) return 'No internet connection';
        // TODO: check if send data currently on here, if not return 'send data off'
        const sendData = await this.getSendDataState();
        if(sendData === false) return 'Sending data is off';
        const ignoreDelays = await this.getForceSendDataState();

        try {
            const queue = await this.getQueue();
            // return '' // to disable
            if(queue.length === 0) return 'No items to sync';

            let responseMessage = 'All items successfully sent to server';
            for (let i = queue.length - 1; i >= 0; i--) { // loop backwards to get oldest first
                const item = queue[i];
                try {
                    if(!ignoreDelays && item.sendAfter) {
                        const now = new Date();
                        const sendAfterTime = new Date(item.sendAfter)
                        if (now < sendAfterTime) {
                            continue; // Skip if not time yet
                        }
                    }
                    // console.log({item});
                    // const uniqueName = `${item.name}_${Date.now()}`; // Timestamp to ensure unique if wanted.
                    const response = await HttpService.sendDataToDataPipe(item.data, item.name, item.datapipeId)
                    if (response.status === 409 || (response.json && response.json.error === 'OSF_FILE_EXISTS')) {
                        console.warn(`Skipping duplicate file: ${item.name}, response: ${JSON.stringify(response)}`);
                    } else if (!response.ok) {
                        // Check if network error or a real server error
                        if (response.status === 0 && response.error === 'Network request failed') {
                            // This is an expected network failure.
                            responseMessage = 'Network unavailable. Pausing sync.';
                            break; // Silently stop the loop
                        } else {
                            // This is a REAL server error (4xx, 5xx)
                            responseMessage = `Send to server failed for ${item.name}\n\nServer Response:\n${JSON.stringify(response)}`;
                            console.error(responseMessage); // log problematic error
                            break;
                        }
                    }
                    queue.splice(i, 1);
                } catch (e) {
                    responseMessage = `Send to server failed for ${item.name}\n${e}`;
                    break;
                }
            }

            await this.setQueue(queue);
            return responseMessage;
        } catch (error) {
            console.error('Error in queue processing:', error);
            return 'Error processing queue';
        }
    }

    initNetworkListener() {
        Network.addNetworkStateListener(({ isConnected, isInternetReachable }) => {
            if (isConnected && isInternetReachable) {
                // Network back online - process queue
                setTimeout(() => this.processQueue(), 1000);
            }
        })
    }
}

export const dataQueue = new DataQueue();
