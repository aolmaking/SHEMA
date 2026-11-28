'use strict';

/**
 * The Living Atlas (أطلس العوالم الحيّة)
 * Core System Engine · Version 1.1
 * 
 * Orchestrates:
 * - Canonical Event Bus & Idempotency
 * - Atlas Persistent Store
 * - Fair Economy & Level Progression Engine
 * - HabitsManager Bridge & Granular Purge
 */

const EventEmitter = require('events');
const { AtlasEventBus, createAtlasEvent, ATLAS_EVENT_TYPES } = require('./atlas-events');
const { AtlasStore } = require('./atlas-store');
const { AtlasEconomyEngine } = require('./atlas-economy');
const { CATEGORY_AFFINITY_MAP, HAVEN_FACILITIES } = require('./atlas-constants');
const { AtlasObstaclesEngine } = require('./atlas-obstacles');
const { AtlasNarrativeEngine, MYSTERY_GRAPH_NODES } = require('./atlas-narrative');
const { MiroCompanion, MIRO_STATES, MIRO_CONSULTATION_MODES } = require('./atlas-miro');
const { AtlasSkillsEngine, ASTROLABE_SKILLS, ASTROLABE_BRANCHES } = require('./atlas-skills');
const { AtlasMaterialsEngine, LIVING_MATERIALS_META, HAVEN_CRAFTING_PROJECTS } = require('./atlas-materials');
const { AtlasMapEngine, MAP_COORDINATES_NODES, MAP_CONNECTING_TRAILS } = require('./atlas-map');
const { AtlasTrialsEngine, MAJOR_TRIALS_CATALOG } = require('./atlas-trials');
const { AtlasRewardsEngine, PRESET_REWARD_TEMPLATES } = require('./atlas-rewards');

class AtlasEngine extends EventEmitter {
  constructor({ storePath = null, getSettings = null } = {}) {
    super();
    this.store = new AtlasStore(storePath);
    this.bus = new AtlasEventBus();
    this.miro = new MiroCompanion();
    this._habitsManager = null;
    this._getSettings = getSettings;
    this._initListeners();
  }

  setSettingsGetter(fn) {
    this._getSettings = fn;
  }

  _initListeners() {
    // Listen to canonical events dispatched on the bus
    this.bus.on('atlas:event', (event) => {
      this._handleCanonicalEvent(event);
    });
  }

  /**
   * Internal event consumer (Idempotent execution)
   */
  _handleCanonicalEvent(event) {
    if (this.bus.isProcessed(event.eventId)) {
      return; // Deduplication guarantee
    }
    this.bus.markProcessed(event.eventId);

    // Append to event journal for traceability
    this.store.appendEvent(event);

    switch (event.eventType) {
      case ATLAS_EVENT_TYPES.HABIT_COMPLETED:
      case ATLAS_EVENT_TYPES.HABIT_MICRO_STEP: {
        this._processHabitExecution(event);
        break;
      }
      case ATLAS_EVENT_TYPES.HABIT_EXEMPTED: {
        this._processHabitExemption(event);
        break;
      }
      default:
        break;
    }

    this.emit('atlas:updated', this.getDashboardState());
  }

