'use strict';

/**
 * ==================================================================== *
 * COMPREHENSIVE SECURITY, PENETRATION & AUTO-RECOVERY TEST SUITE
 * ==================================================================== *
 * 
 * Verifies:
 * 1. Zero Data Leakage: Backups, credentials, and vaults never tracked by Git.
 * 2. Self-Healing Auto-Recovery: Corrupted, 0-byte, and deleted store recovery.
 * 3. Tamper Resistance: AES-256-GCM AuthTag and HMAC signature validation.
 * 4. Path Traversal & Injection Penetration Test: Rejection of ../ and malicious paths.
 * 5. Crash & Sudden Power-Loss Simulation: Atomic writes and snapshot safety.
 * 6. Export/Import Password-Protected Sovereign Vault Archiving.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const { Store } = require('../src/core/store');
const { BackupManager, defaultBackupManager } = require('../src/core/backup-manager');
const { SecurityVault, defaultVault } = require('../src/core/security-vault');
const paths = require('../src/core/paths');

console.log('========================================================');
console.log('🛡️  TESTING SOVEREIGN BACKUP, SECURITY & AUTO-RECOVERY');
console.log('========================================================\n');

const testDir = path.join(__dirname, '../scratch/test-security-vault-' + Date.now());
fs.mkdirSync(testDir, { recursive: true });

const testBackupDir = path.join(testDir, 'backups');
fs.mkdirSync(testBackupDir, { recursive: true });

const vault = new SecurityVault({ vaultDir: testBackupDir });
const backupManager = new BackupManager({ backupDir: testBackupDir, vault });

try {
  // ------------------------------------------------------------------
  // 1. Zero Data Leakage & Git Privacy Verification
  // ------------------------------------------------------------------
  console.log('--- 1. Testing Zero-Leakage & Git Protection (.gitignore) ---');
  const gitignorePath = path.join(__dirname, '../.gitignore');
  const gitignore = fs.readFileSync(gitignorePath, 'utf8');

  assert.ok(gitignore.includes('backups/'), '.gitignore must forbid backups/');
  assert.ok(gitignore.includes('.backups/'), '.gitignore must forbid .backups/');
  assert.ok(gitignore.includes('*.shemabak'), '.gitignore must forbid *.shemabak');
  assert.ok(gitignore.includes('*.vault'), '.gitignore must forbid *.vault');
  assert.ok(gitignore.includes('userData/'), '.gitignore must forbid userData/');
  assert.ok(gitignore.includes('vault.key') || gitignore.includes('.vault*'), '.gitignore must forbid vault keys');
  assert.ok(gitignore.includes('settings.json'), '.gitignore must forbid settings.json');
  assert.ok(gitignore.includes('todos.json'), '.gitignore must forbid todos.json');
  assert.ok(gitignore.includes('notes.json'), '.gitignore must forbid notes.json');
  assert.ok(gitignore.includes('habits.json'), '.gitignore must forbid habits.json');
  assert.ok(gitignore.includes('atlas.json'), '.gitignore must forbid atlas.json');

  // Verify git ls-files does not track any user data stores in git repository
  const trackedJson = execSync('git ls-files "*.json"', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).split(/\r?\n/);
  const forbiddenStores = ['settings.json', 'todos.json', 'notes.json', 'habits.json', 'atlas.json', 'calendar-events.json', 'emails.json'];
  for (const storeFile of forbiddenStores) {
    assert.ok(!trackedJson.includes(storeFile), `Git repository MUST NOT track user store file: ${storeFile}`);
  }

  // Verify git status does not track user files even if created in repo root
  const repoRoot = path.join(__dirname, '..');
  const dummyFiles = [
    path.join(repoRoot, 'test_leak.shemabak'),
    path.join(repoRoot, 'settings.json'),
    path.join(repoRoot, 'todos.json'),
    path.join(repoRoot, 'notes.json'),
    path.join(repoRoot, 'habits.json'),
    path.join(repoRoot, 'atlas.json'),
  ];
  try {
    for (const f of dummyFiles) {
      if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify({ testSensitive: true, secretKey: 'super_secret' }));
    }
    const status = execSync('git status --porcelain', { cwd: repoRoot, encoding: 'utf8' });
    for (const f of dummyFiles) {
      const base = path.basename(f);
      assert.ok(!status.includes(base), `Git MUST NOT track user file ${base} even if in root! Status:\n${status}`);
    }
    console.log('✅ Git zero-leakage verified: All user stores & backup archives are strictly ignored by Git.');
  } finally {
    for (const f of dummyFiles) {
      try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (_) {}
    }
  }

  // ------------------------------------------------------------------
  // 2. Path Traversal & Injection Penetration Test
  // ------------------------------------------------------------------
  console.log('\n--- 2. Penetration Testing: Path Traversal & Store Injection ---');
  const maliciousInputs = [
    '../../etc/passwd',
    '..\\..\\windows\\system32\\calc.exe',
    '../../../sensitive.json',
    'settings/../../secrets',
    'settings\0nullbyte.json',
    'user*dir:?name',
    '   ',
    null,
    undefined,
  ];

  for (const input of maliciousInputs) {
    const sanitized = vault.sanitizeStoreName(input);
    assert.ok(!sanitized.includes('..'), `Path traversal not blocked for ${input}: got ${sanitized}`);
    assert.ok(!sanitized.includes('/'), `Slash not blocked for ${input}: got ${sanitized}`);
    assert.ok(!sanitized.includes('\\'), `Backslash not blocked for ${input}: got ${sanitized}`);
    assert.ok(!sanitized.includes('\0'), `Null byte not blocked for ${input}: got ${sanitized}`);
    assert.ok(/^[a-zA-Z0-9_\-]+$/.test(sanitized), `Sanitized name contains illegal characters: ${sanitized}`);
  }
  console.log('✅ Path traversal penetration test passed: All malicious path inputs safely sanitized.');

  // ------------------------------------------------------------------
  // 3. Tamper Resistance & Authenticated Encryption (AES-256-GCM)
  // ------------------------------------------------------------------
  console.log('\n--- 3. Testing Tamper-Evident Encryption (AES-256-GCM) ---');
  const sampleData = { user: 'wayfinder_ahmed', havenLevel: 4, token: 'secret_classroom_token_xyz' };
  const encryptedPayload = vault.encrypt(JSON.stringify(sampleData));

  // Verify ciphertext is an authenticated envelope
  assert.strictEqual(encryptedPayload.magic, 'SHEMA_VAULT_GCM_V1');
  assert.ok(encryptedPayload.ciphertext, 'Ciphertext must exist');
  assert.ok(encryptedPayload.authTag, 'GCM authTag must exist');
  assert.ok(encryptedPayload.iv, 'GCM IV must exist');

  // Verify successful decryption
  const decrypted = JSON.parse(vault.decrypt(encryptedPayload));
  assert.deepStrictEqual(decrypted, sampleData, 'Decrypted data must match original');

  // Tamper Test: Modify 1 character in ciphertext
  const tamperedCipher = {
    ...encryptedPayload,
    ciphertext: encryptedPayload.ciphertext.slice(0, -2) + (encryptedPayload.ciphertext.slice(-2) === 'aa' ? 'bb' : 'aa')
  };
  assert.throws(() => {
    vault.decrypt(tamperedCipher);
  }, /Authentication failed|tampered|unsupported state/i, 'Tampered ciphertext MUST fail GCM verification');

  // Tamper Test: Modify 1 character in AuthTag
  const tamperedTag = {
    ...encryptedPayload,
    authTag: '00' + encryptedPayload.authTag.slice(2)
  };
  assert.throws(() => {
    vault.decrypt(tamperedTag);
  }, /Authentication failed|tampered|unsupported state/i, 'Tampered AuthTag MUST fail GCM verification');
  console.log('✅ Tamper-resistance verified: Any bit-level payload alteration is rejected by AES-256-GCM.');

  // ------------------------------------------------------------------
  // 4. Auto-Recovery: Corrupted Store Healing
  // ------------------------------------------------------------------
  console.log('\n--- 4. Testing Self-Healing Auto-Recovery on Corrupted File ---');
  const corruptTestFile = path.join(testDir, 'test-corrupt-settings.json');
  const initialSettings = {
    theme: 'notebook',
    language: 'ar',
    setupCompleted: true,
    classroom: { connected: true, courseId: 'math_101' },
    habits: { streakGoal: 21 },
  };

  // Step 1: Save initial settings
  fs.writeFileSync(corruptTestFile, JSON.stringify(initialSettings, null, 2), 'utf8');
  backupManager.createSnapshot(corruptTestFile, initialSettings, 'setup');

  // Verify snapshot exists
  const snaps = backupManager.listSnapshots(corruptTestFile);
  assert.ok(snaps.length > 0, 'Snapshot must be created in vault');

  // Step 2: Corrupt file with non-JSON binary junk
  fs.writeFileSync(corruptTestFile, '<<<CORRUPT_GARBAGE_PAYLOAD_NOT_JSON>>>', 'utf8');

  // Step 3: Instantiate Store and load (simulating app restart after corruption)
  // Hook the backupManager into store's autoRecover
  const recoveredData = backupManager.autoRecover(corruptTestFile);
  assert.ok(recoveredData, 'BackupManager must locate healthy snapshot');
  assert.strictEqual(recoveredData.theme, 'notebook');
  assert.strictEqual(recoveredData.setupCompleted, true);
  assert.strictEqual(recoveredData.classroom.courseId, 'math_101');

  // Verify store automatically repairs file on disk
  const autoStore = new Store(corruptTestFile, { theme: 'default', setupCompleted: false }, { backupManager });
  assert.strictEqual(autoStore.get('setupCompleted'), true, 'Store must self-heal using verified snapshot');
  assert.strictEqual(autoStore.get('theme'), 'notebook', 'Store must recover previous theme');
  console.log('✅ Corrupted file auto-recovery verified: Settings restored with 100% fidelity.');

  // ------------------------------------------------------------------
  // 5. Auto-Recovery: 0-Byte Truncation (Power Loss / Process Kill)
  // ------------------------------------------------------------------
  console.log('\n--- 5. Testing Auto-Recovery on 0-Byte Truncation (Crash Simulation) ---');
  const zeroByteFile = path.join(testDir, 'test-zero-byte.json');
  const importantState = { userId: 'wayfinder_77', xp: 450, havenGold: 120 };

  fs.writeFileSync(zeroByteFile, JSON.stringify(importantState, null, 2), 'utf8');
  backupManager.createSnapshot(zeroByteFile, importantState, 'milestone');

  // Simulate sudden crash truncating file to 0 bytes
  fs.writeFileSync(zeroByteFile, '');
  assert.strictEqual(fs.statSync(zeroByteFile).size, 0, 'File must be 0 bytes');

  // Load via Store
  const zeroStore = new Store(zeroByteFile, { userId: 'guest', xp: 0 }, { backupManager });
  assert.strictEqual(zeroStore.get('userId'), 'wayfinder_77', 'Store must heal from 0-byte state');
  assert.strictEqual(zeroStore.get('havenGold'), 120, 'Store must restore havenGold');
  assert.ok(fs.statSync(zeroByteFile).size > 0, 'File on disk must be restored to healthy non-zero state');
  console.log('✅ 0-Byte crash simulation passed: Store automatically healed and restored disk file.');

  // ------------------------------------------------------------------
  // 6. Auto-Recovery: Missing / Deleted File (ENOENT)
  // ------------------------------------------------------------------
  console.log('\n--- 6. Testing Auto-Recovery on Missing / Deleted File ---');
  const deletedFile = path.join(testDir, 'test-deleted.json');
  const deletedData = { note: 'Do not lose this note', pinned: true };

  fs.writeFileSync(deletedFile, JSON.stringify(deletedData, null, 2), 'utf8');
  backupManager.createSnapshot(deletedFile, deletedData, 'manual');

  // Delete file
  fs.unlinkSync(deletedFile);
  assert.ok(!fs.existsSync(deletedFile), 'File must be deleted');

  // Load via Store
  const deletedStore = new Store(deletedFile, { note: 'empty', pinned: false }, { backupManager });
  assert.strictEqual(deletedStore.get('note'), 'Do not lose this note', 'Store must recover deleted data from vault');
  assert.strictEqual(deletedStore.get('pinned'), true);
  console.log('✅ Deleted file auto-recovery passed: Data resurrected seamlessly from local vault.');

  // ------------------------------------------------------------------
  // 7. Export/Import Password-Protected Sovereign Vault Archive
  // ------------------------------------------------------------------
  console.log('\n--- 7. Testing Encrypted Archive Export & Import (PBKDF2 + AES-256-GCM) ---');
  const archiveFile = path.join(testDir, 'shema_sovereign_export.shemabak');
  const userPassword = 'CorrectWayfinderPassword!2026';

  const exportResult = backupManager.exportEncryptedArchive(userPassword, archiveFile);
  assert.strictEqual(exportResult.success, true);
  assert.ok(fs.existsSync(archiveFile), 'Archive file must exist');

  // Check that archive is not plain JSON
  const rawArchive = fs.readFileSync(archiveFile, 'utf8');
  const parsedArchive = JSON.parse(rawArchive);
  assert.strictEqual(parsedArchive.magic, 'SHEMA_VAULT_GCM_V1');
  assert.ok(parsedArchive.salt, 'Archive must have salt');
  assert.ok(parsedArchive.ciphertext, 'Archive must have ciphertext');
  assert.ok(!rawArchive.includes('secret_classroom_token_xyz'), 'Plaintext tokens must NOT appear in archive');

  // Attempt import with wrong password -> must throw
  assert.throws(() => {
    backupManager.importEncryptedArchive(archiveFile, 'WrongPassword123');
  }, /Authentication failed|Invalid password/i, 'Wrong password must fail authentication');

  // Successful import with correct password
  const importTargetDir = path.join(testDir, 'imported_data');
  fs.mkdirSync(importTargetDir, { recursive: true });
  const importResult = backupManager.importEncryptedArchive(archiveFile, userPassword, importTargetDir);
  assert.strictEqual(importResult.success, true);
  assert.ok(importResult.restoredCount > 0, 'Restored count must be > 0');
  console.log('✅ Encrypted archive export/import verified: Password authentication and payload protection 100%.');

  // ------------------------------------------------------------------
  // 8. Snapshot Pruning & Bounded Storage
  // ------------------------------------------------------------------
  console.log('\n--- 8. Testing Automatic Snapshot Pruning ---');
  const pruneFile = path.join(testDir, 'test-prune.json');
  for (let i = 0; i < 15; i++) {
    backupManager.createSnapshot(pruneFile, { count: i }, 'manual');
  }
  const pruneSnaps = backupManager.listSnapshots(pruneFile);
  assert.ok(pruneSnaps.length <= 10, `Snapshots must be pruned to max 10: found ${pruneSnaps.length}`);
  console.log('✅ Storage bounding verified: Old snapshots automatically pruned to prevent disk consumption.');

  // ------------------------------------------------------------------
  // 9. Comprehensive Full-Spectrum Multi-Store Resilience (Notes, Todos, Habits, Atlas, Settings)
  // ------------------------------------------------------------------
  console.log('\n--- 9. Testing Full-Spectrum Multi-Store Resilience (Notes, Todos, Habits, Atlas, Settings) ---');
  const multiDir = path.join(testDir, 'multi-stores');
  fs.mkdirSync(multiDir, { recursive: true });

  const coreStores = {
    notes: {
      file: path.join(multiDir, 'notes.json'),
      defaults: { items: [], activeId: null },
      sample: {
        items: [
          { id: 'note-01', title: 'ملاحظة بحثية', body: 'توثيق الخوارزميات والمعادلات', folder: 'work' },
          { id: 'note-02', title: 'أفكار التطوير', body: 'حفظ آمن بدون خوادم سحابية', folder: 'ideas' }
        ],
        activeId: 'note-01'
      }
    },
    todos: {
      file: path.join(multiDir, 'todos.json'),
      defaults: { items: [] },
      sample: {
        items: [
          { id: 'todo-01', text: 'إنهاء مراجعة الكود', done: false, priority: 'urgent' },
          { id: 'todo-02', text: 'قراءة 20 صفحة', done: true, priority: 'important', habitId: 'h-read' }
        ]
      }
    },
    habits: {
      file: path.join(multiDir, 'habits.json'),
      defaults: { habits: [], logs: {} },
      sample: {
        habits: [
          { id: 'h-read', title: 'قراءة يومية', type: 'number', target: 20, unit: 'صفحة' },
          { id: 'h-focus', title: 'تركيز عميق', type: 'percentage', target: 85, unit: '%' }
        ],
        logs: {
          '2026-11-28': { 'h-read': 20, 'h-focus': 90 }
        }
      }
    },
    atlas: {
      file: path.join(multiDir, 'atlas.json'),
      defaults: { wayfinder: {}, milestones: [] },
      sample: {
        wayfinder: { name: 'المسافر أحمد', xp: 1450, havenLevel: 3, livingMaterials: { aetherShards: 45 } },
        milestones: ['genesis_unlocked', 'habit_scholar', 'first_century_done']
      }
    },
    settings: {
      file: path.join(multiDir, 'settings.json'),
      defaults: { theme: 'default', language: 'ar', setupCompleted: false },
      sample: {
        theme: 'glass-aurora',
        language: 'ar',
        setupCompleted: true,
        email: { user: 'user@local.secure', pass: 'vault_app_password_secret' },
        classroom: { connected: true, courseId: 'cs-404' }
      }
    }
  };

  // Step A: Save all stores to disk and create encrypted snapshots in the vault
  for (const [storeKey, cfg] of Object.entries(coreStores)) {
    fs.writeFileSync(cfg.file, JSON.stringify(cfg.sample, null, 2), 'utf8');
    const snapPath = backupManager.createSnapshot(cfg.file, cfg.sample, 'setup', true);
    assert.ok(snapPath && fs.existsSync(snapPath), `Snapshot must be created for ${storeKey}`);
  }

  // Step B: Export an encrypted archive containing all 5 stores
  const multiArchiveFile = path.join(testDir, 'multi_sovereign_bundle.shemabak');
  const multiPassword = 'VaultStrongMasterPassword#2026';
  const customStoreMap = {};
  for (const [key, cfg] of Object.entries(coreStores)) {
    customStoreMap[key] = cfg.sample;
  }
  const multiExport = backupManager.exportEncryptedArchive(multiPassword, multiArchiveFile, customStoreMap);
  assert.strictEqual(multiExport.success, true);
  assert.ok(fs.existsSync(multiArchiveFile));

  // Step C: Corrupt all 5 store files with garbage non-JSON data
  for (const [storeKey, cfg] of Object.entries(coreStores)) {
    fs.writeFileSync(cfg.file, `<<<CORRUPT_RANDOM_GARBAGE_PAYLOAD_${storeKey.toUpperCase()}>>>`, 'utf8');
  }

  // Step D: Verify that autoRecover restores all 5 stores with 100% fidelity
  for (const [storeKey, cfg] of Object.entries(coreStores)) {
    const recovered = backupManager.autoRecover(cfg.file);
    assert.ok(recovered, `Auto-recover must succeed for ${storeKey}`);
    assert.deepStrictEqual(recovered, cfg.sample, `Recovered data for ${storeKey} must match original sample`);

    // Verify Store class self-heals disk file
    const storeInst = new Store(cfg.file, cfg.defaults, { backupManager });
    assert.deepStrictEqual(storeInst.data, cfg.sample, `Store instance must have 100% recovered state for ${storeKey}`);
    // Check file on disk was healed
    const diskParsed = JSON.parse(fs.readFileSync(cfg.file, 'utf8'));
    assert.deepStrictEqual(diskParsed, cfg.sample, `Disk file for ${storeKey} must be healed with 100% fidelity`);
  }
  console.log('✅ Full-Spectrum Self-Healing passed: Notes, Todos, Habits, Atlas & Settings healed with 100% fidelity.');

  // Step E: Import encrypted archive into a clean destination directory and verify all 5 stores are unpacked
  const multiUnpackDir = path.join(testDir, 'unpacked_multi');
  fs.mkdirSync(multiUnpackDir, { recursive: true });
  const unpackResult = backupManager.importEncryptedArchive(multiArchiveFile, multiPassword, multiUnpackDir);
  assert.strictEqual(unpackResult.success, true);
  assert.strictEqual(unpackResult.restoredCount >= 5, true);

  for (const [storeKey, cfg] of Object.entries(coreStores)) {
    const unpackedFile = path.join(multiUnpackDir, `${storeKey}.json`);
    assert.ok(fs.existsSync(unpackedFile), `Unpacked archive must include ${storeKey}.json`);
    const unpackedData = JSON.parse(fs.readFileSync(unpackedFile, 'utf8'));
    assert.deepStrictEqual(unpackedData, cfg.sample, `Unpacked ${storeKey}.json must match original sample`);
  }
  console.log('✅ Sovereign Encrypted Vault Archiving passed: Complete multi-store bundle verified.');

  console.log('\n========================================================');
  console.log('🎉 ALL SECURITY, PENETRATION & AUTO-RECOVERY TESTS PASSED (100%)');
  console.log('========================================================\n');

} finally {
  // Cleanup test scratch directory
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch (_) {}
}
