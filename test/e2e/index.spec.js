const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const app = require("../../lib/index");
const expect = chai.expect;
const {
  e2eTests: { githubToken }
} = require("../../settings");

// Ensure there are no existing thumbs in the database before running the tests
const pgAdapter = require("../../lib/adapters/postgresAdapter");
before(pgAdapter.truncateThumbs);

describe("POST /thumbs", () => {
  it("can add a thumbs up to a page", done => {
    chai
      .request(app)
      .post("/thumbs")
      .set("Cookie", `token=${githubToken}`)
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

  it("can add a thumbs down to a page", done => {
    chai
      .request(app)
      .post("/thumbs")
      .set("Cookie", `token=${githubToken}`)
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

  it("can add a thumbs down to page when user first votes up then down", done => {
    chai
      .request(app)
      .post("/thumbs")
      .set("Cookie", `token=${githubToken}`)
      .send({
        userThumb: "thumbUp",
        pageId: "examples_3"
      })
      .end(() =>
        chai
          .request(app)
          .post("/thumbs")
          .set("Cookie", `token=${githubToken}`)
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

  it("can only add a single thumbs up to page when user first votes up then up again", done => {
    chai
      .request(app)
      .post("/thumbs")
      .set("Cookie", `token=${githubToken}`)
      .send({
        userThumb: "thumbUp",
        pageId: "examples_4"
      })
      .end(() =>
        chai
          .request(app)
          .post("/thumbs")
          .set("Cookie", `token=${githubToken}`)
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
});

describe("DELETE /thumbs", () => {
  it("can add a thumb and remove it from page", done => {
    chai
      .request(app)
      .post("/thumbs")
      .set("Cookie", `token=${githubToken}`)
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
          .set("Cookie", `token=${githubToken}`)
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

describe("get /thumbs", () => {
  before(() =>
    chai
      .request(app)
      .post("/thumbs")
      .set("Cookie", `token=${githubToken}`)
      .send({
        userThumb: "thumbUp",
        pageId: "examples_1337"
      })
  );

  it("gets thumbs added with credentials", done => {
    chai
      .request(app)
      .get("/thumbs")
      .set("Cookie", `token=${githubToken}`)
      .query({
        pageId: "examples_1337"
      })
      .end((err, res) => {
        expect(res.body.thumbsUp).eql(1);
        expect(res.body.userThumb).eql("thumbUp");
        done();
      });
  });

  it("gets thumbs added without credentials", done => {
    chai
      .request(app)
      .get("/thumbs")
      .query({
        pageId: "examples_1337"
      })
      .end((err, res) => {
        expect(res.body.thumbsUp).eql(1);
        expect(res.body.userThumb).eql(null);
        done();
      });
  });
});