  _processHabitExecution(event) {
    const { habitId, difficulty = 'medium', category = 'productivity', isMicroStep = false } = event.payload;

    // 1. Calculate XP and Gold
    const xpEarned = AtlasEconomyEngine.calculateXp(difficulty, isMicroStep);
    const goldEarned = AtlasEconomyEngine.calculateGold(difficulty, isMicroStep);

    // 2. Award to Wayfinder Store
    const oldLevel = this.store.data.wayfinder.level;
    this.store.addXpAndGold(xpEarned, goldEarned);

    // Calculate & award living materials based on habit category
    const earnedMaterials = AtlasMaterialsEngine.calculateMaterialsFromExecution({
      category,
      difficulty,
      isMicroStep,
    });
    this.store.addLivingMaterials(earnedMaterials);

    // Increment total actions count
    if (!this.store.data.wayfinder.totalActions) {
      this.store.data.wayfinder.totalActions = 0;
    }
    this.store.data.wayfinder.totalActions += 1;

    // 3. Resolve & award Affinity points
    const affinity = CATEGORY_AFFINITY_MAP[category] || 'DIS';
    this.store.addAffinityPoints(affinity, 1);

    // 4. Update Miro State to Celebrating
    this.miro.setState(MIRO_STATES.CELEBRATING, { isMicroStep });

    // 5. Evaluate Narrative Milestones & Clues
    const existingClues = this.store.data.narrativeState?.unlockedMilestoneIds || [];
    const narrativeEval = AtlasNarrativeEngine.evaluateProgress(
      { totalActions: this.store.data.wayfinder.totalActions },
      existingClues
    );

    if (narrativeEval.newlyUnlocked.length > 0) {
      if (!this.store.data.narrativeState) this.store.data.narrativeState = {};
      this.store.data.narrativeState.unlockedMilestoneIds = narrativeEval.allUnlockedIds;
      narrativeEval.newlyUnlocked.forEach(clueNode => {
        const chronicle = AtlasNarrativeEngine.generateChronicleEntry('clue_unlocked', { clueId: clueNode.id }, 'ar');
        this.emit('atlas:clue-unlocked', { clue: clueNode, chronicle });
      });
    }

    // 6. Evaluate Astrolabe Behavioral Skills
    const habitsList = this._habitsManager?.getHabits ? this._habitsManager.getHabits(false) : [];
    const skillsEval = AtlasSkillsEngine.evaluateSkills(
      { totalActions: this.store.data.wayfinder.totalActions },
      habitsList,
      this.store.data.wayfinder.unlockedSkills || []
    );

    if (skillsEval.newlyUnlocked.length > 0) {
      this.store.data.wayfinder.unlockedSkills = skillsEval.allUnlockedIds;
      skillsEval.newlyUnlocked.forEach(skill => {
        if (skill.materialReward) {
          this.store.addLivingMaterials(skill.materialReward);
        }
        this.emit('atlas:skill-unlocked', { skill });
      });
      this.store.save();
    }

    // 7. Evaluate Level-Up
    const levelMeta = AtlasEconomyEngine.evaluateLevel(this.store.data.wayfinder.xp);
    if (levelMeta.level > oldLevel) {
      this.store.updateLevel(levelMeta.level);
      // Award level-up bonus living materials
      this.store.addLivingMaterials({ aetherShards: 40, manuscriptScraps: 20, seedsOfLight: 20 });
      const levelChronicle = AtlasNarrativeEngine.generateChronicleEntry('level_up', levelMeta, 'ar');
      this.emit('atlas:level-up', {
        oldLevel,
        newLevel: levelMeta.level,
        titleAr: levelMeta.titleAr,
        titleEn: levelMeta.titleEn,
        unlockBenefitAr: levelMeta.unlockBenefitAr,
        bonusMaterials: { aetherShards: 40, manuscriptScraps: 20, seedsOfLight: 20 },
        chronicle: levelChronicle,
      });
    }

    // 8. Process Major Trials Cumulative Steps
    if (!this.store.data.trials) this.store.data.trials = { progress: {}, completed: [] };
    const trialStepRes = AtlasTrialsEngine.processHabitStepForTrials(
      category,
      this.store.data.trials.progress || {},
      this.store.data.trials.completed || []
    );
    this.store.data.trials.progress = trialStepRes.updatedProgress;

    // Auto-claim newly completed trials
    if (trialStepRes.newlyCompletedTrials.length > 0) {
      trialStepRes.newlyCompletedTrials.forEach(t => {
        this.completeTrial(t.id);
      });
    }

    // 9. Update Miro Dimensions based on verified journey accomplishments
    const clueCount = (this.store.data.narrativeState?.unlockedMilestoneIds || []).length;
    this.store.data.miro.knowledge = Math.min(5, Math.max(1, Math.floor(clueCount / 2) + 1));
    this.store.data.miro.relationship = Math.min(5, Math.max(1, Math.floor(this.store.data.wayfinder.totalActions / 15) + 1));
    this.store.save();

    this.emit('atlas:reward-earned', {
      eventId: event.eventId,
      habitId,
      xpEarned,
      goldEarned,
      affinity,
      isMicroStep,
      earnedMaterials,
      livingMaterials: { ...this.store.data.wayfinder.livingMaterials },
      currentXp: this.store.data.wayfinder.xp,
      currentGold: this.store.data.wayfinder.havenGold,
    });
  }

