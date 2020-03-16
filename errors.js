module.exports = {
  badRequest(message) {
    const error = new Error(message);
    error.name = "BadRequest";
    throw error;
  },

  unauthorized(message) {
    const error = new Error(message);
    error.name = "Unauthorized";
    throw error;
  }
};
