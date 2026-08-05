import { TransitionExecutionGraph } from '../execution/TransitionExecutionGraph';
import { ExecutionGraphFactory } from '../execution/ExecutionGraphFactory';
import { TransitionAnimator } from './TransitionAnimator';
import { PreviewFrameState, PreviewMetrics, PreviewStatus } from './TransitionPreviewContext';

export class TransitionPreviewController {
  private static instance: TransitionPreviewController | null = null;
  private animator: TransitionAnimator;
  private currentGraph: TransitionExecutionGraph | null = null;
  private currentStatus: PreviewStatus = 'idle';
  private currentFrameState: PreviewFrameState | null = null;
  private currentMetrics: PreviewMetrics = {
    currentFps: 60,
    averageFrameTimeMs: 16.67,
    totalFramesRendered: 0,
    lastFrameTimeMs: 0
  };

  private listeners: Set<(state: PreviewFrameState, status: PreviewStatus) => void> = new Set();

  private constructor() {
    this.animator = new TransitionAnimator();
    this.animator.setOnFrameCallback(this.handleFrameUpdate);
  }

  public static getInstance(): TransitionPreviewController {
    if (!TransitionPreviewController.instance) {
      TransitionPreviewController.instance = new TransitionPreviewController();
    }
    return TransitionPreviewController.instance;
  }

  private handleFrameUpdate = (frameState: PreviewFrameState, metrics: PreviewMetrics): void => {
    this.currentFrameState = frameState;
    this.currentMetrics = metrics;

    if (frameState.graphProgress >= 1.0) {
      this.currentStatus = 'idle';
    }

    this.notifyListeners();
  };

  public setTransition(graphOrId: TransitionExecutionGraph | string): void {
    let graph: TransitionExecutionGraph | null = null;
    if (typeof graphOrId === 'string') {
      graph = ExecutionGraphFactory.getInstance().createExecutionGraph(graphOrId);
    } else {
      graph = graphOrId;
    }

    this.currentGraph = graph;
    this.animator.setGraph(graph);
    this.currentStatus = 'idle';
    this.notifyListeners();
  }

  public clearTransition(): void {
    this.animator.pause();
    this.currentGraph = null;
    this.animator.setGraph(null);
    this.currentStatus = 'idle';
    this.currentFrameState = null;
    this.notifyListeners();
  }

  public playPreview(): void {
    if (!this.currentGraph) return;
    this.currentStatus = 'playing';
    this.animator.play();
    this.notifyListeners();
  }

  public pausePreview(): void {
    this.currentStatus = 'paused';
    this.animator.pause();
    this.notifyListeners();
  }

  public seekPreview(progressRatio: number): void {
    this.animator.seek(progressRatio);
    this.notifyListeners();
  }

  public subscribe(listener: (state: PreviewFrameState, status: PreviewStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    if (this.currentFrameState) {
      for (const listener of this.listeners) {
        listener(this.currentFrameState, this.currentStatus);
      }
    }
  }

  public getPreviewState(): {
    status: PreviewStatus;
    graph: TransitionExecutionGraph | null;
    frameState: PreviewFrameState | null;
    metrics: PreviewMetrics;
  } {
    return {
      status: this.currentStatus,
      graph: this.currentGraph,
      frameState: this.currentFrameState,
      metrics: this.currentMetrics
    };
  }
}
