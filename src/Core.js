import qs from 'query-string';
import { Linking } from 'react-native';
import { encode as btoa } from 'base-64';
import { getRealmURL, getLoginURL } from './Utils';
import {
  GET, POST, URL,
} from './Constants';
import TokenStorage from './TokenStorage';

const basicHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
};

// ### PRIVATE METHODS

const onOpenURL = (conf, resolve, reject, state, event, callback) => {
  const isRedirectUrlADeepLink = event.url.startsWith(conf.appsiteUri);

  if (isRedirectUrlADeepLink) {
    const {
      state: stateFromUrl,
      code,
    } = qs.parse(qs.extract(event.url));

    if (state === stateFromUrl) {
      callback(conf, code, resolve, reject, event.url);
    }
  }
};

const retrieveTokens = async (conf, code, resolve, reject, deepLinkUrl) => {
  const {
    resource, credentials, realm, redirectUri, 'auth-server-url': authServerUrl,
  } = conf;

  const tokenUrl = `${getRealmURL(realm, authServerUrl)}/protocol/openid-connect/token`;
  const method = POST;

  const headers = credentials && credentials.secret
    ? { ...basicHeaders, Authorization: `Basic ${btoa(`${resource}:${credentials.secret}`)}` }
    : basicHeaders;

  const body = qs.stringify({
    grant_type: 'authorization_code', redirect_uri: redirectUri, client_id: resource, code,
  });

  const options = { headers, method, body };
  const fullResponse = await fetch(tokenUrl, options);
  const jsonResponse = await fullResponse.json();

  if (fullResponse.ok) {
    await TokenStorage.saveConfiguration(conf);
    await TokenStorage.saveTokens(jsonResponse);
    resolve({ tokens: jsonResponse, deepLinkUrl });
  } else {
    console.error('Error during kc-retrieve-tokens');
    reject(jsonResponse);
  }
};

const performLogin = async (conf, username, password, { scope, storeInfo = true } = {}) => {
  const {
    resource, realm, credentials, 'auth-server-url': authServerUrl,
  } = conf;
  const url = `${getRealmURL(realm, authServerUrl)}/protocol/openid-connect/token`;
  const method = POST;
  const body = qs.stringify({
    grant_type: 'password',
    username,
    password,
    client_id: encodeURIComponent(resource),
    client_secret: credentials ? credentials.secret : undefined,
    scope,
  });
  const options = { headers: basicHeaders, method, body };

  const fullResponse = await fetch(url, options);
  const jsonResponse = await fullResponse.json();

  if (fullResponse.status === 200) {
    if (storeInfo) {
      await TokenStorage.saveConfiguration(conf);
      await TokenStorage.saveTokens(jsonResponse);
      await TokenStorage.saveCredentials({ username, password });
    }
    return jsonResponse;
  }

  return Promise.reject(Error(JSON.stringify({
    ...jsonResponse,
    errorMessage: `Error during kc-api-login, ${fullResponse.status}: ${jsonResponse.error_description}`,
    status: fullResponse.status,
  })));
};


// ### PUBLIC METHODS

const keycloakUILogin = (conf, callback, { scope } = {}) => new Promise(((resolve, reject) => {
  const { url, state } = getLoginURL(conf, scope);

  const listener = event => onOpenURL(conf, resolve, reject, state, event, retrieveTokens);
  Linking.addEventListener(URL, listener);

  const doLogin = callback || Linking.openURL;
  doLogin(url).then(null);
}));

const login = async (conf, username, password, options) => performLogin(conf, username, password, options);

const refreshLogin = async ({
  inputConf, inputCredentials, scope, storeInfo = true,
} = {}) => {
  const conf = inputConf || await TokenStorage.getConfiguration();
  if (!conf) {
    return Promise.reject(Error('Error during kc-refresh-login: Could not read configuration from storage'));
  }

  const credentials = inputCredentials || await TokenStorage.getCredentials();
  if (!credentials) {
    return Promise.reject(Error('Error during kc-refresh-login:  Could not read from AsyncStorage'));
  }
  const { username, password } = credentials;
  if (!username || !password) {
    return Promise.reject(Error('Error during kc-refresh-login: Username or Password not found'));
  }

  return performLogin(conf, username, password, { scope, storeInfo });
};

