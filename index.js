const pgAdapter = require('./postgresAdapter')
const app = require("express")();
const { authorizeUser } = require("./routes");
const bodyParser = require("body-parser");
const PORT = 5000;

app.listen(PORT, () => console.log(`listening on ${PORT}`));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("I'm alive!"));

app.get("/authorize", authorizeUser);

app.get("/thumbs", (req, res) => {
  const { pageUrl } = req.query;

  res.sendStatus(200);
});

function getThumbsForPage(pageUrl, userId) {
  // For the given page, return total thumbs up, total thumbs down and
  // sentiment for given user (if defined, otherwise null)
  pgAdapter.get_thumbs(pageUrl, userId);
}

function addThumbUpForPage(pageUrl, userId) {
  // Add user with sentiment thumbs_up to page and return boolean
  pgAdapter.set_thumb(pageUrl, userId, true);
}

function addThumbDownForPage(pageUrl, userId) {
  // Add user with sentiment thumbs_down to page and return boolean
  pgAdapter.set_thumb(pageUrl, userId, false);
}

function removeThumbForPage(pageUrl, userId) {
  // Remove user from page
  pgAdapter.delete_thumb(pageUrl, userId);
}
