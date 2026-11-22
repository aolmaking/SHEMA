'use strict';

/**
 * The Living Atlas (أطلس العوالم الحيّة)
 * Living Map Coordinate Engine & Parchment Vector Generator · Version 1.1
 * 
 * Strict White-Hat & Performance Rules:
 * - High-precision 1000x1000 coordinate system with vector paths.
 * - Dynamic fog-of-discovery calculation based on real accomplishments.
 * - Zero heavy canvas loops; pure declarative SVG rendering.
 * - Official brand asset links for each landmark node.
 */

const MAP_COORDINATES_NODES = Object.freeze([
  {
    id: 'FIRST_HAVEN',
    x: 500,
    y: 680,
    nameAr: 'الملاذ الأول',
    nameEn: 'First Haven',
    region: 'first_haven',
    icon: '🏰',
    assetFile: '01_world_panorama_floating_islands.jpg',
    descriptionAr: 'مرفأ السالكين الآمن ومعقل الرسامين الأوائل وسط الشلالات وجزر السحاب.',
    descriptionEn: 'The safe anchorage of Wayfinders and the first cartographers among cloud waterfalls.',
    unlockCondition: { defaultUnlocked: true },
  },
  {
    id: 'CROSSROADS',
    x: 500,
    y: 380,
    nameAr: 'مفترق الطرق الحجري',
    nameEn: 'The Crossroads',
    region: 'crossroads',
    icon: '🌉',
    assetFile: '03_the_crossroads_stone_bridges.jpg',
    descriptionAr: 'ملتقى الجسور الصخرية المعلقة التي تربط الملاذ بسائر أرجاء الأطلس.',
    descriptionEn: 'The junction of suspended stone bridges connecting the Haven to all atlas realms.',
    unlockCondition: { totalActions: 10 },
  },
  {
    id: 'ARCHIVE_OF_ECHOES',
    x: 250,
    y: 380,
    nameAr: 'أرشيف الأصداء العتيق',
    nameEn: 'Archive of Echoes',
    region: 'archive',
    icon: '📜',
    assetFile: '07_cartographer_study_haven_library.jpg',
    descriptionAr: 'قاعة المخطوطات والخرائط الكبرى؛ هنا تُحفظ أسرار النسيج وفصول الرحلة.',
    descriptionEn: 'The grand hall of folios and maps; here the Weave’s secrets and journey chronicles rest.',
    unlockCondition: { totalActions: 25 },
  },
  {
    id: 'WHISPERING_WOODS',
    x: 750,
    y: 380,
    nameAr: 'غابات الهمس والأراضي الخضراء',
    nameEn: 'Whispering Woods',
    region: 'whispering_woods',
    icon: '🌲',
    assetFile: '04_storybook_map_forest_runes.jpg',
    descriptionAr: 'غابات الرموز المضيئة ومسارات الحيوية واليقظة الذهنية.',
    descriptionEn: 'Forests of luminous runes and trails of bodily vitality and mindfulness.',
    unlockCondition: { totalActions: 25 },
  },
  {
    id: 'IRONFROST_PEAKS',
    x: 500,
    y: 120,
    nameAr: 'قمم الصقيع والجزر العائمة',
    nameEn: 'Ironfrost Peaks',
    region: 'ironfrost_peaks',
    icon: '🏔️',
    assetFile: '08_world_tree_radiant_city.jpg',
    descriptionAr: 'أعالي السحاب وشجرة العالم المشعة حيث تُختبر صلابة الانضباط والعزم.',
    descriptionEn: 'Cloud summits and the Radiant World Tree where steadfast discipline is forged.',
    unlockCondition: { totalActions: 50 },
  },
  {
    id: 'SUNKEN_SPIRES',
    x: 500,
    y: 880,
    nameAr: 'ضفاف السكون والأبراج الغارقة',
    nameEn: 'Sunken Spires',
    region: 'sunken_spires',
    icon: '🌊',
    assetFile: '05_verdant_ruins_mossy_path.jpg',
    descriptionAr: 'أطلال الهدوء الحجري والدروب المعشوشبة وملاذات الاستشفاء والراحة الواعية.',
    descriptionEn: 'Mossy stone sanctuaries and peaceful waters dedicated to conscious healing and stillness.',
    unlockCondition: { totalActions: 15 },
  },
]);

const MAP_CONNECTING_TRAILS = Object.freeze([
  {
    id: 'trail_haven_crossroads',
    fromNodeId: 'FIRST_HAVEN',
    toNodeId: 'CROSSROADS',
    pathD: 'M 500 680 L 500 380',
    affinity: 'DIS',
  },
  {
    id: 'trail_crossroads_archive',
    fromNodeId: 'CROSSROADS',
    toNodeId: 'ARCHIVE_OF_ECHOES',
    pathD: 'M 500 380 Q 375 350 250 380',
    affinity: 'WIS',
  },
  {
    id: 'trail_crossroads_woods',
    fromNodeId: 'CROSSROADS',
    toNodeId: 'WHISPERING_WOODS',
    pathD: 'M 500 380 Q 625 350 750 380',
    affinity: 'VIT',
  },
  {
    id: 'trail_crossroads_peaks',
    fromNodeId: 'CROSSROADS',
    toNodeId: 'IRONFROST_PEAKS',
    pathD: 'M 500 380 L 500 120',
    affinity: 'DIS',
  },
  {
    id: 'trail_haven_spires',
    fromNodeId: 'FIRST_HAVEN',
    toNodeId: 'SUNKEN_SPIRES',
    pathD: 'M 500 680 L 500 880',
    affinity: 'SER',
  },
]);

