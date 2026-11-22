'use strict';

/**
 * Shared Artwork Bridge for Folder & Desktop Drag Ghost
 * Bridges seamlessly to window.renderUnifiedWidgetIcon
 */
(function() {
  function createFolderIconArt(id, options = {}) {
    if (typeof window.renderUnifiedWidgetIcon === 'function') {
      return window.renderUnifiedWidgetIcon(id, options);
    }
    // Fallback if shared-icon-art.js is still loading
    const art = document.createElement('div');
    art.className = `unified-widget-icon folder-icon-art app-icon-art icon-${id} art-${id} app-icon-art-${id}`;
    art.dataset.widgetId = id;
    if (typeof window.getWidgetSvgContent === 'function') {
      art.innerHTML = window.getWidgetSvgContent(id, options);
    }
    return art;
  }

  window.createFolderIconArt = createFolderIconArt;
  if (!window.renderUnifiedWidgetIcon) {
    window.renderUnifiedWidgetIcon = createFolderIconArt;
  }
})();
