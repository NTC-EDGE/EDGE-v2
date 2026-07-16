import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'offline_applications';

export async function enqueueApplication(payload: any) {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push(payload);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function dequeueAll(): Promise<any[]> {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    await AsyncStorage.removeItem(QUEUE_KEY);
    return JSON.parse(raw);
}
