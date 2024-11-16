import { erc20Abi } from "viem";

export const tlxAbi = [
  ...erc20Abi,
  {
    type: "function",
    name: "exchangeRate",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "baseAmountIn_",
        type: "uint256",
      },
      {
        name: "minLeveragedTokenAmountOut_",
        type: "uint256",
      },
    ],
    outputs: [
      {
        type: "uint256",
      },
    ],
  },
  {
    type: "function",
    name: "redeem",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "leveragedTokenAmount_",
        type: "uint256",
      },
      {
        name: "minBaseAmountReceived_",
        type: "uint256",
      },
    ],
    outputs: [
      {
        type: "uint256",
      },
    ],
  },
] as const;
