const got = require("got");
const settings = require("../../settings");
const accessTokenUrl = settings.githubUrl + "/login/oauth/access_token";
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

async function getAccessToken({ code, state }) {
  const response = await got.post(accessTokenUrl, {
    json: {
      client_id: settings.client_id,
      client_secret: settings.client_secret,
      code,
      state
    },
    responseType: "json",
    headers: {
      Accept: "application/json",
      "User-Agent": "Thumbs-up"
    }
  });
  console.log(response);
  if (response.body.error) {
    console.log(response.body.error);
    throw new Error(`Access token response had status ${response.body.error}.`);
  }

  return response.body.access_token;
}

module.exports = {
  getAccessToken,
  getUserId
};
