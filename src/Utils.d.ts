declare const TokensUtils: {
    isAccessTokenExpired(): Promise<boolean>;
    isAccessTokenExpiredSync(): boolean;
    willAccessTokenExpireInLessThan(): Promise<false | number>;
    willAccessTokenExpireInLessThanSync(): false | number;
}
export {TokensUtils};