const retrieveUserInfo = async ({ inputConf, inputTokens } = {}) => {
  const conf = inputConf || await TokenStorage.getConfiguration();

  if (!conf) {
    return Promise.reject(Error('Error during kc-retrieve-user-info: Could not read configuration'));
  }

  const { realm, 'auth-server-url': authServerUrl } = conf;
  const savedTokens = inputTokens || await TokenStorage.getTokens();

  if (!savedTokens) {
    return Promise.reject(Error('Error during kc-retrieve-user-info: Could not read tokens'));
  }

  const userInfoUrl = `${getRealmURL(realm, authServerUrl)}/protocol/openid-connect/userinfo`;
  const method = GET;
  const headers = { ...basicHeaders, Authorization: `Bearer ${savedTokens.access_token}` };
  const options = { headers, method };
  const fullResponse = await fetch(userInfoUrl, options);
  const jsonResponse = await fullResponse.json();

  if (fullResponse.ok) {
    return jsonResponse;
  }

  return Promise.reject(Error(`Error during kc-retrieve-user-info: ${fullResponse.status}: ${fullResponse.url}`));
};

const refreshToken = async ({ inputConf, inputTokens } = {}) => {
  const conf = inputConf || await TokenStorage.getConfiguration();

  if (!conf) {
    return Promise.reject(Error('Could not read configuration from storage'));
  }

  const {
    resource, realm, credentials, 'auth-server-url': authServerUrl,
  } = conf;
  const savedTokens = inputTokens || await TokenStorage.getTokens();

  if (!savedTokens) {
    return Promise.reject(Error(`Error during kc-refresh-token, savedTokens is ${savedTokens}`));
  }

  const refreshTokenUrl = `${getRealmURL(realm, authServerUrl)}/protocol/openid-connect/token`;
  const method = POST;
  const body = qs.stringify({
    grant_type: 'refresh_token',
    refresh_token: savedTokens.refresh_token,
    client_id: encodeURIComponent(resource),
    client_secret: credentials ? credentials.secret : undefined,
  });
  const options = { headers: basicHeaders, method, body };

  const fullResponse = await fetch(refreshTokenUrl, options);
  const jsonResponse = await fullResponse.json();

  if (fullResponse.ok) {
    await TokenStorage.saveTokens(jsonResponse);
    return jsonResponse;
  }

  return Promise.reject(Error(JSON.stringify({
    ...jsonResponse,
    errorMessage: `Error during kc-refresh-token, ${fullResponse.status}: ${fullResponse.url}`,
  })));
};

const logout = async ({ destroySession = true, inputConf, inputTokens } = {}) => {
  if (destroySession) {
    const conf = inputConf || await TokenStorage.getConfiguration();

    if (!conf) {
      return Promise.reject(Error('Could not read configuration from storage'));
    }

    const { realm, 'auth-server-url': authServerUrl, resource } = conf;
    const savedTokens = inputTokens || await TokenStorage.getTokens();

    if (!savedTokens) {
      return Promise.reject(Error(`Error during kc-logout, savedTokens is ${savedTokens}`));
    }

    const logoutUrl = `${getRealmURL(realm, authServerUrl)}/protocol/openid-connect/logout`;
    const method = POST;
    const headers = { ...basicHeaders, Authorization: `Bearer ${savedTokens.access_token}` };
    const body = qs.stringify({
      client_id: resource, refresh_token: savedTokens.refresh_token,
    });
    const options = { headers, method, body };
    const fullResponse = await fetch(logoutUrl, options);

    if (fullResponse.ok) {
      await TokenStorage.clearSession();
      return Promise.resolve();
    }

    return Promise.reject(Error(`Error during kc-logout: ${fullResponse.status}: ${fullResponse.url}`));
  }

  await TokenStorage.clearSession();
  return Promise.resolve();
};

export {
  keycloakUILogin,
  login,
  logout,
  refreshLogin,
  refreshToken,
  retrieveUserInfo,
};
