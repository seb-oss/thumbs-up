const { Client } = require("pg");
const client = new Client(
  "postgresql://thumbs-up:supersecret@localhost:5432/thumbs-up"
);

client.connect();

module.exports = {
  async get_thumb(githubId, pageUrl) {
    const { rows } = await client.query("SELECT sentiment FROM thumbs WHERE github_id = $1 AND url = $2", [githubId, pageUrl]);

    return rows[0].sentiment;
  }
};
