'use strict';

/**
 * ============================================================================
 * FLIP MOTION TRANSITION CONTROLLER (نظام حركة الانتقال التكيفي)
 * ============================================================================
 *
 * Implements high-performance FLIP (First, Last, Invert, Play) layout transitions
 * for adaptive icon grids.
 *
 * Motion Specifications:
 * - Position changes: 220ms with cubic-bezier(0.22, 1, 0.36, 1)
 * - Size changes: 200ms
 * - Restrained, elegant Apple-style motion without overshoot or wobble
 * - Strictly respects prefers-reduced-motion
 * - Auto-cancels stale animations during rapid continuous resizing
 */

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FlipMotion = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {

  const DEFAULT_OPTIONS = Object.freeze({
    duration: 220, // 180-280ms per spec
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    selector: '[data-id]',
    idAttribute: 'data-id',
  });

  const safeRaf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (cb) => setTimeout(cb, 16);
  const safeCaf = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : (id) => clearTimeout(id);

  class FlipManager {
    constructor(container, options = {}) {
      this.container = container;
      this.options = Object.assign({}, DEFAULT_OPTIONS, options);
      this.firstRects = new Map();
      this.activeRaf = null;
      this.activeTimeouts = new Set();
    }

    /**
     * Check if user prefers reduced motion
     */
    isReducedMotion() {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
      return false;
    }

    /**
     * Check if container or body is currently undergoing interactive manual resize
     */
    isResizing() {
      if (typeof document === 'undefined') return false;
      return document.body.classList.contains('resizing') ||
             document.body.classList.contains('is-dragging') ||
             (this.container && this.container.classList.contains('resizing'));
    }

    /**
     * Step 1: FIRST
     * Record the bounding rectangle of every existing child before layout change.
     */
    snapshot() {
      if (!this.container) return this.firstRects;
      this.cancel();
      // Synchronously flush cleared transforms so measurements are 100% natural
      this.container.offsetHeight; // eslint-disable-line no-unused-expressions
      this.firstRects.clear();

      const items = this.container.querySelectorAll(this.options.selector);
      items.forEach(el => {
        const id = el.getAttribute(this.options.idAttribute) || el.dataset?.id;
        if (id) {
          this.firstRects.set(id, el.getBoundingClientRect());
        }
      });
      return this.firstRects;
    }

    /**
     * Cancel any pending animation frames or timeouts and reset all inline transforms
     */
    cancel() {
      if (this.activeRaf) {
        safeCaf(this.activeRaf);
        this.activeRaf = null;
      }
      this.activeTimeouts.forEach(t => clearTimeout(t));
      this.activeTimeouts.clear();

      if (this.container && this.options.selector) {
        const items = this.container.querySelectorAll(this.options.selector);
        items.forEach(el => {
          el.style.transition = '';
          el.style.transform = '';
          el.style.opacity = '';
          el.style.willChange = '';
          el.style.transformOrigin = '';
        });
      }
    }

    /**
     * Steps 2, 3, 4: LAST, INVERT, PLAY
     * Measures the new positions, calculates inversion deltas, and plays the transition.
     */
    play(customOptions = {}) {
      if (!this.container || this.firstRects.size === 0) return;
      if (this.isReducedMotion() || this.isResizing()) {
        this.cancel();
        this.firstRects.clear();
        return;
      }

      const opts = Object.assign({}, this.options, customOptions);
      this.cancel();

      const currentItems = this.container.querySelectorAll(opts.selector);
      const toAnimate = [];

      currentItems.forEach(el => {
        const id = el.getAttribute(opts.idAttribute) || el.dataset?.id;
        if (!id) return;

        const first = this.firstRects.get(id);
        const last = el.getBoundingClientRect();

        if (first) {
          const dx = first.left - last.left;
          const dy = first.top - last.top;
          const scaleX = last.width > 0 ? (first.width / last.width) : 1;
          const scaleY = last.height > 0 ? (first.height / last.height) : 1;

          const moved = Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5;
          const scaled = Math.abs(scaleX - 1) > 0.02 || Math.abs(scaleY - 1) > 0.02;

          if (moved || scaled) {
            toAnimate.push({ el, dx, dy, scaleX, scaleY, isNew: false });
          }
        } else {
          // Genuine new item entrance
          toAnimate.push({ el, dx: 0, dy: 6, scaleX: 0.85, scaleY: 0.85, isNew: true });
        }
      });

      if (toAnimate.length === 0) {
        this.firstRects.clear();
        return;
      }

      // 1. INVERT: Instantly move elements back to their old positions
      toAnimate.forEach(item => {
        const { el, dx, dy, scaleX, scaleY, isNew } = item;
        el.style.transformOrigin = 'center center';
        el.style.transition = 'none';
        el.style.willChange = 'transform, opacity';

        if (isNew) {
          el.style.opacity = '0';
          el.style.transform = `translate3d(0, ${dy}px, 0) scale(${scaleX}, ${scaleY})`;
        } else {
          el.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
        }
      });

      // Force synchronous reflow so browser registers the inverted transforms
      this.container.offsetHeight; // eslint-disable-line no-unused-expressions

      // 2. PLAY: Smoothly transition to natural final position (0, 0, scale 1)
      this.activeRaf = safeRaf(() => {
        toAnimate.forEach(item => {
          const { el, isNew } = item;
          el.style.transition = `transform ${opts.duration}ms ${opts.easing}, opacity ${Math.round(opts.duration * 0.8)}ms ease`;
          el.style.transform = 'translate3d(0, 0, 0) scale(1, 1)';
          if (isNew) {
            el.style.opacity = '1';
          }
        });

        // Clean up styles after transition completion
        const cleanupTimer = setTimeout(() => {
          toAnimate.forEach(item => {
            const { el } = item;
            el.style.transition = '';
            el.style.transform = '';
            el.style.opacity = '';
            el.style.willChange = '';
            el.style.transformOrigin = '';
          });
          this.activeTimeouts.delete(cleanupTimer);
        }, opts.duration + 50);

        this.activeTimeouts.add(cleanupTimer);
      });

      this.firstRects.clear();
    }
  }

  return {
    FlipManager,
    DEFAULT_OPTIONS,
  };
});
