import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import ShoePatternPart from "./ShoePatternPart";

const GLB_WHOLE_URL =
  "https://raw.githubusercontent.com/kyrastratford/On_3D-Assets/main/shoe_pattern_parts_whole.glb";
const GLB_EXPLODED_URL =
  "https://raw.githubusercontent.com/kyrastratford/On_3D-Assets/main/shoe_pattern_parts_exploded.glb";

export default function ShoePatternGroup({
  isExploded,
  onSelectPart,
  activePart,
  onHoverPart,
  hoveredPart, 
}) {
  const wholeGLTF = useGLTF(GLB_WHOLE_URL);
  const explodedGLTF = useGLTF(GLB_EXPLODED_URL);

  const processedParts = useMemo(() => {
    if (!wholeGLTF?.scene || !explodedGLTF?.scene) return [];

    wholeGLTF.scene.updateMatrixWorld(true);
    explodedGLTF.scene.updateMatrixWorld(true);

    const explodedPosMap = new Map();
    explodedGLTF.scene.traverse((child) => {
      if (child.isMesh) {
        const rawName = child.name ? child.name.trim() : "";
        const cleanName = rawName.replace(/_/g, " ").trim().toUpperCase();

        const geomExp = child.geometry.clone();
        geomExp.applyMatrix4(child.matrixWorld);
        geomExp.computeBoundingBox();

        if (geomExp.boundingBox) {
          const center = geomExp.boundingBox.getCenter(new THREE.Vector3());
          explodedPosMap.set(cleanName, [center.x, center.y, center.z]);
        }
      }
    });

    const items = [];
    let index = 0;

    wholeGLTF.scene.traverse((child) => {
      if (child.isMesh) {
        const geom = child.geometry.clone();
        geom.applyMatrix4(child.matrixWorld);
        geom.computeBoundingBox();

        const wholeCenter = geom.boundingBox
          ? geom.boundingBox.getCenter(new THREE.Vector3())
          : new THREE.Vector3();

        geom.center();

        const rawName = child.name ? child.name.trim() : `PART_${index + 1}`;
        const cleanLayerName = rawName.replace(/_/g, " ").trim().toUpperCase();
        const isBaseUnit = cleanLayerName === "BASE";

        const wholePos = [wholeCenter.x, wholeCenter.y, wholeCenter.z];
        const explodedPos = explodedPosMap.get(cleanLayerName) || wholePos;

        const originalMaterial = Array.isArray(child.material)
          ? child.material.map((mat) => mat.clone())
          : child.material.clone();

        items.push({
          key: `pattern_mesh_${index}_${cleanLayerName}`,
          displayKey: cleanLayerName,
          geometry: geom,
          material: originalMaterial,
          wholePosition: wholePos,
          explodedPosition: explodedPos,
          isHiddenUnit: isBaseUnit,
        });

        index++;
      }
    });

    return items;
  }, [wholeGLTF, explodedGLTF]);

  return (
    <group>
      {processedParts.map((part) => (
        <ShoePatternPart
          key={part.key}
          partKey={part.displayKey}
          wholePosition={part.wholePosition}
          explodedPosition={part.explodedPosition}
          material={part.material}
          isExploded={isExploded}
          onSelectPart={onSelectPart}
          activePart={activePart}
          onHoverPart={onHoverPart}
          hoveredPart={hoveredPart}
          geometry={part.geometry}
          isHiddenUnit={part.isHiddenUnit}
        />
      ))}
    </group>
  );
}

useGLTF.preload(GLB_WHOLE_URL);
useGLTF.preload(GLB_EXPLODED_URL);