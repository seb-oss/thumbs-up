module.exports = function errorHandler(err, _req, res, _next) {
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
};
