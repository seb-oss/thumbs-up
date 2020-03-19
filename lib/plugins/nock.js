module.exports = () => {
  const nock = require("nock");
  nock("https://github.sebank.se")
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
