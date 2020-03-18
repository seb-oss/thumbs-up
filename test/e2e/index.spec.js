const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const app = require("../../lib/index");
const expect = chai.expect;
const { token } = require("./settings");

describe("POST /thumbs", () => {
  it("adds a thumbs up to examples page", done => {
    chai
      .request(app)
      .post("/thumbs")
      .set("Cookie", `token=${token}`)
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

  it("adds a thumbs down to new_examples page", done => {
    chai
      .request(app)
      .post("/thumbs")
      .set("Cookie", `token=${token}`)
      .send({
        userThumb: "thumbDown",
        pageUrl: "new_examples"
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
          thumbsUp: 0,
          thumbsDown: 1,
          userThumb: "thumbDown"
        });
        done();
      });
  });
});