  _processHabitExemption(event) {
    // Exemptions (rest/illness/travel) do NOT deduct XP or damage anything
    this.miro.setState(MIRO_STATES.SUPPORTIVE);
    this.emit('atlas:exemption-recorded', {
      eventId: event.eventId,
      habitId: event.payload?.habitId,
      reason: event.payload?.reason,
    });
  }

  /**
   * Sets the Wayfinder's custom sovereign identity name
   */
  setWayfinderName(name) {
    const wf = this.store.setWayfinderName(name);
    this.emit('atlas:updated', this.getDashboardState());
    return { ok: true, wayfinder: wf };
  }

  /**
   * Upgrades a Haven facility using Haven Gold earned from habit executions
   */
  upgradeFacility(facilityId) {
    const facility = HAVEN_FACILITIES[facilityId];
    if (!facility) return { ok: false, error: 'unknown_facility' };

    if (!this.store.data.havenFacilities) this.store.data.havenFacilities = {};
    const current = this.store.data.havenFacilities[facilityId] || { level: 1 };
    const maxLevel = facility.maxLevel || 5;
    if (current.level >= maxLevel) return { ok: false, error: 'max_level_reached' };

    const cost = current.level * 40;
    const currentGold = this.store.data.wayfinder.havenGold || 0;
    if (currentGold < cost) {
      return { ok: false, error: 'insufficient_gold', required: cost, current: currentGold };
    }

    this.store.data.wayfinder.havenGold -= cost;
    current.level += 1;
    this.store.data.havenFacilities[facilityId] = current;
    this.store.save();

    this.emit('atlas:updated', this.getDashboardState());
    return { ok: true, facilityId, newLevel: current.level, remainingGold: this.store.data.wayfinder.havenGold };
  }

  /**
   * Resolves an obstacle using a selected strategy
   */
  resolveObstacle(obstacleKey, strategyKey) {
    const res = AtlasObstaclesEngine.resolveObstacle(obstacleKey, strategyKey);
    this.store.addAffinityPoints(res.affinityGranted, res.affinityAmount);
    this.store.addXpAndGold(0, res.goldAwarded);
    this.miro.setState(MIRO_STATES.SUPPORTIVE);

    const chronicle = AtlasNarrativeEngine.generateChronicleEntry('obstacle_overcome', {
      logAr: res.resolutionLogAr,
      logEn: res.resolutionLogEn,
    }, 'ar');

    this.emit('atlas:updated', this.getDashboardState());
    return { ok: true, resolution: res, chronicle };
  }

  /**
   * Advances an obstacle through the 3-Tier Victory Progression model
   */
  advanceObstacleTier(obstacleKey, strategyKey) {
    const currentTier = this.store.data.obstaclesState?.tiers[obstacleKey] || 0;
    const res = AtlasObstaclesEngine.advanceObstacleTier(obstacleKey, strategyKey, currentTier);

    // Apply store state
    this.store.updateObstacleTier(obstacleKey, res.newTier, res.isDormantRelic);
    this.store.addAffinityPoints(res.affinityGranted, res.affinityAmount);
    this.store.addXpAndGold(0, res.goldAwarded);
    if (res.aetherShardsAwarded > 0) {
      this.store.addLivingMaterials({ aetherShards: res.aetherShardsAwarded });
    }

    this.miro.setState(res.isMastered ? MIRO_STATES.CELEBRATING : MIRO_STATES.SUPPORTIVE);

    const chronicle = AtlasNarrativeEngine.generateChronicleEntry('obstacle_overcome', {
      logAr: res.chronicleAr,
      logEn: res.chronicleEn,
    }, 'ar');
    if (!Array.isArray(this.store.data.chronicleEntries)) this.store.data.chronicleEntries = [];
    this.store.data.chronicleEntries.push(chronicle);
    this.store.save();

    this.emit('atlas:obstacle-advanced', { obstacleKey, tier: res.newTier, res, chronicle });
    this.emit('atlas:updated', this.getDashboardState());
    return { ok: true, res, chronicle };
  }

