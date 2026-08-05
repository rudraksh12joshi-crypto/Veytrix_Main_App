export type OperationType =
  | 'OPACITY'
  | 'TRANSLATE'
  | 'SCALE'
  | 'ROTATE'
  | 'BLUR'
  | 'MASK'
  | 'BLEND'
  | 'SHADER'
  | 'LIGHTING'
  | 'CAMERA'
  | 'WAIT'
  | 'COMPOSITE';

export type PerformanceCost = 'LOW' | 'MEDIUM' | 'HIGH';

export interface OperationTarget {
  clip: 'OUTGOING_CLIP_A' | 'INCOMING_CLIP_B' | 'COMPOSITE_LAYER';
  layerIndex?: number;
}

export interface ExecutionOperation {
  id: string;
  type: OperationType;
  target: OperationTarget;
  startTimeRatio: number; // 0.0 to 1.0
  endTimeRatio: number;   // 0.0 to 1.0
  easing: string;
  parameters: Record<string, any>;
  description: string;
}

export interface ExecutionGraphNode {
  nodeId: string;
  phaseName: string;
  order: number;
  operations: ExecutionOperation[];
  target: OperationTarget;
}

export interface SerializedExecutionGraph {
  graphId: string;
  transitionId: string;
  engineKey: string;
  category: string;
  duration: number;
  easing: string;
  nodes: ExecutionGraphNode[];
  estimatedGPUCost: PerformanceCost;
  estimatedBackendCost: PerformanceCost;
  complexityScore: number;
  version: string;
  createdAt: number;
}

export interface GraphValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  graphId: string;
}

export interface ExecutionGraphMetrics {
  totalGraphsBuilt: number;
  cachedGraphCount: number;
  averageBuildTimeMs: number;
  totalOperationsCount: number;
  supportedOperationTypes: OperationType[];
  memoryUsageKb: number;
}
