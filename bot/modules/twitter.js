import { TwitterApi } from "twitter-api-v2";
import { downloadImage } from "./cdn.js";

const twitterInit = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
const twitterClient = twitterInit.readOnly;

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_KEY_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const writer = client.readWrite;

const postTweetToTimeline = async (tweetInfo) => {
  const rotatedImage = await downloadImage(tweetInfo.postId);
  const imageBuffer = await rotatedImage.arrayBuffer();

  if (!rotatedImage) {
    console.log("Image not found");
    return;
  }

  // functionality to add retweet
  // await writer.v2.retweet(process.env.BOT_USER_ID, tweetInfo.tweetId);
  const mediaIds = await Promise.all([
    // from a buffer, for example obtained with an image modifier package
    writer.v1.uploadMedia(Buffer.from(imageBuffer), {
      mimeType: "png",
    }),
  ]);

  await writer.v1.createMediaMetadata(mediaIds[0], {
    alt_text: {
      text: `txn hash ${tweetInfo.transactionHash}`,
    },
  });

  await writer.v2.tweet({
    text: `@${tweetInfo.username} your minted tweet is here 🚀 \n\nlink - ${process.env.EXPLORER_BASE_URL}/${tweetInfo.transactionHash} \n\n#Starknet #framethispeter #NFT`,
    media: { media_ids: mediaIds },
    reply: {
      in_reply_to_tweet_id: tweetInfo.tweetId,
    },
  });

  return true;
};

export const getTweetDetails = async (id) => {
  const tweet = await client.v2.singleTweet(id, {
    expansions: ["referenced_tweets.id.author_id"],
  });
  return tweet;
};

// const getData = async () => {
//   // await postTweetToTimeline({
//   //   postId: "1797985467666940265",
//   //   tweetId: "1799605490839609724",
//   //   username: "chad_stark_user",
//   //   transactionHash:
//   //     "0x04620172a73cAa49fdf729e258c0CD7B1f6E4262B8a7e724877AF5F780806b40",
//   // });
//   await getTweetDetails("1799605490839609724");
// };

// getData();

export { twitterClient, postTweetToTimeline };
