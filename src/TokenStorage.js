import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { TOKENS as TOKENS_KEY, CONFIG as CONFIG_KEY, CREDENTIALS } from './Constants';


const TokenStorage = {
  saveCredentials: async ({ username, password }) => {
    await Keychain.setGenericPassword(username, password);
  },

  saveConfiguration: async (conf) => {
    await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(conf));
  },

  saveTokens: async (tokens) => {
    await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  },

  getCredentials: () => Keychain.getGenericPassword(),

  getConfiguration: async () => {
    const conf = await AsyncStorage.getItem(CONFIG_KEY);
    return (conf) ? JSON.parse(conf) : undefined;
  },

  getTokens: async () => {
    const tokens = await AsyncStorage.getItem(TOKENS_KEY);
    return (tokens) ? JSON.parse(tokens) : undefined;
  },

  clearSession: async () => {
    await AsyncStorage.removeItem(TOKENS_KEY);
    await AsyncStorage.removeItem(CONFIG_KEY);
    await AsyncStorage.removeItem(CREDENTIALS);
  },
};

export default TokenStorage;
