import { ethers } from "ethers";
import * as path from "path";
import * as fs from "fs";

// Load the artifact dynamically so we don't have relative path issues when compiled to dist/
const artifactPath = path.resolve(__dirname, "../../contracts/artifacts/contracts/Greeter.sol/Greeter.json");
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

// Hardhat local node configuration
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Initialize Provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Initialize Wallet (Signer)
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Initialize Contract Instance (Connected to Wallet for Write access)
const greeterContract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, wallet);

export const blockchainService = {
  getGreeting: async (): Promise<string> => {
    // Read operations are free and instantaneous
    const greeting = await greeterContract.greet();
    return greeting;
  },

  setGreeting: async (newGreeting: string): Promise<string> => {
    // Write operations require signing a transaction and waiting for mining
    // The ethers.Contract automatically handles the nonce, gas estimation, and signing!
    const tx = await greeterContract.setGreeting(newGreeting, {
        value: 0n // Passing 0 ETH (as a BigInt) for the payable function tip
    });
    
    // Wait for the transaction to be mined (1 confirmation)
    const receipt = await tx.wait();
    
    if (receipt.status === 0) {
        throw new Error("Transaction failed on the blockchain");
    }
    
    return receipt.hash;
  }
};
