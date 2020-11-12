const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const url = require("url");
const querystring = require("querystring");
const someFakeUrl = "https://some/fake/url";
const app = require("../../lib/index");
const expect = chai.expect;
const {
  githubUrl,
  state_password,
  e2eTests: { githubToken }
} = require("../../settings");
const { encodeState } = require("../../lib/state");

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
        redirect_uri: someFakeUrl
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

  it("can validate the encoding of the state parameter", done => {
    chai
      .request(app)
      .get("/authorized")
      .query({
        code: "invalid",
        state: "notEncoded",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res).to.have.property("body");
        expect(res.body).to.have.keys(["error", "message"]);
        expect(res.body.message).to.include("state");
        done();
      });
  })

  it("can validate the authenticity of the code parameter", done => {
    chai
      .request(app)
      .get("/authorized")
      .query({
        code: "invalid",
        state: encodeState(someFakeUrl, state_password),
      })
      .end((err, res) => {
        expect(res).to.have.status(500);
        expect(res).to.be.json;
        expect(res).to.have.property("body");
        expect(res.body).to.have.keys(["error", "message"]);
        expect(res.body.message).to.include("code");
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

describe("GET /thumbs", () => {
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

  it("returns a meaningful error on invalid credentials", done => {
    chai
      .request(app)
      .get("/thumbs")
      .set("Cookie", `token=invalid`)
      .query({
        pageId: "examples_1337"
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res).to.be.json;
        expect(res).to.have.property("body");
        expect(res.body).to.have.keys(["error", "message"]);
        expect(res.body.message).to.match(/unauthorized/i);
        done();
      });
  });
});

describe("GET /top-pages", () => {
  const maxPages = 3;
  it("should set the CORS header given some other origin", (done) => {
    chai.request(app)
    .get("/top-pages")
    .set("Origin", "https://some.other.domain.com")
    .query({
      thumbs: "up",
      limit: maxPages
    })
    .end((err, res) => {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.headers).to.have.property("access-control-allow-origin", "*");
      expect(res.body).to.have.lengthOf.at.most(maxPages);
      expect(res.body[0]).to.have.all.keys("pageId", "thumbsUp", "thumbsDown");
      done();
    });
  });
});
