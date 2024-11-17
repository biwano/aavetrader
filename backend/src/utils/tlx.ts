import CONTRACTS from "./blockchain/contracts.js";
import type { TlxContract } from "./blockchain/tlxContract.js";

const MAX_SLIPPAGE = 0.1;

export const mint = async (tlxContract: TlxContract, SUSDAmount: number) => {
  await CONTRACTS.SUSD.ensureAllowance(tlxContract.contract.address);

  const exchangeRate = await tlxContract.getExchangeRate();

  const minAmountOut = (SUSDAmount / exchangeRate) * (1 - MAX_SLIPPAGE);

  console.debug(
    `Minting ${minAmountOut} ${tlxContract.name} with ${SUSDAmount} SUSD`,
  );
  const { result } = await tlxContract.mint(
    await Promise.all([
      await CONTRACTS.SUSD.toBigintBalanceMaxed(SUSDAmount),
      await tlxContract.toBigint(minAmountOut),
    ]),
  );
  console.debug(` => Minted ${result} ${tlxContract.name}`);
};

export const redeem = async (
  tlxContract: TlxContract,
  leveragedTokenAmount: number,
) => {
  const exchangeRate = await tlxContract.getExchangeRate();

  const minBaseAmountReceived =
    leveragedTokenAmount * exchangeRate * (1 - MAX_SLIPPAGE);

  console.debug(
    `Redeeming ${leveragedTokenAmount} ${tlxContract.name} for ${minBaseAmountReceived} SUSD`,
  );
  const { result } = await tlxContract.redeem(
    await Promise.all([
      tlxContract.toBigintBalanceMaxed(leveragedTokenAmount),
      CONTRACTS.SUSD.toBigint(minBaseAmountReceived),
    ]),
  );
  console.debug(` => Received ${result} SUSD`);
};

export const drop = async (tlxContract: TlxContract) => {
  const balance = await tlxContract.getBalance();
  if (balance > 0) {
    await redeem(tlxContract, balance);
  }
};

export const adjust = async (tlxContract: TlxContract, direction: number) => {
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
    console.info(`Adjusting Balance of ${tlxContract.name}`);
    const susdAmount = (targetTlxBalance - tlxBalance) * tlxExchangeRate;
    await mint(tlxContract, susdAmount);
  }

  if (targetTlxBalance < tlxBalance) {
    console.info(`Adjusting Balance of ${tlxContract.name}`);
    const tlxAmount = tlxBalance - targetTlxBalance;
    await redeem(tlxContract, tlxAmount);
  }
};

export const trade = async (direction: number) => {
  if (direction >= 0) {
    await drop(CONTRACTS.BTC_SHORT);
    await adjust(CONTRACTS.BTC_LONG, direction);
  }
  if (direction <= 0) {
    await drop(CONTRACTS.BTC_LONG);
    await adjust(CONTRACTS.BTC_SHORT, -direction);
  }
};
