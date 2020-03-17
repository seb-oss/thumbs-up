const app = require("express")();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {
  authorizeUser,
  handleOauthCallback,
  getThumbsForPage
} = require("./routes");
const settings = require("../settings");
const errorHandler = require("./middleware/errorhandler");

const PORT = 5000;

app.use(cookieParser());
app.use(bodyParser.json());
const corsSettings = {
  origin: settings.origins || "http://localhost:5500",
  credentials: true
};

app.get("/", (_, res) => res.send("I'm alive!"));

app.get("/authorize", authorizeUser);

app.get("/authorized", handleOauthCallback);

app.get("/thumbs", cors(corsSettings), getThumbsForPage);

app.use(errorHandler);

app.listen(PORT, () => console.log(`listening on ${PORT}`));
