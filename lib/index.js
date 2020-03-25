const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const {
  redirectToAuthUrl,
  handleOauthCallback,
  getThumbsForPage,
  setThumbForPage,
  removeThumbForPage
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

app.get("/authorized", validateOauthCallback, handleOauthCallback);

app.get("/thumbs", getThumbsForPage);

app.post("/thumbs", setThumbForPage);

app.delete("/thumbs", removeThumbForPage);

app.use(errorHandler);
app.use(express.static("public"));
app.listen(PORT, () => console.log(`listening on ${PORT}`));

module.exports = app;
