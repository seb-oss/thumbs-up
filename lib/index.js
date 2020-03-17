const app = require("express")();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {
  redirectToAuthUrl,
  handleOauthCallback,
  getThumbsForPage
} = require("./routes");
const settings = require("../settings");
const errorHandler = require("./middleware/errorhandler");
const {
  validateOauthCallback,
  validateAuthorizeUser
} = require("./middleware/oauthValidators");

const PORT = 5000;

app.use(cookieParser());
app.use(bodyParser.json());
const corsSettings = {
  origin: settings.origins || "http://localhost:5500",
  credentials: true
};

app.get("/", (_, res) => res.send("I'm alive!"));

app.get("/authorize", validateAuthorizeUser, redirectToAuthUrl);

app.get("/authorized", validateOauthCallback, handleOauthCallback);

app.get("/thumbs", cors(corsSettings), getThumbsForPage);

app.use(errorHandler);

app.listen(PORT, () => console.log(`listening on ${PORT}`));
