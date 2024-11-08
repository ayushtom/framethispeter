import "dotenv/config";
import puppeteer from "puppeteer";
import sharp from "sharp";
import { uploadImage } from "./cdn.js";
import { sleep } from "../utils/index.js";

async function handleTweetScreenshot(tweetId) {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.goto(`${process.env.CLIENT_PAGE_URL}/${tweetId}`, {
      waitUntil: "networkidle2",
    });

    console.log("page loaded", `${process.env.CLIENT_PAGE_URL}/${tweetId}`);
    await page.setViewport({
      width: 2880,
      height: 1800,
      deviceScaleFactor: 2,
    });

    const fileElement = await page.waitForSelector(
      "#twitter-screenshot-instance"
    );

    await sleep(1000);

    const imageBuffer = await fileElement.screenshot();

    const res = await sharp(imageBuffer).resize(1000, 1000).png().toBuffer();

    await browser.close();
    return res;
  } catch (err) {
    console.log(err);
  }
}

export default handleTweetScreenshot;
