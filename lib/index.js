const pgAdapter = require("./adapters/postgresAdapter");
const app = require("express")();
const {
  authorizeUser,
  handleOauthCallback,
  convertSentimentToThumb
} = require("./routes");
const bodyParser = require("body-parser");
const PORT = 5000;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const settings = require("../settings");
app.use(cookieParser());
app.use(bodyParser.json());
const got = require("got");

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
  origin: settings.origins || "http://localhost:5500",
  credentials: true
};

app.get("/", (req, res) => res.send("I'm alive!"));

app.get("/authorize", authorizeUser);
app.get("/authorized", handleOauthCallback);

app.get("/thumbs", cors(corsSettings), async (req, res) => {
  const { token } = req.cookies;
  const { pageUrl } = req.query;

  const userId = await getUserId(token);
  await addThumbUpForPage(pageUrl, userId);
  const thumbs = await getThumbsForPage(pageUrl, userId);
  console.log("thumbs", thumbs);
  res.send(thumbs);
});

async function getUserId(token) {
  const response = await got.post(settings.githubUrl + "/api/graphql", {
    json: {
      query: `query {
        viewer {
          id
        }
      }`
    },
    responseType: "json",
    headers: {
      Authorization: `bearer ${token}`,
      Accept: "application/json",
      "User-Agent": "Thumbs-up"
    }
  });
  if (response.body.error) {
    console.log(response.body.error);
    throw new Error(`Access token response had status ${response.body.error}.`);
  }
  return response.body.data.viewer.id;
}

function getThumbsForPage(pageUrl, userId) {
  return pgAdapter
    .get_thumbs(pageUrl, userId)
    .then(({ thumbs_up, thumbs_down, user_thumb_up }) => ({
      thumbsUp: Number.parseInt(thumbs_up),
      thumbsDown: Number.parseInt(thumbs_down),
      userThumb: convertSentimentToThumb(user_thumb_up)
    }));
}

function addThumbUpForPage(pageUrl, userId) {
  pgAdapter.set_thumb(pageUrl, userId, true);
}

function addThumbDownForPage(pageUrl, userId) {
  pgAdapter.set_thumb(pageUrl, userId, false);
}

function removeThumbForPage(pageUrl, userId) {
  pgAdapter.delete_thumb(pageUrl, userId);
}

app.use(errorHandler);

app.listen(PORT, () => console.log(`listening on ${PORT}`));
