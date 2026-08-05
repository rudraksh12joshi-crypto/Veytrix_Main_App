export const TRANSITION_DEFAULTS = {
  DURATION: 0.5,
  MIN_DURATION: 0.1,
  MAX_DURATION: 3.0,
  EASING: 'easeInOutCubic',
  VERSION: '1.0.0'
} as const;

export const TRANSITION_CATEGORIES = [
  'Basic',
  'Camera',
  'Zoom',
  'Slide & Push',
  'Spin & Rotate',
  'Blur & Motion',
  'Glitch & Digital',
  'Cinematic & Light'
] as const;

export const TRANSITION_ENGINES = {
  DISSOLVE_COLOR: 'dissolve_color_engine',
  CAMERA_MOTION: 'camera_motion_engine',
  SCALE_ZOOM: 'scale_zoom_engine',
  SPATIAL_PUSH: 'spatial_push_engine',
  THREE_D_ROTATION: '3d_rotation_engine',
  OPTICAL_BLUR: 'optical_blur_engine',
  DIGITAL_GLITCH: 'digital_glitch_engine',
  PHOTOMETRIC_LIGHT: 'photometric_light_engine'
} as const;

export const TRANSITION_PLANS = {
  FREE: 'FREE',
  PRO: 'PRO',
  PREMIUM: 'PREMIUM'
} as const;
