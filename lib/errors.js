function namedError(name, message) {
  const error = new Error(message);
  error.name = name;
  return error;
}

function badRequest(message) {
  throw namedError("BadRequest", message);
}

function unauthorized(message) {
  throw namedError("Unauthorized", message);
}

module.exports = {
  namedError,
  badRequest,
  unauthorized
};
