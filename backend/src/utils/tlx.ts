import { ethers } from "ethers";
import { erc20Abi, getContract, maxUint256 } from "viem";
import { getAlchemy } from "./alchemy.js";
import getBlockchain from "./blockchain.js";

const ABIS = {
  erc20: [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address _owner, address _spender) external returns (uint256)",
  ],
};
type A0xString = `0x${string}`;
const CONTRACTS: Record<string, A0xString> = {
  BTC_LONG: "0xc1422a15de4B7ED22EEedaEA2a4276De542C7a77",
  USDC: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  SUSD: "0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9",
  TLX: "0xc1422a15de4B7ED22EEedaEA2a4276De542C7a77",
};

export const ensureAllowance = async ({
  token,
  spender,
}: {
  token: A0xString;
  spender: A0xString;
}) => {
  const { client, account } = getBlockchain();
  const contract = getContract({
    address: token,
    abi: erc20Abi,
    client,
  });
  const allowance = await contract.read.allowance([account.address, spender]);

  if (!(allowance == maxUint256)) {
    await contract.write.approve([spender, maxUint256]);
  }
};

export const long = async () => {
  const { account } = getBlockchain();
  ensureAllowance({
    token: CONTRACTS.SUSD,
    spender: CONTRACTS.TLX,
  });

  maxUint256;
  return;
  const abi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
  ];
  /*
  const contract = new ethers.Contract(
    CONTRACTS.LONG,
    abi,
    account
  )*/
  const alchemy = getAlchemy();
  let iface = new ethers.utils.Interface(abi);
  const data = iface.encodeFunctionData("approve", [
    CONTRACTS.BTC_LONG,
    ethers.constants.MaxUint256,
  ]);

  const gas = await alchemy.core.estimateGas({
    to: CONTRACTS.BTC_LONG,
    data,
  });

  console.info(gas);

  /*
  const approve = await token.approve(
    routerAddress,
    ethers.constants.MaxUint256,
    {
      gasLimit,
      gasPrice: ethers.utils.parseUnits(gasPrice.toString(), 'gwei'),
    }
  );*/
};
