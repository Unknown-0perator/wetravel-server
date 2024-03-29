require('dotenv').config();

module.exports = {
  client: "mysql2",
  connection: {
    host: process.env.DB_SERVER,
    database: process.env.DB_DNAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations'
  }
}