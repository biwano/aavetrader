import type { Bot } from "../supabase/bots.js";
import { Logger } from "../supabase/logs.js";
import CONTRACTS from "./contracts.js";
import type { TlxContract } from "./tlxContract.js";

const MAX_SLIPPAGE = 0.1;

export class Tlx {
  bot: Bot;
  logger: Logger;

  constructor(bot: Bot) {
    this.bot = bot;
    this.logger = new Logger(bot);
  }

  async mint(tlxContract: TlxContract, SUSDAmount: number) {
    await CONTRACTS.SUSD.ensureAllowance(tlxContract.contract.address);

    const exchangeRate = await tlxContract.getExchangeRate();

    const minAmountOut = (SUSDAmount / exchangeRate) * (1 - MAX_SLIPPAGE);

    await this.logger.debug(
      `Minting ${minAmountOut} ${tlxContract.name} with ${SUSDAmount} SUSD`,
    );
    const { result } = await tlxContract.mint(
      await Promise.all([
        await CONTRACTS.SUSD.toBigintBalanceMaxed(SUSDAmount),
        await tlxContract.toBigint(minAmountOut),
      ]),
    );
    await this.logger.debug(` => Minted ${result} ${tlxContract.name}`);
  }

  async redeem(tlxContract: TlxContract, leveragedTokenAmount: number) {
    const exchangeRate = await tlxContract.getExchangeRate();

    const minBaseAmountReceived =
      leveragedTokenAmount * exchangeRate * (1 - MAX_SLIPPAGE);

    await this.logger.debug(
      `Redeeming ${leveragedTokenAmount} ${tlxContract.name} for ${minBaseAmountReceived} SUSD`,
    );
    const { result } = await tlxContract.redeem(
      await Promise.all([
        tlxContract.toBigintBalanceMaxed(leveragedTokenAmount),
        CONTRACTS.SUSD.toBigint(minBaseAmountReceived),
      ]),
    );
    await this.logger.debug(` => Received ${result} SUSD`);
  }

  async drop(tlxContract: TlxContract) {
    const balance = await tlxContract.getBalance();
    if (balance > 0) {
      await this.redeem(tlxContract, balance);
    }
  }

  async adjust(tlxContract: TlxContract, direction: number) {
    const [tlxBalance, tlxExchangeRate, susdBalance] = await Promise.all([
      tlxContract.getBalance(),
      tlxContract.getExchangeRate(),
      CONTRACTS.SUSD.getBalance(),
    ]);
    const totalSUSDvalue = susdBalance + tlxBalance * tlxExchangeRate;

    const targetTlxBalance = (totalSUSDvalue * direction) / tlxExchangeRate;

    // Adjust differences only if  > 10%
    const diff = Math.abs(targetTlxBalance - tlxBalance) / tlxBalance;
    if (diff < 0.1) return;

    if (targetTlxBalance > tlxBalance) {
      await this.logger.info(`Adjusting Balance of ${tlxContract.name}`);
      const susdAmount = (targetTlxBalance - tlxBalance) * tlxExchangeRate;
      await this.mint(tlxContract, susdAmount);
    }

    if (targetTlxBalance < tlxBalance) {
      await this.logger.info(`Adjusting Balance of ${tlxContract.name}`);
      const tlxAmount = tlxBalance - targetTlxBalance;
      await this.redeem(tlxContract, tlxAmount);
    }
  }

  async trade() {
    const direction = this.bot.direction;
    if (direction >= 0) {
      await this.drop(CONTRACTS.BTC_SHORT);
      await this.adjust(CONTRACTS.BTC_LONG, direction);
    }
    if (direction <= 0) {
      await this.drop(CONTRACTS.BTC_LONG);
      await this.adjust(CONTRACTS.BTC_SHORT, -direction);
    }
  }
}
