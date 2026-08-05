export class TransitionInterpolator {
  public static evaluate(t: number, easing = 'easeInOutCubic'): number {
    let p = Math.max(0, Math.min(1, t));

    switch (easing.toLowerCase()) {
      case 'linear':
        return p;

      case 'easein':
      case 'easeinquad':
        return p * p;

      case 'easeout':
      case 'easeoutquad':
        return p * (2 - p);

      case 'easeinout':
      case 'easeinoutquad':
        return p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;

      case 'easeincubic':
        return p * p * p;

      case 'easeoutcubic':
        p -= 1;
        return p * p * p + 1;

      case 'easeinoutcubic':
        return p < 0.5
          ? 4 * p * p * p
          : (p - 1) * (2 * p - 2) * (2 * p - 2) + 1;

      case 'easeinquart':
        return p * p * p * p;

      case 'easeoutquart':
        p -= 1;
        return 1 - p * p * p * p;

      case 'easeinoutquart':
        if (p < 0.5) return 8 * p * p * p * p;
        p -= 1;
        return 1 - 8 * p * p * p * p;

      case 'easeinquint':
        return p * p * p * p * p;

      case 'easeoutquint':
        p -= 1;
        return 1 + p * p * p * p * p;

      case 'easeinexpo':
        return p === 0 ? 0 : Math.pow(2, 10 * (p - 1));

      case 'easeoutexpo':
        return p === 1 ? 1 : 1 - Math.pow(2, -10 * p);

      case 'bounce':
      case 'easeoutbounce':
        if (p < 1 / 2.75) {
          return 7.5625 * p * p;
        } else if (p < 2 / 2.75) {
          p -= 1.5 / 2.75;
          return 7.5625 * p * p + 0.75;
        } else if (p < 2.5 / 2.75) {
          p -= 2.25 / 2.75;
          return 7.5625 * p * p + 0.9375;
        } else {
          p -= 2.625 / 2.75;
          return 7.5625 * p * p + 0.984375;
        }

      case 'elastic':
      case 'easeoutelastic':
        if (p === 0) return 0;
        if (p === 1) return 1;
        return Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;

      default:
        return p < 0.5
          ? 4 * p * p * p
          : (p - 1) * (2 * p - 2) * (2 * p - 2) + 1;
    }
  }
}
