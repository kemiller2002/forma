import { SOLVER } from "./tokens.mjs";

// Constrained energy relaxation for one line of a layout.
//
// Each variable x_i (an inline size, a separation, or free space) sits in an
// asymmetric spring around its rest length t_i:
//
//   f_i(x) = m_i * ( lo_i * max(0, t_i - x)^2 + hi_i * max(0, x - t_i)^2 ) / rem^2
//
// `lo` is the repulsive stiffness (resisting compression below rest length)
// and `hi` the attractive stiffness (resisting stretch above it). m_i is a
// multiplicity: a variable standing for n equal-width items counts n times.
// The line must conserve space exactly: sum_i m_i * x_i = total, with hard
// bounds min_i <= x_i <= max_i.
//
// The solver is projected gradient descent with Nesterov momentum and
// monotone restart (FISTA). Forces are -grad E. The deterministic initial
// state is the projection of the rest lengths onto the feasible set.

const spring = (v, x) => {
  const d = x - v.t;
  return v.m * (d < 0 ? v.lo * d * d : v.hi * d * d);
};
const force = (v, x) => {
  const d = x - v.t;
  return 2 * v.m * (d < 0 ? v.lo * d : v.hi * d);
};

export const energyOf = (vars, xs, remPx) => vars.reduce((e, v, i) => e + spring(v, xs[i]), 0) / (remPx * remPx);

// Euclidean projection onto { sum m_i x_i = total, min_i <= x_i <= max_i }:
// x_i = clamp(y_i - lambda * m_i), lambda found by bisection.
export const project = (vars, ys, total) => {
  const at = lambda => vars.map((v, i) => Math.min(v.max, Math.max(v.min, ys[i] - lambda * v.m)));
  const mass = xs => xs.reduce((s, x, i) => s + vars[i].m * x, 0);
  const span = Math.max(1, ...ys.map(Math.abs), Math.abs(total)) * 4 + 1;
  const search = (low, high, step) => {
    if (step >= SOLVER.bisectionSteps) return (low + high) / 2;
    const mid = (low + high) / 2;
    return mass(at(mid)) > total ? search(mid, high, step + 1) : search(low, mid, step + 1);
  };
  return at(search(-span, span, 0));
};

export const feasible = (vars, total) => {
  const low = vars.reduce((s, v) => s + v.m * v.min, 0);
  const high = vars.reduce((s, v) => s + v.m * v.max, 0);
  return low <= total + 1e-9 && total <= high + 1e-9;
};

// Optimality residual in CSS px. At the constrained minimum every variable
// strictly inside its bounds feels the same force per unit multiplicity (the
// multiplier of the conservation constraint), and a variable on a bound is
// pushed against it. The residual converts each imbalance into the
// displacement it implies, using the spring's stiffness on that side.
export const residualPx = (vars, xs, remPx) => {
  const eps = 1e-6;
  const g = vars.map((v, i) => force(v, xs[i]) / v.m);
  const free = vars.map((v, i) => xs[i] > v.min + eps && xs[i] < v.max - eps);
  const inside = g.filter((_, i) => free[i]);
  const lambda = inside.length ? inside.reduce((a, b) => a + b, 0) / inside.length : 0;
  const curvature = (v, x) => 2 * Math.max(x < v.t ? v.lo : v.hi, 0.05);
  return vars.reduce((worst, v, i) => {
    const imbalance = free[i]
      ? Math.abs(g[i] - lambda)
      : xs[i] <= v.min + eps ? Math.max(0, lambda - g[i]) : Math.max(0, g[i] - lambda);
    return inside.length ? Math.max(worst, imbalance / curvature(v, xs[i])) : worst;
  }, 0);
};

export const relax = (vars, total, remPx, budget = SOLVER.maxIterations) => {
  if (!feasible(vars, total)) return { status: "unsatisfiable", xs: project(vars, vars.map(v => v.t), total), iterations: 0, energy: Infinity, trace: [] };
  const lipschitz = Math.max(1e-9, ...vars.map(v => 2 * v.m * Math.max(v.lo, v.hi))) / (remPx * remPx);
  const step = 1 / lipschitz;
  const E = xs => energyOf(vars, xs, remPx);
  const gradient = xs => vars.map((v, i) => force(v, xs[i]) / (remPx * remPx));
  const x0 = project(vars, vars.map(v => v.t), total);

  const iterate = (state, k) => {
    const { x, y, theta, energy, rises, trace } = state;
    if (k >= budget) return { status: "non-convergence", xs: x, iterations: k, energy, trace };
    const g = gradient(y);
    const next = project(vars, y.map((yi, i) => yi - step * g[i]), total);
    if (next.some(v => !Number.isFinite(v))) return { status: "numeric-instability", xs: x, iterations: k, energy, trace };
    const nextEnergy = E(next);
    // Monotone restart: if energy rose, drop momentum and restart from x.
    const rose = nextEnergy > energy + 1e-12 * Math.max(1, Math.abs(energy));
    const nextRises = rose ? rises + 1 : 0;
    const nextTrace = trace.length < 64 ? [...trace, nextEnergy] : trace;
    if (nextRises >= SOLVER.oscillationWindow) return { status: "oscillation", xs: x, iterations: k + 1, energy, trace: nextTrace };
    if (rose) return iterate({ x, y: x, theta: 1, energy, rises: nextRises, trace: nextTrace }, k + 1);
    if (residualPx(vars, next, remPx) < SOLVER.tolerancePx) return { status: "converged", xs: next, iterations: k + 1, energy: nextEnergy, trace: nextTrace };
    const nextTheta = (1 + Math.sqrt(1 + 4 * theta * theta)) / 2;
    const momentum = (theta - 1) / nextTheta;
    const nextY = next.map((v, i) => v + momentum * (v - x[i]));
    return iterate({ x: next, y: nextY, theta: nextTheta, energy: nextEnergy, rises: nextRises, trace: nextTrace }, k + 1);
  };
  // Tail-recursive with a bounded depth (budget <= SOLVER.maxIterations).
  return iterate({ x: x0, y: x0, theta: 1, energy: E(x0), rises: 0, trace: [] }, 0);
};

// Exact minimizer used only as a test oracle: separable convex pieces make
// the KKT conditions solvable by bisection on the multiplier.
export const exact = (vars, total) => {
  // Zero stiffness makes the per-variable minimizer discontinuous; a tiny
  // stiffness keeps the oracle's multiplier search well defined.
  const soft = value => Math.max(value, 1e-9);
  const argmin = (v, lambda) => {
    // minimize m*(spring) + lambda*m*x  =>  derivative 2(lo|hi)(x - t) + lambda = 0
    const x = lambda > 0 ? v.t - lambda / (2 * soft(v.lo)) : v.t - lambda / (2 * soft(v.hi));
    return Math.min(v.max, Math.max(v.min, x));
  };
  const mass = lambda => vars.reduce((s, v) => s + v.m * argmin(v, lambda), 0);
  const search = (low, high, step) => {
    if (step >= 200) return (low + high) / 2;
    const mid = (low + high) / 2;
    return mass(mid) > total ? search(mid, high, step + 1) : search(low, mid, step + 1);
  };
  const lambda = search(-1e9, 1e9, 0);
  return vars.map(v => argmin(v, lambda));
};
