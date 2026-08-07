import { TransitionExecutionGraph } from '../execution/TransitionExecutionGraph';
import { TransitionPreviewRenderer } from './TransitionPreviewRenderer';
import { PreviewFrameState, PreviewMetrics } from './TransitionPreviewContext';

export class TransitionAnimator {
  private graph: TransitionExecutionGraph | null = null;
  private animFrameId: number | null = null;
  private startTime: number | null = null;
  private currentTimeSeconds = 0;
  private isPlaying = false;
  private onFrameCallback: ((frameState: PreviewFrameState, metrics: PreviewMetrics) => void) | null = null;

  private frameCount = 0;
  private lastFrameTimestamp = 0;
  private totalFrameTimeMs = 0;
  private currentFps = 60;

  public setGraph(graph: TransitionExecutionGraph | null): void {
    this.pause();
    this.graph = graph;
    this.seek(0);
  }

  public setOnFrameCallback(cb: (frameState: PreviewFrameState, metrics: PreviewMetrics) => void): void {
    this.onFrameCallback = cb;
  }

  public play(): void {
    if (this.isPlaying || !this.graph) return;
    this.isPlaying = true;
    this.startTime = performance.now() - this.currentTimeSeconds * 1000;
    this.lastFrameTimestamp = performance.now();
    this.tick(performance.now());
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public seek(progressRatio: number): void {
    if (!this.graph) return;
    const clampedProgress = Math.max(0, Math.min(1, progressRatio));
    this.currentTimeSeconds = clampedProgress * this.graph.duration;

    if (this.isPlaying) {
      this.startTime = performance.now() - this.currentTimeSeconds * 1000;
    }

    this.evaluateAndEmitFrame(performance.now());
  }

  private tick = (timestamp: number): void => {
    if (!this.isPlaying || !this.graph) return;

    const frameDelta = timestamp - this.lastFrameTimestamp;
    this.lastFrameTimestamp = timestamp;

    if (frameDelta > 0) {
      this.currentFps = Math.round(1000 / frameDelta);
      this.totalFrameTimeMs += frameDelta;
      this.frameCount++;
    }

    this.currentTimeSeconds = (timestamp - (this.startTime || timestamp)) / 1000;

    if (this.currentTimeSeconds >= this.graph.duration) {
      this.currentTimeSeconds = this.graph.duration;
      this.evaluateAndEmitFrame(timestamp);
      this.pause();
      return;
    }

    this.evaluateAndEmitFrame(timestamp);
    this.animFrameId = requestAnimationFrame(this.tick);
  };

  private evaluateAndEmitFrame(timestamp: number): void {
    const frameState = TransitionPreviewRenderer.renderFrame(this.graph, this.currentTimeSeconds);
    const avgFrameTime = this.frameCount > 0 ? Math.round((this.totalFrameTimeMs / this.frameCount) * 100) / 100 : 16.67;

    const metrics: PreviewMetrics = {
      currentFps: this.currentFps,
      averageFrameTimeMs: avgFrameTime,
      totalFramesRendered: this.frameCount,
      lastFrameTimeMs: Math.round((performance.now() - timestamp) * 100) / 100
    };

    if (this.onFrameCallback) {
      this.onFrameCallback(frameState, metrics);
    }
  }

  public getCurrentTime(): number {
    return this.currentTimeSeconds;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}
