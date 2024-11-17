import { formatUnits, maxUint256, parseUnits } from "viem";
import { withCache } from "../cache.js";
import { type A0xString, type BlockchainContract } from "./blockchain.js";
import { Contract } from "./contract.js";

export class ERC20Contract extends Contract {
  constructor(name: string, contract: BlockchainContract) {
    super(name, contract);
  }

  // Helpers
  getBalanceBigint() {
    return this.contract.read.balanceOf([this.account.address]);
  }

  getAllowance(spender: A0xString) {
    return this.contract.read.allowance([this.account.address, spender]);
  }

  async ensureAllowance(spender: A0xString) {
    const allowance = await this.getAllowance(spender);

    if (!(allowance == maxUint256)) {
      console.info(`Creating allowance for ${spender}`);
      await this.writeContract("approve", [spender, maxUint256]);
    }
  }

  async getBalance() {
    const balance = await this.getBalanceBigint();
    return this.toNumber(balance);
  }

  async getDecimals() {
    return withCache({
      key: `decimals_${this.contract.address}`,
      func: () => this.contract.read.decimals(),
    });
  }

  async toNumber(value: bigint) {
    const decimals = await this.getDecimals();
    return Number(formatUnits(value, decimals));
  }

  async toBigint(value: number | string): Promise<bigint> {
    const decimals = await this.getDecimals();
    const valueWithAdjustedPrecision = Number(value).toPrecision(decimals);
    const valueInDecimals = Number(valueWithAdjustedPrecision).toFixed(
      decimals,
    );
    return parseUnits(valueInDecimals, decimals);
  }

  toBigintBalanceMaxed = async (value: number): Promise<bigint> => {
    const [n, max] = await Promise.all([
      this.toBigint(value),
      this.getBalanceBigint(),
    ]);
    return n + 1000n > max ? max : n;
  };
}
