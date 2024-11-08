require("dotenv").config();
const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");

const connectionString = process.env.DATABASE_URL;

// Disable prefetch as it is not supported for "Transaction" pool mode
const dbclient = postgres(connectionString, { prepare: false });
const db = drizzle(dbclient);

module.exports = { db, dbclient };
