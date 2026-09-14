import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import * as THREE from "three";

// 🎯 1. CUSTOM PART NAMES MAP
// Change the right-hand value to whatever title you want displayed in the box!
const CUSTOM_PART_NAMES = {
  "QUARTER/COUNTER/COLLAR LINING": "Collar Lining", // 👈 Edit this text
  "FOAM LINING PIECE": "Counter",
  "FOAM LINING": "Collar Foam",
  "COUNTER STIFFENER": "Heel Counter Reinforcement",
  BACKER: "Inner Seam Backer",
  "NO SEW PIECES": "No-Sew Bonded Film",
  'QUARTER/"SADDLE" PIECE': "Saddle",
  "TOE BOX/CAP OVERLAY": "Toe Cap",
  'TOE STIFFENER "LINER" UNDERLAY': "Toe Box",
  OVERLAYS: "TPU Overlays",
  "SOCK LINER/FOOTBED INSOLE": "Sock Liner",
  'HF WELD "NO SEW" LOGOS AND STRIPE DETAIL': "No-Sew Details",
  'HF WELD "NO SEW" STRIPE DETAIL': "No-Sew Details",
  UNSURE: "Vamp",
};

// 🎯 2. PATTERN DESCRIPTIONS MAP
const PATTERN_DESCRIPTIONS = {
  "FOAM LINING PIECE":
    "Cushioning foam insert layer providing step-in comfort and localized pressure distribution.",
  "FOAM LINING":
    "Internal foam padding layer for collar and tongue structural cushioning.",
  BACKER:
    "Internal reinforcement backing layer stabilizing upper panel seams.",
  "COUNTER STIFFENER":
    "Molded thermoplastic counter insert maintaining heel cup geometry.",
  "QUARTER/COUNTER/COLLAR LINING":
    "Internal textile lining surrounding the heel collar and quarter panels for smooth entry and heel fit.",
  "NO SEW PIECES":
    "Thermoplastic film bonded directly to upper textiles to eliminate bulky stitched seamlines.",
  "VAMP LINING":
    "Soft inner lining backing the forefoot vamp to reduce friction and flex creasing against toes.",
  "SOCK LINER/FOOTBED INSOLE":
    "Removable contoured footbed supporting plantar arch anatomy and underfoot cushioning.",
  "STROBEL SOCK":
    "Textile lasting board sewn directly to upper perimeter prior to midsole cavity bonding.",
  "TONGUE LINING":
    "Internal soft-touch tongue lining preventing lace pressure irritation across instep.",
  "TONGUE OVERLAY":
    "Structural top layer of the tongue providing lace bite protection and aesthetic detailing.",
  "TONGUE TPU OVERLAY":
    "Flexible thermoplastic polyurethane overlay reinforcing tongue structure and lace contact.",
  'QUARTER/"SADDLE" PIECE':
    "Midfoot saddle section wrapping the medial and lateral quarter for arch lockdown.",
  'TOE STIFFENER "LINER" UNDERLAY':
    "Internal structural toe box reinforcement maintaining anterior shape integrity.",
  "TOE BOX/CAP OVERLAY":
    "External forefoot cap panel protecting the toe box against scuffs and impacts.",
  'HF WELD "NO SEW" LOGOS AND STRIPE DETAIL':
    "High-frequency welded decorative overlay detailing and brand accents.",
  'HF WELD "NO SEW" STRIPE DETAIL':
    "High-frequency welded structural strip detail reinforcing dynamic flex zones.",
  "GHILLIE LOOPS":
    "Textile webbed lacing loops distributing pull tension evenly into side quarter panels.",
  OVERLAYS:
    "Reinforcing structural upper panels providing targeted support and shape definition.",
  LACES:
    "Primary closure cords regulating lockdown tension across instep and collar.",
  BASE: "Base shoe lasting reference unit.",
  UNSURE: "Custom description explaining this pattern component layer.",
};

