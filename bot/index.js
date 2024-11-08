import "dotenv/config";
import handleTweetScreenshot from "./modules/screenshot.js";
import { uploadImage, deleteImages } from "./modules/cdn.js";
import {
  mintToUser,
  getTransactionStatus,
  updateAssetCap,
} from "./modules/starknet.js";
import {
  getTweetDetails,
  postTweetToTimeline,
  twitterClient,
} from "./modules/twitter.js";
import {
  addTweetToTable,
  updateTweetTransactionHash,
  fetchPendingTweets,
  removeMultipleTweetsFromTable,
  checkIfTweetAlreadyExists,
  getTweetsWithTransactionHash,
  updatePostStatus,
  addLimitedTweetToTable,
  getMintLimitForTweetById,
  countOfMintedTweetById,
  checkIfTweetisLimited,
  getLimitedTweetById,
  updateLimitedTweetWithTransactionHash,
  removeMultipleLimitedTweets,
  getPendingLimitedTweet,
} from "./modules/operations.js";
import { sleep } from "./utils/index.js";

const BLACKLIST = process.env.BLACKLIST?.split(",");
const refetchInterval = process.env.TWITTER_REFETCH_INTERVAL;
let IS_RATE_LIMITED = false;
let RATE_LIMIT_RESET_TIME = null;
let last_processed_id = null;
let START_TIME = new Date(Date.now()).toISOString();
let IS_POSTING = false;
let IS_POSTING_RATE_LIMITED = false;
let IS_POSTING_RATE_LIMITED_RESET_TIME = null;
let IS_POSTING_ENABLED = process.env.ENABLE_POSTING;

const checkIfRateLimited = () => {
  if (IS_RATE_LIMITED) {
    const currentTime = new Date().getTime();
    if (currentTime > RATE_LIMIT_RESET_TIME) {
      IS_RATE_LIMITED = false;
    }
  }
};

const checkIfPostingRateLimited = () => {
  if (IS_POSTING_RATE_LIMITED) {
    const currentTime = new Date().getTime();
    if (currentTime > IS_POSTING_RATE_LIMITED_RESET_TIME + 10000) {
      IS_POSTING_RATE_LIMITED = false;
    }
  }
};

const checkForMentions = async () => {
  try {
    console.log("Fetch at ", new Date().toISOString());
    const usersMentions = await twitterClient.v2.userMentionTimeline(
      //The ID of the User to list Tweets
      process.env.BOT_USER_ID,
      {
        expansions: ["author_id", "referenced_tweets.id"],
        start_time: START_TIME,
        max_results: process.env.TWITTER_MAX_RESULTS_PER_REQUEST,
        since_id: last_processed_id ? last_processed_id : undefined,
      }
    );
    const finalTweets = [];

    if (!usersMentions || !usersMentions?.data?.data) {
      console.log("No data found since ", last_processed_id);
      return;
    }

    const getPaginationResults = await usersMentions.fetchLast(
      process.env.MAX_TWEETS_PER_CYCLE
    );

    if (!getPaginationResults || !getPaginationResults.data?.data) {
      console.log("Pagination data not found");
    }

    const tweets = getPaginationResults?.data?.data;
    const users = getPaginationResults?.includes?.users;

    tweets.forEach((tweet) => {
      const tweetId = tweet.id;
      const text = tweet.text;
      const tweetAuthor = tweet.author_id;
      const referencedTweets = tweet.referenced_tweets;
      const username = users.find((user) => user.id === tweetAuthor).username;
      const isUserBlacklisted = BLACKLIST?.includes(tweetAuthor) ?? false;

      // add the tweet to finalTweets if it is a quote or a reply
      referencedTweets?.forEach((referencedTweet) => {
        if (
          !isUserBlacklisted &&
          (referencedTweet.type === "quoted" ||
            referencedTweet.type === "replied_to")
        ) {
          finalTweets.push({
            tweetId,
            tweetAuthor,
            text,
            postId: referencedTweet.id,
            username,
            posted: false,
          });
        }
      });
    });

    last_processed_id = getPaginationResults.data.meta.newest_id;
    return finalTweets;
  } catch (error) {
    if (error?.rateLimit?.remaining < 1) {
      IS_RATE_LIMITED = true;
      RATE_LIMIT_RESET_TIME = error?.rateLimit?.reset;
      console.log("Rate limited. New cycle at - ", RATE_LIMIT_RESET_TIME);
    } else {
      console.log(error);
    }
  }
};

