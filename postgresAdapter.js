const { Client } = require("pg");
const client = new Client(
  "postgresql://thumbs_up:supersecret@localhost:5432/thumbs_up"
);

client.connect();

module.exports = {
  async get_thumb(githubId, pageUrl) {
    const { rows } = await client.query(
      "SELECT thumb_up FROM thumbs_up WHERE github_user = $1 AND page_url = $2",
      [githubId, pageUrl]
    );

    return rows[0].thumb_up;
  }
};
