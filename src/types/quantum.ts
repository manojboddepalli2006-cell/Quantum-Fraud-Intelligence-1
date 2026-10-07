/**
 * Quantum Visualizer & Activity State Types
 */

export type QuantumActivityState = 'IDLE' | 'ANALYZING' | 'SUCCESS' | 'ERROR';

export interface QuantumSceneOptions {
  particleCount?: number;
  nodeCount?: number;
  reducedMotion?: boolean;
  lowPowerMode?: boolean;
}

export interface QuantumSystemTelemetry {
  state: QuantumActivityState;
  lastStateChange: number;
  activeQubits: number;
  coherenceScore: number;
  pulseIntensity: number;
}

export type QuantumNodeCategory = 'feature' | 'qubit' | 'circuit' | 'decision';

export interface QuantumNodeMetadata {
  id: string;
  title: string;
  label: string;
  category: QuantumNodeCategory;
  role: string;
  status: 'ACTIVE' | 'ENTANGLED' | 'MEASURED' | 'EVALUATING';
  pipeline: string;
  description: string;
  mathDetail?: string;
  relatedNodes: string[];
  position: [number, number, number];
  color: string;
}

export interface CameraState {
  targetPosition: [number, number, number];
  lookAt: [number, number, number];
  isTransitioning: boolean;
  focusedNodeId: string | null;
  zoomLevel: number;
}
