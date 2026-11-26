import fs from "fs";
import path from "path";

const tsPath = path.join(process.cwd(), "src", "data", "dataset187Motors.ts");
const outPath = path.join(process.cwd(), "src", "lib", "trainedMlModels.json");

const ts = fs.readFileSync(tsPath, "utf8");
const match = ts.match(/RAW_TUPLES[^=]*=\s*(\[[\s\S]*?\]);/);
if (!match) {
  throw new Error("Could not parse RAW_TUPLES from dataset187Motors.ts");
}
const rows = JSON.parse(match[1]);

// Deterministic PRNG (seed = 42 matching Python random_state=42)
let s = 42;
const rand = () => {
  s = (s * 1664525 + 1013904223) % 4294967296;
  return s / 4294967296;
};

// 80:20 Train-Test Split (Tabel 3.1 / Bab III Metodologi)
const idx = rows.map((_, i) => i);
for (let i = idx.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [idx[i], idx[j]] = [idx[j], idx[i]];
}
const split = Math.floor(idx.length * 0.8);
const train = idx.slice(0, split).map((i) => rows[i]);
const test = idx.slice(split).map((i) => rows[i]);

const cats = {
  merek: [...new Set(rows.map((r) => r[2]))].sort(),
  docs: [...new Set(rows.map((r) => r[4]))].sort(),
  cond: [...new Set(rows.map((r) => r[7]))].sort(),
  samsat: [...new Set(rows.map((r) => r[8]))].sort(),
};

function encodeRow(r) {
  // Bias 1, Numericals: harga_beli, tahun, kilometer, cc + One-Hot Categoricals
  const x = [1, r[6], r[3], r[5], r[9]];
  for (const v of cats.merek) x.push(r[2] === v ? 1 : 0);
  for (const v of cats.docs) x.push(r[4] === v ? 1 : 0);
  for (const v of cats.cond) x.push(r[7] === v ? 1 : 0);
  for (const v of cats.samsat) x.push(r[8] === v ? 1 : 0);
  return x;
}

const XtrRaw = train.map(encodeRow);
const means = [0, 1, 2, 3, 4].map((c) =>
  c === 0 ? 0 : XtrRaw.reduce((a, x) => a + x[c], 0) / XtrRaw.length
);
const stds = [0, 1, 2, 3, 4].map((c) =>
  c === 0
    ? 1
    : Math.sqrt(
        XtrRaw.reduce((a, x) => a + (x[c] - means[c]) ** 2, 0) / XtrRaw.length
      ) || 1
);
const norm = (x) =>
  x.map((v, c) => (c >= 1 && c <= 4 ? (v - means[c]) / stds[c] : v));

const Xtr = XtrRaw.map(norm);
const Ytr = train.map((r) => r[10]);
const Xte = test.map(encodeRow).map(norm);
const Yte = test.map((r) => r[10]);

// 1. Ridge Linear Regression (OLS with L2 alpha=1.0)
const d = Xtr[0].length;
const A = Array.from({ length: d }, (_, i) =>
  Array.from(
    { length: d },
    (_, j) =>
      (i === j && i > 0 ? 1.0 : 0) +
      Xtr.reduce((a, x) => a + x[i] * x[j], 0)
  )
);
const b = Array.from({ length: d }, (_, i) =>
  Xtr.reduce((a, x, k) => a + x[i] * Ytr[k], 0)
);
for (let i = 0; i < d; i++) {
  let maxR = i;
  for (let k = i + 1; k < d; k++) {
    if (Math.abs(A[k][i]) > Math.abs(A[maxR][i])) maxR = k;
  }
  [A[i], A[maxR]] = [A[maxR], A[i]];
  [b[i], b[maxR]] = [b[maxR], b[i]];
  for (let k = i + 1; k < d; k++) {
    const f = A[k][i] / (A[i][i] || 1e-12);
    for (let j = i; j < d; j++) A[k][j] -= f * A[i][j];
    b[k] -= f * b[i];
  }
}
const w = new Array(d).fill(0);
for (let i = d - 1; i >= 0; i--) {
  let sum = b[i];
  for (let j = i + 1; j < d; j++) sum -= A[i][j] * w[j];
  w[i] = sum / (A[i][i] || 1e-12);
}

// 2 & 3. Trees predicting showroom margin (harga_jual - harga_beli) -> add back harga_beli
const XtrTree = XtrRaw.map((x) => x.slice(1));
const YtrM = train.map((r) => r[10] - r[6]);
const XteTree = test.map((r) => encodeRow(r).slice(1));
const featImp = new Array(XtrTree[0].length).fill(0);