class AtlasMapEngine {
  /**
   * Evaluates unlocked status for each map node given user accomplishments.
   */
  static evaluateMapNodes(stats = {}) {
    const totalActions = stats.totalActions || 0;

    return MAP_COORDINATES_NODES.map(node => {
      const cond = node.unlockCondition;
      let isUnlocked = Boolean(cond.defaultUnlocked);

      if (cond.totalActions && totalActions >= cond.totalActions) {
        isUnlocked = true;
      }

      return {
        ...node,
        isUnlocked,
        progress: cond.totalActions ? Math.min(100, Math.round((totalActions / cond.totalActions) * 100)) : 100,
        reqActions: cond.totalActions || 0,
      };
    });
  }

  /**
   * Generates interactive, high-performance SVG markup for the Living Map.
   */
  static renderSvgMap(evaluatedNodes = [], options = {}) {
    const activePulseAffinity = options.pulseAffinity || null;

    const nodeMap = new Map();
    evaluatedNodes.forEach(n => nodeMap.set(n.id, n));

    const trailsMarkup = MAP_CONNECTING_TRAILS.map(trail => {
      const from = nodeMap.get(trail.fromNodeId);
      const to = nodeMap.get(trail.toNodeId);
      const isTrailActive = from?.isUnlocked && to?.isUnlocked;
      const isPulsing = activePulseAffinity && trail.affinity === activePulseAffinity;

      const strokeColor = isTrailActive ? '#0284c7' : '#94a3b8';
      const strokeWidth = isTrailActive ? '4' : '2';
      const strokeDash = isTrailActive ? 'none' : '6 6';
      const opacity = isTrailActive ? '0.85' : '0.35';

      return `
        <g class="map-trail-group" id="${trail.id}" data-trail-id="${trail.id}">
          <path d="${trail.pathD}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" stroke-linecap="round" fill="none" opacity="${opacity}" />
          ${isPulsing ? `
            <circle r="6" fill="#38bdf8">
              <animateMotion path="${trail.pathD}" dur="3s" repeatCount="indefinite" />
            </circle>
          ` : ''}
        </g>
      `;
    }).join('\n');

    const nodesMarkup = evaluatedNodes.map(node => {
      const isUnlocked = node.isUnlocked;
      const fillCircle = isUnlocked ? '#f0fdf4' : '#f1f5f9';
      const strokeCircle = isUnlocked ? '#10b981' : '#94a3b8';
      const textColor = isUnlocked ? '#0f172a' : '#64748b';

      return `
        <g class="map-node ${isUnlocked ? 'unlocked' : 'locked'}" data-node-id="${node.id}" style="cursor: pointer;" transform="translate(${node.x}, ${node.y})">
          <!-- Outer Aura Glow -->
          <circle cx="0" cy="0" r="32" fill="${isUnlocked ? 'rgba(16, 185, 129, 0.18)' : 'rgba(148, 163, 184, 0.08)'}" />
          <!-- Node Badge -->
          <circle cx="0" cy="0" r="24" fill="${fillCircle}" stroke="${strokeCircle}" stroke-width="${isUnlocked ? '3' : '2'}" />
          <!-- Icon -->
          <text x="0" y="6" text-anchor="middle" font-size="20">${isUnlocked ? node.icon : '🔒'}</text>
          <!-- Label Banner -->
          <rect x="-70" y="32" width="140" height="22" rx="6" fill="rgba(255, 255, 255, 0.92)" stroke="${strokeCircle}" stroke-width="1" />
          <text x="0" y="47" text-anchor="middle" font-size="11.5" font-weight="700" fill="${textColor}">${node.nameAr}</text>
        </g>
      `;
    }).join('\n');

    return `
<svg class="living-parchment-svg" viewBox="0 0 1000 1000" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="parchmentBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fffbeb" />
      <stop offset="70%" stop-color="#fef3c7" />
      <stop offset="100%" stop-color="#fde68a" />
    </radialGradient>
    <filter id="parchmentShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.08" />
    </filter>
  </defs>

  <!-- Parchment Canvas Background -->
  <rect x="0" y="0" width="1000" height="1000" rx="20" fill="url(#parchmentBg)" />

  <!-- Compass Rose Watermark -->
  <g transform="translate(880, 120)" opacity="0.3">
    <circle cx="0" cy="0" r="45" fill="none" stroke="#b45309" stroke-width="2" />
    <polygon points="0,-40 6,-8 40,0 6,6 0,40 -6,6 -40,0 -6,-8" fill="#d97706" />
    <text x="0" y="-46" text-anchor="middle" font-size="12" font-weight="700" fill="#b45309">N</text>
  </g>

  <!-- Connecting Trails -->
  ${trailsMarkup}

  <!-- Landmark Nodes -->
  ${nodesMarkup}
</svg>
    `.trim();
  }
}

module.exports = {
  MAP_COORDINATES_NODES,
  MAP_CONNECTING_TRAILS,
  AtlasMapEngine,
};
