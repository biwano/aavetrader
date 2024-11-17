import { maxUint256 } from "viem";
import blockchain, {
  type A0xString,
  type ERC20Contract,
  type TLXContract,
} from "./blockchain.js";

const MAX_SLIPPAGE = 0.01;

export const ensureAllowance = async ({
  contract,
  spender,
}: {
  contract: ERC20Contract;
  spender: A0xString;
}) => {
  const { account, writeContract } = blockchain();
  const allowance = await contract.read.allowance([account.address, spender]);

  if (!(allowance == maxUint256)) {
    console.info(`Creating allowance for ${spender}`);
    await writeContract(contract, "approve", [spender, maxUint256]);
  }
};

export const mint = async (
  tlxContract: TLXContract,
  SUSDAmountBigint: bigint,
) => {
  const { CONTRACTS, toNumber, toBigint, writeContract, getExchangeRate } =
    blockchain();
  await ensureAllowance({
    contract: CONTRACTS.SUSD,
    spender: tlxContract.address,
  });

  const exchangeRate = await getExchangeRate(tlxContract);

  const minAmountOut =
    ((await toNumber(CONTRACTS.SUSD, SUSDAmountBigint)) / exchangeRate) *
    (1 - MAX_SLIPPAGE);
  const minAmountOutBigInt = await toBigint(tlxContract, minAmountOut);

  console.info(`Minting ${SUSDAmountBigint} of ${tlxContract.address} `);
  await writeContract(tlxContract, "mint", [
    SUSDAmountBigint,
    minAmountOutBigInt,
  ]);
};

export const redeem = async (
  tlxContract: TLXContract,
  leveragedTokenAmountBigint: bigint,
) => {
  const { CONTRACTS, toNumber, toBigint, writeContract, getExchangeRate } =
    blockchain();

  const exchangeRate = await getExchangeRate(tlxContract);

  const minBaseAmountReceived =
    (await toNumber(tlxContract, leveragedTokenAmountBigint)) *
    exchangeRate *
    (1 - MAX_SLIPPAGE);

  const minBaseAmountReceivedBigInt = await toBigint(
    CONTRACTS.SUSD,
    minBaseAmountReceived,
  );
  console.info(
    `Redeeming ${leveragedTokenAmountBigint} of ${tlxContract.address} `,
  );

  await writeContract(tlxContract, "redeem", [
    leveragedTokenAmountBigint,
    minBaseAmountReceivedBigInt,
  ]);
};

export const dropLong = async () => {
  const { CONTRACTS, getBalance } = blockchain();
  const BtcLongBalance = await getBalance(CONTRACTS.BTC_LONG);
  if (BtcLongBalance > 0) {
    console.info("Droping long");
    await redeem(CONTRACTS.BTC_LONG, BtcLongBalance);
  }
};

export const dropShort = async () => {
  const { CONTRACTS, getBalance } = blockchain();
  const BtcShortBalance = await getBalance(CONTRACTS.BTC_SHORT);
  if (BtcShortBalance > 0) {
    console.info("Droping short");
    await redeem(CONTRACTS.BTC_SHORT, BtcShortBalance);
  }
};

export const adjust = async (tlxContract: TLXContract, direction: number) => {
  const {
    CONTRACTS,
    getExchangeRate,
    getBalanceAsNumber,
    getBalance,
    toBigint,
    toNumber,
  } = blockchain();

  const [tlxBalanceBigint, tlxExchangeRate, susdBalance] = await Promise.all([
    getBalance(tlxContract),
    getExchangeRate(tlxContract),
    getBalanceAsNumber(CONTRACTS.SUSD),
  ]);

  const tlxBalance = await toNumber(tlxContract, tlxBalanceBigint);

  const targetTlxBalance =
    (susdBalance * direction) / (tlxExchangeRate * (1 - direction));

  const targetTlxBalancebigint = await toBigint(
    CONTRACTS.BTC_LONG,
    targetTlxBalance,
  );

  // Adjust differences > 10%
  const diff = Math.abs(targetTlxBalance - tlxBalance) / tlxBalance;
  if (diff < 0.1) return;

  if (targetTlxBalancebigint > tlxBalanceBigint) {
    redeem(CONTRACTS.BTC_LONG, targetTlxBalancebigint - tlxBalanceBigint);
  }

  if (targetTlxBalancebigint < tlxBalanceBigint) {
    mint(CONTRACTS.BTC_LONG, tlxBalanceBigint - targetTlxBalancebigint);
  }
};

export const trade = async (direction: number) => {
  const { CONTRACTS } = blockchain();

  if (direction >= 0) {
    await dropShort();
    adjust(CONTRACTS.BTC_LONG, direction);
  }
  if (direction <= 0) {
    direction = -direction;
    await dropLong();
    adjust(CONTRACTS.BTC_SHORT, -direction);
  }
};
