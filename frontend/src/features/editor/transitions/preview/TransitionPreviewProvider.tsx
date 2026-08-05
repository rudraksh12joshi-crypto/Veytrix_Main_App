import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { TransitionPreviewController } from './TransitionPreviewController';
import { TransitionExecutionGraph } from '../execution/TransitionExecutionGraph';
import { PreviewFrameState, PreviewMetrics, PreviewStatus } from './TransitionPreviewContext';

interface TransitionPreviewContextType {
  status: PreviewStatus;
  graph: TransitionExecutionGraph | null;
  frameState: PreviewFrameState | null;
  metrics: PreviewMetrics;
  setTransition: (graphOrId: TransitionExecutionGraph | string) => void;
  clearTransition: () => void;
  playPreview: () => void;
  pausePreview: () => void;
  seekPreview: (progressRatio: number) => void;
}

const TransitionPreviewContext = createContext<TransitionPreviewContextType | null>(null);

export const TransitionPreviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const controller = TransitionPreviewController.getInstance();

  const [previewState, setPreviewState] = useState(() => controller.getPreviewState());

  useEffect(() => {
    const unsubscribe = controller.subscribe((frameState, status) => {
      setPreviewState({
        status,
        graph: controller.getPreviewState().graph,
        frameState,
        metrics: controller.getPreviewState().metrics
      });
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      status: previewState.status,
      graph: previewState.graph,
      frameState: previewState.frameState,
      metrics: previewState.metrics,
      setTransition: (graphOrId: TransitionExecutionGraph | string) => controller.setTransition(graphOrId),
      clearTransition: () => controller.clearTransition(),
      playPreview: () => controller.playPreview(),
      pausePreview: () => controller.pausePreview(),
      seekPreview: (progressRatio: number) => controller.seekPreview(progressRatio)
    }),
    [previewState]
  );

  return (
    <TransitionPreviewContext.Provider value={value}>
      {children}
    </TransitionPreviewContext.Provider>
  );
};

export const useTransitionPreview = (): TransitionPreviewContextType => {
  const context = useContext(TransitionPreviewContext);
  if (!context) {
    const controller = TransitionPreviewController.getInstance();
    const state = controller.getPreviewState();

    return {
      status: state.status,
      graph: state.graph,
      frameState: state.frameState,
      metrics: state.metrics,
      setTransition: (graphOrId: TransitionExecutionGraph | string) => controller.setTransition(graphOrId),
      clearTransition: () => controller.clearTransition(),
      playPreview: () => controller.playPreview(),
      pausePreview: () => controller.pausePreview(),
      seekPreview: (progressRatio: number) => controller.seekPreview(progressRatio)
    };
  }
  return context;
};
