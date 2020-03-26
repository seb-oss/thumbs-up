module.exports = {
  githubUrl: process.env.githubUrl,
  client_id: process.env.client_id,
  client_secret: process.env.client_secret,
  state_password: process.env.state_password,
  dbHost: process.env.db_host,
  dbPassword: process.env.db_password,
  dbUser: process.env.db_user,
  mockGithub: false,
  e2eTests: {
    githubToken: "test"
    // Filling the "githubToken" field with your own token will let e2e tests use it to query github.
    // If this is the intention, make sure "mockGithub" is set to false
  }
};
