"""
RODA.MOTORKU - Jalankan ulang pelatihan model (npm run ml:train)

Satu-satunya sumber resmi pelatihan adalah notebooks/randomForest.ipynb. Skrip ini hanya
mengeksekusi notebook tersebut dari awal sampai akhir sehingga:
  - Tabel 2 / Tabel 4.6 (metrik), Gambar 2-3 (figures/), dan .pkl diperbarui, dan
  - src/lib/trainedMlModels.json (parameter model untuk web) diekspor ulang dan diverifikasi.

Kebutuhan: pip install nbformat nbclient ipykernel pandas scikit-learn matplotlib openpyxl joblib
"""

import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOTEBOOK = os.path.join(ROOT, "notebooks", "randomForest.ipynb")


def main() -> int:
    try:
        import nbformat
        from nbclient import NotebookClient
    except ImportError:
        print("[ERROR] Paket nbformat/nbclient belum terpasang: pip install nbformat nbclient ipykernel")
        return 1

    print(f"[INFO] Menjalankan {NOTEBOOK} ...")
    nb = nbformat.read(NOTEBOOK, as_version=4)
    NotebookClient(nb, timeout=900, kernel_name="python3",
                   resources={"metadata": {"path": os.path.dirname(NOTEBOOK)}}).execute()
    for cell in nb.cells:
        if cell.cell_type == "code":
            cell.metadata.pop("execution", None)
    nbformat.write(nb, NOTEBOOK)

    last = nb.cells[-1].outputs
    print("[OK] Notebook selesai dieksekusi.")
    if last:
        print(last[0].get("text", "").strip())
    return 0


if __name__ == "__main__":
    sys.exit(main())
