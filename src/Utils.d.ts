import { keycloakConfig } from ".";

declare const TokensUtils: {
    isAccessTokenExpired(): Promise<boolean>;
    isAccessTokenExpiredSync(): boolean;
    willAccessTokenExpireInLessThan(seconds:number): Promise<false | number>;
    willAccessTokenExpireInLessThanSync(seconds:number): false | number;
}
declare function decodeToken(token:string):string;
declare function getRealmURL(realm:string,authServerUrl:string):string;
declare function getLoginURL(conf:keycloakConfig,scope:string):{url:string,state:string};
export {TokensUtils,decodeToken,
    getRealmURL,
    getLoginURL};