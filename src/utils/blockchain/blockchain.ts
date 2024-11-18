import { Network } from "alchemy-sdk";
import {
  createPublicClient,
  createWalletClient,
  erc20Abi,
  getContract,
  http,
  publicActions,
} from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { optimism } from "viem/chains";
import { ALCHEMY_KEY, MNEMONIC } from "../../config.js";
import { withCacheSync } from "../cache.js";
import { tlxAbi } from "./tlxAbi.js";

export type A0xString = `0x${string}`;

export const CONTRACTS_ADDRESSES: Record<string, A0xString> = {
  BTC_LONG: "0x8efd20F6313eB0bc61908b3eB95368BE442A149d",
  BTC_SHORT: "0x5535968f5Cb5C2d69D36948e1e2801a8cC41d980",
  USDC: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  SUSD: "0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9",
};

const getBlockchain = () => {
  if (!MNEMONIC) throw "No wallet mnemonic";
  if (!ALCHEMY_KEY) throw "No ALCHEMY_KEY";

  // Account
  const account = mnemonicToAccount(MNEMONIC);

  // Alchemy URL
  const API_URL = `https://${Network.OPT_MAINNET}.g.alchemy.com/v2/${ALCHEMY_KEY}`;

  // Wallet client
  const client = createWalletClient({
    account,
    chain: optimism,
    transport: http(API_URL),
  }).extend(publicActions);

  // Public client
  const publicClient = createPublicClient({
    chain: optimism,
    transport: http(API_URL),
  });

  // Contracts
  const CONTRACTS = {
    SUSD: getContract({
      address: CONTRACTS_ADDRESSES.SUSD,
      abi: erc20Abi,
      client,
    }),
    BTC_LONG: getContract({
      address: CONTRACTS_ADDRESSES.BTC_LONG,
      abi: tlxAbi,
      client,
    }),
    BTC_SHORT: getContract({
      address: CONTRACTS_ADDRESSES.BTC_SHORT,
      abi: tlxAbi,
      client,
    }),
  };

  return {
    client,
    publicClient,
    account,
    CONTRACTS,
  };
};

const blockchain = () =>
  withCacheSync({
    key: "blockchain",
    func: getBlockchain,
  });

export type Blockchain = ReturnType<typeof getBlockchain>;
export type BlockchainContractsDict = Blockchain["CONTRACTS"];
export type BlockchainContract =
  BlockchainContractsDict[keyof BlockchainContractsDict];
export type BlockchainSUSDContract = BlockchainContractsDict["SUSD"];
export type BlockchainERC20Contract = BlockchainSUSDContract;
export type BlockchainTLXContract = BlockchainContractsDict[
  | "BTC_LONG"
  | "BTC_SHORT"];

export default blockchain;
