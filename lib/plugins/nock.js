module.exports = () => {
  const nock = require("nock");
  const { githubUrl, e2eTests: { githubToken } } = require("../../settings");

  nock(githubUrl, {
    reqheaders: {
      Authorization: `bearer ${githubToken}`
    }})
    .persist(true)
    .post("/api/graphql")
    .reply(200, {
      data: {
        viewer: {
          id: "randomUserId"
        }
      }
    });

  nock(githubUrl)
    .post("/api/graphql")
    .reply(401, {
      "error": "HTTPError",
      "message": "Response code 401 (Unauthorized)"
    });

  nock(githubUrl)
    .post("/login/oauth/access_token")
    .reply(200, {
      "error": "bad_verification_code",
      "error_description": "The code passed is incorrect or expired."
    });
};
