const env = process.env;

const config = {
  db: { /* do not put password or any sensitive info here, done only for demo */
    host: env.DB_HOST || 'postgresql',
    port: env.DB_PORT || '5432',
    user: env.DB_USER || 'xrpsql',
    password: env.DB_PASSWORD || 'xrpsql',
    database: env.DB_NAME || 'xrpsql',
  },
  listPerPage: env.LIST_PER_PAGE || 10,
};

module.exports = config;
