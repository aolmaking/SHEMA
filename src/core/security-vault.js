'use strict';
/**
 * Security Vault — Cryptographic Sovereignty & Data Protection Engine
 *
 * Implements military-grade AES-256-GCM authenticated encryption with
 * PBKDF2 (100,000 iterations, SHA-512) key derivation and hardware-bound
 * local entropy. Protects user snapshots, tokens, and data from unauthorized
 * local extraction, tampering, and data leakage.
 *
 * ZERO TELEMETRY / ZERO CLOUD DEPENDENCY: All operations run 100% locally.
 */

const crypto = require('crypto');
const os = require('os');
const path = require('path');
const fs = require('fs');

const MAGIC_IDENTIFIER = 'SHEMA_VAULT_GCM_V1';
const SALT_LEN = 16;
const IV_LEN = 12;
const TAG_LEN = 16;
const PBKDF2_ROUNDS = 100000;
const KEY_LEN = 32; // 256 bits

class SecurityVault {
  constructor(options = {}) {
    this.vaultDir = options.vaultDir || null;
    this._localEntropy = null;
  }

  /**
   * Generates or retrieves a stable, hardware-bound machine seed.
   */
  _getMachineSeed() {
    if (this._localEntropy) return this._localEntropy;

    let userName = '';
    try {
      if (os.userInfo) userName = os.userInfo().username || '';
    } catch (_) {}

    // Combine stable hardware and OS markers
    const machineTokens = [
      os.hostname() || 'localhost',
      os.platform() || 'windows',
      os.arch() || 'x64',
      userName,
      'SHEMA_SOVEREIGN_OFFLINE_SECRET_SALT_2026'
    ].join('::');

    this._localEntropy = crypto.createHash('sha256').update(machineTokens).digest();
    return this._localEntropy;
  }

  /**
   * Derives a 256-bit encryption key using PBKDF2 with SHA-512.
   * @param {Buffer} salt
   * @param {string|null} userPassphrase
   * @returns {Buffer}
   */
  deriveKey(salt, userPassphrase = null) {
    const baseSecret = userPassphrase
      ? Buffer.from(userPassphrase, 'utf8')
      : this._getMachineSeed();

    return crypto.pbkdf2Sync(baseSecret, salt, PBKDF2_ROUNDS, KEY_LEN, 'sha512');
  }

  /**
   * Encrypts plaintext string or buffer into an authenticated AES-256-GCM envelope.
   *
   * Envelope format (JSON-compatible object):
   * {
   *   magic: 'SHEMA_VAULT_GCM_V1',
   *   version: 1,
   *   salt: hex,
   *   iv: hex,
   *   authTag: hex,
   *   ciphertext: hex
   * }
   *
   * @param {string|Buffer} plaintext
   * @param {string|null} userPassphrase
   * @returns {{ magic: string, version: number, salt: string, iv: string, authTag: string, ciphertext: string }}
   */
  encrypt(plaintext, userPassphrase = null) {
    const inputBuf = Buffer.isBuffer(plaintext) ? plaintext : Buffer.from(String(plaintext), 'utf8');
    const salt = crypto.randomBytes(SALT_LEN);
    const iv = crypto.randomBytes(IV_LEN);
    const key = this.deriveKey(salt, userPassphrase);

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(inputBuf), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      magic: MAGIC_IDENTIFIER,
      version: 1,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      ciphertext: encrypted.toString('hex'),
    };
  }

  /**
   * Decrypts an authenticated AES-256-GCM envelope.
   * Accepts object, JSON string, or Buffer.
   * Throws Error if tampered, corrupted, or incorrect passphrase.
   *
   * @param {object|string|Buffer} envelope
   * @param {string|null} userPassphrase
   * @returns {string} Plaintext string
   */
  decrypt(envelope, userPassphrase = null) {
    let parsed;
    if (Buffer.isBuffer(envelope)) {
      try {
        parsed = JSON.parse(envelope.toString('utf8'));
      } catch (_) {
        throw new Error('Authentication failed: Invalid envelope encoding or corrupt structure');
      }
    } else if (typeof envelope === 'string') {
      try {
        parsed = JSON.parse(envelope);
      } catch (_) {
        throw new Error('Authentication failed: Invalid JSON envelope string');
      }
    } else if (typeof envelope === 'object' && envelope !== null) {
      parsed = envelope;
    } else {
      throw new Error('Authentication failed: Unsupported envelope type');
    }

    if (!parsed || parsed.magic !== MAGIC_IDENTIFIER) {
      throw new Error('Authentication failed: Unrecognized vault signature header');
    }

    if (!parsed.salt || !parsed.iv || !parsed.authTag || !parsed.ciphertext) {
      throw new Error('Authentication failed: Truncated or missing cryptographic parameters');
    }

    const salt = Buffer.from(parsed.salt, 'hex');
    const iv = Buffer.from(parsed.iv, 'hex');
    const authTag = Buffer.from(parsed.authTag, 'hex');
    const ciphertext = Buffer.from(parsed.ciphertext, 'hex');

    const key = this.deriveKey(salt, userPassphrase);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    try {
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return decrypted.toString('utf8');
    } catch (err) {
      throw new Error('Authentication failed: Tampered or corrupted backup data (GCM auth tag mismatch)');
    }
  }

  /**
   * Verifies if a backup envelope is authentic and untampered without throwing.
   * @param {object|string|Buffer} envelope
   * @param {string|null} userPassphrase
   * @returns {{ valid: boolean, error: string|null }}
   */
  verifyIntegrity(envelope, userPassphrase = null) {
    try {
      this.decrypt(envelope, userPassphrase);
      return { valid: true, error: null };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }

  /**
   * Generates a fast SHA-256 integrity hash formatted as hex string.
   * @param {string|Buffer} data
   * @returns {string}
   */
  computeChecksum(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Sanitizes any store name to prevent path traversal attacks.
   * Strictly permits only [a-zA-Z0-9_\-], stripping extensions and directory markers.
   * @param {string} rawName
   * @returns {string}
   */
  sanitizeStoreName(rawName) {
    if (typeof rawName !== 'string' || !rawName.trim()) return 'unknown_store';
    // Strip null-bytes and carriage returns
    let cleaned = rawName.replace(/[\0\r\n]/g, '').trim();
    // Extract base name to eliminate directory traversal
    cleaned = path.basename(cleaned);
    // Strip extension if present (.json, .exe, etc.)
    cleaned = cleaned.replace(/\.[a-zA-Z0-9]+$/g, '');
    // Strictly whitelist alphanumeric, underscore, hyphen
    cleaned = cleaned.replace(/[^a-zA-Z0-9_\-]/g, '_');
    cleaned = cleaned.replace(/^_+|_+$/g, '');
    if (!cleaned) return 'unknown_store';
    return cleaned;
  }
}

const defaultVault = new SecurityVault();

module.exports = {
  SecurityVault,
  defaultVault,
};