  /**
   * Concludes a Major Trial, grants rewards, monuments, and logs chronicle
   */
  completeTrial(trialId) {
    const completedTrials = this.store.data.trials?.completed || [];
    const res = AtlasTrialsEngine.completeTrial(trialId, completedTrials);
    if (!res.ok) return res;

    // Apply store records
    this.store.completeTrial(trialId);
    this.store.addXpAndGold(0, res.rewards.havenGold || 0);
    this.store.addLivingMaterials({
      aetherShards: res.rewards.aetherShards || 0,
      manuscriptScraps: res.rewards.manuscriptScraps || 0,
      seedsOfLight: res.rewards.seedsOfLight || 0,
    });

    // Add Haven Monument
    if (!this.store.data.havenFacilities) this.store.data.havenFacilities = {};
    if (!Array.isArray(this.store.data.havenFacilities.monuments)) {
      this.store.data.havenFacilities.monuments = [];
    }
    if (!this.store.data.havenFacilities.monuments.some(m => m.id === res.monument.id)) {
      this.store.data.havenFacilities.monuments.push(res.monument);
    }

    const chronicle = AtlasNarrativeEngine.generateChronicleEntry('trial_completed', {
      titleAr: res.trial.titleAr,
      titleEn: res.trial.titleEn,
      chronicleAr: res.chronicleAr,
      chronicleEn: res.chronicleEn,
    }, 'ar');
    if (!Array.isArray(this.store.data.chronicleEntries)) this.store.data.chronicleEntries = [];
    this.store.data.chronicleEntries.push(chronicle);
    this.store.save();

    this.miro.setState(MIRO_STATES.CELEBRATING);
    this.emit('atlas:trial-completed', { trialId, res, chronicle });
    this.emit('atlas:updated', this.getDashboardState());
    return { ok: true, res, chronicle };
  }

  /**
   * Redeems a custom real-world reward using earned Haven Gold
   */
  redeemReward(rewardId) {
    const currentGold = this.store.data.wayfinder.havenGold || 0;
    const res = AtlasRewardsEngine.redeemReward(rewardId, this.store.data.customRewards || [], currentGold);
    if (!res.ok) return res;

    this.store.data.wayfinder.havenGold = res.remainingGold;
    const chronicle = AtlasNarrativeEngine.generateChronicleEntry('reward_redeemed', {
      titleAr: res.reward.titleAr,
      titleEn: res.reward.titleEn,
      chronicleAr: res.chronicleAr,
      chronicleEn: res.chronicleEn,
    }, 'ar');
    if (!Array.isArray(this.store.data.chronicleEntries)) this.store.data.chronicleEntries = [];
    this.store.data.chronicleEntries.push(chronicle);
    this.store.save();

    this.emit('atlas:reward-redeemed', { rewardId, res, chronicle });
    this.emit('atlas:updated', this.getDashboardState());
    return { ok: true, res, chronicle };
  }

  /**
   * Adds a user custom reward to the Bazaar
   */
  addCustomReward(rewardOpts) {
    const res = AtlasRewardsEngine.addReward(rewardOpts, this.store.data.customRewards || []);
    if (!res.ok) return res;

    this.store.data.customRewards = res.updatedRewards;
    this.store.save();
    this.emit('atlas:updated', this.getDashboardState());
    return { ok: true, reward: res.reward };
  }

