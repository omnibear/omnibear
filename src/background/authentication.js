import micropub from '../util/micropub';
import {getParamFromUrl, getUrlOrigin} from '../util/url';
import {getAuthTab, logout} from '../util/utils';

export function fetchToken(code) {
  micropub.options.me = localStorage.getItem('domain');
  micropub.options.tokenEndpoint = localStorage.getItem('tokenEndpoint');
  micropub.options.micropubEndpoint = localStorage.getItem('micropubEndpoint');
  return micropub
    .getToken(code)
    .then(function(token) {
      if (!token) {
        throw new Error(
          "Token not found in token endpoint response. Missing expected field 'access_token'"
        );
      }
      localStorage.setItem('token', token);
      micropub.options.token = token;
    })
    .catch(function(err) {
      console.log('error fetching token', err);
      getAuthTab().then(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'fetch-token-error',
          payload: {
            error: err,
          },
        });
        logout();
      });
    });
}

export function fetchSyndicationTargets() {
  return micropub.query('syndicate-to').then(response => {
    const syndicateTo = response['syndicate-to'];
    if (Array.isArray(syndicateTo)) {
      localStorage.setItem('syndicateTo', JSON.stringify(syndicateTo));
    } else {
      localStorage.setItem('syndicateTo', JSON.stringify([]));
    }
  });
}
