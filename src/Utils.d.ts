declare const TokensUtils: {
    isAccessTokenExpired(): Promise<boolean>;
    isAccessTokenExpiredSync(): boolean;
    willAccessTokenExpireInLessThan(seconds:number): Promise<false | number>;
    willAccessTokenExpireInLessThanSync(seconds:number): false | number;
}
export {TokensUtils};