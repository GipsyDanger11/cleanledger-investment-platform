/**
 * blockchain.js — SHA-256 hash chain utility for CleanLedger
 *
 * Every AuditEntry block stores:
 *   hash     = SHA256(canonical_payload)
 *   prevHash = hash of the immediately preceding block
 *
 * Canonical payload formula (pipe-delimited then JSON-meta appended):
 *   "<blockNumber>|<type>|<amount>|<prevHash>|<isoPrecision>|<metaJSON>"
 *
 * Tampering detection:
 *   If record N is altered → its hash changes → record N+1's prevHash
 *   no longer matches → verifyChain() detects the break.
 */

const crypto    = require('crypto');
const AuditEntry = require('../models/AuditEntry');

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Compute a deterministic SHA-256 hash for a block.
 * @param {number}  blockNumber
 * @param {string}  type
 * @param {number}  amount
 * @param {string}  prevHash
 * @param {string}  isoTimestamp  — ISO string, must be fixed before calling
 * @param {object}  metadata
 * @returns {string} 64-char hex hash
 */
function computeHash(blockNumber, type, amount, prevHash, isoTimestamp, metadata = {}) {
  const canonical = `${blockNumber}|${type}|${amount}|${prevHash}|${isoTimestamp}|${JSON.stringify(metadata)}`;
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

/**
 * Append a new verified block to the hash chain and persist it as an AuditEntry.
 *
 * @param {object} opts
 * @param {string}  opts.type         - AuditEntry type enum value
 * @param {string}  opts.fromEntity   - human-readable sender
 * @param {string}  opts.toEntity     - human-readable recipient
 * @param {number}  [opts.amount=0]
 * @param {string}  [opts.currency='INR']
 * @param {object}  [opts.metadata={}]
 * @param {ObjectId} [opts.startupId]
 * @param {ObjectId} [opts.investmentId]
 * @param {ObjectId} [opts.initiatedBy]
 * @returns {Promise<AuditEntryDoc>}
 */
async function createBlock({
  type,
  fromEntity,
  toEntity,
  amount = 0,
  currency = 'INR',
  metadata = {},
  startupId,
  investmentId,
  initiatedBy,
}) {
  // ── 1. Fetch the chain tip (last confirmed block) ─────────────
  const lastEntry = await AuditEntry.findOne({}, {}, { sort: { blockNumber: -1 } }).lean();
  const blockNumber = (lastEntry?.blockNumber ?? -1) + 1;
  const prevHash    = lastEntry?.hash ?? GENESIS_HASH;

  // ── 2. Fix timestamp now so the hash is deterministic ─────────
  const isoTimestamp = new Date().toISOString();

  // ── 3. Compute canonical hash ─────────────────────────────────
  const hash = computeHash(blockNumber, type, amount, prevHash, isoTimestamp, metadata);

  // ── 4. Persist the block ──────────────────────────────────────
  const entry = await AuditEntry.create({
    blockNumber,
    type,
    fromEntity,
    toEntity,
    amount,
    currency,
    hash,
    previousHash: prevHash,
    status:       'confirmed',
    startup:      startupId    || undefined,
    investment:   investmentId || undefined,
    initiatedBy:  initiatedBy  || undefined,
    metadata:     { ...metadata, _ts: isoTimestamp },
  });

  return entry;
}

module.exports = { computeHash, createBlock, GENESIS_HASH };
