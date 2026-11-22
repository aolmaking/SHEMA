'use strict';
/**
 * Selected Photo Widget for Mirqat Widgets.
 *
 * Displays a chosen photo or a rotating slideshow from a folder.
 * Supports drag-and-drop from Windows Explorer, multiple fit modes
 * (Cover, Contain, Center), captions, and instant photo selection.
 */

const { $, el, icon, boot, closeWindow, strings } = window.UI;

strings({
  ar: {
    'photo.title': 'الصورة المختارة',
    'photo.emptyTitle': 'اختر صورة',
    'photo.emptySub': 'اسحب صورة إلى هنا أو انقر للاختيار من جهازك.',
    'photo.selectBtn': 'اختيار صورة…',
    'photo.change': 'تغيير الصورة',
    'photo.fit': 'نمط العرض',
    'photo.adjust': 'ضبط وتعديل الصورة',
    'photo.prev': 'الصورة السابقة',
    'photo.next': 'الصورة التالية',
    'photo.zoomOut': 'تصغير -',
    'photo.zoomIn': 'تكبير +',
    'photo.rotate': 'تدوير 90°',
    'photo.grayscale': 'أبيض وأسود',
    'photo.reset': 'إعادة ضبط',
  },
  en: {
    'photo.title': 'Selected Photo',
    'photo.emptyTitle': 'Choose a Photo',
    'photo.emptySub': 'Drag a photo here or click to choose from your PC.',
    'photo.selectBtn': 'Choose photo…',
    'photo.change': 'Change photo',
    'photo.fit': 'Fit mode',
    'photo.adjust': 'Adjust photo layout & effects',
    'photo.prev': 'Previous photo',
    'photo.next': 'Next photo',
    'photo.zoomOut': 'Zoom Out -',
    'photo.zoomIn': 'Zoom In +',
    'photo.rotate': 'Rotate 90°',
    'photo.grayscale': 'Grayscale',
    'photo.reset': 'Reset',
  },
});

let currentConfig = {};
let folderPhotos = [];
let folderIndex = 0;
let slideshowTimer = null;
let isDraggingPan = false;
let panStartX = 0;
let panStartY = 0;
let initialPanX = 50;
let initialPanY = 50;

const FIT_MODES = ['cover', 'contain', 'center'];

function applyFit(fit = 'cover') {
  const plate = $('#photoPlate');
  const validFit = FIT_MODES.includes(fit) ? fit : 'cover';
  plate.dataset.fit = validFit;
}

function applyAdjustments(conf = {}) {
  const ph = conf.photo || {};
  const plate = $('#photoPlate');
  const img = $('#photoImg');

  const zoom = ph.zoom !== undefined ? Number(ph.zoom) : 1;
  const posX = ph.posX !== undefined ? Number(ph.posX) : 50;
  const posY = ph.posY !== undefined ? Number(ph.posY) : 50;
  const rotate = Number(ph.rotate) || 0;
  const brightness = ph.brightness !== undefined ? Number(ph.brightness) / 100 : 1;
  const contrast = ph.contrast !== undefined ? Number(ph.contrast) / 100 : 1;
  const grayscale = ph.grayscale ? 1 : 0;
  const shape = ph.shape || 'rounded';

  plate.dataset.shape = shape;
  img.style.setProperty('--photo-zoom', String(zoom));
  img.style.setProperty('--photo-pos-x', `${posX}%`);
  img.style.setProperty('--photo-pos-y', `${posY}%`);
  img.style.setProperty('--photo-rotate', `${rotate}deg`);
  img.style.setProperty('--photo-bright', String(brightness));
  img.style.setProperty('--photo-contrast', String(contrast));
  img.style.setProperty('--photo-gray', String(grayscale));

  const valEl = $('#adjZoomVal');
  if (valEl) valEl.textContent = `${Math.round(zoom * 100)}%`;
}

let patchTimer = null;
function savePhotoPatch(patch) {
  currentConfig.photo = { ...(currentConfig.photo || {}), ...patch };
  applyAdjustments(currentConfig);
  clearTimeout(patchTimer);
  patchTimer = setTimeout(async () => {
    try {
      await window.widgets.settings.set({ photo: currentConfig.photo });
    } catch (e) {
      console.warn('Failed saving photo patch:', e);
    }
  }, 100);
}

function showImage(src, captionText = '') {
  const img = $('#photoImg');
  const empty = $('#emptyState');
  const caption = $('#caption');

  if (!src) {
    img.hidden = true;
    img.src = '';
    empty.hidden = false;
    caption.hidden = true;
    return;
  }

  empty.hidden = true;
  img.hidden = false;
  img.style.opacity = '0';
  img.src = src;
  img.onload = () => {
    img.style.opacity = '1';
  };

  const showCaption = currentConfig.photo && currentConfig.photo.showCaption;
  if (showCaption && captionText) {
    caption.textContent = captionText;
    caption.hidden = false;
  } else {
    caption.hidden = true;
  }
}

