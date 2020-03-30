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
};
