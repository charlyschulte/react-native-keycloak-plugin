import { UserCredentials } from "react-native-keychain";

export interface keycloakConfig {
  realm: string;
  appsiteUri: string;
  'auth-server-url': string;
  'ssl-required': string;
  redirectUri: string;
  resource: string;
  credentials: {
    secret: string;
  };
  'confidential-port': number;
}
export interface storedToken {
  access_token: string;
  expires_in: string;
  refresh_expires_in: string;
  refresh_token: string;
  scope: string;
  session_state: string;
  token_type: string;
}
export interface scope {
  scope:string
}
export interface loginOptions{
  storeInfo: boolean;
  scope: string;
}
export interface refreshLoginOptions {
  scope: string;
  inputConf: {

  };
  inputCredentials: {
    username : string;
    password : string;
    storeInfo: boolean;
  }
}
export interface retrieveUserInfoReturn{
  email: string; 
  email_verified: boolean;
  preferred_username: string;
  sub: string;
}
export interface logoutInterface{
  destroySession: boolean;
  inputConf: JSON;
  inputTokens:JSON
}
export interface refreshTokenInterface{
  inputConf: JSON;
  inputTokens: JSON;
}
// declare module 'TokenStorage' {
//   function saveCredentials(username: string, password: string): Promise<void>;
//   function saveConfiguration(conf: keycloakConfig): Promise<void>;
//   function saveTokens(tokens: storedToken): Promise<void>;
//   function getCredentials(): Promise<false | UserCredentials>;
//   function getConfiguration(): Promise<undefined | keycloakConfig>;
//   function getTokens(): Promise<undefined | storedToken>;
//   function clearSession(): Promise<void>
// }
// declare module 'TokensUtils' {
//   function isAccessTokenExpired():Promise<boolean>;
//   function isAccessTokenExpiredSync():boolean;
//   function willAccessTokenExpireInLessThan():Promise<false|number>;
//   function willAccessTokenExpireInLessThanSync():false|number;
// }
declare module 'Keycloak' {
  function keycloakUILogin(conf:keycloakConfig, callback:Function, scope:scope):Promise<storedToken>;
  function login(conf:keycloakConfig, username:string, password:string, options:loginOptions):Promise<JSON|Error>;
  function refreshLogin(options:refreshLoginOptions):Promise<JSON|Error>;
  function retrieveUserInfo():Promise<JSON|Error>;
  function logout(conf: logoutInterface):Promise<void>;
  function refreshToken(conf: refreshTokenInterface):Promise<JSON|Error>;
}
export { default as TokenStorage } from './TokenStorage';
export { TokensUtils } from './Utils';