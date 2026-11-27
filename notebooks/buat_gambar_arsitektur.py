import sys
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

out = sys.argv[1]
TEXT = "#191919"; EDGE = "#444444"; GRAY = "#f2f2f2"; BLUE = "#dcebfb"; YELLOW = "#fdf1cf"
FS = 7.0

fig, ax = plt.subplots(figsize=(7.4, 5.2))
ax.set_xlim(0, 100); ax.set_ylim(0, 72); ax.axis("off")

def group(x, y, w, h, label):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="square,pad=0", fill=False,
                                ls=(0, (5, 3)), lw=0.9, ec="#777777"))
    ax.text(x + 1.5, y + h - 1.4, label, ha="left", va="top", fontsize=8.2, color=TEXT)

def box(cx, cy, w, h, text, fc=GRAY):
    ax.add_patch(FancyBboxPatch((cx - w / 2, cy - h / 2), w, h,
                                boxstyle="round,pad=0,rounding_size=2.0", fc=fc, ec=EDGE, lw=0.9))
    ax.text(cx, cy, text, ha="center", va="center", fontsize=FS, color=TEXT, linespacing=1.25)
    return dict(cx=cx, cy=cy, w=w, h=h)

def side(b, s, dx=0.0):
    return {"l": (b["cx"] - b["w"] / 2, b["cy"]), "r": (b["cx"] + b["w"] / 2, b["cy"]),
            "t": (b["cx"] + dx, b["cy"] + b["h"] / 2), "b": (b["cx"] + dx, b["cy"] - b["h"] / 2)}[s]

def arrow(p, q, both=False, dashed=False):
    ax.add_patch(FancyArrowPatch(p, q, arrowstyle="<|-|>" if both else "-|>", mutation_scale=9,
                                 lw=1.0, color=EDGE, ls=(0, (4, 3)) if dashed else "-",
                                 shrinkA=0, shrinkB=0))

def label(x, y, text, ha="center"):
    ax.text(x, y, text, ha=ha, va="center", fontsize=6.6, color=TEXT, linespacing=1.15)

# --- Tahap offline ---
group(2, 41, 96, 30, "Tahap Pelatihan Model (offline): notebooks/randomForest.ipynb")
a1 = box(17.5, 58.5, 28, 7.5, "Data historis motor bekas\nRoda.Motorku (187 unit)")
a2 = box(50, 58.5, 24, 7.5, "Pembersihan data &\none-hot encoding")
a3 = box(82.5, 58.5, 26, 7.5, "Pembagian data\nlatih : uji = 80 : 20")
b1 = box(82.5, 46.5, 26, 7.5, "Pelatihan Linear Regression\n(Ridge), Decision Tree,\nRandom Forest")
b2 = box(50, 46.5, 24, 7.5, "Evaluasi MAE, RMSE,\nR², 5-fold CV")
b3 = box(17.5, 46.5, 28, 7.5, "Model terbaik\n(.pkl + parameter .json)", fc=BLUE)
arrow(side(a1, "r"), side(a2, "l")); arrow(side(a2, "r"), side(a3, "l"))
arrow(side(a3, "b"), side(b1, "t"))
arrow(side(b1, "l"), side(b2, "r")); arrow(side(b2, "l"), side(b3, "r"))

# --- Tahap online ---
group(2, 2, 96, 31, "Tahap Penggunaan Sistem (online): aplikasi web Next.js")
c_api = box(17.5, 22, 28, 8.5, "API Route Next.js\nPOST /api/prediksi\n(mesin inferensi mlEngine)")
c_ui = box(50, 22, 24, 7.5, "Antarmuka web\n(Next.js / React)")
c_admin = box(85, 22, 18, 6.5, "Admin", fc=YELLOW)
c_db = box(17.5, 8.5, 28, 8.5, "Basis data PostgreSQL\n(users, motor, foto_motor,\nprediksi_harga)")
c_cat = box(50, 8.5, 24, 6.5, "Halaman katalog")
c_buyer = box(85, 8.5, 18, 6.5, "Calon pembeli", fc=YELLOW)
arrow(side(c_admin, "l"), side(c_ui, "r"), both=True)
arrow(side(c_ui, "l"), side(c_api, "r"), both=True)
arrow(side(c_buyer, "l"), side(c_cat, "r"), both=True)
arrow(side(c_cat, "l"), side(c_db, "r"), both=True)
arrow(side(c_api, "b"), side(c_db, "t"), both=True)
label(19, 15.25, "simpan riwayat estimasi", ha="left")
arrow(side(b3, "b"), side(c_api, "t"), dashed=True)
label(19, 37.0, "parameter model diekspor ke trainedMlModels.json", ha="left")

fig.savefig(out, dpi=300, bbox_inches="tight", facecolor="white")
print("saved", out)
