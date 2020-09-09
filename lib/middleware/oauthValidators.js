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
  if (!req.query.code) {
    return badRequest("missing parameter: code");
  }

  if (!req.query.state) {
    return badRequest("missing parameter: state");
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
