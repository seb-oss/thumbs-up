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
        pageId: "examples"
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
        pageId: "new_examples"
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

  it("adds a thumbs down to examples_3 page when user first up then down", done => {
    chai
      .request(app)
      .post("/thumbs")
      .set("Cookie", `token=${token}`)
      .send({
        userThumb: "thumbUp",
        pageId: "examples_3"
      })
      .end(() =>
        chai
          .request(app)
          .post("/thumbs")
          .set("Cookie", `token=${token}`)
          .send({
            userThumb: "thumbDown",
            pageId: "examples_3"
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal({
              thumbsUp: 0,
              thumbsDown: 1,
              userThumb: "thumbDown"
            });
            done();
          })
      );
  });

  it("adds a thumbs up to examples_4 page when user first up then up again", done => {
    chai
      .request(app)
      .post("/thumbs")
      .set("Cookie", `token=${token}`)
      .send({
        userThumb: "thumbUp",
        pageId: "examples_4"
      })
      .end(() =>
        chai
          .request(app)
          .post("/thumbs")
          .set("Cookie", `token=${token}`)
          .send({
            userThumb: "thumbUp",
            pageId: "examples_4"
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal({
              thumbsUp: 1,
              thumbsDown: 0,
              userThumb: "thumbUp"
            });
            done();
          })
      );
  });

  it("adds a thumb and removes it from examples_5 page", done => {
    chai
      .request(app)
      .post("/thumbs")
      .set("Cookie", `token=${token}`)
      .send({
        userThumb: "thumbUp",
        pageId: "examples_5"
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
          thumbsUp: 1,
          thumbsDown: 0,
          userThumb: "thumbUp"
        });
        chai
          .request(app)
          .del("/thumbs?pageId=examples_5")
          .set("Cookie", `token=${token}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal({
              thumbsUp: 0,
              thumbsDown: 0,
              userThumb: null
            });
            done();
          });
      });
  });
});
