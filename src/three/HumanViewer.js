import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MODEL_CONFIG } from "../config/modelConfig.js";
import { loadMichelle } from "./loadMichelle.js";
import { createFallbackHuman } from "./createFallbackHuman.js";
import { FitStyleRig } from "./FitStyleRig.js";

export class HumanViewer {
  constructor({ canvas, container, onStatus, onError }) {
    this.canvas = canvas;
    this.container = container;
    this.onStatus = onStatus ?? (() => {});
    this.onError = onError ?? (() => {});

    this.avatar = null;
    this.rig = null;
    this.mixer = null;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    this.camera.position.set(0, 0.95, 3.15);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.2;
    this.controls.maxDistance = 4.8;
    this.controls.target.set(0, 0.9, 0);

    this.clock = new THREE.Clock();
    this.frameRequest = null;

    this.initializeEnvironment();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);

    this.resize();
    this.animate();
  }

  async loadPrimaryHuman() {
    this.onStatus({
      status: "loading",
      source: "Michelle GLB",
      detail: MODEL_CONFIG.michellePath,
    });

    try {
      const avatar = await loadMichelle(
        MODEL_CONFIG.michellePath,
        MODEL_CONFIG.targetHeightMeters,
      );

      this.installAvatar(avatar);

      this.onStatus({
        status: "ready",
        source: "Michelle GLB",
        detail: "Local /public/models/Michelle.glb",
        diagnostics: this.getDiagnostics(),
      });

      return;
    } catch (error) {
      console.error("Michelle.glb load failed:", error);

      if (!MODEL_CONFIG.allowProceduralFallback) {
        this.onError(
          `Michelle.glb could not load. Check ${MODEL_CONFIG.michellePath}. ${error.message}`,
        );
        throw error;
      }

      const fallback = createFallbackHuman();
      this.installAvatar(fallback);

      this.onError(
        `Michelle.glb was not found or could not be loaded, so the development fallback is being shown. Run "npm run model:michelle", then click Retry Michelle. ${error.message}`,
      );

      this.onStatus({
        status: "fallback",
        source: "Procedural fallback",
        detail: "Viewer is working; Michelle asset still needs to be added.",
        diagnostics: this.getDiagnostics(),
      });
    }
  }

  installAvatar(avatar) {
    this.removeAvatar();

    this.avatar = avatar;
    this.scene.add(avatar.root);

    this.rig = new FitStyleRig({
      avatarRoot: avatar.root,
      model: avatar.model,
      bones: avatar.bones,
      normalizationScale: avatar.normalizationScale,
    });

    if (
      MODEL_CONFIG.playAnimation &&
      !avatar.isFallback &&
      avatar.animations.length > 0
    ) {
      this.mixer = new THREE.AnimationMixer(avatar.model);
      this.mixer.clipAction(avatar.animations[0]).play();
    }

    this.resetView();
  }

  removeAvatar() {
    if (!this.avatar) {
      return;
    }

    this.scene.remove(this.avatar.root);

    this.avatar.root.traverse((object) => {
      if (!object.isMesh) {
        return;
      }

      object.geometry?.dispose?.();

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.filter(Boolean).forEach((material) => material.dispose?.());
    });

    this.avatar = null;
    this.rig = null;
    this.mixer = null;
  }

  initializeEnvironment() {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x726b64, 2.15));

    const key = new THREE.DirectionalLight(0xffffff, 3);
    key.position.set(3, 5, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xdde7ff, 0.75);
    fill.position.set(-3, 3, 2);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffeee2, 0.6);
    rim.position.set(2, 4, -4);
    this.scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(1.45, 64),
      new THREE.ShadowMaterial({ opacity: 0.14 }),
    );

    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  setView(view) {
    const distance = 3.15;
    const targetY = 0.9;

    const positions = {
      front: [0, 0.95, distance],
      side: [distance, 0.95, 0],
      back: [0, 0.95, -distance],
      threeQuarter: [distance * 0.68, 1.0, distance * 0.68],
    };

    const next = positions[view] ?? positions.front;
    this.camera.position.set(...next);
    this.controls.target.set(0, targetY, 0);
    this.controls.update();
  }

  resetView() {
    this.setView("front");
  }

  toggleAttachmentPoints() {
    return this.rig?.toggleDebug() ?? false;
  }

  getDiagnostics() {
    const statistics = this.avatar?.statistics ?? {
      meshCount: 0,
      skinnedMeshCount: 0,
      boneCount: 0,
    };

    return {
      ...statistics,
      isFallback: Boolean(this.avatar?.isFallback),
      garmentLayers: this.rig?.getGarmentLayerNames() ?? [],
      accessories: this.rig?.getAccessoryDiagnostics() ?? [],
    };
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);

    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    this.frameRequest = requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.05);

    if (this.mixer) {
      this.mixer.update(delta);
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
    }

    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.removeAvatar();
    this.renderer.dispose();
  }
}
