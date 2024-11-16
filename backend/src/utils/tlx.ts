import { maxUint256 } from "viem";
import blockchain, {
  type A0xString,
  type ERC20Contract,
  type TLXContract,
} from "./blockchain.js";

const MAX_SLIPPAGE = 0.001;

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
    await writeContract(contract, "approve", [spender, maxUint256]);
  }
};

export const getExchangeRate = async (tlxContract: TLXContract) => {
  const { toNumber } = blockchain();
  const exchangeRate = toNumber(
    tlxContract,
    await tlxContract.read.exchangeRate(),
  );
  return exchangeRate;
};

export const buy = async (
  tlxContract: TLXContract,
  SUSDAmountBigint: bigint,
) => {
  const { CONTRACTS, toNumber, toBigint, writeContract } = blockchain();
  await ensureAllowance({
    contract: CONTRACTS.SUSD,
    spender: tlxContract.address,
  });

  const exchangeRate = await getExchangeRate(tlxContract);

  console.info("exchange rate:", exchangeRate);

  const minAmountOut =
    ((await toNumber(CONTRACTS.SUSD, SUSDAmountBigint)) / exchangeRate) *
    (1 - MAX_SLIPPAGE);
  const minAmountOutBigInt = await toBigint(tlxContract, minAmountOut);

  await writeContract(tlxContract, "mint", [
    SUSDAmountBigint,
    minAmountOutBigInt,
  ]);
};

export const long = async () => {
  const { CONTRACTS, getBalance } = blockchain();

  /*
  const susdBalance = await getBalance(CONTRACTS.SUSD);
  console.info("susdBalance", susdBalance);
  */

  await buy(CONTRACTS.BTC_LONG, 106153426232091494n);

  const input = 106153426232091494;
};
