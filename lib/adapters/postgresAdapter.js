const { Client } = require("pg");
const { dbHost, dbPassword, dbUser } = require("../../settings");
const client = new Client(
  `postgresql://${dbUser}:${dbPassword}@${dbHost}:5432/thumbs_up`
);
client.connect();

module.exports = {
  async getThumbs(pageUrl, userId) {
    const {
      rows
    } = await client.query(
      "SELECT thumbs_up, thumbs_down, user_thumb_up FROM total_thumbs($1, $2)",
      [pageUrl, userId]
    );
    return rows[0];
  },

  async setThumb(pageUrl, userId, thumbUp) {
    const {
      rows
    } = await client.query(
      "INSERT INTO thumbs_up(page_url, github_user, thumb_up) VALUES($1, $2, $3)",
      [pageUrl, userId, thumbUp]
    );
    return rows[0];
  },

  async deleteThumb(pageUrl, userId) {
    const {
      rows
    } = await client.query(
      "DELETE FROM thumbs_up WHERE page_url = $1 AND github_user = $2",
      [pageUrl, userId]
    );
    return rows[0];
  }
};
