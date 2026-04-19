import "@nomicfoundation/hardhat-toolbox";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Search for .env in current folder or server folder
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", "server", ".env") });

const rawKey = process.env.PRIVATE_KEY || "";
// Only use the key if it looks like a valid private key (64 hex chars, with or without 0x)
const isValidKey = /^(0x)?[0-9a-fA-F]{64}$/.test(rawKey);

const PRIVATE_KEY = isValidKey 
  ? (rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`)
  : "0x" + "0".repeat(64); // Fallback to dummy key to allow compilation/loading

if (!isValidKey && process.env.NODE_ENV !== 'test') {
  console.warn("⚠️ PRIVATE_KEY not found or invalid in .env files. Deployment will fail.");
}

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    amoy: {
      url: process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology",
      accounts: [PRIVATE_KEY],
    },
    mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC || "https://rpc-mumbai.maticvigil.com",
      accounts: [PRIVATE_KEY],
    }
  }
};
