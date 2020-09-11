module.exports = function errorHandler(err, _req, res, _next) {
  let statusCode;
  switch (err.name) {
    case "BadRequest":
      statusCode = 400;
      break;
    case "Unauthorized":
      statusCode = 401;
      break;
    case "HTTPError":
      response = err.response || {};
      statusCode = response.statusCode || 500;
      break;
    default:
      statusCode = 500;
      break;
  }
  res.status(statusCode).json({
    error: err.name,
    message: err.message
  });
};
