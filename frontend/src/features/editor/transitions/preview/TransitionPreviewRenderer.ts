import { TransitionExecutionGraph } from '../execution/TransitionExecutionGraph';
import { TransitionFrameCalculator } from './TransitionFrameCalculator';
import { PreviewFrameState, RenderStyleState } from './TransitionPreviewContext';

export class TransitionPreviewRenderer {
  private static defaultStyle(): RenderStyleState {
    return {
      opacity: 1.0,
      transform: 'none',
      filter: 'none',
      clipPath: 'none',
      mixBlendMode: 'normal',
      shaderPlaceholder: false,
      lightingPlaceholder: false,
      rawStyles: {
        opacity: 1.0,
        transform: 'none',
        filter: 'none',
        clipPath: 'none',
        mixBlendMode: 'normal'
      }
    };
  }

  public static renderFrame(
    graph: TransitionExecutionGraph | null,
    currentTimeSeconds: number
  ): PreviewFrameState {
    if (!graph) {
      return {
        graphProgress: 0,
        currentTime: 0,
        duration: 0.5,
        outgoingClipStyle: this.defaultStyle(),
        incomingClipStyle: this.defaultStyle(),
        compositeStyle: this.defaultStyle(),
        activeOperationsCount: 0
      };
    }

    const graphProgress = TransitionFrameCalculator.calculateGraphProgress(
      currentTimeSeconds,
      graph.duration
    );

    const outgoingStyle = this.defaultStyle();
    const incomingStyle = this.defaultStyle();
    const compositeStyle = this.defaultStyle();

    const transformsMap: Record<string, string[]> = {
      OUTGOING_CLIP_A: [],
      INCOMING_CLIP_B: [],
      COMPOSITE_LAYER: []
    };

    const filtersMap: Record<string, string[]> = {
      OUTGOING_CLIP_A: [],
      INCOMING_CLIP_B: [],
      COMPOSITE_LAYER: []
    };

    let outgoingOpacitySet = false;
    let incomingOpacitySet = false;

    const allOperations = graph.getAllOperations();
    let activeOpsCount = 0;

    for (const op of allOperations) {
      const evalProgress = TransitionFrameCalculator.calculateOperationProgress(op, graphProgress);
      const val = evalProgress.evaluatedProgress;
      const clipTarget = op.target.clip;

      const targetStyle =
        clipTarget === 'OUTGOING_CLIP_A'
          ? outgoingStyle
          : clipTarget === 'INCOMING_CLIP_B'
          ? incomingStyle
          : compositeStyle;

      if (evalProgress.isActive) {
        activeOpsCount++;
      }

      const params = op.parameters || {};

      switch (op.type) {
        case 'OPACITY': {
          const startAlpha = typeof params.startAlpha === 'number' ? params.startAlpha : 1.0;
          const endAlpha = typeof params.endAlpha === 'number' ? params.endAlpha : 0.0;
          targetStyle.opacity = startAlpha + (endAlpha - startAlpha) * val;
          if (clipTarget === 'OUTGOING_CLIP_A') outgoingOpacitySet = true;
          if (clipTarget === 'INCOMING_CLIP_B') incomingOpacitySet = true;
          break;
        }

        case 'TRANSLATE': {
          const dir = params.direction || 'LEFT';
          const mode = params.mode || 'EXIT_PUSH';
          let txPercent = 0;
          let tyPercent = 0;

          if (mode === 'ENTER_SLIDE' || mode === 'ENTER_PUSH') {
            const remaining = 1.0 - val;
            if (dir === 'LEFT') txPercent = 100 * remaining;
            else if (dir === 'RIGHT') txPercent = -100 * remaining;
            else if (dir === 'UP') tyPercent = 100 * remaining;
            else if (dir === 'DOWN') tyPercent = -100 * remaining;
            else if (dir === 'DIAGONAL') {
              txPercent = 100 * remaining;
              tyPercent = 100 * remaining;
            } else if (dir === 'SPLIT') {
              txPercent = 50 * remaining;
            } else {
              txPercent = 100 * remaining;
            }
          } else {
            if (dir === 'LEFT') txPercent = -100 * val;
            else if (dir === 'RIGHT') txPercent = 100 * val;
            else if (dir === 'UP') tyPercent = -100 * val;
            else if (dir === 'DOWN') tyPercent = 100 * val;
            else if (dir === 'DIAGONAL') {
              txPercent = -100 * val;
              tyPercent = -100 * val;
            } else if (dir === 'SPLIT') {
              txPercent = -50 * val;
            } else {
              txPercent = -100 * val;
            }
          }

          transformsMap[clipTarget].push(`translate3d(${txPercent.toFixed(1)}%, ${tyPercent.toFixed(1)}%, 0px)`);
          break;
        }

        case 'SCALE': {
          const startScale = typeof params.startScale === 'number' ? params.startScale : 1.0;
          const endScale = typeof params.endScale === 'number' ? params.endScale : 2.0;
          const s = startScale + (endScale - startScale) * val;
          transformsMap[clipTarget].push(`scale(${s.toFixed(3)})`);
          break;
        }

        case 'ROTATE': {
          const deg = typeof params.degrees === 'number' ? params.degrees : 360;
          const endDeg = typeof params.endDegrees === 'number' ? params.endDegrees : deg;
          const r = deg + (endDeg - deg) * val;
          const axis = params.axis || 'Z';

          if (axis === 'X') transformsMap[clipTarget].push(`perspective(1000px) rotateX(${r.toFixed(1)}deg)`);
          else if (axis === 'Y') transformsMap[clipTarget].push(`perspective(1000px) rotateY(${r.toFixed(1)}deg)`);
          else transformsMap[clipTarget].push(`perspective(1000px) rotateZ(${r.toFixed(1)}deg)`);
          break;
        }

        case 'BLUR': {
          const maxRadius = typeof params.maxRadius === 'number' ? params.maxRadius : 20;
          const radius = maxRadius * (1 - Math.abs(val - 0.5) * 2);
          filtersMap[clipTarget].push(`blur(${radius.toFixed(1)}px)`);
          break;
        }

        case 'MASK': {
          targetStyle.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
          break;
        }

        case 'BLEND': {
          if (params.blendMode) {
            targetStyle.mixBlendMode = String(params.blendMode).toLowerCase();
          }
          break;
        }

        case 'SHADER': {
          const type = params.shaderType || 'UV_DISPLACEMENT';
          const offset = typeof params.rgbSplitOffset === 'number' ? params.rgbSplitOffset : 10;
          const shift = Math.sin(val * Math.PI) * offset;

          if (type === 'RGB_SPLIT') {
            filtersMap[clipTarget].push(`drop-shadow(${shift.toFixed(1)}px 0px 0px rgba(255,0,0,0.7)) drop-shadow(-${shift.toFixed(1)}px 0px 0px rgba(0,255,255,0.7))`);
          } else if (type === 'VHS') {
            filtersMap[clipTarget].push(`hue-rotate(${(val * 90).toFixed(0)}deg) contrast(150%) brightness(120%)`);
          } else if (type === 'SCANLINES') {
            filtersMap[clipTarget].push(`contrast(180%) invert(${(val * 30).toFixed(0)}%)`);
          } else {
            filtersMap[clipTarget].push(`drop-shadow(${shift.toFixed(1)}px 0px 0px rgba(255,0,80,0.6)) contrast(140%) hue-rotate(${(val * 120).toFixed(0)}deg)`);
          }
          break;
        }

        case 'LIGHTING': {
          const color = params.flareColor || '#FFD700';
          const intensity = typeof params.bloomIntensity === 'number' ? params.bloomIntensity : 1.5;
          const peak = Math.sin(val * Math.PI) * intensity;
          const brightness = (100 + peak * 100).toFixed(0);

          filtersMap[clipTarget].push(`brightness(${brightness}%) drop-shadow(0px 0px ${(peak * 30).toFixed(0)}px ${color})`);
          break;
        }

        case 'CAMERA': {
          const mode = params.cameraMode || 'PAN';
          const dir = params.direction || 'LEFT';
          const isOutgoing = params.isOutgoing ?? true;

          let tx = 0;
          let ty = 0;
          let scale = 1.0;
          let rx = 0;
          let ry = 0;

          if (mode === 'DOLLY_IN') {
            scale = isOutgoing ? 1.0 + val * 0.8 : 0.4 + val * 0.6;
          } else if (mode === 'DOLLY_OUT') {
            scale = isOutgoing ? 1.0 - val * 0.5 : 1.8 - val * 0.8;
          } else if (mode === 'CRANE_UP') {
            ty = isOutgoing ? -val * 100 : 100 - val * 100;
            rx = isOutgoing ? val * 15 : -15 + val * 15;
          } else if (mode === 'CRANE_DOWN') {
            ty = isOutgoing ? val * 100 : -100 + val * 100;
            rx = isOutgoing ? -val * 15 : 15 - val * 15;
          } else if (mode === 'ORBIT') {
            ry = dir === 'RIGHT' ? val * 45 : -val * 45;
            tx = dir === 'RIGHT' ? val * 50 : -val * 50;
          } else if (mode === 'PARALLAX') {
            tx = isOutgoing ? -val * 40 : 40 - val * 40;
            scale = 1.0 + Math.sin(val * Math.PI) * 0.15;
          } else if (mode === 'HANDHELD') {
            tx = Math.sin(val * Math.PI * 6) * 12;
            ty = Math.cos(val * Math.PI * 4) * 12;
          } else if (mode === 'SWING') {
            ry = Math.sin(val * Math.PI) * 20;
          } else {
            if (dir === 'LEFT') tx = isOutgoing ? -val * 100 : 100 - val * 100;
            else if (dir === 'RIGHT') tx = isOutgoing ? val * 100 : -100 + val * 100;
            else if (dir === 'UP') ty = isOutgoing ? -val * 100 : 100 - val * 100;
            else if (dir === 'DOWN') ty = isOutgoing ? val * 100 : -100 + val * 100;
          }

          transformsMap[clipTarget].push(`perspective(1000px) translate3d(${tx.toFixed(1)}%, ${ty.toFixed(1)}%, 0px) scale(${scale.toFixed(3)}) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg)`);
          break;
        }

        default:
          break;
      }
    }

    // Default opacity fallback ONLY if no explicit OPACITY operation executed for that clip
    if (!outgoingOpacitySet) {
      outgoingStyle.opacity = Math.max(0, Math.min(1, 1.0 - graphProgress));
    }
    if (!incomingOpacitySet) {
      incomingStyle.opacity = Math.max(0, Math.min(1, graphProgress));
    }

    // Join accumulated transform and filter functions per layer
    outgoingStyle.transform = transformsMap['OUTGOING_CLIP_A'].length > 0 ? transformsMap['OUTGOING_CLIP_A'].join(' ') : 'none';
    incomingStyle.transform = transformsMap['INCOMING_CLIP_B'].length > 0 ? transformsMap['INCOMING_CLIP_B'].join(' ') : 'none';
    compositeStyle.transform = transformsMap['COMPOSITE_LAYER'].length > 0 ? transformsMap['COMPOSITE_LAYER'].join(' ') : 'none';

    outgoingStyle.filter = filtersMap['OUTGOING_CLIP_A'].length > 0 ? filtersMap['OUTGOING_CLIP_A'].join(' ') : 'none';
    incomingStyle.filter = filtersMap['INCOMING_CLIP_B'].length > 0 ? filtersMap['INCOMING_CLIP_B'].join(' ') : 'none';
    compositeStyle.filter = filtersMap['COMPOSITE_LAYER'].length > 0 ? filtersMap['COMPOSITE_LAYER'].join(' ') : 'none';

    // Sync raw CSS properties payload after all operations have run for the frame
    outgoingStyle.rawStyles = {
      opacity: Math.max(0, Math.min(1, outgoingStyle.opacity)),
      transform: outgoingStyle.transform,
      filter: outgoingStyle.filter,
      clipPath: outgoingStyle.clipPath,
      mixBlendMode: outgoingStyle.mixBlendMode as any
    };

    incomingStyle.rawStyles = {
      opacity: Math.max(0, Math.min(1, incomingStyle.opacity)),
      transform: incomingStyle.transform,
      filter: incomingStyle.filter,
      clipPath: incomingStyle.clipPath,
      mixBlendMode: incomingStyle.mixBlendMode as any
    };

    compositeStyle.rawStyles = {
      opacity: Math.max(0, Math.min(1, compositeStyle.opacity)),
      transform: compositeStyle.transform,
      filter: compositeStyle.filter,
      clipPath: compositeStyle.clipPath,
      mixBlendMode: compositeStyle.mixBlendMode as any
    };

    return {
      graphProgress,
      currentTime: currentTimeSeconds,
      duration: graph.duration,
      outgoingClipStyle: outgoingStyle,
      incomingClipStyle: incomingStyle,
      compositeStyle,
      activeOperationsCount: activeOpsCount
    };
  }
}
