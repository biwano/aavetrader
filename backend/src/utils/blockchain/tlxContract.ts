import { withCache } from "../cache.js";
import { type BlockchainTLXContract } from "./blockchain.js";
import { ERC20Contract } from "./erc20Contract.js";

export class TlxContract extends ERC20Contract {
  declare contract: BlockchainTLXContract;

  constructor(contract: BlockchainTLXContract) {
    super(contract);
  }

  async getValueinSUSD(susdContract: ERC20Contract) {
    const [balance, exchangeRate] = await Promise.all([
      this.getBalanceBigint(),
      this.getExchangeRate(),
    ]);
    const susdValue = (await this.toNumber(balance)) * exchangeRate;
    const susdValueBigInt = await susdContract.toBigint(susdValue);

    return susdValueBigInt;
  }

  getExchangeRate() {
    return withCache({
      ttlMs: 60 * 1000,
      key: `exchangeRate_${this.contract.address}`,
      func: async () => {
        const exchangeRate = this.toNumber(
          await this.contract.read.exchangeRate(),
        );
        return exchangeRate;
      },
    });
  }
}
