'use strict';

/**
 * ============================================================================
 * UNIFIED WIDGET ICON ART ENGINE (محرك أيقونات الويتجات الموحد ثلاثي الأبعاد)
 * Single Source of Truth for:
 *   - Desktop Mini Widgets (shell.js)
 *   - Smart Folder 2x2 Compact Slots (folder.js)
 *   - Smart Folder Expanded Grid Items (folder.js)
 *   - Desktop Drag Ghost Window (drag-ghost.html)
 * 
 * Features:
 *   - High-fidelity Apple VisionOS / iOS 3D Squircles matching user's reference
 *   - Vector SVG rendering (infinitely scalable, razor-sharp at any DPI)
 *   - Live real-time updates (Clock hands, Calendar day, Email unread badge)
 * ============================================================================
 */

(function(root) {

  /* --------------------------------------------------------------------------
   * 1. VECTOR SVG ARTWORK DEFINITIONS
   * -------------------------------------------------------------------------- */

  function getSvgDefinitions() {
    return `
      <defs>
        <!-- Shadows & Filters -->
        <filter id="u-drop-shadow" x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.32"/>
        </filter>
        <filter id="u-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="3" flood-color="#000000" flood-opacity="0.22"/>
        </filter>
        <filter id="u-flame-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <!-- Gold Metal Gradients -->
        <linearGradient id="u-gold-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fffbeb"/>
          <stop offset="25%" stop-color="#fde68a"/>
          <stop offset="55%" stop-color="#f59e0b"/>
          <stop offset="85%" stop-color="#d97706"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>

        <linearGradient id="u-gold-frame" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="35%" stop-color="#f59e0b"/>
          <stop offset="70%" stop-color="#d97706"/>
          <stop offset="100%" stop-color="#78350f"/>
        </linearGradient>

        <!-- 1. Quran Gradients -->
        <linearGradient id="u-quran-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#059669"/>
          <stop offset="45%" stop-color="#047857"/>
          <stop offset="100%" stop-color="#064e3b"/>
        </linearGradient>
        <linearGradient id="u-quran-arch-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#065f46" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#022c22" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="u-page-left" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#fef3c7"/>
          <stop offset="70%" stop-color="#fffbeb"/>
          <stop offset="100%" stop-color="#e5e7eb"/>
        </linearGradient>
        <linearGradient id="u-page-right" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#e5e7eb"/>
          <stop offset="30%" stop-color="#fffbeb"/>
          <stop offset="100%" stop-color="#fef3c7"/>
        </linearGradient>
        <linearGradient id="u-rehal-wood" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#78350f"/>
          <stop offset="50%" stop-color="#451a03"/>
          <stop offset="100%" stop-color="#1c0a02"/>
        </linearGradient>

        <!-- 2. Habits Flame Gradients -->
        <linearGradient id="u-habits-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fb923c"/>
          <stop offset="50%" stop-color="#f97316"/>
          <stop offset="100%" stop-color="#c2410c"/>
        </linearGradient>
        <linearGradient id="u-flame-outer" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ff7a00"/>
          <stop offset="40%" stop-color="#ff3b30"/>
          <stop offset="100%" stop-color="#c91818"/>
        </linearGradient>
        <linearGradient id="u-flame-mid" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffcc00"/>
          <stop offset="60%" stop-color="#ff9500"/>
          <stop offset="100%" stop-color="#ff3b30"/>
        </linearGradient>
        <linearGradient id="u-flame-core" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#fff3a1"/>
          <stop offset="100%" stop-color="#ffb800"/>
        </linearGradient>

        <!-- 3. Photo Gradients -->
        <linearGradient id="u-photo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#a855f7"/>
          <stop offset="45%" stop-color="#7c3aed"/>
          <stop offset="100%" stop-color="#4c1d95"/>
        </linearGradient>
        <linearGradient id="u-photo-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="70%" stop-color="#bae6fd"/>
          <stop offset="100%" stop-color="#e0f2fe"/>
        </linearGradient>
        <linearGradient id="u-photo-sun" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fffbeb"/>
          <stop offset="50%" stop-color="#fef08a"/>
          <stop offset="100%" stop-color="#facc15"/>
        </linearGradient>
        <linearGradient id="u-photo-mountain-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#34d399"/>
          <stop offset="100%" stop-color="#059669"/>
        </linearGradient>
        <linearGradient id="u-photo-mountain-fg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#10b981"/>
          <stop offset="100%" stop-color="#047857"/>
        </linearGradient>

        <!-- 4. Email Gradients -->
        <linearGradient id="u-email-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="50%" stop-color="#2563eb"/>
          <stop offset="100%" stop-color="#1d4ed8"/>
        </linearGradient>
        <linearGradient id="u-env-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
        <linearGradient id="u-env-flap" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="85%" stop-color="#cbd5e1"/>
          <stop offset="100%" stop-color="#94a3b8"/>
        </linearGradient>
        <linearGradient id="u-red-badge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff453a"/>
          <stop offset="100%" stop-color="#d70015"/>
        </linearGradient>

        <!-- 5. Notes Gradients -->
        <linearGradient id="u-notes-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
        <linearGradient id="u-paper-sheet" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="80%" stop-color="#fef9c3"/>
          <stop offset="100%" stop-color="#fef08a"/>
        </linearGradient>
        <linearGradient id="u-pen-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#374151"/>
          <stop offset="45%" stop-color="#111827"/>
          <stop offset="100%" stop-color="#030712"/>
        </linearGradient>

        <!-- 6. Calendar Gradients -->
        <linearGradient id="u-cal-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="65%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
        <linearGradient id="u-cal-red" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#b91c1c"/>
        </linearGradient>
        <linearGradient id="u-chrome-ring" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#64748b"/>
          <stop offset="40%" stop-color="#f1f5f9"/>
          <stop offset="60%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#475569"/>
        </linearGradient>

        <!-- 7. Todo / Notepad Clipboard Gradients -->
        <linearGradient id="u-todo-wood-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f3c588"/>
          <stop offset="35%" stop-color="#e9aa5d"/>
          <stop offset="70%" stop-color="#d69244"/>
          <stop offset="100%" stop-color="#be792c"/>
        </linearGradient>
        <linearGradient id="u-todo-paper-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fdfbf7"/>
          <stop offset="60%" stop-color="#f9f5ec"/>
          <stop offset="100%" stop-color="#f3ebda"/>
        </linearGradient>
        <filter id="u-todo-paper-shadow" x="-10%" y="-10%" width="125%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.8" flood-color="#8c501e" flood-opacity="0.25"/>
          <feDropShadow dx="0" dy="0.8" stdDeviation="0.8" flood-color="#000000" flood-opacity="0.12"/>
        </filter>
        <linearGradient id="u-todo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f3c588"/>
          <stop offset="50%" stop-color="#e9aa5d"/>
          <stop offset="100%" stop-color="#be792c"/>
        </linearGradient>

        <!-- 8. Clock Gradients -->
        <radialGradient id="u-clock-dial" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#2c2c2e"/>
          <stop offset="70%" stop-color="#18181b"/>
          <stop offset="100%" stop-color="#09090b"/>
        </radialGradient>

        <!-- 9. Pomodoro Gradients -->
        <linearGradient id="u-pomo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f87171"/>
          <stop offset="50%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#991b1b"/>
        </linearGradient>
      </defs>
    `;
  }

  /* --------------------------------------------------------------------------
   * 2. INDIVIDUAL WIDGET SVG TEMPLATES (MATCHING USER REFERENCE PICTURE)
   * -------------------------------------------------------------------------- */

  function getWidgetSvgContent(id, options = {}) {
    switch (id) {
      /* ==================================================================== *
       * 1. QURAN (المصحف الشريف)
       * Emerald Green Squircle, Gold Islamic Arch, Crescent, Open Book on Rehal
       * ==================================================================== */
      case 'quran':
        return `
          <svg viewBox="0 0 100 100" class="unified-icon-svg" xmlns="http://www.w3.org/2000/svg">
            ${getSvgDefinitions()}
            <!-- Background Squircle -->
            <rect width="100" height="100" rx="22" ry="22" fill="url(#u-quran-bg)"/>
            
            <!-- Vignette & Subtle Corner Filigree -->
            <rect width="100" height="100" rx="22" ry="22" fill="none" stroke="url(#u-gold-metal)" stroke-width="1.8" opacity="0.6"/>

            <!-- Islamic Arch (Mihrab) Frame -->
            <path d="M 22 78 L 22 44 C 22 28, 38 18, 50 14 C 62 18, 78 28, 78 44 L 78 78 Z" 
                  fill="url(#u-quran-arch-bg)" stroke="url(#u-gold-metal)" stroke-width="2.4" filter="url(#u-soft-shadow)"/>
            
            <!-- Ornate Trefoil Inner Peak & Minarets Silhouette -->
            <path d="M 32 46 L 32 38 L 35 34 L 38 38 L 38 46" fill="#043c2c" opacity="0.75"/>
            <path d="M 62 46 L 62 38 L 65 34 L 68 38 L 68 46" fill="#043c2c" opacity="0.75"/>
            <path d="M 45 42 Q 50 36 55 42" stroke="url(#u-gold-metal)" stroke-width="1.2" fill="none"/>

            <!-- Golden Crescent Moon & Star -->
            <path d="M 47 24 A 6 6 0 1 0 54 30 A 5 5 0 1 1 47 24 Z" fill="url(#u-gold-metal)"/>
            <circle cx="53" cy="24" r="1.2" fill="#fef08a"/>

            <!-- Wooden Stand (Rehal) Base Legs -->
            <path d="M 24 77 L 42 63 L 58 63 L 76 77 L 70 82 L 50 67 L 30 82 Z" 
                  fill="url(#u-rehal-wood)" filter="url(#u-soft-shadow)"/>
            <path d="M 30 63 L 50 78 L 70 63 L 64 59 L 50 70 L 36 59 Z" fill="#2d0f02"/>

            <!-- Open Holy Quran Book (Gilded Edges & Curved Pages) -->
            <!-- Left Page -->
            <path d="M 50 63 C 44 59, 31 59, 23 63 C 22 49, 23 37, 24 35 C 33 32, 44 32, 50 36 Z" 
                  fill="url(#u-page-left)" stroke="url(#u-gold-metal)" stroke-width="1.3" filter="url(#u-soft-shadow)"/>
            <!-- Right Page -->
            <path d="M 50 63 C 56 59, 69 59, 77 63 C 78 49, 77 37, 76 35 C 67 32, 56 32, 50 36 Z" 
                  fill="url(#u-page-right)" stroke="url(#u-gold-metal)" stroke-width="1.3" filter="url(#u-soft-shadow)"/>
            
            <!-- Book Spine Central Gilded Seam -->
            <line x1="50" y1="36" x2="50" y2="63" stroke="url(#u-gold-metal)" stroke-width="1.6"/>

            <!-- Surah Header Bands & Verse Calligraphy Lines -->
            <!-- Left Page Details -->
            <rect x="27" y="38" width="18" height="3" rx="1" fill="#fef08a" stroke="#d97706" stroke-width="0.5"/>
            <line x1="28" y1="44" x2="45" y2="44" stroke="#047857" stroke-width="0.9" stroke-linecap="round"/>
            <line x1="28" y1="47.5" x2="45" y2="47.5" stroke="#047857" stroke-width="0.9" stroke-linecap="round"/>
            <line x1="28" y1="51" x2="43" y2="51" stroke="#047857" stroke-width="0.9" stroke-linecap="round"/>
            <line x1="29" y1="54.5" x2="44" y2="54.5" stroke="#047857" stroke-width="0.9" stroke-linecap="round"/>
            <line x1="30" y1="58" x2="41" y2="58" stroke="#047857" stroke-width="0.9" stroke-linecap="round"/>

            <!-- Right Page Details -->
            <rect x="55" y="38" width="18" height="3" rx="1" fill="#fef08a" stroke="#d97706" stroke-width="0.5"/>
            <line x1="55" y1="44" x2="72" y2="44" stroke="#047857" stroke-width="0.9" stroke-linecap="round"/>
            <line x1="55" y1="47.5" x2="72" y2="47.5" stroke="#047857" stroke-width="0.9" stroke-linecap="round"/>
            <line x1="57" y1="51" x2="72" y2="51" stroke="#047857" stroke-width="0.9" stroke-linecap="round"/>
            <line x1="56" y1="54.5" x2="71" y2="54.5" stroke="#047857" stroke-width="0.9" stroke-linecap="round"/>
            <line x1="59" y1="58" x2="70" y2="58" stroke="#047857" stroke-width="0.9" stroke-linecap="round"/>
          </svg>
        `;

      /* ==================================================================== *
       * 2. HABITS (العادات - STREAK FLAME)
       * Warm Orange Gradient Squircle, 3D Glowing Layered Flame
       * ==================================================================== */
      case 'habits':
        return `
          <svg viewBox="0 0 100 100" class="unified-icon-svg" xmlns="http://www.w3.org/2000/svg">
            ${getSvgDefinitions()}
            <!-- Background Squircle -->
            <rect width="100" height="100" rx="22" ry="22" fill="url(#u-habits-bg)"/>
            
            <!-- Radiant Base Aura -->
            <ellipse cx="50" cy="68" rx="26" ry="16" fill="#ff3b30" opacity="0.4" filter="url(#u-flame-glow)"/>

            <!-- Outer Flame (Ruby Coral to Deep Orange with Dynamic Top Curl) -->
            <path d="M 48 14 C 54 26, 68 34, 73 48 C 78 64, 69 82, 50 85 C 31 82, 22 64, 27 48 C 31 39, 41 35, 43 25 C 44 19, 46 15, 48 14 Z" 
                  fill="url(#u-flame-outer)" filter="url(#u-drop-shadow)"/>
            
            <!-- Mid Flame (Bright Amber / Golden Flame Layer) -->
            <path d="M 50 27 C 54 36, 64 43, 66 54 C 68 66, 61 78, 50 81 C 39 78, 32 66, 34 54 C 36 45, 44 41, 46 33 Z" 
                  fill="url(#u-flame-mid)"/>

            <!-- Core Flame (Brilliant White to Lemon Glow Teardrop) -->
            <path d="M 50 44 C 53 50, 58 56, 58 64 C 58 72, 54 77, 50 78 C 46 77, 42 72, 42 64 C 42 56, 47 50, 50 44 Z" 
                  fill="url(#u-flame-core)" filter="url(#u-flame-glow)"/>

            <!-- 3D Specular Highlight Gloss Curves -->
            <path d="M 33 46 C 36 38, 43 32, 46 24" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.45"/>
            <path d="M 37 54 C 39 48, 44 44, 46 36" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.35"/>
          </svg>
        `;

      /* ==================================================================== *
       * 3. PHOTO (الصور - GALLERY)
       * Royal Purple Squircle, 3D Golden Beveled Frame, Mountain & Sun Art
       * ==================================================================== */
      case 'photo':
        return `
          <svg viewBox="0 0 100 100" class="unified-icon-svg" xmlns="http://www.w3.org/2000/svg">
            ${getSvgDefinitions()}
            <!-- Background Squircle -->
            <rect width="100" height="100" rx="22" ry="22" fill="url(#u-photo-bg)"/>

            <!-- 3D Beveled Golden Picture Frame -->
            <rect x="18" y="19" width="64" height="62" rx="7" ry="7" fill="url(#u-gold-frame)" filter="url(#u-drop-shadow)"/>
            <rect x="19.5" y="20.5" width="61" height="59" rx="5.5" ry="5.5" fill="none" stroke="#fffbeb" stroke-width="1" opacity="0.75"/>
            <rect x="23.5" y="24.5" width="53" height="51" rx="4" ry="4" fill="none" stroke="#78350f" stroke-width="1.2"/>

            <!-- Framed Canvas Clipping Mask -->
            <g clip-path="url(#photo-canvas-clip)">
              <clipPath id="photo-canvas-clip">
                <rect x="24.5" y="25.5" width="51" height="49" rx="3.5" ry="3.5"/>
              </clipPath>

              <!-- Sky Gradient -->
              <rect x="24.5" y="25.5" width="51" height="49" fill="url(#u-photo-sky)"/>

              <!-- Bright Glowing Sun with Subtle Rays -->
              <circle cx="61" cy="37" r="7" fill="url(#u-photo-sun)" filter="url(#u-soft-shadow)"/>
              <circle cx="61" cy="37" r="10" fill="#fef08a" opacity="0.25"/>

              <!-- Wispy White Cloud -->
              <path d="M 33 38 Q 36 34 40 37 Q 44 33 48 37 Q 50 37 51 39 L 32 39 Z" fill="#ffffff" opacity="0.85"/>

              <!-- Distant Background Mountain Peak (Teal Green) -->
              <polygon points="35,75 52,47 68,75" fill="url(#u-photo-mountain-bg)"/>

              <!-- Foreground Rolling Mountain Hills (Emerald Green) -->
              <path d="M 24 75 Q 36 56 49 66 Q 64 52 76 68 L 76 75 Z" fill="url(#u-photo-mountain-fg)"/>
              
              <!-- Subtle Light Shading on Ridges -->
              <path d="M 49 66 Q 60 55 72 67" stroke="#6ee7b7" stroke-width="1.2" fill="none" opacity="0.6"/>
            </g>
          </svg>
        `;

      /* ==================================================================== *
       * 4. EMAIL (البريد - MESSAGES)
       * Electric Royal Blue Squircle, 3D White Envelope, Red Notification Badge
       * ==================================================================== */
      case 'email':
        const unreadCount = options.count !== undefined ? options.count : 3;
        return `
          <svg viewBox="0 0 100 100" class="unified-icon-svg" xmlns="http://www.w3.org/2000/svg">
            ${getSvgDefinitions()}
            <!-- Background Squircle -->
            <rect width="100" height="100" rx="22" ry="22" fill="url(#u-email-bg)"/>

            <!-- 3D White Envelope Main Body -->
            <rect x="18" y="31" width="64" height="46" rx="6" ry="6" 
                  fill="url(#u-env-body)" filter="url(#u-drop-shadow)"/>
            
            <!-- Side Creases & Lower Seams -->
            <path d="M 19 75 L 43 51 M 81 75 L 57 51" stroke="#cbd5e1" stroke-width="1.4" stroke-linecap="round"/>
            <path d="M 19 33 L 42 53 L 19 74" fill="#f1f5f9" opacity="0.5"/>
            <path d="M 81 33 L 58 53 L 81 74" fill="#f1f5f9" opacity="0.5"/>

            <!-- Top Flap (Triangular 3D Relief Folded Down) -->
            <path d="M 19 33 L 50 58 L 81 33 Z" fill="url(#u-env-flap)" filter="url(#u-soft-shadow)"/>
            <path d="M 20 33 L 50 56 L 80 33" stroke="#ffffff" stroke-width="1" fill="none" opacity="0.8"/>

            <!-- Crisp Notification Badge (Top-Right "3") -->
            ${unreadCount > 0 ? `
              <g class="unified-badge-group">
                <circle cx="79" cy="22" r="12" fill="url(#u-red-badge)" stroke="#ffffff" stroke-width="2.5" filter="url(#u-drop-shadow)"/>
                <text x="79" y="26.5" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', Roboto, sans-serif" 
                      font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">${unreadCount}</text>
              </g>
            ` : ''}
          </svg>
        `;

      /* ==================================================================== *
       * 5. NOTES (الملاحظات / المهام)
       * Warm Amber Squircle, Ivory Paper Sheet with Fold, Diagonal Luxury Pen
       * ==================================================================== */
      case 'notes':
        return `
          <svg viewBox="0 0 100 100" class="unified-icon-svg" xmlns="http://www.w3.org/2000/svg">
            ${getSvgDefinitions()}
            <!-- Background Squircle -->
            <rect width="100" height="100" rx="22" ry="22" fill="url(#u-notes-bg)"/>

            <!-- Ivory Notepad Paper Sheet with Subtle Drop Shadow -->
            <rect x="22" y="18" width="48" height="64" rx="7" ry="7" fill="url(#u-paper-sheet)" filter="url(#u-drop-shadow)"/>
            
            <!-- Bottom-Left Realistic Curled Paper Corner -->
            <path d="M 22 72 L 32 72 L 32 82 Z" fill="#d97706" opacity="0.25"/>
            <path d="M 22 72 Q 27 75 32 82 L 22 82 Z" fill="url(#u-gold-metal)" filter="url(#u-soft-shadow)"/>

            <!-- Horizontal Rule Lines -->
            <line x1="28" y1="31" x2="62" y2="31" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" opacity="0.45"/>
            <line x1="28" y1="40" x2="62" y2="40" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" opacity="0.45"/>
            <line x1="28" y1="49" x2="62" y2="49" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" opacity="0.45"/>
            <line x1="28" y1="58" x2="54" y2="58" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" opacity="0.45"/>

            <!-- Luxury Fountain Pen (Diagonal Black Lacquer & Gold) -->
            <g transform="rotate(-38 52 50)" filter="url(#u-drop-shadow)">
              <!-- Pen Barrel Body -->
              <rect x="48" y="16" width="7" height="42" rx="3.5" fill="url(#u-pen-body)"/>
              <!-- Specular Reflection Stripe -->
              <line x1="49.5" y1="18" x2="49.5" y2="56" stroke="#ffffff" stroke-width="0.8" opacity="0.45"/>
              
              <!-- Gold Trim Rings -->
              <rect x="47.5" y="24" width="8" height="2.5" rx="0.5" fill="url(#u-gold-metal)"/>
              <rect x="47.5" y="44" width="8" height="2" rx="0.5" fill="url(#u-gold-metal)"/>

              <!-- Gold Grip Section -->
              <polygon points="48,58 55,58 54,66 49,66" fill="url(#u-gold-metal)"/>

              <!-- Pointed Gold Fountain Nib -->
              <polygon points="49,66 54,66 51.5,75" fill="url(#u-gold-metal)" stroke="#d97706" stroke-width="0.5"/>
              <line x1="51.5" y1="67" x2="51.5" y2="73" stroke="#451a03" stroke-width="0.6"/>
              <circle cx="51.5" cy="69" r="0.6" fill="#451a03"/>
            </g>
          </svg>
        `;

      /* ==================================================================== *
       * 6. CALENDAR (التقويم)
       * White Porcelain Squircle, Red Header Band, Dual Silver Rings, Dynamic Day
       * ==================================================================== */
      case 'calendar':
        const now = new Date();
        const displayDay = options.day !== undefined ? options.day : now.getDate();
        return `
          <svg viewBox="0 0 100 100" class="unified-icon-svg" xmlns="http://www.w3.org/2000/svg">
            ${getSvgDefinitions()}
            <!-- Background Porcelain White Squircle -->
            <rect width="100" height="100" rx="22" ry="22" fill="url(#u-cal-bg)"/>
            <rect width="100" height="100" rx="22" ry="22" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="1.2"/>

            <!-- Top Binding Red Bar -->
            <path d="M 0 22 C 0 9.8 9.8 0 22 0 L 78 0 C 90.2 0 100 9.8 100 22 L 100 34 L 0 34 Z" fill="url(#u-cal-red)"/>

            <!-- Silver Chrome Binder Rings & Holes -->
            <!-- Left Ring -->
            <ellipse cx="28" cy="18" rx="4.5" ry="3.5" fill="#475569" opacity="0.6"/>
            <rect x="25.5" y="7" width="5" height="15" rx="2.5" fill="url(#u-chrome-ring)" filter="url(#u-soft-shadow)"/>
            <circle cx="28" cy="19" r="2.2" fill="#1e293b"/>

            <!-- Right Ring -->
            <ellipse cx="72" cy="18" rx="4.5" ry="3.5" fill="#475569" opacity="0.6"/>
            <rect x="69.5" y="7" width="5" height="15" rx="2.5" fill="url(#u-chrome-ring)" filter="url(#u-soft-shadow)"/>
            <circle cx="72" cy="19" r="2.2" fill="#1e293b"/>

            <!-- Dynamic Bold Day Numeral -->
            <text x="50" y="72" class="unified-cal-day" id="uCalDayNum"
                  font-size="42" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', Roboto, sans-serif"
                  font-weight="900" fill="#1e293b" letter-spacing="-1">${displayDay}</text>
          </svg>
        `;

      /* ==================================================================== *
       * 7. TODO / NOTEPAD CLIPBOARD (قائمة المهام)
       * Warm Honey Caramel Wood Clipboard, Cream Paper Pad with Ruled Lines,
       * and Hand-Drawn "to do list"
       * ==================================================================== */
      case 'todo':
        return `
          <svg viewBox="0 0 100 100" class="unified-icon-svg" xmlns="http://www.w3.org/2000/svg">
            ${getSvgDefinitions()}
            <!-- Wooden Clipboard Base -->
            <rect width="100" height="100" rx="24" ry="24" fill="url(#u-todo-wood-bg)"/>

            <!-- Wood Grain Accents -->
            <path d="M 22 0 L 22 100 M 48 0 L 48 100 M 76 0 L 76 100" stroke="rgba(255,255,255,0.08)" stroke-width="2.5"/>
            <path d="M 34 0 L 34 100 M 64 0 L 64 100 M 86 0 L 86 100" stroke="rgba(120,60,10,0.06)" stroke-width="1.8"/>

            <!-- Wood Outer Bevel Edge Highlight & Shadow -->
            <rect x="1" y="1" width="98" height="98" rx="23" ry="23" fill="none" stroke="rgba(255,255,255,0.48)" stroke-width="1.2"/>
            <rect x="0.5" y="0.5" width="99" height="99" rx="23.5" ry="23.5" fill="none" stroke="rgba(100,50,10,0.25)" stroke-width="1"/>

            <!-- Paper Sheet with soft drop shadow on wood -->
            <rect x="9.5" y="9.5" width="81" height="81" rx="17" ry="17" fill="url(#u-todo-paper-bg)" filter="url(#u-todo-paper-shadow)"/>
            <rect x="9.5" y="9.5" width="81" height="81" rx="17" ry="17" fill="none" stroke="#e5dfd2" stroke-width="1"/>
            <path d="M 26 10.2 L 74 10.2" stroke="rgba(255,255,255,0.95)" stroke-width="1" stroke-linecap="round"/>

            <!-- Ruled Notebook Lines -->
            <path d="M 18 33.5 L 82 33.5" stroke="#ded8cc" stroke-width="1.2" stroke-linecap="round"/>
            <path d="M 18 48.5 L 82 48.5" stroke="#ded8cc" stroke-width="1.2" stroke-linecap="round"/>
            <path d="M 18 63.5 L 82 63.5" stroke="#ded8cc" stroke-width="1.2" stroke-linecap="round"/>
            <path d="M 18 77.0 L 82 77.0" stroke="#ded8cc" stroke-width="1.2" stroke-linecap="round"/>

            <!-- Handwritten Text: 'to do' on line 1, 'list' on line 2 -->
            <g stroke="#484846" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none">
              <!-- 't' in 'to' -->
              <path d="M 30.5 26.5 L 30.5 43"/>
              <path d="M 26.5 33.5 L 35 33.5"/>

              <!-- 'o' in 'to' -->
              <path d="M 41.5 38.5 C 41.5 33.5, 47.5 33.5, 47.5 38.5 C 47.5 43.5, 41.5 43.5, 41.5 38.5 Z"/>

              <!-- 'd' in 'do' -->
              <path d="M 61 26 L 61 43.5"/>
              <path d="M 61 41.5 C 53.5 41.5, 53.5 34, 61 34"/>

              <!-- 'o' in 'do' -->
              <path d="M 70.5 38.5 C 70.5 33.5, 76.5 33.5, 76.5 38.5 C 76.5 43.5, 70.5 43.5, 70.5 38.5 Z"/>

              <!-- 'l' in 'list' -->
              <path d="M 36.5 44.5 L 36.5 59"/>

              <!-- 'i' stem in 'list' -->
              <path d="M 43.5 49 L 43.5 59"/>

              <!-- 's' in 'list' -->
              <path d="M 52.8 50.8 C 50.8 49.2, 47.2 50.2, 49.2 53.4 C 51.8 56.2, 48.8 59.2, 46.8 58.6"/>

              <!-- 't' in 'list' -->
              <path d="M 57.5 46.5 L 57.5 59"/>
              <path d="M 53.8 51.5 L 61.5 51.5"/>
            </g>

            <!-- Dot on 'i' in 'list' -->
            <circle cx="43.5" cy="45.5" r="1.4" fill="#484846"/>
          </svg>
        `;

      /* ==================================================================== *
       * 8. CLOCK (الساعة)
       * Deep Obsidian Glass Dial, Live Rotating Hands, Center Metallic Pin
       * ==================================================================== */
      case 'clock':
        const date = new Date();
        const mins = date.getMinutes() + date.getSeconds() / 60;
        const hours = (date.getHours() % 12) + mins / 60;
        const degH = hours * 30;
        const degM = mins * 6;
        return `
          <svg viewBox="0 0 100 100" class="unified-icon-svg" xmlns="http://www.w3.org/2000/svg">
            ${getSvgDefinitions()}
            <!-- Outer Dial Bezel -->
            <rect width="100" height="100" rx="22" ry="22" fill="#18181b"/>
            <circle cx="50" cy="50" r="41" fill="url(#u-clock-dial)" stroke="rgba(255,255,255,0.22)" stroke-width="1.8" filter="url(#u-drop-shadow)"/>
            
            <!-- 12 Delicate Hour Marker Ticks -->
            <circle cx="50" cy="16" r="1.5" fill="#ffffff" opacity="0.8"/>
            <circle cx="84" cy="50" r="1.5" fill="#ffffff" opacity="0.8"/>
            <circle cx="50" cy="84" r="1.5" fill="#ffffff" opacity="0.8"/>
            <circle cx="16" cy="50" r="1.5" fill="#ffffff" opacity="0.8"/>

            <!-- Hour Hand (White Rounded Bar) -->
            <g class="unified-clock-hand unified-clock-h" id="uClockH" style="transform: rotate(${degH}deg)">
              <line x1="50" y1="50" x2="50" y2="28" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
            </g>

            <!-- Minute Hand (Vivid Coral-Red Bar) -->
            <g class="unified-clock-hand unified-clock-m" id="uClockM" style="transform: rotate(${degM}deg)">
              <line x1="50" y1="52" x2="50" y2="18" stroke="#f43f5e" stroke-width="2.4" stroke-linecap="round"/>
            </g>

            <!-- Center Metallic Pin -->
            <circle cx="50" cy="50" r="3.2" fill="#ffffff" filter="url(#u-soft-shadow)"/>
            <circle cx="50" cy="50" r="1.4" fill="#f43f5e"/>
          </svg>
        `;

      /* ==================================================================== *
       * 9. POMODORO (مؤقت البومودورو)
       * Tomato Red Squircle, 3D Tomato Body, Green Calyx Stem, Timer Markings
       * ==================================================================== */
      case 'pomodoro':
        return `
          <svg viewBox="0 0 100 100" class="unified-icon-svg" xmlns="http://www.w3.org/2000/svg">
            ${getSvgDefinitions()}
            <!-- Background Squircle -->
            <rect width="100" height="100" rx="22" ry="22" fill="url(#u-pomo-bg)"/>

            <!-- 3D Tomato Timer Body -->
            <ellipse cx="50" cy="57" rx="32" ry="27" fill="#dc2626" filter="url(#u-drop-shadow)"/>
            <ellipse cx="50" cy="56" rx="29" ry="24" fill="#ef4444"/>

            <!-- Timer Scale Ring -->
            <path d="M 28 58 Q 50 67 72 58" stroke="rgba(255,255,255,0.4)" stroke-width="1.4" fill="none" stroke-dasharray="2,3"/>

            <!-- Green Leafy Calyx Crown & Stem -->
            <path d="M 50 36 C 50 28, 54 26, 56 24 C 54 26, 51 30, 50 36 Z" fill="#15803d"/>
            <path d="M 50 36 Q 42 30 36 34 Q 44 38 50 38 Q 56 38 64 34 Q 58 30 50 36 Z" fill="#22c55e" filter="url(#u-soft-shadow)"/>
            <polygon points="50,36 43,42 48,39 52,39 57,42" fill="#16a34a"/>

            <!-- Specular Highlight Curve -->
            <path d="M 32 50 Q 30 62 40 68" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.45"/>
          </svg>
        `;

      default:
        return `
          <svg viewBox="0 0 100 100" class="unified-icon-svg" xmlns="http://www.w3.org/2000/svg">
            ${getSvgDefinitions()}
            <rect width="100" height="100" rx="22" ry="22" fill="#374151"/>
            <circle cx="50" cy="50" r="24" fill="none" stroke="#9ca3af" stroke-width="6"/>
          </svg>
        `;
    }
  }

  /* --------------------------------------------------------------------------
   * 3. MASTER RENDERER FUNCTION (window.renderUnifiedWidgetIcon)
   * -------------------------------------------------------------------------- */

  function renderUnifiedWidgetIcon(wid, options = {}) {
    const el = document.createElement('div');
    el.className = `unified-widget-icon folder-icon-art app-icon-art icon-${wid} art-${wid} app-icon-art-${wid}`;
    el.dataset.widgetId = wid;

    const svgHtml = getWidgetSvgContent(wid, options);
    el.innerHTML = svgHtml;

    // Attach live timers if requested or by default
    if (options.live !== false) {
      setupUnifiedLiveUpdates(wid, el);
    }

    return el;
  }

  /* --------------------------------------------------------------------------
   * 4. LIVE REAL-TIME UPDATES (Clock, Calendar, Unread Badges)
   * -------------------------------------------------------------------------- */

  function setupUnifiedLiveUpdates(wid, element) {
    if (!element) return;

    if (wid === 'clock') {
      const updateHands = () => {
        if (!element.isConnected && !document.body.contains(element)) return;
        const now = new Date();
        const mins = now.getMinutes() + now.getSeconds() / 60;
        const hours = (now.getHours() % 12) + mins / 60;
        const degH = hours * 30;
        const degM = mins * 6;

        const hEl = element.querySelector('#uClockH, .unified-clock-h, .hand-h');
        const mEl = element.querySelector('#uClockM, .unified-clock-m, .hand-m');
        if (hEl) hEl.style.transform = `rotate(${degH}deg)`;
        if (mEl) mEl.style.transform = `rotate(${degM}deg)`;

        // Wake exactly at turn of minute + 50ms buffer
        const nextDelay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;
        setTimeout(updateHands, Math.max(500, nextDelay));
      };
      updateHands();
    } else if (wid === 'calendar') {
      const updateCal = () => {
        if (!element.isConnected && !document.body.contains(element)) return;
        const now = new Date();
        const dayNumEl = element.querySelector('#uCalDayNum, .unified-cal-day, .cal-body');
        if (dayNumEl) dayNumEl.textContent = String(now.getDate());

        // Wake after midnight
        const msUntilTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime() + 1000;
        setTimeout(updateCal, Math.max(10000, msUntilTomorrow));
      };
      updateCal();
    }
  }

  /* --------------------------------------------------------------------------
   * 5. EXPORT AND BINDINGS
   * -------------------------------------------------------------------------- */

  const exportsObj = {
    renderUnifiedWidgetIcon,
    getWidgetSvgContent,
    setupUnifiedLiveUpdates,
  };

  // Browser global environment
  if (typeof window !== 'undefined') {
    window.renderUnifiedWidgetIcon = renderUnifiedWidgetIcon;
    window.createFolderIconArt = renderUnifiedWidgetIcon; // 100% backward compatibility
    window.getWidgetSvgContent = getWidgetSvgContent;
    window.setupUnifiedLiveUpdates = setupUnifiedLiveUpdates;
  }

  // Node environment for tests
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exportsObj;
  }

})(typeof window !== 'undefined' ? window : global);
