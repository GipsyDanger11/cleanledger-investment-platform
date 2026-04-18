/**
 * verifyChain.js — Walk every AuditEntry in block order and verify the hash chain.
 *
 * For each block:
 *   1. Re-compute: expectedHash = SHA256(blockNumber|type|amount|prevHash|_ts|metaJSON)
 *   2. Check:      entry.hash === expectedHash          (own-data integrity)
 *   3. Check:      entry.previousHash === prev.hash     (chain linkage)
 *
 * Returns { valid, brokenAt, total, checkedAt }
 */

const AuditEntry = require('../models/AuditEntry');
const { computeHash, GENESIS_HASH } = require('./blockchain');

async function verifyChain() {
  const entries = await AuditEntry.find({})
    .sort({ blockNumber: 1 })
    .lean();

  const total = entries.length;

  if (total === 0) {
    return { valid: true, brokenAt: null, total: 0, checkedAt: new Date().toISOString() };
  }

  let prevHash = GENESIS_HASH;

  for (const entry of entries) {
    // ── A. Linkage check: prevHash chain ──────────────────────────
    if (entry.previousHash !== prevHash) {
      return {
        valid:      false,
        brokenAt:   entry.blockNumber,
        brokenType: 'prevHash_mismatch',
        message:    `Block #${entry.blockNumber} prevHash mismatch. Chain broken.`,
        total,
        checkedAt:  new Date().toISOString(),
      };
    }

    // ── B. Own-data integrity: recompute hash ─────────────────────
    const meta       = { ...(entry.metadata || {}) };
    const isoTimestamp = meta._ts || '';
    // Remove the _ts we injected so metadata matches exactly what was hashed
    delete meta._ts;
    const metaForHash = { ...entry.metadata };   // use stored metadata (includes _ts)
    // We stored full metadata including _ts when hashing, so pass it unchanged:
    const expectedHash = computeHash(
      entry.blockNumber,
      entry.type,
      entry.amount,
      entry.previousHash,
      isoTimestamp,
      entry.metadata,   // full stored metadata object (includes _ts)
    );

    if (entry.hash !== expectedHash) {
      return {
        valid:      false,
        brokenAt:   entry.blockNumber,
        brokenType: 'hash_mismatch',
        message:    `Block #${entry.blockNumber} hash mismatch. Data may have been tampered.`,
        total,
        checkedAt:  new Date().toISOString(),
      };
    }

    prevHash = entry.hash;
  }

  return {
    valid:     true,
    brokenAt:  null,
    total,
    checkedAt: new Date().toISOString(),
  };
}

module.exports = { verifyChain };
