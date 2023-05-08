# react-native-keycloak-plugin
This is a fork of  lucataglia's react-native-login-keycloak module. I started from that to add some features and also add the ability to create issues and work together on that project.
lastly i wanted to add typescript support to that project

This plugin exposes some util methods to interact with [Keycloak][KeycloakHome] in order to handle the user session. 

## Documentation

- [Install][InstallAnchor]
- [Setup][SetupAnchor]
- [API][APIAnchor]
- [Utils][UtilsAnchor]

## Install 
### Using npm

```shell
npm i --save react-native-keycloak-plugin
```

### Using yarn

```shell
yarn add react-native-keycloak-plugin
```

## Setup

### App configuration

Please configure [Linking](https://facebook.github.io/react-native/docs/linking.html) module, including steps for handling Universal links<br>
This might get changed due to not being able to close the tab on leave, ending up with a lot of tabs in the browser.<br>
_[Not needed if you're using React Native >= 0.60]_

Also, add the applinks: `<APPSITE HOST>` entry to the Associated Domains Capability of your app.


### Imports
The plugin uses an export default statement, so you can import the variable with: 
```js
import Keycloak from 'react-native-keycloak-plugin';
```
From that variable, you have access to all the util methods the plugin implements.

## API
### Keycloak.keycloakUILogin

```js
Keycloak.keycloakUILogin(conf, [callback, { scope }])
  .then((response) => /* Your resolve */ )
  .catch((error) => /* Your reject*/ )
```
Method arguments:
  - _conf_: The JSON configuration object (see the example below).
  - _callback_: By default the plugin try to open the keycloak login url on the default browser. Using this callback you can override this behavior e.g. handling the login flow into a WebView without leaving the app.
  - _scope_: You can override this argument if some custom Keycloak behavior is needed (e.g if you need to handle the Keycloak ID_TOKEN, you have to pass 'offline_access' as value).

```json
config = {
  "realm": "string",
  "auth-server-url": "string",
  "appsiteUri": "string",
  "redirectUri": "string",
  "ssl-required": "string",
  "resource": "string",
  "credentials": {
    "secret": "string"
  },
  "confidential-port": "number",
}
```

Resolver arguments:
 - _response_: a JSON object containing two fields:
    - *tokens*: a JSON containing all the tokens returned by Keycloak. If you used'info' as *scope* the JSON will be as shown below.
    - *deepLinkUrl*: The redirectUrl with some Keycloak query params added at the end.

```json
response.tokens = {
    "access_token": "string",
    "expires_in": "number",
    "refresh_expires_in": "number",
    "refresh_token": "string",
    "token_type": "string",
    "not-before-policy": "number",
    "session_state": "string",
    "scope": "string",
}
```

### Keycloak.login

```js
Keycloak.login(conf, username, password, options)
    .then((response) => /* Your resolve */ )
    .catch((error) => /* Your reject*/ )
```

Method arguments:
  - _conf_: The JSON configuration object (see the example above).
  - _username_: The username to be logged in
  - _password_: The password associated to the above username
  - _options_: JSON containing the following fields:
    - _scope_: same behavior as above
    - _storeInfo_: `boolean`, whether the plugin should save the result into the AsyncStorage. Defaults to `true`
  
### Keycloak.refreshLogin  
  
```js
Keycloak.refreshLogin(options)
    .then((response) => /* Your resolve */ )
    .catch((error) => /* Your reject*/ )
```

Method arguments:
  - _options_: JSON containing the following fields (all are optional):
    - _scope_: same behavior as above
    - _inputConf_: a config object to be used
    - _inputCredentials_: a JSON Object shaped with `{ username, password }`
    - _storeInfo_: same behavior as above

Sometimes you may need to re-login your user w/ Keycloak via the login process but, for some reason, you don't want / can't display the login page.<br>
This method will re-login your user.

#### Manually handling the tokens

```js
import Keycloak, { TokenStorage } from 'react-native-keycloak-plugin'
```

Logging in by the login function will save the tokens information, and the configuration object into the AsyncStorage.<br>Through the TokenStorage object, the plugin exports some methods that can be used to interact with these objects.

### Keycloak.retrieveUserInfo
```js
Keycloak.retrieveUserInfo({ inputConf, inputTokens })
  .then((userInfo) => /* Your resolve */ );
  .catch((error) => /* Your reject*/ )
```
Passing a configuration JSON object, makes available into the resolve function the JSON that describes the user inside Keycloak.

### Keycloak.refreshToken
```js
Keycloak.refreshToken({ inputConf, inputTokens })
  .then((response) => /* Your resolve */ );
  .catch((error) => /* Your reject*/ )
```
Passing a configuration JSON object, makes available into the resolve function the JSON containing the refreshed tokens. This information are also saved into the AsyncStorage, as described above.

### Keycloak.logout
```js
Keycloak.logout({ destroySession = true, inputConf, inputTokens })
  .then(() => /* Your resolve */ );
  .catch((error) => /* Your reject*/ )
```

_destroySession_: Since the `/openid-connect/token` simply returns an `access token` and doesn't create any session on Keycloak side, if you used the `login` method you want to pass false.<br/>
Passing `true` tries to destroy the session: pay attention that on newer Keycloak versions this raises an error if no session is present, preventing the logout.

## Utils
### TokensUtils.isAccessTokenExpired
```js
import { TokensUtils } from 'react-native-keycloak-plugin';

TokensUtils.isAccessTokenExpired()
  .then(() => /* Your resolve */ );
  .catch((error) => /* Your reject*/ )
```
This utils method check if the access token saved into the AsyncStorage is still valid or if it's expired. Since it interact witht the AsyncStorage, a promise must be handled.

### TokensUtils.willAccessTokenExpireInLessThan
```js
import { TokensUtils } from 'react-native-keycloak-plugin';

TokensUtils.willAccessTokenExpireInLessThan(seconds)
  .then(() => /* Your resolve */ );
  .catch((error) => /* Your reject*/ )
```
This utils method check if the access token saved into the AsyncStorage will expire in less than `<seconds>` seconds. Since it interacts with the AsyncStorage, a promise must be handled.

[InstallAnchor]: <https://github.com/lucataglia/react-native-keycloak-plugin#install>
[SetupAnchor]: <https://github.com/lucataglia/react-native-keycloak-plugin#setup>
[APIAnchor]: <https://github.com/lucataglia/react-native-keycloak-plugin#api>
[UtilsAnchor]: <https://github.com/lucataglia/react-native-keycloak-plugin#utils>
[KeycloakHome]: <https://www.keycloak.org/getting-started>