  /**
   * Deletes a user custom reward from the Bazaar
   */
  deleteCustomReward(rewardId) {
    const res = AtlasRewardsEngine.deleteReward(rewardId, this.store.data.customRewards || []);
    this.store.data.customRewards = res.updatedRewards;
    this.store.save();
    this.emit('atlas:updated', this.getDashboardState());
    return { ok: true, rewardId };
  }

  /**
   * Miro Memory & Sovereign Privacy Controls
   */
  setMiroPresenceMode(mode) {
    this.store.setMiroPresenceMode(mode);
    this.emit('atlas:updated', this.getDashboardState());
    return { ok: true, mode };
  }

  addMiroNote(text, habitId = null) {
    const note = this.store.addMiroApprovedNote(text, habitId);
    this.emit('atlas:updated', this.getDashboardState());
    return { ok: true, note };
  }

  deleteMiroNote(noteId) {
    this.store.removeMiroApprovedNote(noteId);
    this.emit('atlas:updated', this.getDashboardState());
    return { ok: true, noteId };
  }

  resetMiroMemory() {
    this.store.resetMiroMemory();
    this.emit('atlas:updated', this.getDashboardState());
    return { ok: true };
  }

  /**
   * Crafts / restores a Haven project using earned Living Materials
   */
  craftProject(projectId) {
    const currentMaterials = this.store.data.wayfinder.livingMaterials || { aetherShards: 0, manuscriptScraps: 0, seedsOfLight: 0 };
    const completedProjects = this.store.data.havenFacilities?.completedProjects || [];

    const craftResult = AtlasMaterialsEngine.craftProject(projectId, currentMaterials, completedProjects);
    if (!craftResult.ok) {
      return craftResult;
    }

    // Apply material deductions
    this.store.data.wayfinder.livingMaterials = craftResult.remainingMaterials;
    if (!this.store.data.havenFacilities) {
      this.store.data.havenFacilities = {};
    }
    if (!Array.isArray(this.store.data.havenFacilities.completedProjects)) {
      this.store.data.havenFacilities.completedProjects = [];
    }
    this.store.data.havenFacilities.completedProjects.push(projectId);

    // Record chronicle
    const chronicle = AtlasNarrativeEngine.generateChronicleEntry('crafting_completed', {
      titleAr: craftResult.project.titleAr,
      titleEn: craftResult.project.titleEn,
      benefitAr: craftResult.project.benefitAr,
    }, 'ar');
    if (!Array.isArray(this.store.data.chronicleEntries)) {
      this.store.data.chronicleEntries = [];
    }
    this.store.data.chronicleEntries.push(chronicle);
    this.store.save();

    this.miro.setState(MIRO_STATES.CELEBRATING);
    this.emit('atlas:project-crafted', { projectId, craftResult, chronicle });
    this.emit('atlas:updated', this.getDashboardState());

    return {
      ok: true,
      project: craftResult.project,
      remainingMaterials: craftResult.remainingMaterials,
      chronicle,
    };
  }

  /**
   * Miro Multi-Modal Interactive Consultation
   * AI-powered when Gemini API is enabled in settings, with graceful deterministic fallback.
   * Returns consultation synchronously when AI is not configured, or a Promise when AI is active.
   */
  consultMiro(modeKey, lang = 'ar', userQuestion = '') {
    const consultation = this.miro.consult(modeKey, lang);
    const settings = (typeof this._getSettings === 'function') ? this._getSettings() : null;
    const atlasConf = settings?.atlas || {};

    if (atlasConf.aiEnabled && atlasConf.apiKey && atlasConf.apiKey.trim()) {
      const { consultMiroWithAi } = require('./atlas-ai');
      const wayfinderState = this.store.data.wayfinder || {};
      return consultMiroWithAi({
        apiKey: atlasConf.apiKey.trim(),
        model: atlasConf.model || 'gemini-1.5-flash',
        modeKey,
        userQuestion,
        wayfinderState,
        lang,
      }).then(aiRes => {
        if (aiRes && aiRes.ok && aiRes.text) {
          consultation.dialogue = aiRes.text;
          consultation.isAiGenerated = true;
        }
        this.emit('atlas:miro-consulted', consultation);
        return consultation;
      }).catch(err => {
        consultation.aiError = err.message;
        this.emit('atlas:miro-consulted', consultation);
        return consultation;
      });
    }

    this.emit('atlas:miro-consulted', consultation);
    return consultation;
  }

