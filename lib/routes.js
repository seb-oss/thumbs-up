const pgAdapter = require("./adapters/postgresAdapter");
const github = require("./adapters/github");
const oauth = require("./oauth");

function redirectToAuthUrl(req, res) {
  const { redirect_uri: endUserUrl } = req.query;
  const authUrl = oauth.getAuthUrl(endUserUrl);

  return res.redirect(authUrl);
}

async function handleOauthCallback(req, res) {
  const code = req.query.code;
  const state = req.query.state;
  const returnUrl = req.validatedReturnUrl;
  const accessToken = await github.getAccessToken({ code, state });

  res.cookie("token", accessToken);
  console.log("returning user to:", returnUrl);
  return res.redirect(returnUrl);
}

function convertSentimentToThumb(sentiment) {
  if (sentiment === null) {
    return null;
  }

  return sentiment ? "thumbUp" : "thumbDown";
}

async function getThumbsForPage(req, res) {
  const { token } = req.cookies;
  const { pageId } = req.query;
  if (!pageId) {
    res.status(500).send("pageId missing");
  }
  console.log("Getting thumbs for", pageId);
  let userId = null;
  if (token) {
    userId = await github.getUserId(token);
  }

  return pgAdapter
    .getThumbs(pageId, userId)
    .then(thumbsToReadable)
    .then(thumbs => res.send(thumbs));
}

async function setThumbForPage(req, res) {
  const { token } = req.cookies;
  const { pageId, userThumb } = req.body;
  const userId = await github.getUserId(token);
  if (!pageId) {
    res.status(500).send("pageId missing");
  }
  console.log("Setting thumbs for", pageId);

  if (userThumb === "thumbUp") {
    pgAdapter.setThumb(pageId, userId, true);
  } else if (userThumb === "thumbDown") {
    pgAdapter.setThumb(pageId, userId, false);
  }

  return pgAdapter
    .getThumbs(pageId, userId)
    .then(thumbsToReadable)
    .then(thumbs => res.send(thumbs));
}

async function removeThumbForPage(req, res) {
  const { token } = req.cookies;
  const { pageId } = req.query;
  const userId = await github.getUserId(token);

  return pgAdapter
    .deleteThumb(pageId, userId)
    .then(() => pgAdapter.getThumbs(pageId, userId))
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
