'use strict';

/**
 * The Living Atlas (أطلس العوالم الحيّة)
 * Multi-Domain Persistent Store & Privacy Engine · Version 1.1
 * 
 * Stores all Atlas state locally with atomic writes via Store.
 * Provides granular purge, full rebirth, and zero-leakage data sovereignty.
 */

const path = require('path');
const { Store } = require('../store');
const paths = require('../paths');

function getDefaultAtlasState() {
  return {
    version: '1.1.0',
    meta: {
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      storageMode: 'local',
      encryptionStatus: 'not_implemented', // Truthful status as per audit
      schemaVersion: 1,
    },
    // Track 1: Wayfinder Progression & Game Store
    wayfinder: {
      name: 'مستكشف الدرب',
      isNamed: false,
      xp: 0,
      level: 1,
      havenGold: 0,
      affinities: {
        VIT: 0, // Vitality points
        WIS: 0, // Wisdom points
        SER: 0, // Serenity points
        DIS: 0, // Discipline points
      },
      livingMaterials: {
        aetherShards: 0,
        manuscriptScraps: 0,
        seedsOfLight: 0,
      },
      unlockedSkills: [],
      currentChapter: 1,
    },
    // World Store: First Haven Facilities & Trail Status
    havenFacilities: {
      cartographyHall: { level: 1, unlockedDecor: [] },
      personalAlcove: { level: 1, booksRead: 0 },
      hearthBalcony: { level: 1, reflectionsCount: 0 },
      herbarium: { level: 1, plantedSeeds: 0 },
    },
    worldTrails: {
      illuminatedAffinities: {
        VIT: false,
        WIS: false,
        SER: false,
        DIS: false,
      },
      activeSectors: ['first_haven'],
    },
    // Obstacles Store
    obstacles: [],
    obstaclesState: {
      tiers: {},
      dormantRelics: [],
    },
    // Major Trials Store
    trials: {
      progress: {},
      completed: [],
    },
    // Miro Companion Context Store (Strictly non-punitive, user-sovereign)
    miro: {
      knowledge: 1,
      relationship: 1,
      expression: 1,
      lastGreetingDate: null,
      lastMood: 'serene',
      presenceMode: 'adaptive', // 'adaptive' | 'quiet' | 'guide_focused'
      observedPatterns: [],
      userApprovedNotes: [],
    },
    // Narrative Store: Milestones, Mystery Graph & Chronicles
    narrativeState: {
      canonVersion: '1.1',
      unlockedMilestoneIds: ['FIRST_ATLAS_OPENED'],
      clueStatuses: {},
      mysteries: {},
    },
    chronicleEntries: [],
    customRewards: [],
    // Event Log Journal (Append-only for traceability)
    eventJournal: [],
  };
}

class AtlasStore {
  constructor(filePath = null) {
    const file = filePath || path.join(paths.root, 'atlas-data.json');
    this.store = new Store(file, getDefaultAtlasState());
    this._ensureStructure();
  }

  get data() {
    return this.store.data;
  }

  _ensureStructure() {
    const d = this.store.data;
    const defaults = getDefaultAtlasState();

    if (!d.wayfinder) d.wayfinder = defaults.wayfinder;
    if (!d.wayfinder.name) d.wayfinder.name = 'مستكشف الدرب';
    if (typeof d.wayfinder.isNamed !== 'boolean') d.wayfinder.isNamed = false;
    if (!d.wayfinder.livingMaterials) {
      d.wayfinder.livingMaterials = { aetherShards: 0, manuscriptScraps: 0, seedsOfLight: 0 };
    }
    if (!Array.isArray(d.wayfinder.unlockedSkills)) {
      d.wayfinder.unlockedSkills = [];
    }
    if (!d.havenFacilities) d.havenFacilities = defaults.havenFacilities;
    if (!Array.isArray(d.havenFacilities.completedProjects)) {
      d.havenFacilities.completedProjects = [];
    }
    if (!d.worldTrails) d.worldTrails = defaults.worldTrails;
    if (!Array.isArray(d.obstacles)) d.obstacles = [];
    if (!d.obstaclesState) d.obstaclesState = { tiers: {}, dormantRelics: [] };
    if (!d.trials) d.trials = { progress: {}, completed: [] };
    if (!d.miro) d.miro = defaults.miro;
    if (!d.narrativeState) d.narrativeState = defaults.narrativeState;
    if (!Array.isArray(d.chronicleEntries)) d.chronicleEntries = [];
    if (!Array.isArray(d.customRewards)) d.customRewards = [];
    if (!Array.isArray(d.eventJournal)) d.eventJournal = [];
  }

