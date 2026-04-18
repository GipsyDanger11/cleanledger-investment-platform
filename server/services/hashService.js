const crypto = require('crypto');

const computeHash = (data, previousHash) => {
  const payload = JSON.stringify({ ...data, previousHash });
  return crypto.createHash('sha256').update(payload).digest('hex');
};

const verifyChain = (entries) => {
  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1];
    const curr = entries[i];
    if (curr.previousHash !== prev.hash) {
      return { valid: false, brokenAt: curr.blockNumber };
    }
  }
  return { valid: true, brokenAt: null };
};

const nextBlockNumber = (lastBlock) => (lastBlock ?? 1000) + 1;

module.exports = { computeHash, verifyChain, nextBlockNumber };
