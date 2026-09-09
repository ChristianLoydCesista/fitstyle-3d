import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export async function loadMichelle(path, targetHeightMeters = 1.75) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(path);

  const model = gltf.scene;
  model.name = model.name || "Michelle";

  let meshCount = 0;
  let skinnedMeshCount = 0;
  const bones = [];

  model.traverse((object) => {
    if (object.isMesh) {
      meshCount += 1;
      object.castShadow = true;
      object.receiveShadow = true;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.filter(Boolean).forEach((material) => {
        if ("roughness" in material) {
          material.roughness = Math.max(material.roughness ?? 0.6, 0.45);
        }
      });
    }

    if (object.isSkinnedMesh) {
      skinnedMeshCount += 1;
    }

    if (object.isBone) {
      bones.push(object);
    }
  });

  const root = new THREE.Group();
  root.name = "FitStyleAvatarRoot";
  root.add(model);

  const normalizationScale = normalizeModel(
    model,
    root,
    targetHeightMeters,
  );

  return {
    root,
    model,
    bones,
    animations: gltf.animations ?? [],
    normalizationScale,
    isFallback: false,
    statistics: {
      meshCount,
      skinnedMeshCount,
      boneCount: bones.length,
    },
  };
}

function normalizeModel(model, root, targetHeightMeters) {
  model.updateMatrixWorld(true);

  let box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);

  if (!Number.isFinite(size.y) || size.y <= 0) {
    throw new Error("Michelle.glb returned an invalid model bounding box.");
  }

  const scale = targetHeightMeters / size.y;
  model.scale.multiplyScalar(scale);
  model.updateMatrixWorld(true);

  box = new THREE.Box3().setFromObject(model);

  const center = new THREE.Vector3();
  box.getCenter(center);

  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= box.min.y;
  model.updateMatrixWorld(true);

  // Keep the wrapper at identity transform. This gives future garment layers
  // and fallback anchors a predictable meter-based coordinate space.
  root.position.set(0, 0, 0);
  root.rotation.set(0, 0, 0);
  root.scale.set(1, 1, 1);

  return scale;
}
