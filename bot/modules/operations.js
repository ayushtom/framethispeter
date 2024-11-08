import {
  createTweet,
  updateTweetTransaction,
  deleteTweet,
  getPendingTweets,
  multipleDelete,
  getTweetByTweetId,
  getValidMintedTweets,
  updateTweetPostStatus,
  getLimitedTweetByTweetId,
  getCountOfMintsForTweet,
  getMintLimitForTweet,
  checkIfLimitedTweetExist,
  createLimitedTweet,
  updateLimitedTweetWithTransaction,
  multipleLimitedTweetsDelete,
  getLimitedTweets,
} from "../db/queries.js";
import {
  checkForAddressFromTweet,
  checkDomainFromTweet,
} from "../utils/index.js";

export const addTweetToTable = async (tweet) => {
  try {
    const domainAddress = await checkDomainFromTweet(tweet);
    const hexAddress = checkForAddressFromTweet(tweet);

    const address = domainAddress ? domainAddress : hexAddress;

    if (!address) return;
    const data = {
      createdAt: new Date(),
      tweetId: tweet.tweetId,
      address,
      postId: tweet.postId,
      username: tweet.username,
    };
    const res = await createTweet(data);
    if (!res) return null;
    console.log("Add tweet to table with tweet id ", tweet.tweetId);
    return res;
  } catch (err) {
    console.log("Error in adding tweet to table", err);
    return null;
  }
};

export const checkIfTweetAlreadyExists = async (tweetId) => {
  try {
    const tweet = await getTweetByTweetId(tweetId);
    if (tweet.length === 0) return false;
    return true;
  } catch (err) {
    console.log("Error in fetching pending tweets", err);
    return null;
  }
};

export const fetchPendingTweets = async () => {
  try {
    const pendingTweets = await getPendingTweets();
    return pendingTweets;
  } catch (err) {
    console.log("Error in fetching pending tweets", err);
    return null;
  }
};

export const updateTweetTransactionHash = async (id, transactionHash) => {
  try {
    const res = await updateTweetTransaction(id, transactionHash);
    console.log("Updated tweet transaction hash of tweet id", id);
    return res;
  } catch (err) {
    console.log("Error in updating tweet transaction hash", err);
    return null;
  }
};

export const removeTweetFromTable = async (id) => {
  try {
    const res = await deleteTweet(id);
    console.log("Deleted tweet of id", id);
    return res;
  } catch (err) {
    console.log("Error in removing tweet from table", err);
    return null;
  }
};

export const getTweetsWithTransactionHash = async () => {
  try {
    const tweets = await getValidMintedTweets();
    return tweets;
  } catch (err) {
    console.log("Error in getting tweets with transaction hash", err);
    return null;
  }
};

export const removeMultipleTweetsFromTable = async (ids) => {
  try {
    const res = await multipleDelete(ids);
    console.log("Deleted tweet of ids", ids);
    return res;
  } catch (err) {
    console.log("Error in removing multiple tweets from table", err);
    return null;
  }
};

export const updatePostStatus = async (id, value) => {
  try {
    const res = await updateTweetPostStatus(id, value);
    console.log("Updated tweet post status of tweet id", id);
    return res;
  } catch (err) {
    console.log("Error in updating tweet post", err);
    return null;
  }
};

export const addLimitedTweetToTable = async (tweet) => {
  try {
    const data = {
      createdAt: new Date(),
      tweetId: tweet.tweetId,
      postId: tweet.postId,
      cap: tweet.cap,
    };
    const res = await createLimitedTweet(data);
    if (!res) return null;
    console.log("Add limited tweet to table with tweet id ", tweet.tweetId);
    return res;
  } catch (err) {
    console.log("Error in adding limited tweet to table", err);
    return null;
  }
};

export const getMintLimitForTweetById = async (tweetId) => {
  try {
    const tweet = await getMintLimitForTweet(tweetId);
    return tweet;
  } catch (err) {
    console.log("Error in fetching mint limit for tweets", err);
    return null;
  }
};

export const countOfMintedTweetById = async (tweetId) => {
  try {
    const tweet = await getCountOfMintsForTweet(tweetId);
    return tweet;
  } catch (err) {
    console.log("Error in fetching minted tweet count", err);
    return null;
  }
};

export const checkIfTweetisLimited = async (tweetId) => {
  try {
    const tweet = await checkIfLimitedTweetExist(tweetId);
    if (tweet.length === 0) return false;
    return true;
  } catch (err) {
    console.log("Error in fetching pending tweets", err);
    return null;
  }
};

export const getLimitedTweetById = async (tweetId) => {
  try {
    const tweet = await getLimitedTweetByTweetId(tweetId);
    return tweet;
  } catch (err) {
    console.log("Error in fetching pending tweets", err);
    return null;
  }
};

export const getPendingLimitedTweet = async () => {
  try {
    const tweets = await getLimitedTweets();
    return tweets;
  } catch (err) {
    console.log("Error in fetching pending tweets", err);
    return null;
  }
};

export const updateLimitedTweetWithTransactionHash = async (
  id,
  transactionHash
) => {
  try {
    const res = await updateLimitedTweetWithTransaction(id, transactionHash);
    console.log("Updated limited tweet transaction hash of tweet id", id);
    return res;
  } catch (err) {
    console.log("Error in fetching pending tweets", err);
    return null;
  }
};

export const removeMultipleLimitedTweets = async (ids) => {
  try {
    const res = await multipleLimitedTweetsDelete(ids);
    console.log("Deleted limited tweets of ids", ids);
    return res;
  } catch (err) {
    console.log("Error in removing multiple tweets from table", err);
    return null;
  }
};