// 🎯 Strips slashes, quotes, underscores & spaces for 100% reliable key matching
function normalizeKey(str) {
  if (!str) return "";
  return str.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function resolveDisplayName(rawKey) {
  if (!rawKey) return "";
  const targetNorm = normalizeKey(rawKey);

  for (const [key, customName] of Object.entries(CUSTOM_PART_NAMES)) {
    if (normalizeKey(key) === targetNorm) {
      return customName;
    }
  }

  return rawKey.replace(/_/g, " ").trim().toUpperCase();
}

function getPatternDescription(rawKey) {
  if (!rawKey) return "Precision footwear pattern component layer.";
  const targetNorm = normalizeKey(rawKey);

  for (const [key, desc] of Object.entries(PATTERN_DESCRIPTIONS)) {
    if (normalizeKey(key) === targetNorm) {
      return desc;
    }
  }

  return `Technical pattern layer defining perimeter boundary and material layout for ${rawKey}.`;
}

export default function ShoePatternPart({
  partKey,
  wholePosition,
  explodedPosition,
  material,
  isExploded,
  onSelectPart,
  activePart,
  onHoverPart,
  hoveredPart,
  geometry,
  isHiddenUnit,
}) {
  const meshRef = useRef();

  const rawTitle = partKey ? partKey.replace(/_/g, " ").trim().toUpperCase() : "";
  const displayTitle = resolveDisplayName(rawTitle);

  const isInteractive = isExploded && !isHiddenUnit;
  const isSelected = isInteractive && activePart === displayTitle;
  const isHovered = isInteractive && hoveredPart === displayTitle;

  useCursor(isHovered, "pointer", "auto");

  const description = getPatternDescription(rawTitle);

  const clonedMaterial = useMemo(() => {
    if (!material) {
      return new THREE.MeshStandardMaterial({
        color: "#cbd5e1",
        roughness: 0.4,
        metalness: 0.1,
        transparent: true,
        opacity: 1.0,
      });
    }

    const mat = Array.isArray(material)
      ? material.map((m) => m.clone())
      : material.clone();

    const mats = Array.isArray(mat) ? mat : [mat];

    const cleanTitle = rawTitle.toUpperCase();
    const needsGreyOverride =
      cleanTitle.includes("FOAM LINING") ||
      cleanTitle.includes("BACKER") ||
      cleanTitle.includes("COUNTER STIFFENER") ||
      cleanTitle.includes("SPONGE");

    mats.forEach((m) => {
      m.transparent = true;
      m.depthWrite = true;

      if (needsGreyOverride && m.color) {
        m.color.set("#d1d5db");
      }
    });

    return mat;
  }, [material, rawTitle]);

  useFrame(() => {
    if (!meshRef.current) return;

    const targetX = isExploded ? explodedPosition[0] : wholePosition[0];
    const targetY = isExploded ? explodedPosition[1] : wholePosition[1];
    const targetZ = isExploded ? explodedPosition[2] : wholePosition[2];

    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.08);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.08);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.08);

    const mats = Array.isArray(meshRef.current.material)
      ? meshRef.current.material
      : [meshRef.current.material];

    let targetAlpha = 1.0;

    if (isHiddenUnit) {
      targetAlpha = isExploded ? 0.0 : 1.0;
    } else if (activePart && isExploded) {
      targetAlpha = isSelected ? 1.0 : 0.15;
    } else {
      targetAlpha = 1.0;
    }

    mats.forEach((mat) => {
      if (!mat) return;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetAlpha, 0.1);
      mat.visible = mat.opacity > 0.01;

      if (isSelected) {
        if ("emissive" in mat && mat.emissive) mat.emissive.set("#c084fc");
        if ("emissiveIntensity" in mat) mat.emissiveIntensity = 0.8;
      } else if (isHovered && !activePart) {
        if ("emissive" in mat && mat.emissive) mat.emissive.set("#e2fbaf");
        if ("emissiveIntensity" in mat) mat.emissiveIntensity = 0.5;
      } else {
        if ("emissive" in mat && mat.emissive) mat.emissive.set("#000000");
        if ("emissiveIntensity" in mat) mat.emissiveIntensity = 0.0;
      }
    });
  });

  return (
    <mesh
      ref={meshRef}
      position={wholePosition}
      geometry={geometry}
      material={clonedMaterial}
      raycast={!isInteractive ? () => null : THREE.Mesh.prototype.raycast}
      onClick={(e) => {
        e.stopPropagation();
        if (!isInteractive) return;
        onSelectPart(isSelected ? null : displayTitle);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!isInteractive) return;
        if (!activePart) onHoverPart(displayTitle);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        if (!isInteractive) return;
        if (!activePart) onHoverPart(null);
      }}
    >
      {isSelected && (
        <Html
          position={[0, 0, 0]}
          style={{
            pointerEvents: "auto",
            transform: "translate(160px, -50%)", // Offsets card into clear space
          }}
        >
          <aside
            className="glazed-glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <button
                className="close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPart(null);
                }}
              >
                ×
              </button>
            </div>

            <h2>{displayTitle}</h2>
            <div className="divider" />
            <p>{description}</p>
          </aside>
        </Html>
      )}
    </mesh>
  );
}