function fitTree(X, y, depth, maxDepth, minSplit, maxFeat, trackImp) {
  const n = y.length;
  const mean = Math.round(y.reduce((a, b) => a + b, 0) / n);
  if (depth >= maxDepth || n < minSplit) return mean;

  const p = X[0].length;
  let featIdx = Array.from({ length: p }, (_, i) => i);
  if (maxFeat && maxFeat < p) {
    for (let i = featIdx.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [featIdx[i], featIdx[j]] = [featIdx[j], featIdx[i]];
    }
    featIdx = featIdx.slice(0, maxFeat);
  }

  const totalSum = y.reduce((a, b) => a + b, 0);
  let bestGain = 0;
  let bestF = -1;
  let bestT = 0;
  const parentScore = (totalSum * totalSum) / n;

  for (const f of featIdx) {
    const pairs = X.map((x, i) => [x[f], y[i]]).sort((a, b) => a[0] - b[0]);
    let leftSum = 0;
    for (let i = 0; i < n - 1; i++) {
      leftSum += pairs[i][1];
      if (pairs[i][0] === pairs[i + 1][0]) continue;
      const nL = i + 1;
      const nR = n - nL;
      const rightSum = totalSum - leftSum;
      const gain =
        (leftSum * leftSum) / nL + (rightSum * rightSum) / nR - parentScore;
      if (gain > bestGain) {
        bestGain = gain;
        bestF = f;
        bestT = (pairs[i][0] + pairs[i + 1][0]) / 2;
      }
    }
  }

  if (bestF === -1 || bestGain <= 1e-6) return mean;
  if (trackImp) featImp[bestF] += bestGain;

  const XL = [];
  const yL = [];
  const XR = [];
  const yR = [];
  for (let i = 0; i < n; i++) {
    if (X[i][bestF] <= bestT) {
      XL.push(X[i]);
      yL.push(y[i]);
    } else {
      XR.push(X[i]);
      yR.push(y[i]);
    }
  }

  return [
    bestF,
    Number(bestT.toFixed(2)),
    fitTree(XL, yL, depth + 1, maxDepth, minSplit, maxFeat, trackImp),
    fitTree(XR, yR, depth + 1, maxDepth, minSplit, maxFeat, trackImp),
  ];
}

function predTree(node, x) {
  while (Array.isArray(node)) {
    node = x[node[0]] <= node[1] ? node[2] : node[3];
  }
  return node;
}

const dtTree = fitTree(XtrTree, YtrM, 0, 8, 4, XtrTree[0].length, false);
const p = XtrTree[0].length;
const maxF = Math.max(1, Math.round(Math.sqrt(p)));
const rfTrees = [];
for (let t = 0; t < 150; t++) {
  const bx = [];
  const by = [];
  for (let i = 0; i < XtrTree.length; i++) {
    const k = Math.floor(rand() * XtrTree.length);
    bx.push(XtrTree[k]);
    by.push(YtrM[k]);
  }
  rfTrees.push(fitTree(bx, by, 0, 8, 4, maxF, true));
}

function computeMetrics(yTrue, yPred) {
  const mae =
    yTrue.reduce((a, v, i) => a + Math.abs(v - yPred[i]), 0) / yTrue.length;
  const mse =
    yTrue.reduce((a, v, i) => a + (v - yPred[i]) ** 2, 0) / yTrue.length;
  const ym = yTrue.reduce((a, b) => a + b, 0) / yTrue.length;
  const r2 =
    1 -
    (mse * yTrue.length) / yTrue.reduce((a, v) => a + (v - ym) ** 2, 0);
  return {
    r2_score: Number(r2.toFixed(4)),
    mae: Math.round(mae),
    rmse: Math.round(Math.sqrt(mse)),
  };
}

const lrPreds = Xte.map((x) =>
  Math.max(0, x.reduce((a, v, i) => a + v * w[i], 0))
);
const dtPreds = XteTree.map((x, i) => test[i][6] + predTree(dtTree, x));
const rfPreds = XteTree.map(
  (x, i) =>
    test[i][6] +
    rfTrees.reduce((a, tr) => a + predTree(tr, x), 0) / rfTrees.length
);

const o1 = 4;
const o2 = o1 + cats.merek.length;
const o3 = o2 + cats.docs.length;
const o4 = o3 + cats.cond.length;
const o5 = o4 + cats.samsat.length;
const sumRange = (a, end) =>
  featImp.slice(a, end).reduce((sum, v) => sum + v, 0);
const totImp = featImp.reduce((a, b) => a + b, 0) || 1;

const featureImportances = {
  harga_beli: Number(((featImp[0] / totImp) * 100).toFixed(1)),
  kilometer: Number(((featImp[2] / totImp) * 100).toFixed(1)),
  cc: Number(((featImp[3] / totImp) * 100).toFixed(1)),
  tahun: Number(((featImp[1] / totImp) * 100).toFixed(1)),
  domisili_samsat: Number(((sumRange(o4, o5) / totImp) * 100).toFixed(1)),
  merek: Number(((sumRange(o1, o2) / totImp) * 100).toFixed(1)),
  kondisi_mesin: Number(((sumRange(o3, o4) / totImp) * 100).toFixed(1)),
  kelengkapan_dokumen: Number(((sumRange(o2, o3) / totImp) * 100).toFixed(1)),
};

const output = {
  dataset_size: rows.length,
  train_size: train.length,
  test_size: test.length,
  split_ratio: "80:20",
  cats,
  means: means.map((v) => Number(v.toFixed(6))),
  stds: stds.map((v) => Number(v.toFixed(6))),
  lr_weights: w.map((v) => Number(v.toFixed(4))),
  dt_tree: dtTree,
  rf_trees: rfTrees,
  metrics: {
    lr: computeMetrics(Yte, lrPreds),
    dt: computeMetrics(Yte, dtPreds),
    rf: computeMetrics(Yte, rfPreds),
  },
  feature_importances: featureImportances,
};

fs.writeFileSync(outPath, JSON.stringify(output), "utf8");
console.log("Exported ML models to:", outPath);
console.log("Metrics:", output.metrics);
console.log("Feature importances:", featureImportances);
