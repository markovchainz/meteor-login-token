/* global LoginToken:true */
function getParams(str) {
  let queryString = str || window.location.search || '';
  let keyValPairs = [];

  let params = {};

  // There are no parameters on the route.
  if (queryString.indexOf('?') === -1) return params;

  queryString = queryString.substring(queryString.indexOf('?') + 1);

  if (queryString.length) {
    keyValPairs = queryString.split('&');

    for (let pairNum in keyValPairs) {
      if (keyValPairs.hasOwnProperty(pairNum)) {
        let key = keyValPairs[pairNum].split('=')[0];
        if (!key.length) continue;
        if (typeof params[key] === 'undefined') {
          params[key] = keyValPairs[pairNum].split('=')[1];
        }
      }
    }
  }
  return params;
}

LoginToken.checkToken = function(token, params) {
  if (!token) {
    return;
  }
  const userId = Tracker.nonreactive(Meteor.userId);

  if (!userId) {
    Accounts.callLoginMethod({
      methodArguments: [{
        dispatch_authToken: token,
      }],
      userCallback: function(err) {
        if (err) {
          LoginToken.emit('errorClient', err);
        } else {
          LoginToken.emit('loggedInClient');
          delete params.authToken;
          let queryString = [];

          for (let k in params) {
            if (params.hasOwnProperty(k)) {
              queryString.push(k + '=' + encodeURIComponent(params[k]));
            }
          }

          // Make it look clean by removing the authToken from the URL
          if (window.history) {
            window.history.pushState(null, null,
              window.location.href.split('?')[0] + queryString.join('&'));
          }
        }
      },
    });
  }
};

Meteor.startup(function() {
  const params = getParams(window.location.search);

  if (params.authToken) {
    LoginToken.checkToken(params.authToken, params);
  }
});
