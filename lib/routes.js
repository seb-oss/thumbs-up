const pgAdapter = require("./adapters/postgresAdapter");
const github = require("./adapters/github");
const oauth = require("./oauth");
const { badRequest } = require("./errors");

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
    badRequest("pageId missing");
  }
  const { token } = req.cookies;
  let userId = null;
  if (token) {
    userId = await github.getUserId(token);
  }

  console.log("Getting thumbs for", pageId);
  const thumbs = await pgAdapter.getThumbs(pageId, userId);
  res.send(thumbsToReadable(thumbs));
}

async function setThumbForPage(req, res) {
  const { pageId, userThumb } = req.body;
  if (!pageId) {
    badRequest("pageId missing");
  }
  if (![ "thumbUp", "thumbDown" ].includes(userThumb)) {
    badRequest("userThumb invalid");
  }
  const { token } = req.cookies;
  const userId = await github.getUserId(token);

  console.log("Setting thumbs for", pageId);
  const thumbs = await pgAdapter.setThumb(pageId, userId, userThumb === "thumbUp");
  res.send(thumbsToReadable(thumbs));
}

async function removeThumbForPage(req, res) {
  const { pageId } = req.query;
  if (!pageId) {
    badRequest("pageId missing");
  }
  const { token } = req.cookies;
  const userId = await github.getUserId(token);

  console.log("Removing thumb for", pageId);
  const thumbs = await pgAdapter.deleteThumb(pageId, userId);
  res.send(thumbsToReadable(thumbs));
}

async function getTopPagesByThumbs(req, res) {
  const { thumbs, limit } = req.query;
  const validTypes = [ "up", "down", "net" ];
  if (!validTypes.includes(thumbs)) {
    badRequest(`thumbs is not one of [${validTypes.join(", ")}]`);
  }

  const pages = await pgAdapter.getTopPages(thumbs, limit);
  res.send(pages.map(thumbsToIntegers));
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
