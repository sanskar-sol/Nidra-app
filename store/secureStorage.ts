import * as SecureStore from 'expo-secure-store';
import { StateStorage } from 'zustand/middleware';
import { Platform } from 'react-native';

export const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === 'web') return null;
    return (await SecureStore.getItemAsync(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') return;
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === 'web') return;
    await SecureStore.deleteItemAsync(name);
  },
};