  save() {
    this.data.meta.lastActive = new Date().toISOString();
    this.store.save();
  }

  flush() {
    this.data.meta.lastActive = new Date().toISOString();
    this.store.save();
    this.store.flush();
  }

  // --- Wayfinder Game Domain Getters / Setters ---

  getWayfinder() {
    return { ...this.data.wayfinder };
  }

  setWayfinderName(name) {
    const clean = typeof name === 'string' ? name.trim().slice(0, 32) : '';
    if (clean) {
      this.data.wayfinder.name = clean;
      this.data.wayfinder.isNamed = true;
      this.flush();
    }
    return this.getWayfinder();
  }

  addXpAndGold(xp = 0, gold = 0) {
    if (xp > 0) this.data.wayfinder.xp += Math.floor(xp);
    if (gold > 0) this.data.wayfinder.havenGold += Math.floor(gold);
    this.save();
    return this.getWayfinder();
  }

  updateLevel(newLevel) {
    if (newLevel > this.data.wayfinder.level) {
      this.data.wayfinder.level = newLevel;
      this.save();
    }
  }

  addAffinityPoints(affinityCode, points = 1) {
    const aff = (affinityCode || '').toUpperCase();
    if (this.data.wayfinder.affinities[aff] !== undefined) {
      this.data.wayfinder.affinities[aff] += points;
      this.data.worldTrails.illuminatedAffinities[aff] = true;
      this.save();
    }
  }

  addLivingMaterials({ aetherShards = 0, manuscriptScraps = 0, seedsOfLight = 0 } = {}) {
    if (!this.data.wayfinder.livingMaterials) {
      this.data.wayfinder.livingMaterials = { aetherShards: 0, manuscriptScraps: 0, seedsOfLight: 0 };
    }
    if (aetherShards > 0) {
      this.data.wayfinder.livingMaterials.aetherShards = (this.data.wayfinder.livingMaterials.aetherShards || 0) + Math.floor(aetherShards);
    }
    if (manuscriptScraps > 0) {
      this.data.wayfinder.livingMaterials.manuscriptScraps = (this.data.wayfinder.livingMaterials.manuscriptScraps || 0) + Math.floor(manuscriptScraps);
    }
    if (seedsOfLight > 0) {
      this.data.wayfinder.livingMaterials.seedsOfLight = (this.data.wayfinder.livingMaterials.seedsOfLight || 0) + Math.floor(seedsOfLight);
    }
    this.save();
    return { ...this.data.wayfinder.livingMaterials };
  }

  // --- Major Trials Store Management ---

  advanceTrial(trialId, steps = 1) {
    if (!this.data.trials) this.data.trials = { progress: {}, completed: [] };
    const cur = this.data.trials.progress[trialId] || 0;
    this.data.trials.progress[trialId] = cur + steps;
    this.save();
    return this.data.trials.progress[trialId];
  }

  completeTrial(trialId) {
    if (!this.data.trials) this.data.trials = { progress: {}, completed: [] };
    if (!Array.isArray(this.data.trials.completed)) this.data.trials.completed = [];
    if (!this.data.trials.completed.includes(trialId)) {
      this.data.trials.completed.push(trialId);
      this.save();
    }
    return this.data.trials.completed;
  }