  /**
   * Connects cleanly to the project's HabitsManager without modifying its internal tables
   */
  bridgeHabitsManager(habitsManager) {
    if (!habitsManager || typeof habitsManager.on !== 'function') return;
    this._habitsManager = habitsManager;

    // Listen to habit completions / status changes
    habitsManager.on('log-changed', ({ dateStr, habitId, status, isMicroStep }) => {
      if (status === 'done' || status === true) {
        const habit = habitsManager.getHabit ? habitsManager.getHabit(habitId) : null;
        const difficulty = habit?.difficulty || 'medium';
        const category = habit?.category || 'productivity';

        const eventType = isMicroStep
          ? ATLAS_EVENT_TYPES.HABIT_MICRO_STEP
          : ATLAS_EVENT_TYPES.HABIT_COMPLETED;

        const event = createAtlasEvent({
          eventType,
          occurredAt: new Date().toISOString(),
          source: 'habit_core',
          entityId: habitId,
          payload: {
            dateStr,
            habitId,
            difficulty,
            category,
            isMicroStep: Boolean(isMicroStep),
          },
          userConfirmed: true,
        });

        this.bus.dispatch(event);
      } else if (status === 'skip') {
        const event = createAtlasEvent({
          eventType: ATLAS_EVENT_TYPES.EXEMPTION_RECORDED,
          occurredAt: new Date().toISOString(),
          source: 'habit_core',
          entityId: habitId,
          payload: {
            dateStr,
            habitId,
          },
          userConfirmed: true,
        });

        this.bus.dispatch(event);
      }
    });

    // Listen to habit deletions for granular purge
    if (typeof habitsManager.on === 'function') {
      habitsManager.on('habit-deleted', ({ habitId }) => {
        this.store.selectivePurgeHabit(habitId);
        this.emit('atlas:habit-purged', { habitId });
      });
    }
  }

  /**
   * Dispatches a manual or UI-triggered Atlas Event
   */
  dispatchAction(eventType, payload = {}) {
    const event = createAtlasEvent({
      eventType,
      source: 'user_input',
      payload,
    });
    return this.bus.dispatch(event);
  }

