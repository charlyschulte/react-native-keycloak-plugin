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
  };
  export interface storedToken {
  access_token: string;
  expires_in: string;
  refresh_expires_in: string;
  refresh_token: string;
  scope: string;
  session_state: string;
  token_type: string;
}
declare module 'TokenStorage' {
    async function saveCredentials(username:string,password:string):Promise<void>;
    async function saveConfiguration(conf:keycloakConfig):Promise<void>;
    async function saveTokens(tokens:storedToken):Promise<void>;
}