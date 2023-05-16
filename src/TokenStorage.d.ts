import { UserCredentials } from "react-native-keychain";
import { keycloakConfig, storedToken } from ".";

declare const TokenStorage: {

    saveCredentials(username: string, password: string): Promise<void>;
    saveConfiguration(conf?: keycloakConfig): Promise<void>;
    saveTokens(tokens: storedToken): Promise<void>;
    getCredentials(): Promise<false | UserCredentials>;
    getConfiguration(): Promise<undefined | keycloakConfig>;
    getTokens(): Promise<undefined | storedToken>;
    clearSession(): Promise<void>
};

export default TokenStorage;