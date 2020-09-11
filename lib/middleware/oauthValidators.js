const { state_password } = require("../../settings");
const { tryDecodeState } = require("../state");
const { badRequest } = require("../errors");

function validateAuthorizeUser(req, _res, next) {
  if (!req.query.redirect_uri) {
    return badRequest("missing parameter: redirect_uri");
  }

  return next();
}

function validateOauthCallback(req, _res, next) {
  const required = [ "code", "state" ];
  const missing = required.filter(i => !(i in req.query));

  if (missing.length > 0) {
    return badRequest(`missing parameter: ${missing.join(", ")}`);
  }

  const returnUrl = tryDecodeState(req.query.state, state_password);
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
