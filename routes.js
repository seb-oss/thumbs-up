const settings = require("./settings");
const authorizeUrl = settings.githubUrl + "/login/oauth/authorize";
const accessTokenUrl = settings.githubUrl + "/login/oauth/access_token";
const { client_id, client_secret, state_password } = settings;
const { badRequest } = require("./errors");
const { encodeState, tryDecodeState } = require("./state");
const got = require("got");

async function authorizeUser(req, res) {
  const { redirect_uri: endUserUrl } = req.query;
  if (!endUserUrl) {
    return badRequest(`"redirect_uri" is required.`);
  }

  const state = await encodeState(endUserUrl, state_password);

  const authUrl = `${authorizeUrl}?${new URLSearchParams({
    client_id,
    state
  })}`;
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

  const accessToken = await getAccessToken({ code, state });

  res.cookie("token", accessToken, { domain: "localhost" });
  return res.redirect(returnUrl);
}

async function getAccessToken({ code, state }) {
  const response = await got.post(accessTokenUrl, {
    json: {
      client_id,
      client_secret,
      code,
      state
    },
    responseType: "json",
    headers: {
      Accept: "application/json",
      "User-Agent": "Thumbs-up"
    }
  });
  console.log(response);
  if (response.body.error) {
    console.log(response.body.error);
    throw new Error(`Access token response had status ${response.body.error}.`);
  }

  return response.body.access_token;
}

function convertSentimentToThumb(sentiment) {
  if (sentiment === null) {
    return null;
  }

  return sentiment ? "thumbUp" : "thumbDown";
}

module.exports = {
  handleOauthCallback,
  authorizeUser,
  convertSentimentToThumb
};
