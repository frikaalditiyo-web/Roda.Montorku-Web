// Machine Learning Inference Engine for RODA.MOTORKU
// Menggunakan parameter hasil pelatihan langsung dari 187 Dataset Motor Bekas (80:20 Split)
// 3 Algoritma Regresi: Random Forest (Best), Decision Tree Regressor, & Linear Regression (Ridge)

import trainedModels from "./trainedMlModels.json";

export interface FiturMasukanML {
  merek: string;
  tahun: number;
  kelengkapan_dokumen: string;
  kilometer: number;
  harga_beli: number;
  kondisi_mesin: string;
  domisili_samsat: string;
  cc: number;
}

export interface ModelMetric {
  id: "rf" | "lr" | "dt";
  nama_model:
    | "Random Forest Regressor v1.4"
    | "Linear Regression"
    | "Decision Tree Regressor";
  short_name: string;
  r2_score: number;
  mae: number;
  rmse: number;
  hyperparameter_info: string;
  is_best: boolean;
}

export const DATASET_SAMSAT_OPTIONS: string[] = [
  "Nganjuk (AG)",
  "Kediri Kota (AG)",
  "Kediri Kabupaten (AG)",
  "Tulungagung (AG)",
  "Blitar (AG)",
  "Trenggalek (AG)",
  "Madiun (AE)",
  "Ngawi (AE)",
  "Magetan (AE)",
  "Ponorogo (AE)",
  "Pacitan (AE)",
  "Surabaya (L)",
  "Sidoarjo (W)",
  "Gresik (W)",
  "Jombang (S)",
  "Mojokerto (S)",
  "Bojonegoro (S)",
  "Malang (N)",
];

export const DATASET_KONDISI_OPTIONS: string[] = [
  "Sangat Baik",
  "Baik",
  "Cukup",
  "Perlu Perbaikan",
];

export const DATASET_DOKUMEN_OPTIONS: string[] = [
  "Lengkap (STNK + BPKB + Faktur)",
  "Lengkap (STNK + BPKB)",
  "Hanya BPKB",
  "Hanya STNK",
];

type TreeNode = number | [number, number, TreeNode, TreeNode];

interface TrainedModelBundle {
  dataset_size: number;
  train_size: number;
  test_size: number;
  split_ratio: string;
  cats: {
    merek: string[];
    docs: string[];
    cond: string[];
    samsat: string[];
  };
  means: number[];
  stds: number[];
  lr_weights: number[];
  dt_tree: TreeNode;
  rf_trees: TreeNode[];
  metrics: {
    lr: { r2_score: number; mae: number; rmse: number };
    dt: { r2_score: number; mae: number; rmse: number };
    rf: { r2_score: number; mae: number; rmse: number };
  };
  feature_importances: Record<string, number>;
}

const BUNDLE = trainedModels as unknown as TrainedModelBundle;

export const MODEL_METRICS: ModelMetric[] = [
  {
    id: "rf",
    nama_model: "Random Forest Regressor v1.4",
    short_name: "Random Forest",
    r2_score: BUNDLE.metrics.rf.r2_score,
    mae: BUNDLE.metrics.rf.mae,
    rmse: BUNDLE.metrics.rf.rmse,
    hyperparameter_info: `n_estimators: 150, max_features: 'sqrt', One-Hot Encoding (${BUNDLE.split_ratio} Split / ${BUNDLE.dataset_size} Unit)`,
    is_best: true,
  },
  {
    id: "dt",
    nama_model: "Decision Tree Regressor",
    short_name: "Decision Tree",
    r2_score: BUNDLE.metrics.dt.r2_score,
    mae: BUNDLE.metrics.dt.mae,
    rmse: BUNDLE.metrics.dt.rmse,
    hyperparameter_info: `max_depth: 8, min_samples_split: 4, One-Hot Encoding (${BUNDLE.split_ratio} Split)`,
    is_best: false,
  },
  {
    id: "lr",
    nama_model: "Linear Regression",
    short_name: "Linear Regression",
    r2_score: BUNDLE.metrics.lr.r2_score,
    mae: BUNDLE.metrics.lr.mae,
    rmse: BUNDLE.metrics.lr.rmse,
    hyperparameter_info: `Ridge L2 OLS + StandardScaler, One-Hot Encoding (${BUNDLE.split_ratio} Split)`,
    is_best: false,
  },
];

export const FEATURE_IMPORTANCES = BUNDLE.feature_importances;
export const DATASET_INFO = {
  total: BUNDLE.dataset_size,
  train: BUNDLE.train_size,
  test: BUNDLE.test_size,
  splitRatio: BUNDLE.split_ratio,
};

export interface PredictionResult {
  estimatedPrice: number;
  rangeLow: number;
  rangeHigh: number;
  marginShowroom: number;
  roiPct: number;
  r2Score: number;
  mae: number;
  rmse: number;
  modelName: ModelMetric["nama_model"];
  detailParam: string;
}