async function cycleFit() {
  const current = $('#photoPlate').dataset.fit || 'cover';
  const nextIdx = (FIT_MODES.indexOf(current) + 1) % FIT_MODES.length;
  const nextFit = FIT_MODES[nextIdx];
  applyFit(nextFit);
  await window.widgets.settings.set({ photo: { ...(currentConfig.photo || {}), fit: nextFit } });
}

async function pickPhoto() {
  try {
    const res = await window.widgets.photo.pick();
    if (res && res.path) {
      await window.widgets.photo.setPath(res.path);
      const imgData = await window.widgets.photo.get(res.path);
      if (imgData && imgData.src) {
        showImage(imgData.src, imgData.name || '');
      }
    }
  } catch (err) {
    console.error('Failed to pick photo:', err);
  }
}

function setupSlideshow() {
  clearTimeout(slideshowTimer);
  if (window.UI?.isDormant?.()) return;
  if (!currentConfig.photo || currentConfig.photo.mode !== 'folder' || folderPhotos.length <= 1) {
    $('#prevBtn').hidden = true;
    $('#nextBtn').hidden = true;
    return;
  }

  $('#prevBtn').hidden = false;
  $('#nextBtn').hidden = false;

  const intervalSec = Math.max(5, Number(currentConfig.photo.interval) || 60);
  slideshowTimer = setTimeout(() => {
    stepSlideshow(1);
    setupSlideshow();
  }, intervalSec * 1000);
}

function stepSlideshow(direction = 1) {
  if (folderPhotos.length === 0) return;
  folderIndex = (folderIndex + direction + folderPhotos.length) % folderPhotos.length;
  const photo = folderPhotos[folderIndex];
  if (photo) {
    window.widgets.photo.get(photo).then((res) => {
      if (res && res.src) showImage(res.src, res.name);
    });
  }
}

async function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  $('#photoPlate').classList.remove('drag-over');

  const files = e.dataTransfer ? e.dataTransfer.files : null;
  if (!files || files.length === 0) return;
  const file = files[0];
  const filePath = window.widgets?.getPathForFile ? window.widgets.getPathForFile(file) : (file.path || '');
  if (filePath) {
    await window.widgets.photo.setPath(filePath);
    const imgData = await window.widgets.photo.get(filePath);
    if (imgData && imgData.src) {
      showImage(imgData.src, imgData.name || file.name || '');
      return;
    }
  }
  // Fallback for virtual / browser dropped files
  if (file.type && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      showImage(evt.target.result, file.name || '');
    };
    reader.readAsDataURL(file);
  }
}

async function syncState(settings) {
  currentConfig = settings || {};
  const photoConf = currentConfig.photo || {};

  applyFit(photoConf.fit || 'cover');
  applyAdjustments(currentConfig);

  if (photoConf.mode === 'folder' && photoConf.folder) {
    const res = await window.widgets.photo.listFolder(photoConf.folder);
    if (res && res.photos && res.photos.length > 0) {
      folderPhotos = res.photos;
      folderIndex = 0;
      const initial = await window.widgets.photo.get(folderPhotos[0]);
      if (initial && initial.src) showImage(initial.src, initial.name);
      setupSlideshow();
      return;
    }
  }

  // Single photo mode
  if (photoConf.path) {
    const res = await window.widgets.photo.get(photoConf.path);
    if (res && res.src) {
      showImage(res.src, res.name || '');
      $('#prevBtn').hidden = true;
      $('#nextBtn').hidden = true;
      return;
    }
  }

  showImage(null);
}

