const routes = require(process.cwd() + "/lib/routes");
const { expect } = require("chai");

describe("routes/getThumbs", () => {
  it("returns thumbUp if param is true", () => {
    expect(routes.convertSentimentToThumb(true)).to.eql("thumbUp");
  });
  it("returns thumbDown if param is false", () => {
    expect(routes.convertSentimentToThumb(false)).to.eql("thumbDown");
  });
  it("returns null if param is null", () => {
    expect(routes.convertSentimentToThumb(null)).to.eql(null);
  });
});