function normalizeFeatures(fitur: FiturMasukanML) {
  const merekLower = (fitur.merek || "").toLowerCase();
  const matchedMerek =
    BUNDLE.cats.merek.find((m) => m.toLowerCase() === merekLower) || fitur.merek;

  const docLower = (fitur.kelengkapan_dokumen || "").toLowerCase();
  let matchedDocs = fitur.kelengkapan_dokumen;
  let hasFakturBonus = false;
  if (docLower.includes("stnk") && docLower.includes("bpkb")) {
    matchedDocs = "Lengkap (STNK + BPKB)";
    hasFakturBonus = docLower.includes("faktur");
  } else if (docLower.includes("bpkb")) {
    matchedDocs = "Hanya BPKB";
  } else if (docLower.includes("stnk")) {
    matchedDocs = "Hanya STNK";
  }

  const condLower = (fitur.kondisi_mesin || "").toLowerCase();
  let matchedCond = fitur.kondisi_mesin;
  if (condLower.includes("sangat baik")) matchedCond = "Sangat Baik";
  else if (condLower.includes("baik")) matchedCond = "Baik";
  else if (condLower.includes("cukup")) matchedCond = "Cukup";
  else if (condLower.includes("perlu") || condLower.includes("butuh") || condLower.includes("servis")) {
    matchedCond = "Perlu Perbaikan";
  }

  let matchedSamsat = fitur.domisili_samsat || "";
  if (matchedSamsat === "Kediri (Plat AG)") {
    matchedSamsat = "Kediri Kota (AG)";
  }

  const hargaBeli = Math.max(0, Number(fitur.harga_beli) || 0);
  const tahun = Number(fitur.tahun) || 2020;
  const kilometer = Math.max(0, Number(fitur.kilometer) || 0);
  const cc = Math.max(50, Number(fitur.cc) || 125);

  const rawVector: number[] = [1, hargaBeli, tahun, kilometer, cc];
  for (const v of BUNDLE.cats.merek) rawVector.push(matchedMerek === v ? 1 : 0);
  for (const v of BUNDLE.cats.docs) rawVector.push(matchedDocs === v ? 1 : 0);
  for (const v of BUNDLE.cats.cond) rawVector.push(matchedCond === v ? 1 : 0);
  for (const v of BUNDLE.cats.samsat) rawVector.push(matchedSamsat === v ? 1 : 0);

  return { rawVector, hargaBeli, hasFakturBonus };
}

function evalTree(node: TreeNode, x: number[]): number {
  let curr = node;
  while (Array.isArray(curr)) {
    curr = x[curr[0]] <= curr[1] ? curr[2] : curr[3];
  }
  return curr;
}

/**
 * Predict selling price using genuine trained models from the 187-unit Capstone dataset
 */
export function predictPrice(
  fitur: FiturMasukanML,
  modelName: ModelMetric["nama_model"] = "Random Forest Regressor v1.4"
): PredictionResult {
  const { rawVector, hargaBeli, hasFakturBonus } = normalizeFeatures(fitur);
  const treeFeatures = rawVector.slice(1);

  let rawPrediction = 0;

  if (modelName === "Linear Regression") {
    const normVector = rawVector.map((v, idx) =>
      idx >= 1 && idx <= 4
        ? (v - BUNDLE.means[idx]) / (BUNDLE.stds[idx] || 1)
        : v
    );
    rawPrediction = normVector.reduce(
      (sum, v, idx) => sum + v * (BUNDLE.lr_weights[idx] || 0),
      0
    );
  } else if (modelName === "Decision Tree Regressor") {
    const predictedMargin = evalTree(BUNDLE.dt_tree, treeFeatures);
    rawPrediction = hargaBeli + predictedMargin;
  } else {
    // Random Forest Regressor (ensemble average across 150 trees)
    const treeCount = BUNDLE.rf_trees.length || 1;
    const sumMargins = BUNDLE.rf_trees.reduce<number>(
      (sum, tree) => sum + evalTree(tree, treeFeatures),
      0
    );
    rawPrediction = hargaBeli + sumMargins / treeCount;
  }

  if (hasFakturBonus) {
    rawPrediction += 150000;
  }

  const metric =
    MODEL_METRICS.find((m) => m.nama_model === modelName) ?? MODEL_METRICS[0];

  // Round to Rp 50.000 showroom denomination and guarantee minimum positive margin
  const estimatedPrice = Math.max(
    hargaBeli + 350000,
    Math.round(rawPrediction / 50000) * 50000
  );
  const spread = Math.max(300000, Math.round(metric.mae / 50000) * 50000);
  const rangeLow = Math.max(
    hargaBeli + 100000,
    Math.round((estimatedPrice - spread) / 50000) * 50000
  );
  const rangeHigh = Math.round((estimatedPrice + spread) / 50000) * 50000;
  const marginShowroom = estimatedPrice - hargaBeli;
  const roiPct =
    hargaBeli > 0
      ? Number(((marginShowroom / hargaBeli) * 100).toFixed(1))
      : 0;

  return {
    estimatedPrice,
    rangeLow,
    rangeHigh,
    marginShowroom,
    roiPct,
    r2Score: Number((metric.r2_score * 100).toFixed(1)),
    mae: metric.mae,
    rmse: metric.rmse,
    modelName: metric.nama_model,
    detailParam: metric.hyperparameter_info,
  };
}

/**
 * Predict with all 3 models for comparison table
 */
export function predictAllModels(fitur: FiturMasukanML) {
  return MODEL_METRICS.map((m) => ({
    metric: m,
    prediction: predictPrice(fitur, m.nama_model),
  }));
}
