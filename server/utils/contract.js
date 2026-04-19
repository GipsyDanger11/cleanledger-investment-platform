const { ethers } = require('ethers');
require('dotenv').config();

let provider;
let wallet;
let contract;

try {
  provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
  
  if (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== 'your_private_key_here') {
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  } else {
    console.warn('WARNING: PRIVATE_KEY not configured. Blockchain writes will fail.');
  }

  const CONTRACT_ABI = [
    "function createStartup(string _id, string _name, string _sector, string _geography, string _description, uint256 _fundingTarget, uint256 _techPlanned, uint256 _marketingPlanned, uint256 _operationsPlanned, uint256 _legalPlanned) public",
    "function invest(string _investmentId, string _startupId, uint256 _amount, string _trancheTag, string _encryptedAmount) public payable",
    "function updateTrustScore(string _startupId, uint256 _newScore, string _riskLevel) public",
    "function getStartup(string _id) public view returns (tuple(string id, address founder, string name, string sector, string geography, string description, uint256 fundingTarget, uint256 totalRaised, uint256 backers, uint256 trustScore, string riskLevel, string verificationStatus, tuple(uint256 techPlanned, uint256 marketingPlanned, uint256 operationsPlanned, uint256 legalPlanned, uint256 techActual, uint256 marketingActual, uint256 operationsActual, uint256 legalActual) allocation, bool exists))",
    "function getMilestones(string _startupId) public view returns (tuple(string title, string description, uint256 tranchePct, string status, string proofUrl, uint256 voteDeadline, uint256 trustPenalty, bool redFlagged)[])",
    "function getInvestments(string _startupId) public view returns (tuple(string id, address investor, string startupId, uint256 amount, uint256 timestamp, string trancheTag, string trancheStatus, string encryptedAmount)[])"
  ];

  if (process.env.CONTRACT_ADDRESS && process.env.CONTRACT_ADDRESS.startsWith('0x')) {
    contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, wallet || provider);
  } else {
    console.warn('WARNING: CONTRACT_ADDRESS not configured. Blockchain features will be disabled.');
  }
} catch (err) {
  console.error('Blockchain initialization error:', err.message);
}

module.exports = { provider, wallet, contract };
