const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const url = require("url");
const querystring = require("querystring");
const app = require("../../lib/index");
const expect = chai.expect;
const {
  githubUrl,
  e2eTests: { githubToken }
} = require("../../settings");

describe("GET /authorize", () => {
  it("can validate the required query parameters", done => {
    chai
      .request(app)
      .get("/authorize")
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res).to.have.property("body");
        expect(res.body).to.have.keys(["error", "message"]);
        expect(res.body.message).to.include("redirect_uri");
        done();
      });
  })

  it("can redirect the user to the correct URL", done => {
    chai
      .request(app)
      .get("/authorize")
      .query({
        redirect_uri: "https://some/fake/url"
      })
      .redirects(0)
      .end((err, res) => {
        expect(res).to.have.status(302);
        const redirect = url.parse(res.headers.location);
        expect(`${redirect.protocol}//${redirect.hostname}`).to.eql(githubUrl);
        expect(redirect.pathname).to.eql("/login/oauth/authorize");
        const query = querystring.parse(redirect.query);
        expect(query).to.have.keys(["client_id", "state"]);
        done();
      });
  })
})

describe("GET /authorized", () => {
  it("can validate the required query parameters", done => {
    chai
      .request(app)
      .get("/authorized")
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res).to.have.property("body");
        expect(res.body).to.have.keys(["error", "message"]);
        expect(res.body.message).to.include("code");
        expect(res.body.message).to.include("state");
        done();
      });
  })
})

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
