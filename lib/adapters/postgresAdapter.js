const { Pool } = require("pg");
const { dbHost, dbPassword, dbUser } = require("../../settings");

const pool = new Pool({
  user: dbUser,
  password: dbPassword,
  host: dbHost,
  database: 'thumbs_up',
  port: 5432,
  query_timeout: 10000 // milliseconds
});

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle postgres client', err);
});

async function getThumbs(pageId, userId) {
  const { rows } = await pool.query(
    "SELECT thumbs_up, thumbs_down, user_thumb_up FROM total_thumbs($1, $2)",
    [pageId, userId]
  );
  return rows[0];
}

async function setThumb(pageId, userId, thumbUp) {
  const { rows } = await pool.query(
    "INSERT INTO thumbs_up(page_id, github_user, thumb_up) VALUES($1, $2, $3)",
    [pageId, userId, thumbUp]
  );
  return rows[0];
}

async function deleteThumb(pageId, userId) {
  const { rows } = await pool.query(
    "DELETE FROM thumbs_up WHERE page_id = $1 AND github_user = $2",
    [pageId, userId]
  );
  return rows[0];
}

module.exports = {
  getThumbs,
  setThumb,
  deleteThumb
};