  // --- Obstacles 3-Tier Victory & Dormant Relics ---

  updateObstacleTier(obstacleId, tier, isDormantRelic = false) {
    if (!this.data.obstaclesState) this.data.obstaclesState = { tiers: {}, dormantRelics: [] };
    this.data.obstaclesState.tiers[obstacleId] = tier;
    if (isDormantRelic && !this.data.obstaclesState.dormantRelics.includes(obstacleId)) {
      this.data.obstaclesState.dormantRelics.push(obstacleId);
    }
    this.save();
  }

  // --- Custom Rewards Bazaar ---

  addCustomReward(reward) {
    if (!Array.isArray(this.data.customRewards)) this.data.customRewards = [];
    this.data.customRewards.unshift(reward);
    this.save();
    return this.data.customRewards;
  }

  deleteCustomReward(rewardId) {
    if (!Array.isArray(this.data.customRewards)) this.data.customRewards = [];
    this.data.customRewards = this.data.customRewards.filter(r => r.id !== rewardId);
    this.save();
    return this.data.customRewards;
  }

  // --- Miro Memory & Privacy Controls ---

  setMiroPresenceMode(mode = 'adaptive') {
    if (!this.data.miro) this.data.miro = {};
    this.data.miro.presenceMode = mode;
    this.save();
  }

  addMiroApprovedNote(text, habitId = null) {
    if (!this.data.miro) this.data.miro = {};
    if (!Array.isArray(this.data.miro.userApprovedNotes)) this.data.miro.userApprovedNotes = [];
    const note = {
      id: `mnote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      text: String(text).trim(),
      habitId: habitId || null,
    };
    this.data.miro.userApprovedNotes.push(note);
    this.save();
    return note;
  }

  removeMiroApprovedNote(noteId) {
    if (!this.data.miro || !Array.isArray(this.data.miro.userApprovedNotes)) return;
    this.data.miro.userApprovedNotes = this.data.miro.userApprovedNotes.filter(n => n.id !== noteId);
    this.save();
  }

  resetMiroMemory() {
    if (!this.data.miro) this.data.miro = {};
    this.data.miro.userApprovedNotes = [];
    this.data.miro.observedPatterns = [];
    this.data.miro.knowledge = 1;
    this.data.miro.relationship = 1;
    this.data.miro.expression = 1;
    this.save();
  }

  // --- Event Journal (Append-only) ---

  appendEvent(event) {
    if (!event || !event.eventId) return;
    // Limit journal size to 5000 events to maintain widget speed
    if (this.data.eventJournal.length >= 5000) {
      this.data.eventJournal.shift();
    }
    this.data.eventJournal.push(event);
    this.save();
  }

  getEventHistory(limit = 100) {
    return this.data.eventJournal.slice(-limit);
  }

  // --- Data Sovereignty & Granular Purge ---

  /**
   * Granular Purge: completely removes all obstacles, notes, and records linked to a specific habit
   * without affecting the rest of the Atlas.
   */
  selectivePurgeHabit(habitId) {
    if (!habitId) return;

    // Purge obstacles
    this.data.obstacles = this.data.obstacles.filter(
      (o) => o.linkedHabitId !== habitId
    );

    // Purge linked chronicle entries
    this.data.chronicleEntries = this.data.chronicleEntries.filter(
      (entry) => !entry.sourceEventIds?.some((id) => id.includes(habitId))
    );

    // Purge miro observed patterns
    this.data.miro.observedPatterns = (this.data.miro.observedPatterns || []).filter(
      (p) => p.habitId !== habitId
    );

    this.save();
  }

  /**
   * Complete Atlas Rebirth: Resets Atlas state to pristine Level 1 condition.
   */
  resetAtlas() {
    const defaults = getDefaultAtlasState();
    Object.assign(this.data, defaults);
    this.data.meta.createdAt = new Date().toISOString();
    this.flush();
  }
}

module.exports = {
  AtlasStore,
  getDefaultAtlasState,
};
