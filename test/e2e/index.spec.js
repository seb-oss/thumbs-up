const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const app = require("../../lib/index");
const expect = chai.expect;

describe("POST /thumbs", () => {
  it("adds a thumbs up to examples page", done => {
    chai
      .request(app)
      .post("/thumbs")
      .set("Cookie", "token=")
      .send({
        userThumb: "thumbUp",
        pageUrl: "examples"
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
          thumbsUp: 1,
          thumbsDown: 0,
          userThumb: "thumbUp"
        });
        done();
      });
  });
});
