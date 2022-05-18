// this runs as an auth0 rule.
// if the email is not verified don't grant the create:order scope
function (user, context, callback) {
	var requestedScopes = context.request.query.scope;
  if (requestedScopes) {
    requestedScopes = requestedScopes.split(' ');
    if(!user.email_verified){
			requestedScopes = requestedScopes.filter(e => e !== 'create:order');
    }

  } else {
    requestedScopes = [];
  }
  
  // TODO: probably aught to preserve any scopes already added in previous rules, rather than blindly overwrite.
  context.accessToken.scope = requestedScopes;
  callback(null, user, context);
}