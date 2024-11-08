import "dotenv/config";
import { db } from "./db.js";
import { isNull, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { limitedtweetsTable, tweetsTable } from "./schema.js";

export async function createTweet(data) {
  try {
    return await db.insert(tweetsTable).values(data);
  } catch (err) {
    console.log("Error in create tweet", err);
    return null;
  }
}

export async function deleteTweet(id) {
  try {
    return await db.delete(tweetsTable).where(eq(tweetsTable.id, id));
  } catch (err) {
    console.log("Error in delete tweet", err);
    return null;
  }
}

export async function updateTweetTransaction(id, data) {
  try {
    return await db
      .update(tweetsTable)
      .set({ transactionHash: data })
      .where(eq(tweetsTable.id, id));
  } catch (err) {
    console.log("Error in update tweet", err);
    return null;
  }
}

export async function updateTweetPostStatus(id, data) {
  try {
    return await db
      .update(tweetsTable)
      .set({ posted: data })
      .where(eq(tweetsTable.id, id));
  } catch (err) {
    console.log("Error in update tweet", err);
    return null;
  }
}
export async function getPendingTweets() {
  try {
    return await db
      .select(tweetsTable)
      .from(tweetsTable)
      .orderBy(tweetsTable.createdAt)
      .where(isNull(tweetsTable.transactionHash));
  } catch (err) {
    console.log("Error in getting pending tweets", err);
    return null;
  }
}

export async function getTweetByTweetId(id) {
  try {
    return await db
      .select(tweetsTable)
      .from(tweetsTable)
      .where(eq(tweetsTable.tweetId, id));
  } catch (err) {
    console.log("Error in getting tweet by tweet id", err);
    return null;
  }
}

export async function multipleDelete(ids) {
  try {
    return await db.delete(tweetsTable).where(inArray(tweetsTable.id, ids));
  } catch (err) {
    console.log("Error in removing multiple tweets", err);
    return null;
  }
}

export async function getValidMintedTweets() {
  try {
    return await db
      .select(tweetsTable)
      .from(tweetsTable)
      .where(isNull(tweetsTable.posted));
  } catch (err) {
    console.log("Error in getting valid minted tweets", err);
    return null;
  }
}

export async function createLimitedTweet(data) {
  try {
    return await db.insert(limitedtweetsTable).values(data);
  } catch (err) {
    console.log("Error in create limited tweet", err);
    return null;
  }
}

export async function getLimitedTweetByTweetId(id) {
  try {
    return await db
      .select(limitedtweetsTable)
      .from(limitedtweetsTable)
      .where(eq(limitedtweetsTable.tweetId, id));
  } catch (err) {
    console.log("Error in getting tweet by tweet id", err);
    return null;
  }
}

export async function getMintLimitForTweet(id) {
  try {
    const res = await db
      .select({ cap: limitedtweetsTable.cap })
      .from(limitedtweetsTable)
      .orderBy(limitedtweetsTable.createdAt)
      .where(eq(limitedtweetsTable.postId, id));
    return res[res?.length - 1]?.cap;
  } catch (err) {
    console.log("Error in getting mint limit", err);
    return null;
  }
}

export async function getCountOfMintsForTweet(id) {
  try {
    const res = await db
      .select({ count: sql`count(*)` })
      .from(tweetsTable)
      .where(eq(tweetsTable.postId, id));
    return res[0]?.count;
  } catch (err) {
    console.log("Error in getting mint count", err);
    return null;
  }
}

export async function checkIfLimitedTweetExist(id) {
  try {
    return await db
      .select(limitedtweetsTable)
      .from(limitedtweetsTable)
      .where(eq(limitedtweetsTable.postId, id));
  } catch (err) {
    console.log("Error in getting limited tweet by tweet id", err);
    return null;
  }
}

export async function getLimitedTweets() {
  try {
    return await db
      .select(limitedtweetsTable)
      .from(limitedtweetsTable)
      .orderBy(limitedtweetsTable.createdAt)
      .where(isNull(limitedtweetsTable.transactionHash));
  } catch (err) {
    console.log("Error in getting pending tweets", err);
    return null;
  }
}

export async function updateLimitedTweetWithTransaction(id, data) {
  try {
    return await db
      .update(limitedtweetsTable)
      .set({ transactionHash: data })
      .where(eq(limitedtweetsTable.id, id));
  } catch (err) {
    console.log("Error in updating limited tweet", err);
    return null;
  }
}

export async function multipleLimitedTweetsDelete(ids) {
  try {
    return await db
      .delete(limitedtweetsTable)
      .where(inArray(limitedtweetsTable.id, ids));
  } catch (err) {
    console.log("Error in removing multiple limited tweets", err);
    return null;
  }
}
