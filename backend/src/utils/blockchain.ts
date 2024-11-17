import { Network } from "alchemy-sdk";
import {
  createPublicClient,
  createWalletClient,
  erc20Abi,
  formatUnits,
  getContract,
  http,
  parseUnits,
  publicActions,
  type ContractFunctionArgs,
  type ContractFunctionName,
} from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { optimism } from "viem/chains";
import { withCache, withCacheSync } from "./cache.js";
import { tlxAbi } from "./tlxAbi.js";

export type A0xString = `0x${string}`;

export const CONTRACTS_ADDRESSES: Record<string, A0xString> = {
  BTC_LONG: "0x8efd20F6313eB0bc61908b3eB95368BE442A149d",
  BTC_SHORT: "0x940C53FD9E3184686C963e55A6e663b6922F3DD9",
  USDC: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  SUSD: "0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9",
};

const getBlockchain = () => {
  if (!process.env.MNEMONIC) throw "No wallet";

  // Account
  const account = mnemonicToAccount(process.env.MNEMONIC);

  // Alchemy URL
  const API_URL = `https://${Network.OPT_MAINNET}.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`;

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
  type Contract = (typeof CONTRACTS)[keyof typeof CONTRACTS];
  type TLXContract = (typeof CONTRACTS)["BTC_LONG" | "BTC_SHORT"];

  // Helpers
  const getBalance = async (contract: Contract) => {
    return contract.read.balanceOf([account.address]);
  };

  const getBalanceAsNumber = async (contract: Contract) => {
    const balance = await getBalance(contract);
    return toNumber(contract, balance);
  };

  const getExchangeRate = (tlxContract: TLXContract) =>
    withCache({
      ttlMs: 60 * 1000,
      key: `exchangeRate_${tlxContract.address}`,
      func: async () => {
        const exchangeRate = toNumber(
          tlxContract,
          await tlxContract.read.exchangeRate(),
        );
        return exchangeRate;
      },
    });

  const getValueinSUSD = async (tlxContract: TLXContract) => {
    const [balance, exchangeRate] = await Promise.all([
      getBalance(tlxContract),
      getExchangeRate(tlxContract),
    ]);
    const susdValue = (await toNumber(tlxContract, balance)) * exchangeRate;
    const susdValueBigInt = await toBigint(CONTRACTS.SUSD, susdValue);

    return susdValueBigInt;
  };

  const getDecimals = async (contract: Contract) => {
    return withCache({
      key: `decimals_${contract.address}`,
      func: () => contract.read.decimals(),
    });
  };

  const toNumber = async (contract: Contract, value: bigint) => {
    const decimals = await getDecimals(contract);
    return Number(formatUnits(value, decimals));
  };

  const toBigint = async (
    contract: Contract,
    value: number,
  ): Promise<bigint> => {
    const decimals = await getDecimals(contract);
    return parseUnits(value.toPrecision(decimals), decimals);
  };

  const writeContract = async <
    const T extends Contract,
    const abi extends T["abi"],
    functionName extends ContractFunctionName<abi, "nonpayable" | "payable">,
    const args extends ContractFunctionArgs<
      abi,
      "nonpayable" | "payable",
      functionName
    >,
  >(
    contract: T,
    functionName: functionName,
    args: args,
  ) => {
    console.debug(
      `Writing contract ${contract.address}.${functionName} ${args}`,
    );

    const { request, result } = await publicClient.simulateContract({
      address: contract.address,
      abi: contract.abi,
      // @ts-expect-error
      functionName,
      // @ts-expect-error
      args,
      account,
    });
    const hash = await client.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash });
    console.debug(`Done : ${hash} ${result}`);
    return { hash, result };
  };

  return {
    client,
    account,
    getBalance,
    getBalanceAsNumber,
    getValueinSUSD,
    getExchangeRate,
    getDecimals,
    toNumber,
    toBigint,
    writeContract,
    CONTRACTS,
  };
};

const blockchain = () =>
  withCacheSync({
    key: "blockchain",
    func: getBlockchain,
  });

type ContractsDict = ReturnType<typeof getBlockchain>["CONTRACTS"];
export type ERC20Contract = ContractsDict["SUSD"];
export type TLXContract = ContractsDict["BTC_LONG"];

export default blockchain;
