const { Client } = require("pg");
const client = new Client(
  "postgresql://thumbs_up:supersecret@localhost:5432/thumbs_up"
);
client.connect();

module.exports = {
  async get_thumbs(pageUrl, userId) {
    const { rows } = await client.query(
      "SELECT thumbs_up, thumbs_down, user_thumb_up FROM total_thumbs($1, $2)",
      [pageUrl, userId]
    );
    return rows[0];
  },

  async set_thumb(pageUrl, userId, thumbUp) {
    const { rows } = await client.query(
      "INSERT INTO thumbs_up(page_url, github_user, thumb_up) VALUES($1, $2, $3)",
      [pageUrl, userId, thumbUp]
    );
    return rows[0];
  },

  async delete_thumb(pageUrl, userId) {
    const { rows } = await client.query(
      "DELETE FROM thumbs_up WHERE page_url = $1 AND github_user = $2",
      [pageUrl, userId]
    );
    return rows[0];
  }
};
