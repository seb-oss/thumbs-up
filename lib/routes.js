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

const addThumbUpForPage = (pageUrl, userId) =>
  pgAdapter.setThumb(pageUrl, userId, true);

const addThumbDownForPage = (pageUrl, userId) =>
  pgAdapter.setThumb(pageUrl, userId, false);

const removeThumbForPage = (pageUrl, userId) =>
  pgAdapter.deleteThumb(pageUrl, userId);

async function getThumbsForPage(req, res) {
  const { token } = req.cookies;
  const { pageUrl } = req.query;

  return github
    .getUserId(token)
    .then(userId =>
      pgAdapter
        .getThumbs(pageUrl, userId)
        .then(({ thumbs_up, thumbs_down, user_thumb_up }) => ({
          thumbsUp: Number.parseInt(thumbs_up),
          thumbsDown: Number.parseInt(thumbs_down),
          userThumb: convertSentimentToThumb(user_thumb_up)
        }))
    )
    .then(thumbs => res.send(thumbs));
}

async function setThumbOnPage(req, res) {
  const { token } = req.cookies;
  const { pageUrl, userThumb } = req.body;
  const userId = await github.getUserId(token);
  if (userThumb === "thumbUp") {
    await addThumbUpForPage(pageUrl, userId);
  } else if (userThumb === "thumbDown") {
    await addThumbUpForPage(pageUrl, userId);
  }

  return pgAdapter
    .getThumbs(pageUrl, userId)
    .then(({ thumbs_up, thumbs_down, user_thumb_up }) => ({
      thumbsUp: Number.parseInt(thumbs_up),
      thumbsDown: Number.parseInt(thumbs_down),
      userThumb: convertSentimentToThumb(user_thumb_up)
    }))
    .then(thumbs => res.send(thumbs));
}

module.exports = {
  handleOauthCallback,
  redirectToAuthUrl,
  convertSentimentToThumb,
  addThumbUpForPage,
  addThumbDownForPage,
  removeThumbForPage,
  setThumbOnPage,
  getThumbsForPage
};
