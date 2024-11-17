import blockchain from "./blockchain.js";
import { ERC20Contract } from "./erc20Contract.js";
import { TlxContract } from "./tlxContract.js";

const b = blockchain();

const CONTRACTS = {
  SUSD: new ERC20Contract(b.CONTRACTS.SUSD),
  BTC_LONG: new TlxContract(b.CONTRACTS.BTC_LONG),
  BTC_SHORT: new TlxContract(b.CONTRACTS.BTC_SHORT),
};

export default CONTRACTS;
