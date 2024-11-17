import blockchain from "./blockchain.js";
import { ERC20Contract } from "./erc20Contract.js";
import { TlxContract } from "./tlxContract.js";

const b = blockchain();

const CONTRACTS = {
  SUSD: new ERC20Contract("SUSD", b.CONTRACTS.SUSD),
  BTC_LONG: new TlxContract("BTC_LONG", b.CONTRACTS.BTC_LONG),
  BTC_SHORT: new TlxContract("BTC_SHORT", b.CONTRACTS.BTC_SHORT),
};

export default CONTRACTS;
