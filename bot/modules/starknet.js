import "dotenv/config";

import { Provider, Contract, Account, cairo, CallData } from "starknet";
//initialize Provider
const provider = new Provider({
  nodeUrl: process.env.RPC_URL,
});

// setup the contract
const { abi: myAbi } = await provider.getClassAt(process.env.TOKEN_CONTRACT);
const tokenContract = new Contract(myAbi, process.env.TOKEN_CONTRACT, provider);

// setup account
// connect your account. To adapt to your own account:
const privateKey = process.env.ACCOUNT_PRIVATE_KEY;
const accountAddress = process.env.ACCOUNT_ADDRESS;

const account = new Account(provider, accountAddress, privateKey, "1");

// connect account and contract
tokenContract.connect(account);
// const maxFee = "0x2386f26fc10000"; // 0.0002 ETH

const getTransactionStatus = async (txHash) => {
  try {
    if (!txHash) return null;
    const result = await provider.getTransactionStatus(txHash);
    return result;
  } catch (error) {
    console.log("Error getting transaction status", error);
    return null;
  }
};

const mintToUser = async (calldata) => {
  try {
    const result = await account.execute(
      {
        contractAddress: process.env.TOKEN_CONTRACT,
        entrypoint: "admin_mint",
        calldata: CallData.compile({
          token_id: cairo.uint256(calldata.imageId),
          receiver: calldata.receiver,
          tweet_id: cairo.uint256(calldata.tweet_id),
        }),
      }
      // {
      //   maxFee: 501219271814058,
      // }
    );

    await provider.waitForTransaction(result.transaction_hash);
    return result.transaction_hash;
  } catch (error) {
    console.log("Error executing starknet transaction for mint", error);
    return null;
  }
};

const getAddressFromDomain = async (domainName) => {
  try {
    const res = await provider.getAddressFromStarkName(domainName);
    return res;
  } catch (err) {
    console.log(`Error fetching address for domain ${domainName}`);
    return null;
  }
};

const updateAssetCap = async (calldata) => {
  try {
    const result = await account.execute(
      {
        contractAddress: process.env.TOKEN_CONTRACT,
        entrypoint: "set_asset_cap",
        calldata: CallData.compile({
          token_id: cairo.uint256(calldata.imageId),
          asset_cap: cairo.uint256(calldata.asset_cap),
        }),
      }
      // {
      //   maxFee: 501219271814058,
      // }
    );

    await provider.waitForTransaction(result.transaction_hash);
    return result.transaction_hash;
  } catch (error) {
    console.log("Error executing starknet transaction for asset cap", error);
    return null;
  }
};

export {
  mintToUser,
  getTransactionStatus,
  getAddressFromDomain,
  updateAssetCap,
};
