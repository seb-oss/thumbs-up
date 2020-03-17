const { state_password } = require("../../settings");
const { tryDecodeState } = require("../state");
const { badRequest } = require("../errors");
function validateAuthorizeUser(req, _res, next) {
  if (!req.query.redirect_uri) {
    return badRequest(`"redirect_uri" is required.`);
  }

  return next();
}

async function validateOauthCallback(req, _res, next) {
  if (!req.query.code) {
    return badRequest('"code" is required.');
  }

  if (!req.query.state) {
    return badRequest('"state" is required.');
  }

  const returnUrl = await tryDecodeState(req.query.state, state_password);
  if (returnUrl instanceof Error) {
    return badRequest(returnUrl.message);
  }
  req.validatedReturnUrl = returnUrl;
  return next();
}

module.exports = {
  validateOauthCallback,
  validateAuthorizeUser
};
