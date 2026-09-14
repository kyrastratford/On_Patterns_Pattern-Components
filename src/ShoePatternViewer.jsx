import React, { useState, Suspense, Component } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import * as THREE from "three";
import ShoePatternGroup from "./ShoePatternGroup";

class CanvasErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bottom-hud-container">
          <div className="glass-callout">
            <span>⚠️ WebGL re-rendering recovered. Click below to reset.</span>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ShoePatternViewer() {
  const [isExploded, setIsExploded] = useState(false);
  const [activePart, setActivePart] = useState(null);
  const [hoveredPart, setHoveredPart] = useState(null);

  const handleToggleExplode = () => {
    const nextExploded = !isExploded;
    setIsExploded(nextExploded);
    if (!nextExploded) {
      setActivePart(null);
      setHoveredPart(null);
    }
  };

  return (
    <div className="app-container">
      <div className="viewport-matrix">
        <div className="canvas-wrapper">
          <CanvasErrorBoundary>
            <Canvas
              gl={{ toneMapping: THREE.NoToneMapping }}
              camera={{ position: [0, 0, 2.2], fov: 45 }}
              onPointerMissed={() => setActivePart(null)}
            >
              <color attach="background" args={["#050508"]} />

              <ambientLight intensity={1.2} />
              <directionalLight position={[10, 15, 10]} intensity={1.5} />
              <directionalLight position={[-10, -10, -10]} intensity={0.5} />

              <Suspense fallback={null}>
                <Center scale={0.004}>
                  <group
                    scale={[-0.01, 0.01, 0.01]}
                    rotation={[0, -Math.PI / 20, 0]}
                  >
                    <ShoePatternGroup
                      isExploded={isExploded}
                      activePart={activePart}
                      onSelectPart={setActivePart}
                      hoveredPart={hoveredPart}
                      onHoverPart={setHoveredPart}
                    />
                  </group>
                </Center>
              </Suspense>

              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                makeDefault
              />
            </Canvas>
          </CanvasErrorBoundary>

          {/* TOP CONTROLS */}
          <div className="top-controls">
            <button
              className={`glass-toggle-btn ${isExploded ? "active-mode" : ""}`}
              onClick={handleToggleExplode}
            >
              {isExploded ? "ASSEMBLE VIEW" : "EXPLODE VIEW"}
            </button>
          </div>

          {/* BOTTOM HUD CALLOUT */}
          <div className="bottom-hud-container">
            <div className="glass-callout">
              {activePart ? (
                <span className="active-text">
                  FOCUS: <strong>{activePart}</strong>
                </span>
              ) : hoveredPart ? (
                <span className="highlight">
                  HOVER: <strong>{hoveredPart}</strong>
                </span>
              ) : (
                <span>
                  {isExploded
                    ? "CLICK ANY PATTERN PIECE TO INSPECT"
                    : "EXPLODE MODEL TO INSPECT INDIVIDUAL PATTERN PARTS"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}