import { getAddressFromDomain } from "../modules/starknet.js";

export const checkForAddressFromTweet = (tweet) => {
  // check if the tweet text has a address of starknet
  const regex = /^(0x)?[0-9a-fA-F]{64}$/;

  // split words and check
  let wordIndex = 0;
  let currentAddress = null;
  const tweetText = tweet.text;
  const formattedText = tweetText.replace(/\n/g, " ");
  let numOfWords = formattedText.split(" ").length;
  while (wordIndex < numOfWords) {
    const word = formattedText.split(" ")[wordIndex];
    if (regex.test(word)) {
      currentAddress = word;
    }
    wordIndex++;
  }

  return currentAddress;
};

export const checkDomainFromTweet = async (tweet) => {
  const regex = /\.stark$/;

  // split words and check
  let wordIndex = 0;
  let currentAddress = null;
  const tweetText = tweet.text;
  const formattedText = tweetText.replace(/\n/g, " ");
  let numOfWords = formattedText.split(" ").length;
  while (wordIndex < numOfWords) {
    const word = formattedText.split(" ")[wordIndex];
    if (regex.test(word) && word !== ".stark") {
      currentAddress = await getAddressFromDomain(word?.toLowerCase());
    }
    wordIndex++;
  }
  return currentAddress;
};

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
