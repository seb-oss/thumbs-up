const { Pool } = require("pg");
const { dbHost, dbPassword, dbUser } = require("../../settings");
const { badRequest } = require("../errors");

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

async function selectThumbs(client, pageId, userId) {
  const { rows } = await client.query(
    "SELECT thumbs_up, thumbs_down, user_thumb_up FROM total_thumbs($1, $2)",
    [pageId, userId]
  );
  return rows[0];
}

async function setThumb(pageId, userId, thumbUp) {
  const client = await pool.connect();
  try {
    await client.query(
      "INSERT INTO thumbs_up(page_id, github_user, thumb_up) VALUES($1, $2, $3)",
      [pageId, userId, thumbUp]
    );
    return selectThumbs(client, pageId, userId);
  } finally {
    client.release();
  }
}

async function deleteThumb(pageId, userId) {
  const client = await pool.connect();
  try {
    await client.query(
      "DELETE FROM thumbs_up WHERE page_id = $1 AND github_user = $2",
      [pageId, userId]
    );
    return selectThumbs(client, pageId, userId);
  } finally {
    client.release();
  }
}

async function getTopPages(thumbType = "up", limit = 10) {
  const validTypes = [ "up", "down", "net" ];
  if (!validTypes.includes(thumbType)) {
    badRequest(`"${thumbType}" is not one of [${validTypes.join(", ")}]`);
  }
  const top_thumbs = "top_thumbs_" + thumbType;
  const { rows } = await pool.query(
    `SELECT page_id, thumbs_up, thumbs_down FROM ${top_thumbs}($1)`,
    [limit]
  );
  return rows;
}

module.exports = {
  getThumbs: selectThumbs.bind(null, pool),
  setThumb,
  deleteThumb,
  getTopPages
};
