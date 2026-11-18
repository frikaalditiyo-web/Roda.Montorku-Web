"""
=============================================================================
RODA.MOTORKU - SKRIP PELATIHAN & EVALUASI MACHINE LEARNING (BAB III & IV)
=============================================================================
Membandingkan 3 Algoritma Regresi Supervised Learning:
1. Linear Regression
2. Decision Tree Regressor
3. Random Forest Regressor (Model Rekomendasi Capstone)

Dataset: 187 Data Riil Showroom Motor Bekas
8 Fitur Masukan (Tabel 3.1 Proposal):
- merek (kategorikal)
- tahun (numerik)
- kelengkapan_dokumen (kategorikal)
- kilometer (numerik)
- harga_beli (numerik)
- kondisi_mesin (kategorikal)
- domisili_samsat (kategorikal)
- cc (numerik)
Target: harga_jual (numerik)
=============================================================================
"""

import os
import sys
import zipfile
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

def load_dataset():
    """Load the 187 motorcycle dataset from Excel or ZIP"""
    excel_name = "dataset_motor_bekas_187-v2.xlsx"
    zip_name = "dataset_motor_bekas_187-v2.zip"

    if os.path.exists(excel_name):
        print(f"[OK] Memuat dataset langsung dari {excel_name}...")
        return pd.read_excel(excel_name)
    elif os.path.exists(zip_name):
        print(f"[OK] Mengekstrak {excel_name} dari {zip_name}...")
        with zipfile.ZipFile(zip_name, 'r') as z:
            with z.open(excel_name) as f:
                return pd.read_excel(f)
    else:
        raise FileNotFoundError(f"Dataset {excel_name} atau {zip_name} tidak ditemukan di direktori kerja.")

def preprocess_and_split(df):
    """Normalize column names and split into 8 features + target with 80:20 split"""
    print(f"\n[INFO] Jumlah baris data awal: {len(df)}")
    
    # Standardize column names (lowercase & strip)
    df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]
    
    # Match required column mappings
    col_mapping = {
        "merk_motor": "merek",
        "merk": "merek",
        "tahun_pembuatan": "tahun",
        "kelengkapan": "kelengkapan_dokumen",
        "odometer": "kilometer",
        "samsat": "domisili_samsat",
        "kapasitas_mesin": "cc",
    }
    df = df.rename(columns=col_mapping)

    required_features = [
        "merek", "tahun", "kelengkapan_dokumen",
        "kilometer", "harga_beli", "kondisi_mesin",
        "domisili_samsat", "cc"
    ]
    target_col = "harga_jual"

    # Clean data
    df = df.dropna(subset=required_features + [target_col])
    
    # Ensure types
    df["tahun"] = pd.to_numeric(df["tahun"], errors="coerce")
    df["kilometer"] = pd.to_numeric(df["kilometer"], errors="coerce")
    df["harga_beli"] = pd.to_numeric(df["harga_beli"], errors="coerce")
    df["cc"] = pd.to_numeric(df["cc"], errors="coerce")
    df["harga_jual"] = pd.to_numeric(df["harga_jual"], errors="coerce")

    X = df[required_features]
    y = df[target_col]

    print(f"[INFO] Jumlah data bersih untuk pemodelan: {len(df)} unit")
    print(f"[INFO] Rata-rata margin showroom riil: Rp {(y - df['harga_beli']).mean():,.0f}")

    # 80:20 Split sesuai Bab III Metodologi Penelitian
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    return X_train, X_test, y_train, y_test, required_features

def build_models():
    """Build preprocessing and regression pipelines for 3 algorithms"""
    cat_features = ["merek", "kelengkapan_dokumen", "kondisi_mesin", "domisili_samsat"]
    num_features = ["tahun", "kilometer", "harga_beli", "cc"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_features),
            ("num", StandardScaler(), num_features)
        ],
        remainder="passthrough"
    )

    models = {
        "Linear Regression": Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", Ridge(alpha=1.0))
        ]),
        "Decision Tree Regressor": Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", DecisionTreeRegressor(max_depth=8, min_samples_split=4, random_state=42))
        ]),
        "Random Forest Regressor": Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", RandomForestRegressor(n_estimators=150, max_features="sqrt", random_state=42))
        ]),
    }

    return models

def evaluate_and_export():
    df = load_dataset()
    X_train, X_test, y_train, y_test, features = preprocess_and_split(df)
    models = build_models()

    print("\n" + "=" * 78)
    print("HASIL EVALUASI KOMPARASI 3 ALGORITMA REGRESI (DATA UJI 20%):")
    print("=" * 78)
    print(f"{'Algoritma':<26} | {'MAE (Rp)':<16} | {'RMSE (Rp)':<16} | {'R2 Score':<10}")
    print("-" * 78)

    results = []
    best_model_name = None
    best_model_pipeline = None
    highest_r2 = -float("inf")

    for name, pipeline in models.items():
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)

        results.append({
            "name": name,
            "mae": mae,
            "rmse": rmse,
            "r2": r2,
            "pipeline": pipeline
        })

        print(f"{name:<26} | Rp {mae:>12,.0f} | Rp {rmse:>12,.0f} | {r2 * 100:>8.2f}%")

        if r2 > highest_r2:
            highest_r2 = r2
            best_model_name = name
            best_model_pipeline = pipeline

    print("=" * 78)
    print(f"\n[REKOMENDASI CAPSTONE]: Model '{best_model_name}' mencatatkan performa terbaik.")
    
    # Export model to root directory
    output_model_path = "model_terbaik_roda_motorku.pkl"
    joblib.dump(best_model_pipeline, output_model_path)
    print(f"[OK] Model serialisasi pipeline berhasil disimpan ke: {output_model_path}")

    return results

if __name__ == "__main__":
    evaluate_and_export()
