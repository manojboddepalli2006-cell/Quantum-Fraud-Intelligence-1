/**
 * InteractiveQuantumLab Component
 * High-fidelity interactive 3D laboratory with raycasting, click/touch-to-focus,
 * smart camera controller, connection highlighting, quantum ripples,
 * and data stream flow.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useQuantum } from '../../context/QuantumContext';
import { QUANTUM_NODES } from '../../data/quantumNodes';
import { QuantumCameraController } from '../../three/cameraController';
import { InteractiveNodeInspector } from './InteractiveNodeInspector';
import { QuantumNodeMetadata } from '../../types/quantum';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  Info,
} from 'lucide-react';

interface Node3DObject {
  metadata: QuantumNodeMetadata;
  group: THREE.Group;
  coreMesh: THREE.Mesh;
  glowMesh: THREE.Mesh;
  ringMesh?: THREE.Mesh;
  originalScale: number;
}

interface Connection3D {
  fromId: string;
  toId: string;
  line: THREE.Line;
  defaultOpacity: number;
}

export const InteractiveQuantumLab: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    activityState,
    reducedMotion,
    focusedNode,
    setFocusedNode,
    clearFocusedNode,
    focusTriggerId,
  } = useQuantum();

  const cameraControllerRef = useRef<QuantumCameraController | null>(null);
  const [hoveredNode, setHoveredNode] = useState<QuantumNodeMetadata | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [isCinematicFullscreen, setIsCinematicFullscreen] = useState(false);

  // References for scene synchronization
  const nodeObjectsRef = useRef<Map<string, Node3DObject>>(new Map());
  const connectionsRef = useRef<Connection3D[]>([]);
  const rippleMeshRef = useRef<THREE.Mesh | null>(null);
  const rippleRadiusRef = useRef(0);
  const rippleActiveRef = useRef(false);

  // Mouse / Raycaster
  const mouseRef = useRef(new THREE.Vector2(-10, -10));
  const raycasterRef = useRef(new THREE.Raycaster());

  // Focus a specific node
  const handleFocusNode = useCallback((nodeId: string) => {
    const nodeObj = nodeObjectsRef.current.get(nodeId);
    if (!nodeObj || !cameraControllerRef.current) return;

    setFocusedNode(nodeObj.metadata);

    // Trigger Camera Focus
    const worldPos = new THREE.Vector3();
    nodeObj.group.getWorldPosition(worldPos);
    cameraControllerRef.current.focusObject(worldPos, 9.2, 0.4);

    // Trigger Outward Quantum Ripple from clicked node
    if (rippleMeshRef.current) {
      rippleMeshRef.current.position.copy(worldPos);
      rippleRadiusRef.current = 0.2;
      rippleActiveRef.current = true;
      rippleMeshRef.current.visible = true;
    }
  }, [setFocusedNode]);

  // Return to field action
  const handleReturnToField = useCallback(() => {
    clearFocusedNode();
    if (cameraControllerRef.current) {
      cameraControllerRef.current.resetCamera();
    }
  }, [clearFocusedNode]);

  // Synchronize external focus requests (e.g. from context trigger)
  useEffect(() => {
    if (focusTriggerId) {
      handleFocusNode(focusTriggerId);
    }
  }, [focusTriggerId, handleFocusNode]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFFF9F0, 0.008);

    const camera = new THREE.PerspectiveCamera(46, container.clientWidth / container.clientHeight, 0.1, 100);
    const initialPos = new THREE.Vector3(0, 2, 23);
    const initialLookAt = new THREE.Vector3(0, 0, 0);

    const cameraController = new QuantumCameraController(camera, container, initialPos, initialLookAt);
    cameraControllerRef.current = cameraController;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const disposables: { dispose: () => void }[] = [];
    const nodeMap = new Map<string, Node3DObject>();
    const connectionList: Connection3D[] = [];

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 2. Build 3D Nodes from QUANTUM_NODES dictionary
    Object.values(QUANTUM_NODES).forEach((node) => {
      const nGroup = new THREE.Group();
      nGroup.position.set(...node.position);

      const colorHex = parseInt(node.color.replace('#', '0x'), 16);
      const isQubit = node.category === 'qubit';
      const isFeature = node.category === 'feature';
      const isDecision = node.category === 'decision';

      // Core sphere
      const baseRadius = isQubit ? 0.95 : isFeature ? 0.8 : isDecision ? 1.05 : 0.88;
      const coreGeo = new THREE.SphereGeometry(baseRadius, 18, 18);
      const coreMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        wireframe: true,
        transparent: true,
        opacity: isFeature ? 0.45 : 0.35,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.userData = { nodeId: node.id };
      nGroup.add(coreMesh);

      // Inner glowing nucleus
      const glowGeo = new THREE.SphereGeometry(baseRadius * 0.45, 12, 12);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xDFB878,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      nGroup.add(glowMesh);

      // Orbital precession ring
      const ringGeo = new THREE.RingGeometry(baseRadius * 1.55, baseRadius * 1.68, 36);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xC5A46D,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.38,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 3;
      nGroup.add(ringMesh);

      rootGroup.add(nGroup);
      nodeMap.set(node.id, {
        metadata: node,
        group: nGroup,
        coreMesh,
        glowMesh,
        ringMesh,
        originalScale: 1.0,
      });

      disposables.push(coreGeo, coreMat, glowGeo, glowMat, ringGeo, ringMat);
    });
    nodeObjectsRef.current = nodeMap;

    // 3. Build Interconnecting Curves between related nodes
    const connectedPairs = new Set<string>();
    Object.values(QUANTUM_NODES).forEach((source) => {
      source.relatedNodes.forEach((targetId) => {
        const target = QUANTUM_NODES[targetId];
        if (!target) return;
        const pairKey = [source.id, target.id].sort().join('--');
        if (connectedPairs.has(pairKey)) return;
        connectedPairs.add(pairKey);

        const p1 = new THREE.Vector3(...source.position);
        const p2 = new THREE.Vector3(...target.position);
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        mid.y += (p1.x > 0 ? 0.9 : -0.9);

        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        const curvePoints = curve.getPoints(24);
        const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const curveMat = new THREE.LineBasicMaterial({
          color: 0xDCC09B,
          transparent: true,
          opacity: 0.22,
        });
        const line = new THREE.Line(curveGeo, curveMat);
        rootGroup.add(line);

        connectionList.push({
          fromId: source.id,
          toId: target.id,
          line,
          defaultOpacity: 0.22,
        });
        disposables.push(curveGeo, curveMat);
      });
    });
    connectionsRef.current = connectionList;

    // 4. Interactive Data Flow Stream Particles
    const flowCount = 64;
    const flowGeo = new THREE.BufferGeometry();
    const flowPositions = new Float32Array(flowCount * 3);
    for (let i = 0; i < flowCount; i++) {
      flowPositions[i * 3] = -8 + (i / flowCount) * 18;
      flowPositions[i * 3 + 1] = (Math.sin(i * 0.4) * 2.5);
      flowPositions[i * 3 + 2] = (Math.cos(i * 0.3) * 1.5);
    }
    flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPositions, 3));
    const flowMat = new THREE.PointsMaterial({
      color: 0xDFB878,
      size: 0.42,
      transparent: true,
      opacity: 0.85,
    });
    const flowParticles = new THREE.Points(flowGeo, flowMat);
    rootGroup.add(flowParticles);
    disposables.push(flowGeo, flowMat);

    // 5. Outward Quantum Ripple Ring Mesh
    const ripGeo = new THREE.RingGeometry(0.1, 0.4, 48);
    const ripMat = new THREE.MeshBasicMaterial({
      color: 0xDFB878,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const ripMesh = new THREE.Mesh(ripGeo, ripMat);
    ripMesh.visible = false;
    scene.add(ripMesh);
    rippleMeshRef.current = ripMesh;
    disposables.push(ripGeo, ripMat);

    // 6. Interaction Event Handlers (Pointer Move, Click, Touch)
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      setTooltipPos({ x: e.clientX, y: e.clientY });
    };

    const handleClick = () => {
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const meshes = Array.from(nodeMap.values()).map((n) => n.coreMesh);
      const intersects = raycasterRef.current.intersectObjects(meshes);

      if (intersects.length > 0) {
        const clickedNodeId = intersects[0].object.userData.nodeId;
        if (clickedNodeId) {
          handleFocusNode(clickedNodeId);
        }
      }
    };

    // Touch controls: tap to focus, drag to orbit
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        touchMoved = false;

        const rect = container.getBoundingClientRect();
        mouseRef.current.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((t.clientY - rect.top) / rect.height) * 2 + 1;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && cameraController) {
        const t = e.touches[0];
        const dx = (t.clientX - touchStartX) * 0.006;
        const dy = (t.clientY - touchStartY) * 0.006;
        if (Math.abs(dx) > 0.02 || Math.abs(dy) > 0.02) {
          touchMoved = true;
          cameraController.orbitAround(-dx, dy);
          touchStartX = t.clientX;
          touchStartY = t.clientY;
        }
      }
    };

    const handleTouchEnd = () => {
      if (!touchMoved) {
        // Was a tap -> trigger click raycast
        handleClick();
      }
    };

    container.addEventListener('mousemove', handlePointerMove, { passive: true });
    container.addEventListener('click', handleClick);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    // 7. Animation Loop
    let animId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Update camera controller smoothly
      cameraController.update(delta);

      if (!reducedMotion) {
        const speed = activityState === 'ANALYZING' ? 2.6 : 1.0;

        // Animate nodes breathing and orbital rings
        nodeMap.forEach((nObj, id) => {
          if (nObj.ringMesh) {
            nObj.ringMesh.rotation.z += delta * 0.3 * speed;
          }
          nObj.coreMesh.rotation.y += delta * 0.2 * speed;
        });

        // Animate Data Flow Stream particles
        const flowArr = flowGeo.getAttribute('position') as THREE.BufferAttribute;
        const arr = flowArr.array as Float32Array;
        const flowSpeed = delta * 14.0 * speed;

        for (let k = 0; k < flowCount; k++) {
          arr[k * 3] += flowSpeed * 0.35;
          if (arr[k * 3] > 11.5) {
            arr[k * 3] = -9.0;
          }
        }
        flowArr.needsUpdate = true;
      }

      // 8. Raycast for Hover inspection
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const coreMeshes = Array.from(nodeMap.values()).map((n) => n.coreMesh);
      const hits = raycasterRef.current.intersectObjects(coreMeshes);

      if (hits.length > 0) {
        const hitId = hits[0].object.userData.nodeId;
        const hitObj = nodeMap.get(hitId);
        if (hitObj) {
          setHoveredNode(hitObj.metadata);
          hitObj.group.scale.setScalar(1.22);
          (hitObj.coreMesh.material as THREE.MeshBasicMaterial).opacity = 0.85;
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredNode(null);
        container.style.cursor = 'default';
        nodeMap.forEach((nObj) => {
          if (!focusedNode || focusedNode.id !== nObj.metadata.id) {
            nObj.group.scale.setScalar(1.0);
            (nObj.coreMesh.material as THREE.MeshBasicMaterial).opacity = 0.38;
          }
        });
      }

      // 9. Update Quantum Ripple Animation
      if (rippleActiveRef.current && rippleMeshRef.current) {
        rippleRadiusRef.current += delta * 24.0;
        const s = rippleRadiusRef.current;
        rippleMeshRef.current.scale.set(s, s, 1);
        const ripMat = rippleMeshRef.current.material as THREE.MeshBasicMaterial;
        ripMat.opacity = Math.max(0, 0.7 - (rippleRadiusRef.current / 22) * 0.7);

        if (rippleRadiusRef.current > 22) {
          rippleActiveRef.current = false;
          rippleMeshRef.current.visible = false;
        }
      }

      // 10. Connection Highlighting / Subduing
      if (focusedNode) {
        const related = new Set(focusedNode.relatedNodes);
        related.add(focusedNode.id);

        connectionList.forEach((conn) => {
          const isRelated = related.has(conn.fromId) && related.has(conn.toId);
          const mat = conn.line.material as THREE.LineBasicMaterial;
          mat.opacity = isRelated ? 0.75 : 0.08;
          mat.color.set(isRelated ? '#DFB878' : '#DCC09B');
        });
      } else {
        connectionList.forEach((conn) => {
          const mat = conn.line.material as THREE.LineBasicMaterial;
          mat.opacity = conn.defaultOpacity;
          mat.color.set('#DCC09B');
        });
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Resize Observer
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      disposables.forEach((d) => d.dispose());
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      cameraControllerRef.current = null;
    };
  }, [activityState, reducedMotion, handleFocusNode, focusedNode]);

  return (
    <div
      data-interactive-3d="true"
      className={`relative w-full overflow-hidden rounded-3xl border border-[#DCC09B] bg-gradient-to-br from-[#FFFDF9] via-[#F6EBDD]/90 to-[#E8D2B5]/40 shadow-[0_12px_40px_rgba(74,48,36,0.08)] ${
        isCinematicFullscreen
          ? 'fixed inset-4 z-50 rounded-3xl shadow-2xl bg-[#FFFDF9]'
          : 'h-[460px] sm:h-[540px] lg:h-[600px]'
      } ${className}`}
    >
      {/* 1. Header Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-[#FFFDF9]/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-[#E8D2B5] shadow-xs text-xs font-mono text-[#4A3024]">
          <Sparkles className="w-3.5 h-3.5 text-[#B98252]" />
          <span>Interactive 3D Quantum Lab</span>
          <span className="text-[#8B6245]/50" aria-hidden="true">·</span>
          <span className="text-[#8B6245]">Click node to focus</span>
        </div>

        {/* Camera Control Dock (+, -, Reset, Fullscreen) */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#FFFDF9]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#E8D2B5] shadow-xs">
          <button
            onClick={() => cameraControllerRef.current?.zoomIn()}
            className="p-1.5 rounded-xl text-[#8B6245] hover:text-[#2E1E18] hover:bg-[#F6EBDD] transition-colors cursor-pointer"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => cameraControllerRef.current?.zoomOut()}
            className="p-1.5 rounded-xl text-[#8B6245] hover:text-[#2E1E18] hover:bg-[#F6EBDD] transition-colors cursor-pointer"
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReturnToField}
            className="p-1.5 rounded-xl text-[#8B6245] hover:text-[#2E1E18] hover:bg-[#F6EBDD] transition-colors cursor-pointer"
            title="Reset View"
            aria-label="Reset Camera"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCinematicFullscreen(!isCinematicFullscreen)}
            className="p-1.5 rounded-xl text-[#8B6245] hover:text-[#2E1E18] hover:bg-[#F6EBDD] transition-colors cursor-pointer"
            title="Toggle Cinematic Viewport"
            aria-label="Toggle Fullscreen"
          >
            {isCinematicFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Three.js Mount Container */}
      <div ref={containerRef} className="w-full h-full relative z-10 touch-none" />

      {/* 3. Subtle Depth-of-field Vignette */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,_transparent_45%,_rgba(246,235,221,0.55)_100%] pointer-events-none" />

      {/* 4. Active Node Spotlight Atmosphere */}
      {focusedNode && (
        <div className="absolute inset-0 bg-[#2E1E18]/15 backdrop-blur-[0.5px] pointer-events-none transition-opacity duration-500 animate-in fade-in" />
      )}

      {/* 5. Hover Tooltip */}
      {hoveredNode && !focusedNode && tooltipPos && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-1.5 rounded-xl bg-[#2E1E18] text-[#FFF9F0] text-xs font-mono shadow-xl border border-[#4A3024] -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <p className="font-bold text-[#DFB878]">{hoveredNode.title}</p>
          <p className="text-[10px] text-[#DCC09B]">{hoveredNode.role}</p>
        </div>
      )}

      {/* 6. Contextual Floating Inspector Panel */}
      <InteractiveNodeInspector
        onReturnToField={handleReturnToField}
        onFocusNode={handleFocusNode}
      />
    </div>
  );
};
