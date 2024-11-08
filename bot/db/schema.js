import {
  pgTable,
  integer,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const tweetsTable = pgTable("tweets_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: timestamp("created_at").notNull(),
  tweetId: text("tweet_id").notNull(),
  transactionHash: text("transaction_hash"),
  address: text("address").notNull(),
  postId: text("post_id").notNull(),
  username: text("username").notNull(),
  posted: boolean("posted"),
});

export const limitedtweetsTable = pgTable("limited_tweets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: timestamp("created_at").notNull(),
  tweetId: text("tweet_id").notNull(),
  postId: text("post_id").notNull(),
  cap: integer("cap").notNull(),
  transactionHash: text("transaction_hash"),
});
