import { type ContractFunctionArgs, type ContractFunctionName } from "viem";
import blockchain, {
  type Blockchain,
  type BlockchainContract,
} from "./blockchain.js";

export class Contract {
  contract: BlockchainContract;
  blockchain: Blockchain;
  name: string;

  constructor(name: string, contract: BlockchainContract) {
    this.name = name;
    this.contract = contract;
    this.blockchain = blockchain();
  }
  get client() {
    return this.blockchain.client;
  }
  get account() {
    return this.blockchain.account;
  }

  get publicClient() {
    return this.blockchain.publicClient;
  }

  writeContract = async <
    const T extends BlockchainContract,
    const abi extends T["abi"],
    functionName extends ContractFunctionName<abi, "nonpayable" | "payable">,
    const args extends ContractFunctionArgs<
      abi,
      "nonpayable" | "payable",
      functionName
    >,
  >(
    functionName: functionName,
    args: args,
  ) => {
    console.debug(
      `...Writing contract ${this.contract.address}.${functionName} ${args}`,
    );

    const { request, result } = await this.publicClient.simulateContract({
      address: this.contract.address,
      abi: this.contract.abi,
      // @ts-expect-error
      functionName,
      // @ts-expect-error
      args,
      account: this.account,
    });
    const hash = await this.client.writeContract(request);
    await this.publicClient.waitForTransactionReceipt({ hash });
    console.debug(`...Done : ${hash} ${result}`);
    return { hash, result };
  };
}
