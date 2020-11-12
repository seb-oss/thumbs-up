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
  const { pageId } = req.query;
  if (!pageId) {
    res.status(500).send("pageId missing");
  }

  const { token } = req.cookies;
  let userId = null;
  if (token) {
    userId = await github.getUserId(token);
  }
  console.log("Getting thumbs for", pageId);

  return pgAdapter
    .getThumbs(pageId, userId)
    .then(thumbsToReadable)
    .then(thumbs => res.send(thumbs));
}

async function setThumbForPage(req, res) {
  const { pageId, userThumb } = req.body;
  if (!pageId) {
    res.status(500).send("pageId missing");
  }
  if (![ "thumbUp", "thumbDown" ].includes(userThumb)) {
    res.status(500).send("userThumb invalid");
  }

  const { token } = req.cookies;
  const userId = await github.getUserId(token);
  console.log("Setting thumbs for", pageId);

  return pgAdapter
    .setThumb(pageId, userId, userThumb === "thumbUp")
    .then(thumbsToReadable)
    .then(thumbs => res.send(thumbs));
}

async function removeThumbForPage(req, res) {
  const { pageId } = req.query;
  if (!pageId) {
    res.status(500).send("pageId missing");
  }

  const { token } = req.cookies;
  const userId = await github.getUserId(token);
  console.log("Removing thumbs for", pageId);

  return pgAdapter
    .deleteThumb(pageId, userId)
    .then(thumbsToReadable)
    .then(thumbs => res.send(thumbs));
}

async function getTopPagesByThumbs(req, res) {
  const { thumbs, limit } = req.query;

  return pgAdapter
    .getTopPages(thumbs, limit)
    .then(pages => res.send(pages.map(thumbsToIntegers)));
}

const thumbsToReadable = ({ thumbs_up, thumbs_down, user_thumb_up }) => ({
  thumbsUp: Number.parseInt(thumbs_up),
  thumbsDown: Number.parseInt(thumbs_down),
  userThumb: convertSentimentToThumb(user_thumb_up)
});

const thumbsToIntegers = ({ page_id, thumbs_up, thumbs_down }) => ({
  pageId: page_id,
  thumbsUp: Number.parseInt(thumbs_up),
  thumbsDown: Number.parseInt(thumbs_down)
});

module.exports = {
  handleOauthCallback,
  redirectToAuthUrl,
  convertSentimentToThumb,
  removeThumbForPage,
  setThumbForPage,
  getThumbsForPage,
  getTopPagesByThumbs
};
