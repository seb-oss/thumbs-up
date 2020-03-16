async function authorizeUser(req, res) {
  const { redirect_uri: endUserUrl } = req.query;
  if (!endUserUrl) {
    return badRequest(`"redirect_uri" is required.`);
  }

  const state = await encodeState(endUserUrl, state_password);

  const authUrl = github.getAuthorizeUrl(client_id, state);
  return res.redirect(authUrl);
}

async function handleOauthCallback(req, res) {
  const code = req.query.code;
  const state = req.query.state;

  if (!code) {
    return badRequest('"code" is required.');
  }

  if (!state) {
    return badRequest('"state" is required.');
  }

  const returnUrl = await tryDecodeState(state, state_password);
  if (returnUrl instanceof Error) {
    return badRequest(returnUrl.message);
  }

  const accessToken = await github.getAccessToken({ code, state });

  res.set("Set-Cookie", `token=${accessToken}`);
  return res.redirect(returnUrl);
}

module.exports = {
  handleOauthCallback,
  authorizeUser
};
