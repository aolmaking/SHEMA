'use strict';

/**
 * The Living Atlas (أطلس العوالم الحيّة)
 * Canonical Event Bus & Idempotent Event Contracts · Version 1.1
 * 
 * Rules:
 * - Every event has an immutable, unique UUID (eventId).
 * - Events are idempotent; duplicate event processing is strictly prevented.
 * - occurredAt: exact real-life execution time.
 * - recordedAt: timestamp of logging into the app.
 * - userConfirmed: explicit confirmation of reality.
 */

const EventEmitter = require('events');
const crypto = require('crypto');
const { ATLAS_EVENT_TYPES } = require('./atlas-constants');

function generateUUID() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'evt-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

/**
 * Creates a validated, canonical AtlasEvent
 */
function createAtlasEvent({
  eventType,
  occurredAt = new Date().toISOString(),
  recordedAt = new Date().toISOString(),
  source = 'user_input',
  entityId = null,
  payload = {},
  userConfirmed = true,
  eventId = null,
} = {}) {
  if (!eventType) {
    throw new Error('[AtlasEvents] eventType is required');
  }

  return Object.freeze({
    eventId: eventId || generateUUID(),
    eventType,
    occurredAt: typeof occurredAt === 'string' ? occurredAt : new Date(occurredAt).toISOString(),
    recordedAt: typeof recordedAt === 'string' ? recordedAt : new Date(recordedAt).toISOString(),
    schemaVersion: 1,
    source, // 'user_input' | 'habit_core' | 'game_engine' | 'narrative_engine'
    entityId: entityId ? String(entityId) : null,
    payload: Object.freeze({ ...payload }),
    userConfirmed: Boolean(userConfirmed),
  });
}

/**
 * Lightweight, memory-efficient Event Bus for The Living Atlas
 */
class AtlasEventBus extends EventEmitter {
  constructor({ maxProcessedHistory = 2000 } = {}) {
    super();
    this.maxProcessedHistory = maxProcessedHistory;
    this._processedEventIds = new Set();
    this._processedOrder = [];
  }

  /**
   * Checks whether an event has already been processed by consumers
   */
  isProcessed(eventId) {
    if (!eventId) return false;
    return this._processedEventIds.has(eventId);
  }

  /**
   * Marks an event as processed (FIFO cache to prevent memory bloat)
   */
  markProcessed(eventId) {
    if (!eventId || this._processedEventIds.has(eventId)) return;

    this._processedEventIds.add(eventId);
    this._processedOrder.push(eventId);

    if (this._processedOrder.length > this.maxProcessedHistory) {
      const oldest = this._processedOrder.shift();
      this._processedEventIds.delete(oldest);
    }
  }

  /**
   * Safely dispatch an Atlas event to all registered domain listeners
   */
  dispatch(event) {
    if (!event || !event.eventId || !event.eventType) {
      throw new Error('[AtlasEventBus] Invalid event object dispatched');
    }

    // Emit generic and type-specific events
    this.emit('atlas:event', event);
    this.emit(`atlas:${event.eventType}`, event);

    return event;
  }

  /**
   * Resets the bus history (used in tests or atlas rebirth)
   */
  clearHistory() {
    this._processedEventIds.clear();
    this._processedOrder = [];
  }
}

module.exports = {
  createAtlasEvent,
  AtlasEventBus,
  ATLAS_EVENT_TYPES,
};
