import * as THREE from 'three';
import { readPersonal } from './personal-store.ts';
import { getAsset } from './storage.ts';
import { controlIcon } from './controls.ts';
import { getPaletteDefinition } from './themes.ts';

type Companion = 'fox' | 'tanuki' | 'crane' | 'rabbit' | 'plant';
type Mascot = Exclude<Companion, 'plant'>;
const artUrl = new URL('../site/art/sela-mage-sky.webp', location.href).href;
const atlasUrl = new URL('../library/assets/jculture-companions-v3.webp', location.href).href;
const mascotCell: Record<Mascot, { column: number; row: number }> = {
  fox: { column: 0, row: 0 },
  tanuki: { column: 1, row: 0 },
  crane: { column: 0, row: 1 },
  rabbit: { column: 1, row: 1 }
};

/** A bright Jakarta reading scene with an optional animated personal companion. */
export async function mountHomeWorld(home: HTMLElement): Promise<() => void> {
  const intro = home.querySelector<HTMLElement>('.room-intro');
  if (!intro) return () => {};
  const worldPanel = document.createElement('div');
  worldPanel.className = 'home-world-stage tw:relative tw:isolate tw:min-w-0 tw:overflow-hidden tw:rounded-[24px]';
  worldPanel.setAttribute('aria-hidden', 'true');
  const paletteDoodle = document.createElement('span');
  paletteDoodle.className = 'home-world-doodle';
  const syncPaletteDoodle = () => {
    const key = document.documentElement.dataset.palette || 'white';
    const palette = getPaletteDefinition(key);
    worldPanel.dataset.palette = key;
    paletteDoodle.replaceChildren(controlIcon(palette.motif));
  };
  syncPaletteDoodle();
  // Keep the stage palette current even while the companion texture is loading.
  document.addEventListener('sela:palette', syncPaletteDoodle);

  const art = document.createElement('img');
  art.className = 'home-world-art';
  art.alt = '';
  art.setAttribute('aria-hidden', 'true');
  art.decoding = 'async';
  art.loading = 'eager';
  art.src = artUrl;
  art.onerror = () => { home.dataset.world = 'art-unavailable'; art.remove(); };

  const canvas = document.createElement('canvas');
  canvas.className = 'home-world-canvas tw:absolute tw:inset-0 tw:z-[1] tw:block tw:h-full tw:min-h-0 tw:w-full tw:pointer-events-none tw:opacity-0 tw:transition-opacity tw:duration-500';
  canvas.setAttribute('aria-hidden', 'true');
  worldPanel.append(art, canvas, paletteDoodle);
  intro.insertBefore(worldPanel, intro.querySelector('.ritual'));
  const applyScene = () => {
    const hour = new Date().getHours();
    worldPanel.dataset.daypart = hour >= 5 && hour < 10 ? 'morning' : hour >= 10 && hour < 16 ? 'day' : hour >= 16 && hour < 19 ? 'sunset' : 'night';
    worldPanel.dataset.weather = document.documentElement.dataset.weather || 'neutral';
  };
  let artOnlyTimer = 0;
  const cleanupArtOnly = () => {
    document.removeEventListener('sela:palette', syncPaletteDoodle);
    document.removeEventListener('sela:weather', applyScene);
    if (artOnlyTimer) clearInterval(artOnlyTimer);
    window.removeEventListener('pagehide', cleanupArtOnly);
    worldPanel.remove();
  };
  const useArtOnly = () => {
    home.dataset.world = 'art-only';
    applyScene();
    document.addEventListener('sela:weather', applyScene);
    artOnlyTimer = window.setInterval(applyScene, 60000);
    canvas.remove();
    window.addEventListener('pagehide', cleanupArtOnly, { once: true });
    return cleanupArtOnly;
  };

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: true, depth: false, stencil: false,
      powerPreference: 'low-power'
    });
  } catch {
    return useArtOnly();
  }

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const stage = new THREE.Group();
  scene.add(stage);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 20);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  const loader = new THREE.TextureLoader();
  let atlas: THREE.Texture;
  try {
    atlas = await loader.loadAsync(atlasUrl);
  } catch {
    renderer.dispose();
    return useArtOnly();
  }
  // The palette can change while the companion atlas is loading. Refresh the
  // stage from the current document state before subscribing to later changes.
  syncPaletteDoodle();
  atlas.colorSpace = THREE.SRGBColorSpace;

  let disposed = false;
  let visible = false;
  let quiet = false;
  let lastFrame = 0;
  let petGeneration = 0;
  let petKind: Companion | undefined;
  let pet: THREE.Sprite | undefined;
  let petTexture: THREE.CanvasTexture | undefined;
  let customTextureURL = '';
  let petHeight = .82;
  let petY = -.48;
  let petX = 0;
  let aspect = 1;

  const removePet = () => {
    if (!pet) return;
    scene.remove(pet);
    pet.material.dispose();
    pet = undefined;
    petTexture?.dispose();
    petTexture = undefined;
  };

  const layout = () => {
    if (disposed) return;
    const bounds = worldPanel.getBoundingClientRect();
    const compact = bounds.width < 420;
    const tablet = bounds.width >= 420 && bounds.width < 600;
    const size = canvas.getBoundingClientRect();
    const viewHeight = compact ? 3.65 : tablet ? 3.8 : 3.6;
    aspect = size.width / Math.max(1, size.height);
    camera.left = -aspect * viewHeight / 2;
    camera.right = aspect * viewHeight / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(Math.max(1, size.width), Math.max(1, size.height), false);

    // The illustration keeps open sky on the left; place the companion there,
    // away from the mage and the animals baked into the artwork.
    petX = -aspect * viewHeight / 2 + .405 * viewHeight;
    petY = -.16 * viewHeight;
    petHeight = compact ? .68 : tablet ? .78 : .82;
    if (pet && petTexture) {
      const ratio = (petTexture.image.width || 1) / (petTexture.image.height || 1);
      pet.position.set(petX, petY, 0.2);
      pet.scale.set(petHeight * ratio, petHeight, 1);
    }
    renderer.render(scene, camera);
  };

  const textureFor = (kind: Mascot) => {
    const source = atlas.image as CanvasImageSource & { width: number; height: number };
    const cell = mascotCell[kind];
    const width = Math.floor(source.width / 2);
    const height = Math.floor(source.height / 2);
    const image = document.createElement('canvas');
    image.width = width;
    image.height = height;
    const context = image.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable');
    context.drawImage(source, cell.column * width, cell.row * height, width, height, 0, 0, width, height);
    const texture = new THREE.CanvasTexture(image);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    return texture;
  };

  const textureForCustom = async (image: Blob) => {
    if (customTextureURL) URL.revokeObjectURL(customTextureURL);
    customTextureURL = URL.createObjectURL(image);
    const loaded = await loader.loadAsync(customTextureURL);
    const imageCanvas = document.createElement('canvas');
    imageCanvas.width = imageCanvas.height = 512;
    const context = imageCanvas.getContext('2d');
    if (!context) { loaded.dispose(); throw new Error('Canvas is unavailable'); }
    const source = loaded.image as CanvasImageSource & { width: number; height: number };
    const scale = Math.min(1, 460 / Math.max(source.width, source.height));
    const width = source.width * scale, height = source.height * scale;
    context.drawImage(source, (512 - width) / 2, (512 - height) / 2, width, height);
    loaded.dispose();
    const texture = new THREE.CanvasTexture(imageCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  };

  const updatePet = async () => {
    const selected = readPersonal().companion as Companion;
    if (selected === petKind && !home.dataset.customMascotChanged) return;
    petKind = selected;
    delete home.dataset.customMascotChanged;
    const generation = ++petGeneration;
    removePet();
    try {
      const custom = await getAsset('home-mascot').catch(() => undefined);
      if (!custom && (selected === 'plant' || !(selected in mascotCell))) return;
      const texture = custom ? await textureForCustom(custom) : textureFor(selected as Mascot);
      if (disposed || generation !== petGeneration) {
        texture.dispose();
        return;
      }
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: .025, depthTest: false, depthWrite: false });
      pet = new THREE.Sprite(material);
      petTexture = texture;
      pet.renderOrder = 2;
      scene.add(pet);
      layout();
    } catch {
      home.dataset.companion = 'unavailable';
    }
  };

  const lowPower = () => {
    try { return !!JSON.parse(localStorage.getItem('sela-library:preferences') || '{}').lowPower; }
    catch { return false; }
  };
  const wantsMotion = () => !disposed && visible && !document.hidden && !reducedMotion.matches && !quiet && !lowPower();
  const render = (time: number) => {
    if (!wantsMotion() || time - lastFrame < 48) return;
    lastFrame = time;
    const phase = time * .001;
    if (pet) {
      pet.position.y = petY + Math.sin(phase * .9) * .015;
      pet.position.x = petX + Math.sin(phase * .25) * .012;
      pet.rotation.z = Math.sin(phase * .35) * .018;
      pet.scale.y = petHeight * (1 + Math.sin(phase * .9) * .012);
    }
    renderer.render(scene, camera);
  };

  const updateCanvasOpacity = () => {
    canvas.classList.toggle('tw:opacity-0', !visible);
    canvas.classList.toggle('tw:opacity-75', visible && home.dataset.customBackground !== 'true');
    canvas.classList.toggle('tw:opacity-35', visible && home.dataset.customBackground === 'true');
    art.style.opacity = home.dataset.customBackground === 'true' ? '.42' : '.84';
  };
  const sync = () => {
    if (disposed) return;
    applyScene();
    updateCanvasOpacity();
    quiet = readPersonal().quiet;
    void updatePet();
    if (wantsMotion()) renderer.setAnimationLoop(render);
    else {
      renderer.setAnimationLoop(null);
      renderer.render(scene, camera);
    }
  };
  const mascotSync = () => { home.dataset.customMascotChanged = 'true'; sync(); };
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    canvas.classList.toggle('is-visible', visible);
    sync();
  }, { threshold: 0 });
  observer.observe(home);
  const sizeObserver = new ResizeObserver(layout);
  sizeObserver.observe(worldPanel);
  const resize = () => layout();
  const powerControl = document.querySelector('#default-low-power');
  const sceneTimer=window.setInterval(applyScene,60000);
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('sela:personal', sync);
  document.addEventListener('sela:weather', applyScene);
  document.addEventListener('sela:mascot', mascotSync);
  document.addEventListener('sela:background', updateCanvasOpacity);
  powerControl?.addEventListener('change', sync);
  reducedMotion.addEventListener('change', sync);

  const stop = () => {
    if (disposed) return;
    disposed = true;
    petGeneration++;
    observer.disconnect();
    sizeObserver.disconnect();
    renderer.setAnimationLoop(null);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', sync);
    document.removeEventListener('sela:personal', sync);
    document.removeEventListener('sela:weather', applyScene);
    document.removeEventListener('sela:palette', syncPaletteDoodle);
    document.removeEventListener('sela:mascot', mascotSync);
    document.removeEventListener('sela:background', updateCanvasOpacity);
    powerControl?.removeEventListener('change', sync);
    reducedMotion.removeEventListener('change', sync);
    clearInterval(sceneTimer);
    removePet();
    atlas.dispose();
    if (customTextureURL) URL.revokeObjectURL(customTextureURL);
    renderer.dispose();
    canvas.remove();
    art.remove();
  };

  window.addEventListener('pagehide', stop, { once: true });
  home.dataset.world = 'ready';
  layout();
  sync();
  return stop;
}
