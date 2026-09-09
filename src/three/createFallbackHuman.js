import * as THREE from "three";

export function createFallbackHuman() {
  const root = new THREE.Group();
  root.name = "FitStyleFallbackHuman";

  const skin = new THREE.MeshPhysicalMaterial({
    color: 0xc99779,
    roughness: 0.64,
    sheen: 0.12,
  });

  const base = new THREE.MeshPhysicalMaterial({
    color: 0xbeb7ae,
    roughness: 0.82,
  });

  function mesh(geometry, material, position, scale = [1, 1, 1]) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position);
    object.scale.set(...scale);
    object.castShadow = true;
    object.receiveShadow = true;
    root.add(object);
    return object;
  }

  mesh(
    new THREE.SphereGeometry(0.22, 24, 18),
    skin,
    [0, 1.62, 0],
    [0.9, 1.08, 0.92],
  );

  mesh(
    new THREE.CapsuleGeometry(0.27, 0.52, 7, 18),
    skin,
    [0, 1.12, 0],
    [1, 1, 0.58],
  );

  mesh(
    new THREE.SphereGeometry(0.31, 22, 16),
    base,
    [0, 0.82, 0],
    [1.04, 0.55, 0.62],
  );

  [-1, 1].forEach((side) => {
    const arm = mesh(
      new THREE.CapsuleGeometry(0.06, 0.57, 6, 14),
      skin,
      [side * 0.36, 1.12, 0],
    );
    arm.rotation.z = side * 0.07;

    mesh(
      new THREE.CapsuleGeometry(0.09, 0.72, 6, 14),
      skin,
      [side * 0.14, 0.3, 0],
    );
  });

  return {
    root,
    model: root,
    bones: [],
    animations: [],
    statistics: {
      meshCount: root.children.length,
      skinnedMeshCount: 0,
      boneCount: 0,
    },
    normalizationScale: 1,
    isFallback: true,
  };
}