const postBotTweet = async () => {
  try {
    checkIfPostingRateLimited();
    if (IS_POSTING_RATE_LIMITED) {
      console.log(
        `Posting Rate limited. Skipping this cycle. Restarts at ${IS_POSTING_RATE_LIMITED_RESET_TIME}`
      );
      return;
    }
    IS_POSTING = true;
    console.log("Executing Post bot");
    const results = await getTweetsWithTransactionHash();
    if (results?.length === 0) return;
    // get valid transactions
    for (let i = 0; i < results?.length; i++) {
      const tweet = results[i];
      if (!tweet.transactionHash) continue;
      if (tweet.posted) continue;
      const transactionStatus = await getTransactionStatus(
        tweet?.transactionHash
      );
      if (transactionStatus?.execution_status === "SUCCEEDED") {
        const res = await postTweetToTimeline(tweet);
        if (res) {
          await updatePostStatus(tweet.id, true);
        }
      }
    }

    if (!results) {
      console.log("No tweets found for posting");
      return;
    }
  } catch (err) {
    console.log("Error in Post Tweet bot", err);
    if (err?.rateLimit?.remaining < 1) {
      IS_POSTING_RATE_LIMITED = true;
      IS_POSTING_RATE_LIMITED_RESET_TIME = err?.rateLimit?.reset;
      console.log(
        "Posting Rate limited. New cycle at - ",
        IS_POSTING_RATE_LIMITED_RESET_TIME
      );
      return;
    } else if (err?.data?.title === "Too Many Requests") {
      IS_POSTING_RATE_LIMITED = true;
      IS_POSTING_RATE_LIMITED_RESET_TIME =
        err?.headers["x-rate-limit-reset"] * 1000;

      console.log(
        "Too many requests for posting.Rate limited. New cycle at - ",
        IS_POSTING_RATE_LIMITED_RESET_TIME
      );
      return;
    }
  }
};

const executeTwitterBot = async () => {
  try {
    console.log("Executing Twitter bot");
    checkIfRateLimited();
    if (IS_RATE_LIMITED) {
      console.log(
        `Rate limited. Skipping this cycle. Restarts at ${RATE_LIMIT_RESET_TIME}`
      );
      return;
    }

    console.log(
      "Checking for mentions. Last processed id - ",
      last_processed_id
    );
    const eligibleTweets = await checkForMentions();
    const limitedTweets = eligibleTweets?.filter((tweet) => {
      // check if tweet has a limit in it's text
      const regex = /limit/;
      const checkIfLimitExists = regex.test(tweet.text);

      if (checkIfLimitExists) {
        // check the limit number which comes after the word "limit"
        let limit;
        tweet.text.split(" ").forEach((word, index) => {
          if (word === "limit") {
            limit = tweet.text.split(" ")[index + 1];
          }
        });

        // check if the limit is a number
        if (parseInt(limit)) {
          return true;
        }
      }
    });

    // add limited tweets to db
    const saveLimitedTweets = limitedTweets?.map(async (tweet) => {
      const tweetdetails = await getTweetDetails(tweet.postId);

      if (!tweetdetails) return null;
      let limit = 0;
      tweet.text.split(" ").forEach((word, index) => {
        if (word === "limit") {
          limit = tweet.text.split(" ")[index + 1];
        }
      });
      if (tweet?.tweetAuthor === tweetdetails?.includes?.users[0]?.id) {
        return await addLimitedTweetToTable({
          ...tweet,
          cap: parseInt(limit),
        });
      }

      return null;
    });

    if (saveLimitedTweets && saveLimitedTweets?.length > 0) {
      await Promise.all(saveLimitedTweets);
      console.log("Saved limited tweets Data to db at ", new Date().getTime());
    }

    // add tweets to db
    const saveData = eligibleTweets?.map(async (tweet) => {
      let mintedPostId = tweet.postId;
      // check if it is a limited edition tweet
      const isLimited = await checkIfTweetisLimited(tweet.postId);
      if (isLimited) {
        const limit = await getMintLimitForTweetById(tweet.postId);
        const count = await countOfMintedTweetById(tweet.postId);
        if (count >= limit) {
          return;
        }
      }

      // check if it is a tweet which directs a limited edition tweet
      const limitedTweetDetails = await getLimitedTweetById(tweet.postId);
      if (limitedTweetDetails?.length > 0) {
        const limit = limitedTweetDetails[0].cap;
        const count = await countOfMintedTweetById(
          limitedTweetDetails[0].postId
        );
        if (count >= limit) {
          return;
        }

        mintedPostId = limitedTweetDetails[0].postId;
      }

      const exists = await checkIfTweetAlreadyExists(tweet.tweetId);
      if (!exists) {
        return await addTweetToTable({ ...tweet, postId: mintedPostId });
      }
      return null;
    });

    // execute all promises
    if (saveData && saveData?.length > 0) {
      await Promise.all(saveData);
      console.log("Saved new tweets Data to db at ", new Date().getTime());
    }
    if (saveData?.length === 0 && saveLimitedTweets?.length === 0) {
      console.log("No eligible tweets found");
      return;
    }
    return;
  } catch (err) {
    console.log("Error in twitter bot", err);
  }
};

