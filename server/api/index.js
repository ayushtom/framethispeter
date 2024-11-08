require("dotenv").config();
const express = require("express");
const app = express();
const { db } = require("../db/db");
const { limitedtweetsTable } = require("../db/schema");
const { eq } = require("drizzle-orm");

function hexToDecimal(hexString) {
  // Remove leading zeroes
  const trimmedHexString = hexString.replace(/^0+/, "");
  // Convert the hexadecimal string to a decimal number
  const decimalNumber = BigInt("0x" + trimmedHexString);
  return decimalNumber;
}

app.get("/uri", (req, res) => {
  // get params from req
  const { id } = req.query;

  const number = hexToDecimal(id).toString();

  if (!id) {
    return res.status(400).json({
      error: "id is required",
    });
  }

  const nft_uri = {
    name: `${number}`,
    description: `This is a tweet of ID - ${number} generated by a @framethispeter on Twitter`,
    image: `${process.env.CDN_BASE_URL}/${number}.png`,
  };

  // return json response
  res.status(200).json(nft_uri);
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is up and running",
  });
});

app.get("/checkLimitedEdition", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        error: "id is required",
      });
    }

    const tweet = await db
      .select(limitedtweetsTable)
      .from(limitedtweetsTable)
      .where(eq(limitedtweetsTable.postId, id));

    let result = false;
    if (tweet.length !== 0) result = true;
    res.status(200).json(result);
  } catch (err) {
    console.log("Error in getting limited tweet by tweet id", err);
    return null;
  }
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
