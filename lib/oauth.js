const settings = require("../settings");
const authorizeUrl = settings.githubUrl + "/login/oauth/authorize";
const { encodeState } = require("./state");

const { client_id, state_password } = settings;

function getAuthUrl(endUserUrl) {
  const state = encodeState(endUserUrl, state_password);

  return `${authorizeUrl}?${new URLSearchParams({
    client_id,
    state
  })}`;
}
module.exports = {
  getAuthUrl
};
