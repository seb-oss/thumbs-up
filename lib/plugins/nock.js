module.exports = () => {
  const nock = require("nock");
  const { githubUrl } = require("../../settings");

  nock(githubUrl)
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
    .post("/login/oauth/access_token")
    .reply(200, {
      "error": "bad_verification_code",
      "error_description": "The code passed is incorrect or expired."
    });
};
