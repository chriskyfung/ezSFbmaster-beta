
var CLIENT_ID = '';
var CLIENT_SECRET = '';
var TOKEN = '';
var CODE = '';


function getSlackService() {
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return OAuth2.createService('ezSFbmaster')

      // Set the endpoint URLs, which are the same for all Google services.
      .setAuthorizationBaseUrl('https://slack.com/oauth/authorize')
      .setTokenUrl('https://slack.com/api/oauth.access')

      // Set the client ID and secret, from the Google Developers Console.
      .setClientId( CLIENT_ID )
      .setClientSecret( CLIENT_SECRET )

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())

      // Set the scopes to request (space-separated for Google services).
      .setScope('reactions:write,emoji:read,reactions:read,groups:history,groups:read,usergroups:read,incoming-webhook')   
      
      .setPropertyStore(PropertiesService.getUserProperties())
      .setCache(CacheService.getUserCache())
}


function getAuthType() {
  var response = {
    "type": "OAUTH2"
  };
  return response;
}

function authCallback(request) {
  var authorized = getSlackService().handleCallback(request);
  Logger.log('callback message' + authorized)
  
  if (authorized) {
    CODE = authorized;
    return HtmlService.createHtmlOutput('Success! You can close this tab.'+ authorized);
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  };
};

function isAuthValid() {
  var service = getSlackService();
  if (service == null) {
    return false;
  }
  return service.hasAccess();
}

function get3PAuthorizationUrls() {
  var service = getSlackService();
  if (service == null) {
    return '';
  }
  return service.getAuthorizationUrl();
}

function resetAuth() {
  var service = getSlackService()
  service.reset();
}

/**
 * Logs the redict URI to register.
 */
function logRedirectUri() {
  Logger.log(getSlackService().getRedirectUri());
}