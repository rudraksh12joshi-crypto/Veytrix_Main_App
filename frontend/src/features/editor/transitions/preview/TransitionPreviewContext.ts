import React from 'react';
import { TransitionExecutionGraph } from '../execution/TransitionExecutionGraph';

export type PreviewStatus = 'idle' | 'playing' | 'paused';

export interface RenderStyleState {
  opacity: number;
  transform: string;
  filter: string;
  clipPath: string;
  mixBlendMode: string;
  shaderPlaceholder: boolean;
  lightingPlaceholder: boolean;
  rawStyles: React.CSSProperties;
}

export interface PreviewFrameState {
  graphProgress: number;
  currentTime: number;
  duration: number;
  outgoingClipStyle: RenderStyleState;
  incomingClipStyle: RenderStyleState;
  compositeStyle: RenderStyleState;
  activeOperationsCount: number;
}

export interface PreviewMetrics {
  currentFps: number;
  averageFrameTimeMs: number;
  totalFramesRendered: number;
  lastFrameTimeMs: number;
}
