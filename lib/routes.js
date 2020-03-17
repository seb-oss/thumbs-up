const pgAdapter = require("./adapters/postgresAdapter");
const github = require("./adapters/github");

const settings = require("../settings");
const { client_id, state_password } = settings;
const authorizeUrl = settings.githubUrl + "/login/oauth/authorize";

const { badRequest } = require("./errors");
const { encodeState, tryDecodeState } = require("./state");

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

  const accessToken = await github.getAccessToken({ code, state });

  res.cookie("token", accessToken, { domain: "localhost" });
  return res.redirect(returnUrl);
}

function convertSentimentToThumb(sentiment) {
  if (sentiment === null) {
    return null;
  }

  return sentiment ? "thumbUp" : "thumbDown";
}

function addThumbUpForPage(pageUrl, userId) {
  pgAdapter.set_thumb(pageUrl, userId, true);
}

function addThumbDownForPage(pageUrl, userId) {
  pgAdapter.set_thumb(pageUrl, userId, false);
}

function removeThumbForPage(pageUrl, userId) {
  pgAdapter.delete_thumb(pageUrl, userId);
}

async function getThumbsForPage(req, res) {
  const { token } = req.cookies;
  const { pageUrl } = req.query;

  return github
    .getUserId(token)
    .then(userId =>
      pgAdapter
        .get_thumbs(pageUrl, userId)
        .then(({ thumbs_up, thumbs_down, user_thumb_up }) => ({
          thumbsUp: Number.parseInt(thumbs_up),
          thumbsDown: Number.parseInt(thumbs_down),
          userThumb: convertSentimentToThumb(user_thumb_up)
        }))
    )
    .then(thumbs => res.send(thumbs));
}

module.exports = {
  handleOauthCallback,
  authorizeUser,
  convertSentimentToThumb,
  addThumbUpForPage,
  addThumbDownForPage,
  removeThumbForPage,
  getThumbsForPage
};
