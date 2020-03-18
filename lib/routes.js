const pgAdapter = require("./adapters/postgresAdapter");
const github = require("./adapters/github");
const oauth = require("./oauth");

async function redirectToAuthUrl(req, res) {
  const { redirect_uri: endUserUrl } = req.query;
  const authUrl = await oauth.getAuthUrl(endUserUrl);

  return res.redirect(authUrl);
}

async function handleOauthCallback(req, res) {
  const code = req.query.code;
  const state = req.query.state;
  const returnUrl = req.validatedReturnUrl;
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

const removeThumbForPage = (pageUrl, userId) =>
  pgAdapter.deleteThumb(pageUrl, userId);

async function getThumbsForPage(req, res) {
  const { token } = req.cookies;
  const { pageUrl } = req.query;

  return github
    .getUserId(token)
    .then(userId => pgAdapter.getThumbs(pageUrl, userId))
    .then(thumbsToReadable)
    .then(thumbs => res.send(thumbs));
}

async function setThumbForPage(req, res) {
  const { token } = req.cookies;
  const { pageUrl, userThumb } = req.body;
  const userId = await github.getUserId(token);

  if (userThumb === "thumbUp") {
    pgAdapter.setThumb(pageUrl, userId, true);
  } else if (userThumb === "thumbDown") {
    pgAdapter.setThumb(pageUrl, userId, false);
  }

  return pgAdapter
    .getThumbs(pageUrl, userId)
    .then(thumbsToReadable)
    .then(thumbs => res.send(thumbs));
}

const thumbsToReadable = ({ thumbs_up, thumbs_down, user_thumb_up }) => ({
  thumbsUp: Number.parseInt(thumbs_up),
  thumbsDown: Number.parseInt(thumbs_down),
  userThumb: convertSentimentToThumb(user_thumb_up)
});

module.exports = {
  handleOauthCallback,
  redirectToAuthUrl,
  convertSentimentToThumb,
  removeThumbForPage,
  setThumbForPage,
  getThumbsForPage
};
