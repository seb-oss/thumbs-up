const { Client } = require("pg");
const { dbHost, dbPassword, dbUser } = require("../../settings");
const client = new Client(
  `postgresql://${dbUser}:${dbPassword}@${dbHost}:5432/thumbs_up`
);
client.connect();

module.exports = {
  async getThumbs(pageId, userId) {
    const {
      rows
    } = await client.query(
      "SELECT thumbs_up, thumbs_down, user_thumb_up FROM total_thumbs($1, $2)",
      [pageId, userId]
    );
    return rows[0];
  },

  async setThumb(pageId, userId, thumbUp) {
    const {
      rows
    } = await client.query(
      "INSERT INTO thumbs_up(page_id, github_user, thumb_up) VALUES($1, $2, $3)",
      [pageId, userId, thumbUp]
    );
    return rows[0];
  },

  async deleteThumb(pageId, userId) {
    const {
      rows
    } = await client.query(
      "DELETE FROM thumbs_up WHERE page_id = $1 AND github_user = $2",
      [pageId, userId]
    );
    return rows[0];
  },

  async truncateThumbs() {
    await client.query(
      'TRUNCATE TABLE thumbs RESTART IDENTITY'
    );
  }
};