  /**
   * Returns the clean, structured state needed by the First Haven UI
   */
  getDashboardState(lang = 'ar') {
    const wf = this.store.getWayfinder();
    const levelMeta = AtlasEconomyEngine.evaluateLevel(wf.xp);
    const unlockedClueIds = this.store.data.narrativeState?.unlockedMilestoneIds || [];
    const foreshadowing = AtlasNarrativeEngine.getForeshadowingHint(
      { totalActions: wf.totalActions || 0 },
      unlockedClueIds,
      lang
    );

    const unlockedClues = MYSTERY_GRAPH_NODES.filter(node => unlockedClueIds.includes(node.id));

    // Phase 2: Astrolabe Behavioral Skills
    const habitsList = this._habitsManager?.getHabits ? this._habitsManager.getHabits(false) : [];
    const skillsEval = AtlasSkillsEngine.evaluateSkills(
      { totalActions: wf.totalActions || 0 },
      habitsList,
      wf.unlockedSkills || []
    );

    // Phase 2: Haven Crafting Projects Status
    const completedProjects = this.store.data.havenFacilities?.completedProjects || [];
    const mat = wf.livingMaterials || { aetherShards: 0, manuscriptScraps: 0, seedsOfLight: 0 };
    const craftingProjects = HAVEN_CRAFTING_PROJECTS.map(proj => {
      const isCompleted = completedProjects.includes(proj.id);
      const canAfford = (
        !isCompleted &&
        (mat.aetherShards || 0) >= proj.cost.aetherShards &&
        (mat.manuscriptScraps || 0) >= proj.cost.manuscriptScraps &&
        (mat.seedsOfLight || 0) >= proj.cost.seedsOfLight
      );
      return {
        ...proj,
        isCompleted,
        canAfford,
      };
    });

    // Phase 2: Living Vector Map Nodes & Dynamic SVG
    const mapNodes = AtlasMapEngine.evaluateMapNodes(
      { totalActions: wf.totalActions || 0 },
      lang
    );
    const illuminatedAffinities = this.store.data.worldTrails?.illuminatedAffinities || {};
    const mapSvg = AtlasMapEngine.renderSvgMap(mapNodes, illuminatedAffinities);

    return {
      wayfinder: {
        ...wf,
        level: levelMeta.level,
        titleAr: levelMeta.titleAr,
        titleEn: levelMeta.titleEn,
        xpInCurrentLevel: levelMeta.xpInCurrentLevel,
        currentLevelRequired: levelMeta.currentLevelRequired,
        xpRemainingToNextLevel: levelMeta.xpRemainingToNextLevel,
        progressPercent: levelMeta.progressPercent,
        unlockBenefitAr: levelMeta.unlockBenefitAr,
        livingMaterials: {
          aetherShards: mat.aetherShards || 0,
          manuscriptScraps: mat.manuscriptScraps || 0,
          seedsOfLight: mat.seedsOfLight || 0,
        },
      },
      astrolabe: {
        branches: ASTROLABE_BRANCHES,
        skills: skillsEval.skillStatuses,
        unlockedCount: skillsEval.allUnlockedIds.length,
        totalCount: ASTROLABE_SKILLS.length,
      },
      livingMaterialsMeta: LIVING_MATERIALS_META,
      craftingProjects,
      completedProjects,
      map: {
        nodes: mapNodes,
        svg: mapSvg,
      },
      havenFacilities: { ...this.store.data.havenFacilities },
      worldTrails: { ...this.store.data.worldTrails },
      miro: {
        state: this.miro.state,
        glowIntensity: this.miro.glowIntensity,
        dialogue: this.miro.lastDialogue || this.miro.getDialogueForState(this.miro.state, { lang, wayfinderName: wf.name }),
        svgSprite: MiroCompanion.renderSvgSprite({ glow: this.miro.glowIntensity }),
        consultationModes: MIRO_CONSULTATION_MODES,
      },
      activeChapter: wf.currentChapter || 1,
      unlockedMilestones: [...unlockedClueIds],
      unlockedClues,
      foreshadowing,
      // Phase 3: Major Trials, Living Obstacles, Rewards Bazaar & Memory
      trials: AtlasTrialsEngine.getTrialsState(
        this.store.data.trials?.progress || {},
        this.store.data.trials?.completed || []
      ),
      obstacles: AtlasObstaclesEngine.getObstaclesState(
        this.store.data.obstaclesState?.tiers || {},
        this.store.data.obstaclesState?.dormantRelics || []
      ),
      rewards: AtlasRewardsEngine.getAllRewards(
        this.store.data.customRewards || [],
        wf.havenGold || 0
      ),
      chronicles: [...(this.store.data.chronicleEntries || [])].reverse(),
      miroMemory: {
        dimensions: {
          knowledge: this.store.data.miro.knowledge || 1,
          relationship: this.store.data.miro.relationship || 1,
          expression: this.store.data.miro.expression || 1,
        },
        presenceMode: this.store.data.miro.presenceMode || 'adaptive',
        notes: this.store.data.miro.userApprovedNotes || [],
      },
      meta: { ...this.store.data.meta },
    };
  }
}

module.exports = {
  AtlasEngine,
};
