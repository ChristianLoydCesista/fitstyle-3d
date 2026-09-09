import * as THREE from "three";

const ACCESSORY_DEFINITIONS = {
  HEAD: {
    patterns: ["head"],
    fallback: [0, 1.69, 0],
    offsetMeters: [0, 0.08, 0],
  },
  FACE: {
    patterns: ["head"],
    fallback: [0, 1.63, 0.1],
    offsetMeters: [0, 0, 0.09],
  },
  NECK: {
    patterns: ["neck"],
    fallback: [0, 1.48, 0],
    offsetMeters: [0, 0.02, 0.04],
  },
  LEFT_WRIST: {
    patterns: ["lefthand", "left_hand", "hand_l", "l_hand"],
    fallback: [-0.45, 0.92, 0],
    offsetMeters: [0, 0, 0],
  },
  RIGHT_WRIST: {
    patterns: ["righthand", "right_hand", "hand_r", "r_hand"],
    fallback: [0.45, 0.92, 0],
    offsetMeters: [0, 0, 0],
  },
  LEFT_FOOT: {
    patterns: ["leftfoot", "left_foot", "foot_l", "l_foot"],
    fallback: [-0.15, 0.08, 0.05],
    offsetMeters: [0, 0, 0],
  },
  RIGHT_FOOT: {
    patterns: ["rightfoot", "right_foot", "foot_r", "r_foot"],
    fallback: [0.15, 0.08, 0.05],
    offsetMeters: [0, 0, 0],
  },
  BACK: {
    patterns: ["spine2", "spine_02", "upperchest", "chest", "spine1"],
    fallback: [0, 1.32, -0.12],
    offsetMeters: [0, 0, -0.1],
  },
};

export class FitStyleRig {
  constructor({
    avatarRoot,
    model,
    bones = [],
    normalizationScale = 1,
  }) {
    this.avatarRoot = avatarRoot;
    this.model = model;
    this.bones = bones;
    this.normalizationScale = Math.max(
      Number(normalizationScale) || 1,
      0.000001,
    );

    this.garmentLayers = {};
    this.accessoryAnchors = {};
    this.debugMarkers = [];

    this.createGarmentLayers();
    this.createAccessoryAnchors();

    this.avatarRoot.userData.fitStyle = {
      ...(this.avatarRoot.userData.fitStyle ?? {}),
      rig: this,
      garmentLayers: this.garmentLayers,
      accessoryAnchors: this.accessoryAnchors,
    };
  }

  createGarmentLayers() {
    ["TOP", "DRESS", "BOTTOM"].forEach((slot) => {
      const layer = new THREE.Group();
      layer.name = `FITSTYLE_GARMENT_${slot}`;
      this.avatarRoot.add(layer);
      this.garmentLayers[slot] = layer;
    });
  }

  createAccessoryAnchors() {
    Object.entries(ACCESSORY_DEFINITIONS).forEach(([slot, definition]) => {
      const anchor = new THREE.Object3D();
      anchor.name = `FITSTYLE_ACCESSORY_${slot}`;

      const bone = this.findBone(definition.patterns);

      if (bone) {
        const localOffset = definition.offsetMeters.map(
          (value) => value / this.normalizationScale,
        );

        anchor.position.set(...localOffset);
        bone.add(anchor);
        anchor.userData.attachedBone = bone.name;
        anchor.userData.usesFallbackPosition = false;
      } else {
        anchor.position.set(...definition.fallback);
        this.avatarRoot.add(anchor);
        anchor.userData.attachedBone = null;
        anchor.userData.usesFallbackPosition = true;
      }

      this.accessoryAnchors[slot] = anchor;
      this.addDebugMarker(anchor);
    });

    this.setDebugVisible(false);
  }

  findBone(patterns) {
    const normalizedPatterns = patterns.map((pattern) => pattern.toLowerCase());

    return (
      this.bones.find((bone) => {
        const boneName = bone.name.toLowerCase();
        return normalizedPatterns.some((pattern) => boneName.includes(pattern));
      }) ?? null
    );
  }

  addDebugMarker(anchor) {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.025 / this.normalizationScale, 12, 10),
      new THREE.MeshBasicMaterial({
        color: 0xd84b4b,
        depthTest: false,
      }),
    );

    marker.name = `${anchor.name}_DEBUG`;
    marker.renderOrder = 999;
    anchor.add(marker);
    this.debugMarkers.push(marker);
  }

  setDebugVisible(visible) {
    this.debugMarkers.forEach((marker) => {
      marker.visible = Boolean(visible);
    });

    return Boolean(visible);
  }

  toggleDebug() {
    const next = !(this.debugMarkers[0]?.visible ?? false);
    return this.setDebugVisible(next);
  }

  getAccessoryDiagnostics() {
    return Object.entries(this.accessoryAnchors).map(([slot, anchor]) => ({
      slot,
      bone: anchor.userData.attachedBone,
      fallback: anchor.userData.usesFallbackPosition,
    }));
  }

  getGarmentLayerNames() {
    return Object.keys(this.garmentLayers);
  }

  getGarmentLayer(slot) {
    return this.garmentLayers[String(slot).toUpperCase()] ?? null;
  }

  getAccessoryAnchor(slot) {
    return this.accessoryAnchors[String(slot).toUpperCase()] ?? null;
  }
}