boot(async (settings) => {
  // Attach icons
  $('#photoIcon').append(icon('image') || icon('note'));
  $('#pickBtn').append(icon('image') || icon('plus'));
  $('#fitBtn').append(icon('eye') || icon('refresh'));
  $('#adjustBtn').append(icon('sliders') || icon('gear'));
  $('#prevBtn').append(icon('chevronLeft') || icon('chevron'));
  $('#nextBtn').append(icon('chevron'));
  $('#settingsBtn').append(icon('gear'));
  $('#closeBtn').append(icon('close'));

  // Bind actions
  $('#pickBtn').addEventListener('click', () => pickPhoto());
  $('#selectBtn').addEventListener('click', () => pickPhoto());
  $('#emptyState').addEventListener('click', (e) => {
    if (e.target !== $('#selectBtn')) pickPhoto();
  });
  $('#fitBtn').addEventListener('click', () => cycleFit());
  $('#adjustBtn').addEventListener('click', () => {
    const bar = $('#adjustBar');
    bar.hidden = !bar.hidden;
  });
  $('#settingsBtn').addEventListener('click', () => window.widgets.win.openSettings('photo'));
  $('#closeBtn').addEventListener('click', () => closeWindow());
  $('#prevBtn').addEventListener('click', () => stepSlideshow(-1));
  $('#nextBtn').addEventListener('click', () => stepSlideshow(1));

  // Quick adjust toolbar button actions
  $('#adjZoomIn').addEventListener('click', () => {
    const curZoom = currentConfig.photo?.zoom !== undefined ? Number(currentConfig.photo.zoom) : 1;
    const nextZoom = Math.min(3.0, Math.round((curZoom + 0.15) * 100) / 100);
    savePhotoPatch({ zoom: nextZoom });
  });

  $('#adjZoomOut').addEventListener('click', () => {
    const curZoom = currentConfig.photo?.zoom !== undefined ? Number(currentConfig.photo.zoom) : 1;
    const nextZoom = Math.max(0.5, Math.round((curZoom - 0.15) * 100) / 100);
    savePhotoPatch({ zoom: nextZoom });
  });

  $('#adjRotate').addEventListener('click', () => {
    const curRot = Number(currentConfig.photo?.rotate) || 0;
    const nextRot = (curRot + 90) % 360;
    savePhotoPatch({ rotate: nextRot });
  });

  $('#adjGrayscale').addEventListener('click', () => {
    const curGray = Boolean(currentConfig.photo?.grayscale);
    savePhotoPatch({ grayscale: !curGray });
  });

  $('#adjReset').addEventListener('click', () => {
    savePhotoPatch({
      zoom: 1,
      posX: 50,
      posY: 50,
      rotate: 0,
      brightness: 100,
      contrast: 100,
      grayscale: false,
      shape: 'rounded',
    });
  });

  $('#adjClose').addEventListener('click', () => {
    $('#adjustBar').hidden = true;
  });

  // Direct Interactive Manipulation on Photo:
  const img = $('#photoImg');

  // 1. Mouse wheel zoom
  img.addEventListener('wheel', (e) => {
    e.preventDefault();
    const curZoom = currentConfig.photo?.zoom !== undefined ? Number(currentConfig.photo.zoom) : 1;
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    const nextZoom = Math.min(3.0, Math.max(0.5, Math.round((curZoom + delta) * 100) / 100));
    savePhotoPatch({ zoom: nextZoom });
  }, { passive: false });

  // 2. Click and Drag to Pan
  img.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDraggingPan = true;
    panStartX = e.clientX;
    panStartY = e.clientY;
    initialPanX = currentConfig.photo?.posX !== undefined ? Number(currentConfig.photo.posX) : 50;
    initialPanY = currentConfig.photo?.posY !== undefined ? Number(currentConfig.photo.posY) : 50;
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingPan) return;
    const dx = e.clientX - panStartX;
    const dy = e.clientY - panStartY;
    const rect = img.getBoundingClientRect();
    const pctX = (dx / (rect.width || 200)) * 100;
    const pctY = (dy / (rect.height || 200)) * 100;

    const nextX = Math.min(100, Math.max(0, Math.round(initialPanX - pctX)));
    const nextY = Math.min(100, Math.max(0, Math.round(initialPanY - pctY)));

    img.style.setProperty('--photo-pos-x', `${nextX}%`);
    img.style.setProperty('--photo-pos-y', `${nextY}%`);
  });

  window.addEventListener('mouseup', () => {
    if (!isDraggingPan) return;
    isDraggingPan = false;
    const curX = parseFloat(img.style.getPropertyValue('--photo-pos-x')) || 50;
    const curY = parseFloat(img.style.getPropertyValue('--photo-pos-y')) || 50;
    savePhotoPatch({ posX: curX, posY: curY });
  });

  // 3. Double-click reset
  img.addEventListener('dblclick', () => {
    savePhotoPatch({ zoom: 1, posX: 50, posY: 50 });
  });

  // Global window drop safety
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => e.preventDefault());

  // Drag and drop support
  const plate = $('#photoPlate');
  plate.addEventListener('dragover', (e) => {
    e.preventDefault();
    plate.classList.add('drag-over');
  });
  plate.addEventListener('dragleave', (e) => {
    e.preventDefault();
    plate.classList.remove('drag-over');
  });
  plate.addEventListener('drop', handleDrop);

  await syncState(settings);

  window.UI?.onDormancy?.((isDormant) => {
    if (isDormant) {
      clearTimeout(slideshowTimer);
    } else {
      setupSlideshow();
    }
  });

  window.widgets.settings.onChange((next) => syncState(next));
});