const executeDatabaseBot = async () => {
  try {
    console.log("Executing Database bot");
    const pendingTweets = await fetchPendingTweets();
    const pendingLimitedTweets = await getPendingLimitedTweet();
    if (pendingTweets?.length === 0) {
      console.log("No pending tweets found");
    }

    if (pendingLimitedTweets.length === 0) {
      console.log("No pending limited tweets found");
    }

    let deletedTweetIds = [];
    let deletedImageIds = [];

    let deletedLimitedTweetIds = [];

    for (let i = 0; i < pendingLimitedTweets?.length; i++) {
      const tweet = pendingLimitedTweets[i];
      const transactionHash = await updateAssetCap({
        imageId: tweet.postId,
        asset_cap: parseInt(tweet.cap),
      });

      if (!transactionHash) {
        console.log(`Error in setting limit image ${tweet.postId}`);
        deletedLimitedTweetIds.push(tweet.id);
        continue;
      }
      console.log(
        `Updated asset cap of imageId ${tweet.postId} with limit ${parseInt(
          tweet.cap
        )} with txn hash ${transactionHash}`
      );
      await updateLimitedTweetWithTransactionHash(tweet.id, transactionHash);
    }

    for (let i = 0; i < pendingTweets?.length; i++) {
      const tweet = pendingTweets[i];
      const imageBuffer = await handleTweetScreenshot(tweet.postId);
      await uploadImage(imageBuffer, tweet.postId);
      const receiver = tweet.address;
      const tweet_id = tweet.tweetId;
      const transactionHash = await mintToUser({
        imageId: tweet.postId,
        receiver,
        tweet_id,
      });

      if (!transactionHash) {
        console.log("Error in minting image");
        deletedTweetIds.push(tweet.id);
        deletedImageIds.push(tweet.postId);
        continue;
      }

      console.log(
        `Minting imageId ${tweet.postId}, receiver ${receiver} and tweetId ${tweet_id} with txn hash ${transactionHash}`
      );
      await updateTweetTransactionHash(tweet.id, transactionHash);
    }

    if (deletedTweetIds.length !== 0) {
      await removeMultipleTweetsFromTable(deletedTweetIds);
    }
    if (deletedImageIds.length !== 0) {
      await deleteImages(deletedImageIds);
    }

    if (deletedLimitedTweetIds.length !== 0) {
      await removeMultipleLimitedTweets(deletedLimitedTweetIds);
    }
  } catch (error) {
    console.log("Error in database bot", error);
  }
};

async function botRunner() {
  try {
    // check if bot is enabled
    if (process.env.ENABLE_TWITTER_BOT !== "true") {
      console.log("Twitter bot is disabled. Exiting.");
      return;
    }

    console.log("Twitter Bot started at ", new Date().toISOString());
    // start twitter handler
    setInterval(async () => {
      try {
        await executeTwitterBot();
      } catch (error) {
        console.log(error);
      }
    }, refetchInterval);

    // post tweets
    setInterval(async () => {
      try {
        if (!IS_POSTING_ENABLED || IS_POSTING) return;
        await postBotTweet();
        IS_POSTING = false;
      } catch (error) {
        console.log(error);
      }
    }, process.env.TWITTER_POST_INTERVAL);

    // start transaction executer
    console.log("Database Bot started at ", new Date().toISOString());
    while (true) {
      await executeDatabaseBot();
      await sleep(10000);
    }
  } catch (error) {
    console.log(error);
  }
}

botRunner();
