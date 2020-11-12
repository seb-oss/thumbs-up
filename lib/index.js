const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const asyncHandler = require('express-async-handler');
const cors = require('cors');

const {
  redirectToAuthUrl,
  handleOauthCallback,
  getThumbsForPage,
  setThumbForPage,
  removeThumbForPage,
  getTopPagesByThumbs
} = require("./routes");
const settings = require("../settings");
const errorHandler = require("./middleware/errorhandler");
const {
  validateOauthCallback,
  validateAuthorizeUser
} = require("./middleware/oauthValidators");

const PORT = 5000;

if (settings.mockGithub) {
  require("./plugins/nock")();
}

app.use(cookieParser());
app.use(bodyParser.json());

app.get("/authorize", validateAuthorizeUser, redirectToAuthUrl);
app.get("/authorized", validateOauthCallback, asyncHandler(handleOauthCallback));

app.get("/thumbs", asyncHandler(getThumbsForPage));
app.post("/thumbs", asyncHandler(setThumbForPage));
app.delete("/thumbs", asyncHandler(removeThumbForPage));

app.get("/top-pages", cors(), asyncHandler(getTopPagesByThumbs));

app.use(errorHandler);
app.use(express.static("public"));
app.use(express.static("node_modules/@fortawesome/fontawesome-pro"));

app.listen(PORT, () => console.log(`listening on ${PORT}`));

module.exports = app;
