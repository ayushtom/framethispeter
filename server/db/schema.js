const { pgTable, integer, text, timestamp } = require("drizzle-orm/pg-core");

const limitedtweetsTable = pgTable("limited_tweets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: timestamp("created_at").notNull(),
  tweetId: text("tweet_id").notNull(),
  postId: text("post_id").notNull(),
  cap: integer("cap").notNull(),
  transactionHash: text("transaction_hash"),
});

module.exports = {
  limitedtweetsTable,
};
