import { TransitionInstance } from '../engine/TransitionEngineTypes';
import { TransitionExecutionGraph } from './TransitionExecutionGraph';
import { ExecutionGraphNode, PerformanceCost } from './ExecutionGraphTypes';
import { OperationFactory } from './ExecutionOperation';
import { GraphNodeBuilder } from './ExecutionGraphNode';

export class ExecutionGraphBuilder {
  public static buildGraph(instance: TransitionInstance): TransitionExecutionGraph {
    const graphId = `graph_${instance.id}_${instance.engineKey}`;
    const nodes: ExecutionGraphNode[] = [];
    const params = instance.parameters || {};

    let gpuCost: PerformanceCost = 'LOW';
    let backendCost: PerformanceCost = 'LOW';
    let complexityScore = 1;

    // Node 1: Outgoing Clip A Phase
    const outgoingOps = [];
    // Node 2: Incoming Clip B Phase
    const incomingOps = [];
    // Node 3: Composite Overlay / Shader / Blend Phase
    const compositeOps = [];

    switch (instance.engineKey) {
      case 'dissolve_color_engine': {
        const nameLower = (instance.name || '').toLowerCase();

        if (nameLower.includes('black') || nameLower.includes('dark') || params.dipColor === '#000000') {
          // Dip / Fade to Black: Clip A fades to black (0-0.5), Clip B fades in from black (0.5-1.0)
          outgoingOps.push(
            OperationFactory.create('OPACITY', { clip: 'OUTGOING_CLIP_A' }, 0.0, 0.5, { startAlpha: 1.0, endAlpha: 0.0 }, 'easeInQuad', 'Fade Clip A to black')
          );
          incomingOps.push(
            OperationFactory.create('OPACITY', { clip: 'INCOMING_CLIP_B' }, 0.5, 1.0, { startAlpha: 0.0, endAlpha: 1.0 }, 'easeOutQuad', 'Fade Clip B from black')
          );
          compositeOps.push(
            OperationFactory.create('BLEND', { clip: 'COMPOSITE_LAYER' }, 0.4, 0.6, { blendMode: 'COLOR_DIP', color: '#000000' }, 'linear', 'Dip to black intermediate pass')
          );
        } else if (nameLower.includes('white') || nameLower.includes('flash') || nameLower.includes('bright') || nameLower.includes('exposure') || nameLower.includes('light')) {
          // Fade / Flash to White: Clip A flashes white (0-0.4), Clip B reveals from white (0.4-1.0)
          outgoingOps.push(
            OperationFactory.create('OPACITY', { clip: 'OUTGOING_CLIP_A' }, 0.0, 0.4, { startAlpha: 1.0, endAlpha: 0.0 }, 'easeInExpo', 'Flash Clip A to white')
          );
          incomingOps.push(
            OperationFactory.create('OPACITY', { clip: 'INCOMING_CLIP_B' }, 0.4, 1.0, { startAlpha: 0.0, endAlpha: 1.0 }, 'easeOutExpo', 'Reveal Clip B from white')
          );
          compositeOps.push(
            OperationFactory.create('BLEND', { clip: 'COMPOSITE_LAYER' }, 0.3, 0.6, { blendMode: 'COLOR_DIP', color: '#FFFFFF' }, 'linear', 'Flash white blend pass')
          );
        } else if (nameLower.includes('instant') || nameLower.includes('cut')) {
          // Instant Cut: Step transition at 50% midpoint
          outgoingOps.push(
            OperationFactory.create('WAIT', { clip: 'OUTGOING_CLIP_A' }, 0.0, 0.5, {}, 'linear', 'Hold Clip A until cut point')
          );
          incomingOps.push(
            OperationFactory.create('OPACITY', { clip: 'INCOMING_CLIP_B' }, 0.5, 1.0, { startAlpha: 1.0, endAlpha: 1.0 }, 'linear', 'Instant cut to Clip B')
          );
        } else {
          // Standard Alpha Cross Dissolve / Smooth Fade / Soft Reveal (Default)
          outgoingOps.push(
            OperationFactory.create('OPACITY', { clip: 'OUTGOING_CLIP_A' }, 0.0, 1.0, { startAlpha: 1.0, endAlpha: 0.0 }, instance.easing, 'Crossfade Clip A out')
          );
          incomingOps.push(
            OperationFactory.create('OPACITY', { clip: 'INCOMING_CLIP_B' }, 0.0, 1.0, { startAlpha: 0.0, endAlpha: 1.0 }, instance.easing, 'Crossfade Clip B in')
          );
        }
        gpuCost = 'LOW';
        backendCost = 'LOW';
        complexityScore = 2;
        break;
      }

      case 'spatial_push_engine': {
        const nameLower = (instance.name || '').toLowerCase();
        let direction = params.direction || 'LEFT';
        let easing = instance.easing || 'easeInOutCubic';

        if (nameLower.includes('right')) direction = 'RIGHT';
        else if (nameLower.includes('up')) direction = 'UP';
        else if (nameLower.includes('down')) direction = 'DOWN';
        else if (nameLower.includes('diagonal')) direction = 'DIAGONAL';
        else if (nameLower.includes('split') || nameLower.includes('dual') || nameLower.includes('cross')) direction = 'SPLIT';
        else if (nameLower.includes('card') || nameLower.includes('stack') || nameLower.includes('gallery')) direction = 'STACK';

        if (nameLower.includes('elastic')) easing = 'elastic';
        else if (nameLower.includes('bounce')) easing = 'bounce';
        else if (nameLower.includes('smooth')) easing = 'easeInOutCubic';

        const isSlideOnly = nameLower.includes('slide') || nameLower.includes('swipe');

        if (isSlideOnly) {
          // Slide: Clip A stays static (or soft fade), Clip B slides over Clip A
          outgoingOps.push(
            OperationFactory.create('OPACITY', { clip: 'OUTGOING_CLIP_A' }, 0.0, 1.0, { startAlpha: 1.0, endAlpha: 0.8 }, 'linear', 'Clip A background anchor')
          );
          incomingOps.push(
            OperationFactory.create('TRANSLATE', { clip: 'INCOMING_CLIP_B' }, 0.0, 1.0, { direction, mode: 'ENTER_SLIDE', pushDistance: '100%' }, easing, `Slide Clip B in from ${direction}`)
          );
        } else {
          // Push: Clip A pushes off-screen while Clip B enters
          outgoingOps.push(
            OperationFactory.create('TRANSLATE', { clip: 'OUTGOING_CLIP_A' }, 0.0, 1.0, { direction, mode: 'EXIT_PUSH', pushDistance: '100%' }, easing, `Push Clip A out towards ${direction}`)
          );
          incomingOps.push(
            OperationFactory.create('TRANSLATE', { clip: 'INCOMING_CLIP_B' }, 0.0, 1.0, { direction, mode: 'ENTER_PUSH', pushDistance: '100%' }, easing, `Push Clip B in from ${direction}`)
          );
        }

        compositeOps.push(
          OperationFactory.create('MASK', { clip: 'COMPOSITE_LAYER' }, 0.0, 1.0, { maskType: 'VIEWPORT_CLIPPING' }, 'linear', 'Clip viewport bounds')
        );

        gpuCost = 'LOW';
        backendCost = 'LOW';
        complexityScore = 3;
        break;
      }

      case 'scale_zoom_engine': {
        const nameLower = (instance.name || '').toLowerCase();
        let easing = instance.easing || 'easeInOutCubic';

        if (nameLower.includes('elastic')) easing = 'elastic';
        else if (nameLower.includes('bounce')) easing = 'bounce';
        else if (nameLower.includes('fast') || nameLower.includes('punch') || nameLower.includes('hyper')) easing = 'easeOutExpo';
        else if (nameLower.includes('soft') || nameLower.includes('slow')) easing = 'easeInOutSine';

        if (nameLower.includes('out') || nameLower.includes('down')) {
          // Zoom Out: Clip A shrinks down, Clip B zooms down into place from large scale
          outgoingOps.push(
            OperationFactory.create('SCALE', { clip: 'OUTGOING_CLIP_A' }, 0.0, 1.0, { startScale: 1.0, endScale: 0.4 }, easing, 'Zoom out Clip A')
          );
          outgoingOps.push(
            OperationFactory.create('OPACITY', { clip: 'OUTGOING_CLIP_A' }, 0.0, 1.0, { startAlpha: 1.0, endAlpha: 0.0 }, 'linear', 'Fade Clip A out')
          );
          incomingOps.push(
            OperationFactory.create('SCALE', { clip: 'INCOMING_CLIP_B' }, 0.0, 1.0, { startScale: 2.2, endScale: 1.0 }, easing, 'Scale Clip B down into place')
          );
          incomingOps.push(
            OperationFactory.create('OPACITY', { clip: 'INCOMING_CLIP_B' }, 0.0, 0.6, { startAlpha: 0.0, endAlpha: 1.0 }, 'linear', 'Fade Clip B in')
          );
        } else if (nameLower.includes('through') || nameLower.includes('infinite') || nameLower.includes('warp')) {
          // Zoom Through: Extreme scale pass-through
          outgoingOps.push(
            OperationFactory.create('SCALE', { clip: 'OUTGOING_CLIP_A' }, 0.0, 0.6, { startScale: 1.0, endScale: 5.0 }, easing, 'Extreme Zoom Through Clip A')
          );
          outgoingOps.push(
            OperationFactory.create('OPACITY', { clip: 'OUTGOING_CLIP_A' }, 0.2, 0.6, { startAlpha: 1.0, endAlpha: 0.0 }, 'linear', 'Fade Clip A out')
          );
          incomingOps.push(
            OperationFactory.create('SCALE', { clip: 'INCOMING_CLIP_B' }, 0.4, 1.0, { startScale: 0.1, endScale: 1.0 }, easing, 'Emerge Clip B from center')
          );
          incomingOps.push(
            OperationFactory.create('OPACITY', { clip: 'INCOMING_CLIP_B' }, 0.4, 1.0, { startAlpha: 0.0, endAlpha: 1.0 }, 'linear', 'Fade Clip B in')
          );
        } else {
          // Default Zoom In / Scale Up / Dynamic Zoom
          outgoingOps.push(
            OperationFactory.create('SCALE', { clip: 'OUTGOING_CLIP_A' }, 0.0, 1.0, { startScale: 1.0, endScale: 2.2 }, easing, 'Zoom In Clip A')
          );
          outgoingOps.push(
            OperationFactory.create('OPACITY', { clip: 'OUTGOING_CLIP_A' }, 0.2, 1.0, { startAlpha: 1.0, endAlpha: 0.0 }, 'linear', 'Fade Clip A out')
          );
          incomingOps.push(
            OperationFactory.create('SCALE', { clip: 'INCOMING_CLIP_B' }, 0.0, 1.0, { startScale: 0.5, endScale: 1.0 }, easing, 'Scale Clip B up')
          );
          incomingOps.push(
            OperationFactory.create('OPACITY', { clip: 'INCOMING_CLIP_B' }, 0.0, 0.7, { startAlpha: 0.0, endAlpha: 1.0 }, 'linear', 'Fade Clip B in')
          );
        }
        gpuCost = 'MEDIUM';
        backendCost = 'MEDIUM';
        complexityScore = 4;
        break;
      }

      case '3d_rotation_engine': {
        const nameLower = (instance.name || '').toLowerCase();
        let axis: 'X' | 'Y' | 'Z' = 'Y';
        let degrees = 180;
        let easing = instance.easing || 'easeInOutCubic';

        if (nameLower.includes('vert') || nameLower.includes('flip x') || nameLower.includes('tilt')) {
          axis = 'X';
          degrees = 180;
        } else if (nameLower.includes('horiz') || nameLower.includes('flip y') || nameLower.includes('card') || nameLower.includes('page') || nameLower.includes('swivel')) {
          axis = 'Y';
          degrees = 180;
        } else if (nameLower.includes('cube')) {
          axis = (nameLower.includes('up') || nameLower.includes('down')) ? 'X' : 'Y';
          degrees = 90;
        } else if (nameLower.includes('barrel') || nameLower.includes('spin') || nameLower.includes('whirl') || nameLower.includes('twister') || nameLower.includes('vortex')) {
          axis = 'Z';
          degrees = (nameLower.includes('ccw') || nameLower.includes('left')) ? -360 : 360;
        }

        if (nameLower.includes('fast') || nameLower.includes('quick')) easing = 'easeOutExpo';

        // Node 1: Clip A rotates to midpoint (0 -> 50% transition progress)
        outgoingOps.push(
          OperationFactory.create('ROTATE', { clip: 'OUTGOING_CLIP_A' }, 0.0, 0.5, { axis, degrees: degrees / 2 }, easing, `Rotate Clip A 3D ${axis}-axis`)
        );
        outgoingOps.push(
          OperationFactory.create('OPACITY', { clip: 'OUTGOING_CLIP_A' }, 0.4, 0.5, { startAlpha: 1.0, endAlpha: 0.0 }, 'linear', 'Hide Clip A at rotation midpoint')
        );

        // Node 2: Clip B enters from opposing rotation (50% -> 100% transition progress)
        incomingOps.push(
          OperationFactory.create('ROTATE', { clip: 'INCOMING_CLIP_B' }, 0.5, 1.0, { axis, degrees: -degrees / 2, endDegrees: 0 }, easing, `Rotate Clip B 3D ${axis}-axis`)
        );
        incomingOps.push(
          OperationFactory.create('OPACITY', { clip: 'INCOMING_CLIP_B' }, 0.5, 0.6, { startAlpha: 0.0, endAlpha: 1.0 }, 'linear', 'Show Clip B at rotation midpoint')
        );

        compositeOps.push(
          OperationFactory.create('MASK', { clip: 'COMPOSITE_LAYER' }, 0.0, 1.0, { perspectiveDepth: 1000 }, 'linear', 'Apply 3D perspective projection matrix')
        );

        gpuCost = 'MEDIUM';
        backendCost = 'MEDIUM';
        complexityScore = 5;
        break;
      }

      case 'optical_blur_engine': {
        const nameLower = (instance.name || '').toLowerCase();
        let blurType = 'GAUSSIAN';
        let maxRadius = params.blurRadius || 20;

        if (nameLower.includes('motion') || nameLower.includes('directional') || nameLower.includes('velocity') || nameLower.includes('linear') || nameLower.includes('stretch')) {
          blurType = 'DIRECTIONAL';
          maxRadius = 25;
        } else if (nameLower.includes('zoom') || nameLower.includes('radial') || nameLower.includes('spin') || nameLower.includes('prism')) {
          blurType = 'ZOOM';
          maxRadius = 30;
        } else if (nameLower.includes('bokeh') || nameLower.includes('defocus') || nameLower.includes('focus')) {
          blurType = 'DEFOCUS';
          maxRadius = 22;
        }

        outgoingOps.push(
          OperationFactory.create('BLUR', { clip: 'OUTGOING_CLIP_A' }, 0.0, 0.6, { blurType, maxRadius }, 'easeInQuad', `Apply ${blurType} blur peak to Clip A`)
        );
        outgoingOps.push(
          OperationFactory.create('OPACITY', { clip: 'OUTGOING_CLIP_A' }, 0.2, 0.6, { startAlpha: 1.0, endAlpha: 0.0 }, 'linear', 'Fade Clip A out')
        );

        incomingOps.push(
          OperationFactory.create('BLUR', { clip: 'INCOMING_CLIP_B' }, 0.4, 1.0, { blurType, maxRadius, endRadius: 0 }, 'easeOutQuad', `Decay ${blurType} blur from Clip B`)
        );
        incomingOps.push(
          OperationFactory.create('OPACITY', { clip: 'INCOMING_CLIP_B' }, 0.4, 0.9, { startAlpha: 0.0, endAlpha: 1.0 }, 'linear', 'Fade Clip B in')
        );

        gpuCost = 'HIGH';
        backendCost = 'HIGH';
        complexityScore = 6;
        break;
      }

      case 'camera_motion_engine': {
        const nameLower = (instance.name || '').toLowerCase();
        let cameraMode = 'PAN';
        let direction = 'LEFT';
        let easing = instance.easing || 'easeInOutCubic';

        if (nameLower.includes('dolly')) {
          cameraMode = nameLower.includes('out') ? 'DOLLY_OUT' : 'DOLLY_IN';
        } else if (nameLower.includes('crane')) {
          cameraMode = nameLower.includes('down') ? 'CRANE_DOWN' : 'CRANE_UP';
        } else if (nameLower.includes('orbit')) {
          cameraMode = 'ORBIT';
          direction = nameLower.includes('right') ? 'RIGHT' : 'LEFT';
        } else if (nameLower.includes('parallax')) {
          cameraMode = 'PARALLAX';
        } else if (nameLower.includes('shake') || nameLower.includes('handheld')) {
          cameraMode = 'HANDHELD';
        } else if (nameLower.includes('swing') || nameLower.includes('drift') || nameLower.includes('roll')) {
          cameraMode = 'SWING';
        } else {
          cameraMode = 'PAN';
          if (nameLower.includes('right')) direction = 'RIGHT';
          else if (nameLower.includes('up')) direction = 'UP';
          else if (nameLower.includes('down')) direction = 'DOWN';
          else direction = 'LEFT';
        }

        if (nameLower.includes('whip') || nameLower.includes('fast') || nameLower.includes('snap')) {
          easing = 'easeOutExpo';
        }

        outgoingOps.push(
          OperationFactory.create('CAMERA', { clip: 'OUTGOING_CLIP_A' }, 0.0, 1.0, { cameraMode, direction, isOutgoing: true }, easing, `Camera ${cameraMode} Clip A`)
        );
        outgoingOps.push(
          OperationFactory.create('OPACITY', { clip: 'OUTGOING_CLIP_A' }, 0.2, 1.0, { startAlpha: 1.0, endAlpha: 0.0 }, 'linear', 'Fade Clip A camera exit')
        );

        incomingOps.push(
          OperationFactory.create('CAMERA', { clip: 'INCOMING_CLIP_B' }, 0.0, 1.0, { cameraMode, direction, isOutgoing: false }, easing, `Camera ${cameraMode} Clip B`)
        );
        incomingOps.push(
          OperationFactory.create('OPACITY', { clip: 'INCOMING_CLIP_B' }, 0.0, 0.8, { startAlpha: 0.0, endAlpha: 1.0 }, 'linear', 'Fade Clip B camera entry')
        );

        gpuCost = 'MEDIUM';
        backendCost = 'MEDIUM';
        complexityScore = 5;
        break;
      }

      case 'digital_glitch_engine': {
        const nameLower = (instance.name || '').toLowerCase();
        let shaderType = 'UV_DISPLACEMENT';
        let rgbSplitOffset = 8.0;
        let noiseIntensity = 0.5;
        let pixelSize = 12;

        if (nameLower.includes('rgb') || nameLower.includes('chromatic') || nameLower.includes('bleed')) {
          shaderType = 'RGB_SPLIT';
          rgbSplitOffset = 16.0;
        } else if (nameLower.includes('static') || nameLower.includes('vhs') || nameLower.includes('noise') || nameLower.includes('crt') || nameLower.includes('interference')) {
          shaderType = 'VHS';
          noiseIntensity = 0.8;
        } else if (nameLower.includes('scan') || nameLower.includes('tear') || nameLower.includes('line') || nameLower.includes('jump')) {
          shaderType = 'SCANLINES';
        } else if (nameLower.includes('pixel') || nameLower.includes('bit')) {
          shaderType = 'PIXELATE';
          pixelSize = 20;
        }

        compositeOps.push(
          OperationFactory.create('SHADER', { clip: 'COMPOSITE_LAYER' }, 0.0, 1.0, { shaderType, rgbSplitOffset, noiseIntensity, pixelSize, blockNoise: true }, 'linear', `Apply ${shaderType} glitch fragment pass`)
        );
        compositeOps.push(
          OperationFactory.create('BLEND', { clip: 'COMPOSITE_LAYER' }, 0.2, 0.8, { blendMode: 'DIFFERENCE' }, 'linear', 'Apply glitch blend difference')
        );

        outgoingOps.push(
          OperationFactory.create('OPACITY', { clip: 'OUTGOING_CLIP_A' }, 0.0, 0.5, { startAlpha: 1.0, endAlpha: 0.0 }, 'linear', 'Clip A glitch exit')
        );
        incomingOps.push(
          OperationFactory.create('OPACITY', { clip: 'INCOMING_CLIP_B' }, 0.5, 1.0, { startAlpha: 0.0, endAlpha: 1.0 }, 'linear', 'Clip B glitch entry')
        );

        gpuCost = 'HIGH';
        backendCost = 'HIGH';
        complexityScore = 8;
        break;
      }

      case 'photometric_light_engine': {
        const nameLower = (instance.name || '').toLowerCase();
        let flareColor = '#FFD700';
        let blendMode = 'SCREEN';
        let bloomIntensity = 1.6;

        if (nameLower.includes('burn') || nameLower.includes('retro') || nameLower.includes('film')) {
          flareColor = '#FF3300';
          blendMode = 'COLOR_DODGE';
          bloomIntensity = 2.2;
        } else if (nameLower.includes('flare') || nameLower.includes('ray') || nameLower.includes('anamorphic')) {
          flareColor = '#00D0FF';
          blendMode = 'LIGHTEN';
          bloomIntensity = 2.0;
        } else if (nameLower.includes('leak') || nameLower.includes('golden') || nameLower.includes('vintage')) {
          flareColor = '#FF9900';
          blendMode = 'SCREEN';
          bloomIntensity = 1.8;
        } else if (nameLower.includes('neon') || nameLower.includes('laser')) {
          flareColor = '#FF00FF';
          blendMode = 'SCREEN';
          bloomIntensity = 1.9;
        }

        compositeOps.push(
          OperationFactory.create('LIGHTING', { clip: 'COMPOSITE_LAYER' }, 0.0, 1.0, { flareColor, bloomIntensity, flareOrigin: [0.5, 0.5] }, instance.easing, `Synthesize ${instance.name} volumetric light flare`)
        );
        compositeOps.push(
          OperationFactory.create('BLEND', { clip: 'COMPOSITE_LAYER' }, 0.0, 1.0, { blendMode }, 'linear', `Blend light flare via ${blendMode} mode`)
        );

        outgoingOps.push(
          OperationFactory.create('OPACITY', { clip: 'OUTGOING_CLIP_A' }, 0.0, 0.5, { startAlpha: 1.0, endAlpha: 0.0 }, 'linear', 'Clip A dissolve under flare')
        );
        incomingOps.push(
          OperationFactory.create('OPACITY', { clip: 'INCOMING_CLIP_B' }, 0.5, 1.0, { startAlpha: 0.0, endAlpha: 1.0 }, 'linear', 'Clip B reveal under flare')
        );

        gpuCost = 'HIGH';
        backendCost = 'HIGH';
        complexityScore = 7;
        break;
      }

      default:
        outgoingOps.push(
          OperationFactory.create('OPACITY', { clip: 'OUTGOING_CLIP_A' }, 0.0, 1.0, { startAlpha: 1.0, endAlpha: 0.0 }, instance.easing, 'Generic fade out')
        );
        incomingOps.push(
          OperationFactory.create('OPACITY', { clip: 'INCOMING_CLIP_B' }, 0.0, 1.0, { startAlpha: 0.0, endAlpha: 1.0 }, instance.easing, 'Generic fade in')
        );
        break;
    }

    nodes.push(GraphNodeBuilder.createNode('OUTGOING_PHASE', 1, { clip: 'OUTGOING_CLIP_A' }, outgoingOps));
    nodes.push(GraphNodeBuilder.createNode('INCOMING_PHASE', 2, { clip: 'INCOMING_CLIP_B' }, incomingOps));
    nodes.push(GraphNodeBuilder.createNode('COMPOSITE_PHASE', 3, { clip: 'COMPOSITE_LAYER' }, compositeOps));

    return new TransitionExecutionGraph(
      graphId,
      instance.id,
      instance.engineKey,
      instance.category,
      instance.duration,
      instance.easing,
      nodes,
      gpuCost,
      backendCost,
      complexityScore
    );
  }
}
