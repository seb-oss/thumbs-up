// const pgAdapter = require("./postgresAdapter");
const app = require("express")();
const { authorizeUser, handleOauthCallback } = require("./routes");
const bodyParser = require("body-parser");
const PORT = 5000;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const settings = require("./settings");
app.use(cookieParser());
app.use(bodyParser.json());

function errorHandler(err, _req, res, _next) {
  console.error(err);
  switch (err.name) {
    case "BadRequest":
      res.status(400).send("bad request");
      break;
    case "Unauthorized":
      res.status(401).send("unauthorized");
      break;
    default:
      res.status(500);
      break;
  }
}

const corsSettings = {
  origin: settings.origins || "*",
  credentials: true
};

app.get("/", (req, res) => res.send("I'm alive!"));

app.get("/authorize", authorizeUser);
app.get("/authorized", handleOauthCallback);

app.get("/thumbs", cors(corsSettings), (req, res) => {
  console.log(req.cookies);
  const { pageUrl } = req.query;

  res.sendStatus(200);
});

// function getThumbsForPage(pageUrl, userId) {
//   // For the given page, return total thumbs up, total thumbs down and
//   // sentiment for given user (if defined, otherwise null)
//   pgAdapter.get_thumbs(pageUrl, userId);
// }

// function addThumbUpForPage(pageUrl, userId) {
//   // Add user with sentiment thumbs_up to page and return boolean
//   pgAdapter.set_thumb(pageUrl, userId, true);
// }

// function addThumbDownForPage(pageUrl, userId) {
//   // Add user with sentiment thumbs_down to page and return boolean
//   pgAdapter.set_thumb(pageUrl, userId, false);
// }

// function removeThumbForPage(pageUrl, userId) {
//   // Remove user from page
//   pgAdapter.delete_thumb(pageUrl, userId);
// }

app.use(errorHandler);

app.listen(PORT, () => console.log(`listening on ${PORT}`));
