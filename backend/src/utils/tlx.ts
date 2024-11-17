import { maxUint256 } from "viem";
import blockchain, {
  type A0xString,
  type ERC20Contract,
  type TLXContract,
} from "./blockchain.js";

const MAX_SLIPPAGE = 0.1;

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

export const mint = async (tlxContract: TLXContract, SUSDAmount: number) => {
  const {
    CONTRACTS,
    toBigint,
    writeContract,
    getExchangeRate,
    toBigintBalanceMaxed,
  } = blockchain();
  await ensureAllowance({
    contract: CONTRACTS.SUSD,
    spender: tlxContract.address,
  });

  const exchangeRate = await getExchangeRate(tlxContract);

  const minAmountOut = (SUSDAmount / exchangeRate) * (1 - MAX_SLIPPAGE);

  console.info(`Minting ${tlxContract.address} with ${SUSDAmount} SUSD`);
  const { result } = await writeContract(
    tlxContract,
    "mint",
    await Promise.all([
      toBigintBalanceMaxed(CONTRACTS.SUSD, SUSDAmount),
      toBigint(tlxContract, minAmountOut),
    ]),
  );
  console.info(` => Minted ${result} ${tlxContract.address}`);
};

export const redeem = async (
  tlxContract: TLXContract,
  leveragedTokenAmount: number,
) => {
  const {
    CONTRACTS,
    toBigint,
    writeContract,
    getExchangeRate,
    toBigintBalanceMaxed,
  } = blockchain();

  const exchangeRate = await getExchangeRate(tlxContract);

  const minBaseAmountReceived =
    leveragedTokenAmount * exchangeRate * (1 - MAX_SLIPPAGE);

  console.info(`Redeeming ${leveragedTokenAmount} of ${tlxContract.address} `);
  const { result } = await writeContract(
    tlxContract,
    "redeem",
    await Promise.all([
      toBigintBalanceMaxed(tlxContract, leveragedTokenAmount),
      toBigint(CONTRACTS.SUSD, minBaseAmountReceived),
    ]),
  );
  console.info(` => Received ${result} SUSD`);
};

export const drop = async (tlxContract: TLXContract) => {
  const { getBalance } = blockchain();
  const balance = await getBalance(tlxContract);
  if (balance > 0) {
    console.info(`Droping ${tlxContract.address}`);
    await redeem(tlxContract, balance);
  }
};

export const adjust = async (tlxContract: TLXContract, direction: number) => {
  const { CONTRACTS, getExchangeRate, getBalance } = blockchain();

  const [tlxBalance, tlxExchangeRate, susdBalance] = await Promise.all([
    getBalance(tlxContract),
    getExchangeRate(tlxContract),
    getBalance(CONTRACTS.SUSD),
  ]);
  const totalSUSDvalue = susdBalance + tlxBalance * tlxExchangeRate;

  const targetTlxBalance = (totalSUSDvalue * direction) / tlxExchangeRate;

  // Adjust differences > 10%
  const diff = Math.abs(targetTlxBalance - tlxBalance) / tlxBalance;
  if (diff < 0.1) return;

  if (targetTlxBalance > tlxBalance) {
    console.info(`Adjusting Balance of ${tlxContract.address}`);
    const susdAmount = (targetTlxBalance - tlxBalance) * tlxExchangeRate;
    await mint(tlxContract, susdAmount);
  }

  if (targetTlxBalance < tlxBalance) {
    console.info(`Adjusting Balance of ${tlxContract.address}`);
    const tlxAmount = tlxBalance - targetTlxBalance;
    await redeem(tlxContract, tlxAmount);
  }
};

export const trade = async (direction: number) => {
  const { CONTRACTS } = blockchain();

  if (direction >= 0) {
    await drop(CONTRACTS.BTC_SHORT);
    await adjust(CONTRACTS.BTC_LONG, direction);
  }
  if (direction <= 0) {
    await drop(CONTRACTS.BTC_LONG);
    await adjust(CONTRACTS.BTC_SHORT, -direction);
  }
};
