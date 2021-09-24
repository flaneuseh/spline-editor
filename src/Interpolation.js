import { range } from 'lodash-es';
import { multiply, divide, add, subtract, zeros, size } from 'mathjs';

const times = range(0, 1.0, .01);

function linear_interpolation_at_t(p0, p1, t){
  return add(multiply((1 - t), p0), multiply(t, p1));
}

export function linear_interpolation_of_points(control_points){
  let interpolated_points = [];
  for (let i = 0; i < control_points.length - 1; i++) {
    let p0 = control_points[i];
    let p1 = control_points[i+1];
    for (let t = 0; t < times.length; t++) {
      interpolated_points = [...interpolated_points, linear_interpolation_at_t(p0, p1, times[t])];
    }
  }

  return interpolated_points;
}

function bezier_interpolation_at_t(p0, p1, p2, p3, t){

  // Time Matrix
  let T = [t**3, t**2, t, 1];

  // Basis Matrix
  let M = [
      [-1, 3, -3, 1],
      [3, -6, 3, 0],
      [-3, 3, 0, 0],
      [1, 0, 0, 0],
  ];

  // Geometry Matrix
  let G = [p0, p1, p2, p3];

  return multiply(multiply(T, M), G);
}

export function bezier_interpolation_of_points(control_points){
  let bezier_points = [];

  for (let i = 0; i < control_points.length - 3; i+=3) {
    let p0 = control_points[i];
    let p1 = control_points[i+1];
    let p2 = control_points[i+2];
    let p3 = control_points[i+3];

    for (let t = 0; t < times.length; t++) {
      bezier_points = [...bezier_points, bezier_interpolation_at_t(p0, p1, p2, p3, times[t])];
    }
  }

  return bezier_points;
}

function bspline_interpolation_at_t(p0, p1, p2, p3, t){
  // Time Matrix
  let T = [t**3, t**2, t, 1];

  // Basis Matrix
  let M = multiply(1/6, [
      [-1, 3, -3, 1],
      [3, -6, 3, 0],
      [-3, 0, 3, 0],
      [1, 4, 1, 0],
  ])

  // Geometry Matrix
  let G = [p0, p1, p2, p3];

  return multiply(multiply(T, M), G);
}

export function bspline_interpolation_of_points(control_points){
  let c0 = control_points[0];
  let cn = control_points[control_points.length - 1];
  control_points = [c0, c0, ...control_points, cn, cn];

  let bspline_points = [];

  for (let i = 0; i < control_points.length - 3; i++) {
    let p0 = control_points[i];
    let p1 = control_points[i+1];
    let p2 = control_points[i+2];
    let p3 = control_points[i+3];

    for (let t = 0; t < times.length; t++) {
      bspline_points = [...bspline_points, bspline_interpolation_at_t(p0, p1, p2, p3, times[t])];
    }
  }

  return bspline_points;
}

function catmullrom_interpolation_at_t(p0, p1, p2, p3, t){
  // Time Matrix
  let T = [t**3, t**2, t, 1];

  // Basis Matrix
  let M = multiply(1/2, [
      [-1, 3, -3, 1],
      [2, -5, 4, -1],
      [-1, 0, 1, 0],
      [0, 2, 0, 0],
  ]);

  // Geometry Matrix
  let G = [p0, p1, p2, p3];

  return multiply(multiply(T, M), G);
}

export function catmullrom_interpolation_of_points(control_points){
  let c0 = control_points[0];
  let cn = control_points[control_points.length - 1];
  control_points = [c0, ...control_points, cn];

  let catmullrom_points = [];

  for (let i = 0; i < control_points.length - 3; i++) {
    let p0 = control_points[i];
    let p1 = control_points[i+1];
    let p2 = control_points[i+2];
    let p3 = control_points[i+3];

    for (let t = 0; t < times.length; t++) {
      catmullrom_points = [...catmullrom_points, catmullrom_interpolation_at_t(p0, p1, p2, p3, times[t])];
    }
  }

  return catmullrom_points;
}

function c2_get_D(control_points){
  let n = control_points.length;
  if (n < 2) return [];

  // Matrix of coefficients for the left side of the equations.
  let LC = zeros(n, n).toArray();
  LC[0][0] = 2; LC[0][1] = 1;         // start 2, 1
  LC[n-1][n-2] = 1; LC[n-1][n-1] = 2; // end   1, 2

  for (let i = 1; i < n-1; i++) {
    LC[i][i-1] = 1; LC[i][i] = 4; LC[i][i+1] = 1; // interior 1, 4, 1
  }

  // Remove first point and pad with last.
  let c_next = [...control_points, control_points[n-1]]
  c_next.splice(0, 1)
  // Remove last point and pad with first
  let c_prev = [control_points[0], ...control_points];
  c_prev.splice(-1, 1)
  let C = multiply(3, subtract(c_next, c_prev));

  // Forward Elimination and Backward Substitution found at
  // https://my.mech.utah.edu/~pardyjak/me2040/Lect8_NaiveGaussElim.pdf

  // Forward Elimination
  for (let k = 0; k < n-1; k++){
    for (let i = k+1; i < n; i++) {
      let f = divide(LC[i][k], LC[k][k]);
      for (let j = k+1; j < n; j++) {
        LC[i][j] = subtract(LC[i][j], multiply(f, LC[k][j]));
      }
      C[i] = subtract(C[i], multiply(f, C[k]));
    }
  }

  // Backward Substitution
  let D = zeros(size(C));
  D[n-1] = divide(C[n-1], LC[n-1][n-1]);
  for (let i = n-2; i > -1; i--) {
    let s = 0;
    for (let j = i+1; j < n; j++) {
      s = add(s, multiply(LC[i][j], D[j]));
    }
    D[i] = divide(subtract(C[i], s) , LC[i][i]);
  }

  return D;
}

export function c2_interpolation_of_points(control_points) {
  let n = control_points.length;
  let D = c2_get_D(control_points);

  let c2_points = [];
  let midpoints = []; // The Bezier midpoints, for visualization

  for (let i = 0; i < n-1; i++) {
    // Interleave C and D by calculating the Bezier midpoints with D as the Hermite tangents.
    let p0 = control_points[i];
    let p1 = add(p0, divide(D[i], 3));
    let p3 = control_points[i+1];
    let p2 = subtract(p3, divide(D[i+1], 3));

    for (let t = 0; t < times.length; t++) {
      c2_points = [...c2_points, bezier_interpolation_at_t(p0, p1, p2, p3, times[t])];
    }
    midpoints = [...midpoints, p1, p2];
  }

  return c2_points;
}
