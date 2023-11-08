require('dotenv').config();

module.exports = {
  client: "mysql",
  connection: {
    host: process.env.DB_SERVER,
    database: process.env.DB_DNAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  }
}