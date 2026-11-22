'use strict';

/**
 * Smart Folder Widget Logic
 * Provides an authentic Apple / iOS Smart Folder experience on desktop,
 * supporting 2x2 compact live view and smooth animated expansion to full view.
 */

(function () {
  const { $, $$, boot, t, strings } = window.UI;

  strings({
    ar: {
      'folder.defaultTitle': 'أدوات مساعدة',
      'folder.editTitlePh': 'انقر لتعديل الاسم',
      'folder.closeEsc': 'إغلاق (Esc)',
      'folder.managerTitle': 'تخصيص ويتجات المجلد',
      'folder.managerSub': 'حدد الويتجات التي تريد وضعها داخل المجلد، ويمكنك إعادة ترتيبها بالسحب والإفلات:',
      'folder.saveChanges': 'حفظ التغييرات',
      'folder.runningClickToClose': 'يعمل حالياً - انقر للإغلاق',
      'folder.clickToOpenOrDrag': 'انقر للتشغيل / اسحب لسطح المكتب',
      'folder.clickToOpen': 'انقر لتشغيل {title}',
      'folder.dragToDetach': 'اسحب لسطح المكتب لإخراجه',
      'folder.statusMini': 'مصغر',
      'folder.statusRunning': 'يعمل حالياً',
      'folder.moveUp': 'تحريك لأعلى',
      'folder.moveDown': 'تحريك لأسفل',
      'w.clock': 'الساعة',
      'w.pomodoro': 'مؤقت التركيز',
      'w.calendar': 'التقويم',
      'w.habits': 'العادات والعافية',
      'w.todo': 'قائمة المهام',
      'w.quran': 'آية وتفسير',
      'w.notes': 'الملاحظات',
      'w.email': 'البريد الإلكتروني',
      'w.photo': 'إطار الصور',
    },
    en: {
      'folder.defaultTitle': 'Utilities',
      'folder.editTitlePh': 'Click to edit folder name',
      'folder.closeEsc': 'Close (Esc)',
      'folder.managerTitle': 'Customize Folder Widgets',
      'folder.managerSub': 'Select widgets to place inside this folder, or reorder them by dragging:',
      'folder.saveChanges': 'Save Changes',
      'folder.runningClickToClose': 'Running - click to close',
      'folder.clickToOpenOrDrag': 'Click to launch / Drag to desktop',
      'folder.clickToOpen': 'Click to launch {title}',
      'folder.dragToDetach': 'Drag to desktop to detach',
      'folder.statusMini': 'Minimized',
      'folder.statusRunning': 'Running',
      'folder.moveUp': 'Move up',
      'folder.moveDown': 'Move down',
      'w.clock': 'Clock',
      'w.pomodoro': 'Focus Timer',
      'w.calendar': 'Calendar',
      'w.habits': 'Habits & Wellness',
      'w.todo': 'Tasks & To-Do',
      'w.quran': 'Ayah & Tafsir',
      'w.notes': 'Notes',
      'w.email': 'Email',
      'w.photo': 'Photo Frame',
    },
  });

  const ALL_AVAILABLE_WIDGETS = [
    { id: 'clock', title: 'الساعة' },
    { id: 'pomodoro', title: 'مؤقت التركيز' },
    { id: 'calendar', title: 'التقويم' },
    { id: 'habits', title: 'العادات والعافية' },
    { id: 'todo', title: 'قائمة المهام' },
    { id: 'quran', title: 'آية وتفسير' },
    { id: 'notes', title: 'الملاحظات' },
    { id: 'email', title: 'البريد الإلكتروني' },
    { id: 'photo', title: 'إطار الصور' },
  ];

  const urlParams = new URLSearchParams(window.location.search);
  const currentFolderId = urlParams.get('folderId') || 'folder_1';

  let state = {
    title: 'أدوات مساعدة',
    widgetIds: [],
    quickSlots: [],
    groupMinis: false,
    isExpanded: false,
    widgetStatus: {},
  };

  let clockInterval = null;

  /* ==================================================================== *
   * 1. ARTWORK BUILDERS (HIGH-FIDELITY APPLE SQUIRCLE ICONS)
   * ==================================================================== */

  function createIconArt(id) {
    if (typeof window.renderUnifiedWidgetIcon === 'function') {
      return window.renderUnifiedWidgetIcon(id, { context: 'folder-slot' });
    }
    if (typeof window.createFolderIconArt === 'function') {
      return window.createFolderIconArt(id);
    }
    const art = document.createElement('div');
    art.className = `folder-icon-art art-${id}`;

    switch (id) {
      case 'clock': {
        const face = document.createElement('div');
        face.className = 'clock-face';
        const now = new Date();
        const mins = now.getMinutes() + now.getSeconds() / 60;
        const hours = (now.getHours() % 12) + mins / 60;
        const degH = hours * 30;
        const degM = mins * 6;

        const hHand = document.createElement('div');
        hHand.className = 'clock-hand hand-h';
        hHand.style.transform = `rotate(${degH}deg)`;

        const mHand = document.createElement('div');
        mHand.className = 'clock-hand hand-m';
        mHand.style.transform = `rotate(${degM}deg)`;

        const pin = document.createElement('div');
        pin.className = 'clock-pin';

        face.append(hHand, mHand, pin);
        art.append(face);
        break;
      }
      case 'pomodoro': {
        const inner = document.createElement('div');
        inner.className = 'pomo-inner';
        inner.textContent = '🍅';
        art.append(inner);
        break;
      }
      case 'calendar': {
        const top = document.createElement('div');
        top.className = 'cal-top';
        const now = new Date();
        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        top.textContent = monthNames[now.getMonth()];

        const body = document.createElement('div');
        body.className = 'cal-body';
        body.textContent = String(now.getDate());

        art.append(top, body);
        break;
      }
      case 'habits':
        art.innerHTML = '<span class="icon-glyph">🔥</span>';
        break;
      case 'todo':
        art.innerHTML = '<span class="icon-glyph">📋</span>';
        break;
      case 'quran':
        art.innerHTML = '<span class="icon-glyph">📖</span>';
        break;
      case 'notes': {
        const fold = document.createElement('div');
        fold.className = 'app-icon-note-fold';
        const lines = document.createElement('div');
        lines.className = 'app-icon-note-lines';
        lines.innerHTML = '<span></span><span></span><span></span>';
        const pencil = document.createElement('div');
        pencil.className = 'app-icon-note-pencil';
        pencil.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';
        art.append(fold, lines, pencil);
        break;
      }
      case 'email':
        art.innerHTML = '<span class="icon-glyph">✉️</span>';
        break;
      case 'photo':
        art.innerHTML = '<span class="icon-glyph">🖼️</span>';
        break;
      default:
        art.innerHTML = '<span class="icon-glyph">⚙️</span>';
        break;
    }

    return art;
  }

  function getWidgetTitle(id) {
    const key = `w.${id}`;
    const translated = t(key);
    if (translated && translated !== key) return translated;
    const item = ALL_AVAILABLE_WIDGETS.find(w => w.id === id);
    return item ? item.title : id;
  }

  /* ==================================================================== *
   * 2. DRAG-AND-DROP REORDER & BIDIRECTIONAL DETACH TO DESKTOP
   * ==================================================================== */

  let lastDraggedWid = null;

  function makeIconDraggable(element, wid) {
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let ghost = null;
    let lastSwapTime = 0;
    let isDesktopGhostActive = false;

    element.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      startX = e.clientX;
      startY = e.clientY;
      isDragging = false;
      isDesktopGhostActive = false;

      const onPointerMove = (moveEv) => {
        const dx = moveEv.clientX - startX;
        const dy = moveEv.clientY - startY;
        const dist = Math.hypot(dx, dy);

        if (!isDragging && dist > 35) {
          isDragging = true;
          lastDraggedWid = wid;
          document.body.classList.add('is-dragging');
          try { element.setPointerCapture(e.pointerId); } catch { /* ignore */ }

          element.classList.add('is-empty-placeholder');

          ghost = document.createElement('div');
          ghost.className = 'drag-out-ghost';
          ghost.appendChild(createIconArt(wid));
          ghost.style.left = `${moveEv.clientX - 22}px`;
          ghost.style.top = `${moveEv.clientY - 22}px`;
          document.body.appendChild(ghost);
        }

        if (isDragging && ghost) {
          const card = state.isExpanded ? $('#folderExpandedCard') : $('#folderSquircleCard');
          let isOutside = false;
          if (card) {
            const rect = card.getBoundingClientRect();
            isOutside = (
              moveEv.clientX < rect.left - 40 || moveEv.clientX > rect.right + 40 ||
              moveEv.clientY < rect.top - 40 || moveEv.clientY > rect.bottom + 40
            );
          }

          if (isOutside) {
            // Dragging outside folder card: hide in-window ghost and drive desktop proxy window!
            ghost.style.opacity = '0';
            ghost.style.pointerEvents = 'none';

            if (!isDesktopGhostActive) {
              isDesktopGhostActive = true;
              if (window.widgets?.folder?.dragOutStart) {
                window.widgets.folder.dragOutStart(wid, {
                  screenX: moveEv.screenX,
                  screenY: moveEv.screenY,
                });
              }
            } else {
              if (window.widgets?.folder?.dragOutMove) {
                window.widgets.folder.dragOutMove({
                  screenX: moveEv.screenX,
                  screenY: moveEv.screenY,
                });
              }
            }
          } else {
            // Dragging inside folder card: restore in-window ghost and hide desktop ghost
            if (isDesktopGhostActive) {
              isDesktopGhostActive = false;
              if (window.widgets?.folder?.dragOutCancel) {
                window.widgets.folder.dragOutCancel();
              }
            }
            ghost.style.opacity = '1';
            ghost.style.left = `${moveEv.clientX - 22}px`;
            ghost.style.top = `${moveEv.clientY - 22}px`;

            // In-folder drag and drop reordering
            const now = Date.now();
            if (now - lastSwapTime > 110) {
              const elBelow = document.elementFromPoint(moveEv.clientX, moveEv.clientY);
              const targetBtn = elBelow ? elBelow.closest('.folder-slot-btn, .expanded-item-btn') : null;
              const targetId = targetBtn?.dataset?.id;

              if (targetId && targetId !== wid) {
                const oldIdx = state.widgetIds.indexOf(wid);
                const newIdx = state.widgetIds.indexOf(targetId);
                if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
                  lastSwapTime = now;
                  state.widgetIds.splice(oldIdx, 1);
                  state.widgetIds.splice(newIdx, 0, wid);

                  if (state.quickSlots && state.quickSlots.includes(wid)) {
                    const qOld = state.quickSlots.indexOf(wid);
                    const qNew = state.quickSlots.indexOf(targetId);
                    if (qOld !== -1 && qNew !== -1) {
                      state.quickSlots.splice(qOld, 1);
                      state.quickSlots.splice(qNew, 0, wid);
                    }
                  }

                  if (state.isExpanded) renderExpandedView();
                  else renderCompactView();

                  const newSlot = document.querySelector(`[data-id="${wid}"]`);
                  if (newSlot) newSlot.classList.add('is-empty-placeholder');
                }
              }
            }
          }
        }
      };

      const cleanupAllPlaceholders = () => {
        document.body.classList.remove('is-dragging');
        document.querySelectorAll('.is-empty-placeholder').forEach(el => el.classList.remove('is-empty-placeholder'));
        if (ghost) {
          ghost.remove();
          ghost = null;
        }
      };

      const onPointerUp = async (upEv) => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        window.removeEventListener('blur', cleanupAllPlaceholders);

        if (isDragging) {
          try { element.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
          cleanupAllPlaceholders();

          const card = state.isExpanded ? $('#folderExpandedCard') : $('#folderSquircleCard');
          let isOutside = false;
          if (card) {
            const rect = card.getBoundingClientRect();
            isOutside = (
              upEv.clientX < rect.left - 40 || upEv.clientX > rect.right + 40 ||
              upEv.clientY < rect.top - 40 || upEv.clientY > rect.bottom + 40
            );
          }

          if (isOutside) {
            // DETACH WIDGET TO DESKTOP AS AN ICON!
            if (ghost) ghost.remove();

            // 1. Remove the widget from this folder's items
            state.widgetIds = (state.widgetIds || []).filter(id => id !== wid);
            state.quickSlots = (state.quickSlots || []).filter(id => id !== wid);

            // 2. Detach on desktop backend
            if (window.widgets?.folder?.dragOutEnd) {
              await window.widgets.folder.dragOutEnd({
                id: wid,
                folderId: currentFolderId,
                screenX: upEv.screenX,
                screenY: upEv.screenY,
                isOutside: true,
              });
            } else if (window.widgets?.folder?.detachWidget) {
              await window.widgets.folder.detachWidget(wid, {
                screenX: upEv.screenX,
                screenY: upEv.screenY,
              }, currentFolderId);
            }

            // 3. Update folder UI if it still has >= 2 widgets
            if (state.widgetIds.length >= 2) {
              await saveFolderSettings();
              if (state.isExpanded) renderExpandedView();
              renderCompactView();
            }
          } else {
            // Dropped inside folder: save the new order immediately
            if (isDesktopGhostActive && window.widgets?.folder?.dragOutCancel) {
              window.widgets.folder.dragOutCancel();
            }
            saveFolderSettings();
            if (ghost) {
              ghost.style.transition = 'transform 0.15s ease, opacity 0.15s ease';
              ghost.style.transform = 'scale(0.8)';
              ghost.style.opacity = '0';
              setTimeout(() => ghost && ghost.remove(), 150);
            }
            const curSlot = document.querySelector(`[data-id="${wid}"]`);
            if (curSlot) curSlot.classList.remove('is-empty-placeholder');
          }

          isDesktopGhostActive = false;
          setTimeout(() => {
            if (lastDraggedWid === wid) lastDraggedWid = null;
          }, 150);
        }
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
      window.addEventListener('blur', cleanupAllPlaceholders);
    });
  }

  /* ==================================================================== *
   * 3. RENDER ADAPTIVE RESPONSIVE COMPACT VIEW
   * ==================================================================== */

  const MIN_ICON_SIZE = 28; // Clean uniform icon bound in pixels
  const MAX_ICON_SIZE = 54; // Standard desktop icon matching bound
  let _lastAdaptiveLayout = null;

  function computeAdaptiveGrid(cardW, cardH, totalWidgets = 4) {
    const N = Math.max(1, totalWidgets);
    const isWideDock = (cardW / Math.max(1, cardH) >= 1.35);
    const isTallDock = (cardH / Math.max(1, cardW) >= 1.35);
    const isDockAspect = isWideDock || isTallDock;

    if (!cardW || !cardH || cardW < 24 || cardH < 24) {
      const fallbackCols = isWideDock ? N : (isTallDock ? 1 : Math.min(N, 2));
      const fallbackRows = isWideDock ? 1 : (isTallDock ? N : Math.ceil(N / fallbackCols));
      return {
        cols: fallbackCols, rows: fallbackRows, capacity: fallbackCols * fallbackRows, showTitles: false,
        artSize: 44, slotRadius: 11, titleFontSize: 9,
        gap: 6, gapX: 6, gapY: 6, gridMaxW: isWideDock ? (cardW || 300) : 96, gridMaxH: isTallDock ? (cardH || 300) : 96,
        visibleCount: N, centerLastRow: false
      };
    }

    const maxArtSize = isDockAspect ? 54 : 48;
    const prefArtSize = isDockAspect ? 48 : 44;
    const maxGapAllowed = isDockAspect ? 16 : 8;

    const padX = isDockAspect ? Math.max(6, Math.min(12, Math.round(cardW * 0.03))) : Math.max(8, Math.min(16, Math.round(cardW * 0.05)));
    const padY = isDockAspect ? Math.max(6, Math.min(12, Math.round(cardH * 0.03))) : Math.max(8, Math.min(16, Math.round(cardH * 0.05)));
    const showTitles = Boolean(typeof state !== 'undefined' && state.showCompactTitles && cardW >= 320 && cardH >= 240);

    // Determine how many items to display (up to 9 in compact squircle, or up to 16 in expanded dimensions)
    const visibleCount = cardW >= 300 && cardH >= 300 ? Math.min(N, 16) : Math.min(N, 9);

    if (typeof AdaptiveLayoutEngine !== 'undefined' && AdaptiveLayoutEngine.calculateAdaptiveLayout) {
      const engineRes = AdaptiveLayoutEngine.calculateAdaptiveLayout({
        width: cardW,
        height: cardH,
        itemCount: visibleCount,
        minSize: MIN_ICON_SIZE,
        maxSize: maxArtSize,
        preferredSize: prefArtSize,
        minGap: 5,
        maxGap: maxGapAllowed,
        padding: { left: padX, right: padX, top: padY, bottom: padY },
        showTitles,
        previousLayout: _lastAdaptiveLayout
      });

      _lastAdaptiveLayout = engineRes;

      const cols = engineRes.cols;
      const rows = engineRes.rows;
      const artSize = engineRes.artSize;
      const gap = engineRes.gapX;
      const slotRadius = Math.max(7, Math.min(14, Math.round(artSize * 0.25)));
      const titleFontSize = Math.max(8.5, Math.min(10, Math.round(artSize * 0.22)));
      const gridMaxW = engineRes.gridWidth;
      const gridMaxH = engineRes.gridHeight;
      const capacity = cols * rows;

      return {
        cols,
        rows,
        capacity,
        showTitles,
        artSize,
        slotRadius,
        titleFontSize,
        gap,
        gapX: engineRes.gapX,
        gapY: engineRes.gapY,
        gridMaxW,
        gridMaxH,
        visibleCount,
        centerLastRow: engineRes.centerLastRow,
        rawLayout: engineRes
      };
    }

    const netW = Math.max(36, cardW - padX * 2);
    const netH = Math.max(36, cardH - padY * 2);
    const aspect = cardW / cardH;

    let cols = 2;
    let rows = 2;

    if (visibleCount === 1) {
      cols = 1;
      rows = 1;
    } else if (visibleCount === 2) {
      if (aspect < 0.82) {
        cols = 1;
        rows = 2;
      } else {
        cols = 2;
        rows = 1;
      }
    } else if (visibleCount === 3) {
      if (aspect >= 1.35) {
        cols = 3;
        rows = 1;
      } else if (aspect <= 0.72) {
        cols = 1;
        rows = 3;
      } else {
        cols = 2;
        rows = 2;
      }
    } else if (visibleCount === 4) {
      if (aspect >= 1.85) {
        cols = 4;
        rows = 1;
      } else if (aspect <= 0.55) {
        cols = 1;
        rows = 4;
      } else {
        cols = 2;
        rows = 2;
      }
    } else if (visibleCount <= 6) {
      if (aspect >= 2.2) {
        cols = visibleCount;
        rows = 1;
      } else if (aspect >= 1.15) {
        cols = 3;
        rows = 2;
      } else if (aspect <= 0.82) {
        cols = 2;
        rows = 3;
      } else {
        cols = 3;
        rows = 2;
      }
    } else {
      cols = 3;
      rows = 3;
    }

    const gap = Math.max(5, Math.min(8, Math.round(Math.min(cardW, cardH) * 0.03)));
    const cellW = Math.floor((netW - gap * (cols - 1)) / cols);
    const cellH = Math.floor((netH - gap * (rows - 1)) / rows);

    const maxFittingArt = showTitles ? Math.min(cellW - 6, cellH - 18) : Math.min(cellW - 4, cellH - 4);
    const artSize = Math.max(MIN_ICON_SIZE, Math.min(MAX_ICON_SIZE, maxFittingArt));
    const slotRadius = Math.max(7, Math.min(12, Math.round(artSize * 0.25)));
    const titleFontSize = Math.max(8.5, Math.min(10, Math.round(artSize * 0.22)));
    const gridMaxW = cols * artSize + (cols - 1) * gap + 4;
    const capacity = cols * rows;

    return { cols, rows, capacity, showTitles, artSize, slotRadius, titleFontSize, gap, gapX: gap, gapY: gap, gridMaxW, gridMaxH: rows * artSize + (rows - 1) * gap + 4, visibleCount, centerLastRow: false };
  }

  function attachHoverPeek(element, wid) {
    // Automatic hover peek disabled so elements never pop up or vanish on mouse hover
    return;
  }

  function createSlotButton(wid, showTitle) {
    const btn = document.createElement('button');
    btn.className = 'folder-slot-btn slot-large';
    btn.dataset.id = wid;
    btn.style.opacity = '';

    btn.appendChild(createIconArt(wid));

    const dot = document.createElement('span');
    dot.className = 'slot-status-dot';
    btn.appendChild(dot);

    const st = state.widgetStatus && state.widgetStatus[wid];
    const isActive = Boolean(st && st.isRunning && st.visible && !st.isMini);
    btn.classList.toggle('is-active', isActive);
    btn.title = isActive
      ? `${getWidgetTitle(wid)} (${t('folder.runningClickToClose')})`
      : `${getWidgetTitle(wid)} (${t('folder.clickToOpenOrDrag')})`;

    if (showTitle) {
      const titleSpan = document.createElement('span');
      titleSpan.className = 'folder-slot-title';
      titleSpan.textContent = getWidgetTitle(wid);
      btn.appendChild(titleSpan);
    }

    makeIconDraggable(btn, wid);
    attachHoverPeek(btn, wid);

    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (lastDraggedWid === wid) return;
      btn.classList.add('slot-opening');
      setTimeout(() => btn.classList.remove('slot-opening'), 400);
      await activateWidget(wid);
      await refreshWidgetStatus();
      setTimeout(refreshWidgetStatus, 200);
    });

    return btn;
  }

  let _flipManager = null;
  function getFlipManager() {
    if (!_flipManager && typeof FlipMotion !== 'undefined' && FlipMotion.FlipManager) {
      const grid = $('#folderGrid2x2');
      if (grid) {
        _flipManager = new FlipMotion.FlipManager(grid, {
          duration: 220,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          selector: '.folder-slot-btn',
          idAttribute: 'data-id'
        });
      }
    }
    return _flipManager;
  }

  function renderCompactView(forceRebuild = false) {
    const grid = $('#folderGrid2x2');
    const titleEl = $('#compactFolderTitle');
    const card = $('#folderSquircleCard');
    if (!grid) return;

    if (titleEl) {
      titleEl.textContent = state.title || 'أدوات مساعدة';
    }

    const rawWidgets = Array.isArray(state.widgetIds) ? state.widgetIds : [];
    const allWidgets = rawWidgets.filter(wid => {
      if (state.widgetStatus && state.widgetStatus[wid]) {
        return state.widgetStatus[wid].enabled !== false;
      }
      return true;
    });
    const totalWidgets = allWidgets.length;

    const winW = window.innerWidth || 170;
    const winH = window.innerHeight || 150;
    const isWideAspect = winW >= winH * 1.35;
    const isTallAspect = winH >= winW * 1.35;

    const w = Math.round((card && card.clientWidth > 0) ? card.clientWidth : winW);
    const h = Math.round((card && card.clientHeight > 0) ? card.clientHeight : (isWideAspect ? winH : Math.max(40, winH - 20)));
    const m = computeAdaptiveGrid(w, h, totalWidgets);

    const isDockH = (m.rows === 1 && m.cols >= 2) || isWideAspect;
    const isDockV = (m.cols === 1 && m.rows >= 2) || isTallAspect;
    document.documentElement.classList.toggle('is-dock-h', isDockH);
    document.documentElement.classList.toggle('is-dock-v', isDockV);
    document.documentElement.classList.toggle('is-dock-mode', isDockH || isDockV);

    // Set dynamic CSS properties on grid and card
    grid.style.setProperty('--folder-cols', String(m.cols));
    grid.style.setProperty('--folder-rows', String(m.rows));
    grid.style.setProperty('--folder-gap-x', `${m.gapX || m.gap}px`);
    grid.style.setProperty('--folder-gap-y', `${m.gapY || m.gap}px`);
    grid.style.setProperty('--folder-gap', `${m.gap}px`);
    grid.style.setProperty('--grid-max-w', isDockH ? '100%' : `${m.gridMaxW}px`);
    grid.style.setProperty('--grid-max-h', isDockV ? '100%' : `${m.gridMaxH || m.gridMaxW}px`);

    grid.classList.remove('has-centered-last-item');

    if (card) {
      card.style.setProperty('--art-size', `${m.artSize}px`);
      card.style.setProperty('--art-radius', `${m.slotRadius}px`);
      card.style.setProperty('--slot-radius', `${m.slotRadius}px`);
      card.style.setProperty('--title-font-size', `${m.titleFontSize}px`);
      card.classList.toggle('has-slot-titles', m.showTitles);
    }

    const maxSlots = m.capacity;
    const needsOverflowBadge = totalWidgets > maxSlots || totalWidgets > 9;
    const directCount = needsOverflowBadge ? Math.min(8, maxSlots - 1) : Math.min(totalWidgets, maxSlots);
    const displayWidgets = allWidgets.slice(0, directCount);

    const layoutKey = `${m.cols}x${m.rows}_${m.showTitles}_${m.capacity}_${displayWidgets.join(',')}`;

    if (!forceRebuild && card && card._lastLayoutKey === layoutKey) {
      // Fast path: update status indicators without touching DOM structure or FLIP motion
      grid.querySelectorAll('.folder-slot-btn').forEach(btn => {
        if (btn.style.opacity === '0') {
          btn.style.opacity = '';
        }
        const wid = btn.dataset.id;
        if (wid && wid !== '__overflow_more__') {
          const st = state.widgetStatus && state.widgetStatus[wid];
          const isActive = Boolean(st && st.isRunning && st.visible && !st.isMini);
          btn.classList.toggle('is-active', isActive);
        }
      });
      return;
    }
    if (card) card._lastLayoutKey = layoutKey;

    // FLIP: Step 1 - snapshot before geometry changes
    const flipper = getFlipManager();
    if (flipper) {
      flipper.snapshot();
    }

    // Reuse existing slot buttons if IDs match, and unconditionally strip any stale transforms and opacities
    const existingButtons = new Map();
    Array.from(grid.children).forEach(child => {
      if (child.dataset && child.dataset.id) {
        child.style.transform = '';
        child.style.transition = '';
        child.style.opacity = '';
        child.style.willChange = '';
        child.style.transformOrigin = '';
        existingButtons.set(child.dataset.id, child);
      }
    });

    grid.innerHTML = '';

    displayWidgets.forEach((wid) => {
      let btn = existingButtons.get(wid);
      if (!btn) {
        btn = createSlotButton(wid, m.showTitles);
      } else {
        btn.style.opacity = '';
        const titleEl = btn.querySelector('.folder-slot-title');
        if (m.showTitles && !titleEl) {
          const newTitle = document.createElement('span');
          newTitle.className = 'folder-slot-title';
          newTitle.textContent = getWidgetTitle(wid);
          btn.appendChild(newTitle);
        } else if (!m.showTitles && titleEl) {
          titleEl.remove();
        }
        let dot = btn.querySelector('.slot-status-dot');
        if (!dot) {
          dot = document.createElement('span');
          dot.className = 'slot-status-dot';
          btn.appendChild(dot);
        }
        const st = state.widgetStatus && state.widgetStatus[wid];
        const isActive = Boolean(st && st.isRunning && st.visible && !st.isMini);
        btn.classList.toggle('is-active', isActive);
        btn.title = isActive
          ? `${getWidgetTitle(wid)} (${t('folder.runningClickToClose')})`
          : `${getWidgetTitle(wid)} (${t('folder.clickToOpenOrDrag')})`;
      }
      grid.appendChild(btn);
    });

    if (totalWidgets > displayWidgets.length) {
      const remainingCount = totalWidgets - displayWidgets.length;
      let moreBtn = existingButtons.get('__overflow_more__');
      if (!moreBtn) {
        moreBtn = document.createElement('button');
        moreBtn.className = 'folder-slot-btn slot-more-badge';
        moreBtn.dataset.id = '__overflow_more__';
        moreBtn.title = `+${remainingCount}`;

        const moreArt = document.createElement('div');
        moreArt.className = 'folder-icon-art art-more-badge';
        moreArt.innerHTML = `<span>+${remainingCount}</span>`;
        moreBtn.appendChild(moreArt);

        moreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openExpandedFolder();
        });
      } else {
        const span = moreBtn.querySelector('span');
        if (span) span.textContent = `+${remainingCount}`;
      }

      grid.appendChild(moreBtn);
    }

    // FLIP: Step 2, 3, 4 - Last, Invert, Play
    if (flipper) {
      flipper.play({ duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    }
  }

  /* ==================================================================== *
   * 4. RENDER EXPANDED VIEW
   * ==================================================================== */

  function renderExpandedView() {
    const grid = $('#expandedGrid');
    const inputTitle = $('#inputFolderTitle');
    if (!grid) return;

    if (inputTitle) inputTitle.value = state.title || 'أدوات مساعدة';

    // Refresh widget status asynchronously without delaying initial layout
    if (window.widgets?.folder?.getWidgetStatus) {
      window.widgets.folder.getWidgetStatus().then((res) => {
        if (res) {
          state.widgetStatus = res;
          updateAllStatusIndicators();
        }
      }).catch(() => {});
    }

    grid.innerHTML = '';

    const displayWidgets = (state.widgetIds || []).filter(wid => {
      if (state.widgetStatus && state.widgetStatus[wid]) {
        return state.widgetStatus[wid].enabled !== false;
      }
      return true;
    });

    displayWidgets.forEach((wid, idx) => {
      const itemBtn = document.createElement('button');
      itemBtn.className = 'expanded-item-btn';
      itemBtn.style.setProperty('--item-idx', String(idx));
      itemBtn.dataset.id = wid;

      const iconWrap = document.createElement('div');
      iconWrap.className = 'expanded-icon-wrap';
      iconWrap.appendChild(createIconArt(wid));

      // Active status dot
      const st = (state.widgetStatus && state.widgetStatus[wid]) || {};
      const isActive = Boolean(st.isRunning && st.visible && !st.isMini);
      itemBtn.title = isActive
        ? `${getWidgetTitle(wid)} (${t('folder.runningClickToClose')})`
        : `${t('folder.clickToOpen', { title: getWidgetTitle(wid) })} (${t('folder.dragToDetach')})`;

      const dot = document.createElement('span');
      dot.className = 'item-status-dot';
      if (st.isMini) {
        dot.classList.add('is-mini');
        dot.title = t('folder.statusMini');
      } else if (!st.isRunning && !st.visible) {
        dot.classList.add('is-closed');
      } else {
        dot.title = t('folder.statusRunning');
      }
      iconWrap.appendChild(dot);

      const title = document.createElement('span');
      title.className = 'expanded-item-title';
      title.textContent = getWidgetTitle(wid);

      itemBtn.append(iconWrap, title);
      makeIconDraggable(itemBtn, wid);
      attachHoverPeek(itemBtn, wid);

      itemBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (lastDraggedWid === wid) return;
        await activateWidget(wid);
        await refreshWidgetStatus();
        setTimeout(refreshWidgetStatus, 200);
      });

      grid.appendChild(itemBtn);
    });
  }

  /* ==================================================================== *
   * 5. ANIMATION & STATE TRANSITIONS (SMOOTH OPEN / CLOSE)
   * ==================================================================== */

  async function openExpandedFolder() {
    if (state.isExpanded) return;
    state.isExpanded = true;

    const plate = $('#folderPlate');
    const expandedView = $('#folderExpandedView');

    if (plate) {
      plate.classList.remove('is-closing');
    }

    // 1. Build DOM items in advance so the expanded card is ready to display instantly
    renderExpandedView();

    if (expandedView) {
      expandedView.style.display = 'flex';
      void expandedView.offsetHeight; // Force layout reflow
    }

    if (plate) {
      plate.classList.add('is-expanded');
    }

    // 2. Expand Electron BrowserWindow concurrently with smooth animation
    if (window.widgets?.folder?.expand) {
      await window.widgets.folder.expand(currentFolderId);
    }
  }

  async function closeExpandedFolder() {
    if (!state.isExpanded) return;
    state.isExpanded = false;

    const plate = $('#folderPlate');
    const expandedView = $('#folderExpandedView');

    if (plate) {
      plate.classList.add('is-closing');
    }

    // Wait for the smooth CSS spring exit animation (200ms)
    setTimeout(async () => {
      if (plate) {
        plate.classList.remove('is-expanded');
        plate.classList.remove('is-closing');
      }
      if (expandedView && !state.isExpanded) {
        expandedView.style.display = 'none';
      }
      // Collapse Electron BrowserWindow back to compact
      if (window.widgets?.folder?.collapse) {
        await window.widgets.folder.collapse(currentFolderId);
      }
      renderCompactView();
    }, 200);
  }

  async function activateWidget(id) {
    if (window.widgets?.folder?.activateWidget) {
      return await window.widgets.folder.activateWidget(id, currentFolderId);
    }
  }

  async function refreshWidgetStatus() {
    if (!window.widgets?.folder?.getWidgetStatus) return;
    try {
      const res = await window.widgets.folder.getWidgetStatus();
      if (res) {
        state.widgetStatus = res;
        const prevLen = (state.widgetIds || []).length;
        state.widgetIds = (state.widgetIds || []).filter(wid => !res[wid] || res[wid].enabled !== false);
        if (state.widgetIds.length !== prevLen) {
          renderCompactView(true);
          if (state.isExpanded) renderExpandedView();
        }
        updateAllStatusIndicators();
      }
    } catch (_) {}
  }

  function updateAllStatusIndicators() {
    // 1. Update compact view slot buttons
    const slotButtons = $$('.folder-slot-btn[data-id]');
    slotButtons.forEach(btn => {
      const wid = btn.dataset.id;
      if (!wid || wid.startsWith('__')) return;
      let dot = btn.querySelector('.slot-status-dot');
      if (!dot) {
        dot = document.createElement('span');
        dot.className = 'slot-status-dot';
        btn.appendChild(dot);
      }
      const st = state.widgetStatus && state.widgetStatus[wid];
      const isActive = Boolean(st && st.isRunning && st.visible && !st.isMini);
      btn.classList.toggle('is-active', isActive);
      btn.title = isActive
        ? `${getWidgetTitle(wid)} (${t('folder.runningClickToClose')})`
        : `${getWidgetTitle(wid)} (${t('folder.clickToOpenOrDrag')})`;
    });

    // 2. Update expanded view buttons
    const expandedButtons = $$('.expanded-item-btn[data-id]');
    expandedButtons.forEach(btn => {
      const wid = btn.dataset.id;
      if (!wid) return;
      const dot = btn.querySelector('.item-status-dot');
      const st = (state.widgetStatus && state.widgetStatus[wid]) || {};
      const isActive = Boolean(st.isRunning && st.visible && !st.isMini);
      if (dot) {
        dot.className = 'item-status-dot';
        if (st.isMini) {
          dot.classList.add('is-mini');
          dot.title = t('folder.statusMini');
        } else if (!st.isRunning && !st.visible) {
          dot.classList.add('is-closed');
        } else {
          dot.title = t('folder.statusRunning');
        }
      }
      btn.title = isActive
        ? `${getWidgetTitle(wid)} (${t('folder.runningClickToClose')})`
        : `${t('folder.clickToOpen', { title: getWidgetTitle(wid) })} (${t('folder.dragToDetach')})`;
    });
  }

  /* ==================================================================== *
   * 5. WIDGET MANAGER MODAL
   * ==================================================================== */

  function openManagerModal() {
    const modal = $('#folderManagerOverlay');
    const list = $('#managerItemsList');
    if (!modal || !list) return;

    list.innerHTML = '';

    // Render only available widgets that are enabled in settings
    const availableWidgets = ALL_AVAILABLE_WIDGETS.filter(w => !state.widgetStatus || !state.widgetStatus[w.id] || state.widgetStatus[w.id].enabled !== false);
    const currentIds = [...state.widgetIds].filter(id => !state.widgetStatus || !state.widgetStatus[id] || state.widgetStatus[id].enabled !== false);
    const allIds = [...new Set([...currentIds, ...availableWidgets.map(w => w.id)])];

    allIds.forEach((id, idx) => {
      const isChecked = currentIds.includes(id);
      const row = document.createElement('div');
      row.className = 'manager-row';
      row.dataset.id = id;

      const left = document.createElement('div');
      left.className = 'manager-row-left';

      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.id = `mgrChk_${id}`;
      chk.checked = isChecked;

      const label = document.createElement('label');
      label.htmlFor = `mgrChk_${id}`;
      label.textContent = getWidgetTitle(id);

      left.append(chk, label);

      const actions = document.createElement('div');
      actions.className = 'manager-row-actions';

      const upBtn = document.createElement('button');
      upBtn.className = 'mgr-arrow-btn';
      upBtn.textContent = '▲';
      upBtn.title = t('folder.moveUp');
      upBtn.onclick = () => {
        if (row.previousElementSibling) {
          list.insertBefore(row, row.previousElementSibling);
        }
      };

      const downBtn = document.createElement('button');
      downBtn.className = 'mgr-arrow-btn';
      downBtn.textContent = '▼';
      downBtn.title = t('folder.moveDown');
      downBtn.onclick = () => {
        if (row.nextElementSibling) {
          list.insertBefore(row.nextElementSibling, row);
        }
      };

      actions.append(upBtn, downBtn);
      row.append(left, actions);
      list.appendChild(row);
    });

    modal.style.display = 'flex';
  }

  function closeManagerModal() {
    const modal = $('#folderManagerOverlay');
    if (modal) modal.style.display = 'none';
  }

  async function saveManagerModal() {
    const list = $('#managerItemsList');
    if (!list) return;

    const newWidgetIds = [];
    list.querySelectorAll('.manager-row').forEach((row) => {
      const id = row.dataset.id;
      const chk = row.querySelector('input[type="checkbox"]');
      if (chk && chk.checked) {
        newWidgetIds.push(id);
      }
    });

    if (newWidgetIds.length === 0) {
      newWidgetIds.push('clock', 'pomodoro', 'calendar');
    }

    const removedWidgetIds = (state.widgetIds || []).filter(id => !newWidgetIds.includes(id));

    state.widgetIds = newWidgetIds;
    state.quickSlots = newWidgetIds.slice(0, 3);

    await saveFolderSettings();

    for (const remId of removedWidgetIds) {
      if (window.widgets?.folder?.detachWidget) {
        await window.widgets.folder.detachWidget(remId, {}, currentFolderId);
      }
    }

    closeManagerModal();
    renderExpandedView();
    renderCompactView();
  }

  /* ==================================================================== *
   * 6. SETTINGS PERSISTENCE & WIRE EVENTS
   * ==================================================================== */

  function applyFolderAppearance(cfg) {
    if (!cfg) return;
    const card = $('#folderSquircleCard');
    if (!card) return;

    const fCfg = cfg.folderSettings || {};
    const ws = cfg.widgetStyles?.folder || {};

    const radius = fCfg.radius ?? ws.radius ?? 24;
    const blur = fCfg.blur ?? 34;
    const opacity = fCfg.opacity ?? 24;
    const borderWidth = fCfg.borderWidth ?? ws.borderWidth ?? 1;
    const borderOpacity = fCfg.borderOpacity ?? 38;

    card.style.setProperty('--folder-radius', `${radius}px`);
    card.style.setProperty('--folder-blur', `${blur}px`);
    card.style.setProperty('--folder-opacity', String(opacity));
    card.style.setProperty('--folder-border-width', `${borderWidth}px`);
    card.style.setProperty('--folder-border-opacity', String(borderOpacity / 100));

    if (fCfg.showCompactTitles !== undefined && state.showCompactTitles !== Boolean(fCfg.showCompactTitles)) {
      state.showCompactTitles = Boolean(fCfg.showCompactTitles);
      renderCompactView(true);
    }
  }

  async function loadFolderSettings() {
    try {
      if (window.widgets?.folder?.get) {
        const data = await window.widgets.folder.get(currentFolderId);
        if (data) {
          state.title = data.title || state.title;
          state.widgetIds = Array.isArray(data.widgetIds) ? data.widgetIds : state.widgetIds;
          state.quickSlots = Array.isArray(data.quickSlots) ? data.quickSlots : state.quickSlots;
          state.groupMinis = Boolean(data.groupMinis);
        }
      }
      if (window.widgets?.settings?.get) {
        const genSettings = await window.widgets.settings.get();
        applyFolderAppearance(genSettings);
      }
    } catch (_) {}
  }

  async function saveFolderSettings() {
    try {
      if (window.widgets?.folder?.set) {
        await window.widgets.folder.set({
          id: currentFolderId,
          title: state.title,
          widgetIds: state.widgetIds,
          quickSlots: state.quickSlots,
          groupMinis: state.groupMinis,
        });
      }
    } catch (_) {}
  }

  function wireEvents() {
    // Double-click folder squircle card to open expanded modal
    $('#folderSquircleCard')?.addEventListener('dblclick', (e) => {
      if (e.target.closest('.folder-slot-btn')) return;
      openExpandedFolder();
    });

    // 1. Rename Folder Title
    const inputTitle = $('#inputFolderTitle');
    if (inputTitle) {
      inputTitle.addEventListener('change', async () => {
        state.title = inputTitle.value.trim() || 'أدوات مساعدة';
        await saveFolderSettings();
        renderCompactView();
      });
      inputTitle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') inputTitle.blur();
      });
    }

    // 2. Close Buttons
    $('#btnCloseExpanded')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeExpandedFolder();
    });

    $('#folderExpandedBackdrop')?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeExpandedFolder();
    });

    // 3. Manager Modal Controls
    $('#btnCloseManager')?.addEventListener('click', closeManagerModal);
    $('#btnCancelManager')?.addEventListener('click', closeManagerModal);
    $('#btnSaveManager')?.addEventListener('click', saveManagerModal);

    // 5. Keyboard Esc to Close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if ($('#folderManagerOverlay')?.style.display === 'flex') {
          closeManagerModal();
        } else if (state.isExpanded) {
          closeExpandedFolder();
        }
      }
    });

    // 6. Realtime Clock Hands Tick (Optimized: pauses when hidden)
    function tickClock() {
      if (document.hidden) return;
      const now = new Date();
      const mins = now.getMinutes() + now.getSeconds() / 60;
      const hours = (now.getHours() % 12) + mins / 60;
      const degH = hours * 30;
      const degM = mins * 6;

      const hHands = $$('.art-clock .hand-h');
      const mHands = $$('.art-clock .hand-m');
      for (let i = 0; i < hHands.length; i++) hHands[i].style.transform = `rotate(${degH}deg)`;
      for (let i = 0; i < mHands.length; i++) mHands[i].style.transform = `rotate(${degM}deg)`;
    }
    clockInterval = setInterval(tickClock, 1000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) tickClock();
    });
  }

  /* ==================================================================== *
   * 7. BOOT
   * ==================================================================== */

  boot(async () => {
    await loadFolderSettings();
    if (window.widgets?.folder?.getWidgetStatus) {
      try {
        const st = await window.widgets.folder.getWidgetStatus();
        if (st) {
          state.widgetStatus = st;
          state.widgetIds = (state.widgetIds || []).filter(wid => !st[wid] || st[wid].enabled !== false);
        }
      } catch (_) {}
    }
    renderCompactView();
    wireEvents();
    refreshWidgetStatus();

    if (window.widgets?.settings?.onChange) {
      window.widgets.settings.onChange((newSettings) => {
        applyFolderAppearance(newSettings);
        if (newSettings?.widgets) {
          const prevLen = (state.widgetIds || []).length;
          state.widgetIds = (state.widgetIds || []).filter(wid => newSettings.widgets[wid]?.visible !== false);
          if (state.widgetIds.length !== prevLen) {
            renderCompactView(true);
            if (state.isExpanded) renderExpandedView();
          }
        }
        refreshWidgetStatus();
      });
    }

    if (window.widgets?.folder?.onFolderChanged) {
      window.widgets.folder.onFolderChanged((data) => {
        if (data && (!data.id || data.id === currentFolderId)) {
          state.title = data.title || state.title;
          state.widgetIds = Array.isArray(data.widgetIds) ? data.widgetIds : state.widgetIds;
          state.quickSlots = Array.isArray(data.quickSlots) ? data.quickSlots : state.quickSlots;
          state.groupMinis = Boolean(data.groupMinis);
          renderCompactView();
          if (state.isExpanded) renderExpandedView();
        }
      });
    }

    if (window.widgets?.folder?.onDragHover) {
      window.widgets.folder.onDragHover(({ isOver, folderId }) => {
        if (!folderId || folderId === currentFolderId) {
          const squircle = $('#folderSquircleCard');
          if (squircle) {
            squircle.classList.toggle('drag-over-active', Boolean(isOver));
          }
        }
      });
    }

    if (window.widgets?.folder?.onAbsorb) {
      window.widgets.folder.onAbsorb(async (data) => {
        if (!data || !data.folderId || data.folderId === currentFolderId) {
          const squircle = $('#folderSquircleCard');
          if (squircle) {
            squircle.classList.add('absorbing');
            setTimeout(() => squircle && squircle.classList.remove('absorbing'), 480);
          }
          if (data && data.id && Array.isArray(state.widgetIds) && !state.widgetIds.includes(data.id)) {
            state.widgetIds.push(data.id);
          }
          await refreshWidgetStatus();
          renderCompactView(true);
          if (state.isExpanded) renderExpandedView();
        }
      });
    }

    // Entrance pop animation on spawn (plays once upon new folder creation)
    const spawnKey = `folder_spawned_${currentFolderId}`;
    const forceSpawn = urlParams.get('spawn') === '1';
    if (forceSpawn || !sessionStorage.getItem(spawnKey)) {
      sessionStorage.setItem(spawnKey, '1');
      const squircle = $('#folderSquircleCard');
      if (squircle) {
        squircle.classList.add('spawn-pop');
        setTimeout(() => squircle && squircle.classList.remove('spawn-pop'), 450);
      }
    }

    // Dynamic Adaptive Sizing Observer
    let resizeRaf = 0;
    const handleResize = () => {
      if (state.isExpanded) return;
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        renderCompactView();
      });
    };

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(handleResize);
      const plate = $('#folderPlate') || document.body;
      if (plate) ro.observe(plate);
    }
    window.addEventListener('resize', handleResize);
  });

})();
