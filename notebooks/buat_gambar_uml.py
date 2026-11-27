"""Gambar ulang activity diagram & sequence diagram (laporan Bab III) sesuai arsitektur Next.js + PostgreSQL.

Pemakaian:  python buat_gambar_uml.py <folder_output>
"""
import os
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Polygon, Circle, Rectangle

OUT = sys.argv[1] if len(sys.argv) > 1 else "figures"
os.makedirs(OUT, exist_ok=True)
FS = 9.5


def arrow(ax, p, q, dashed=False, head="-|>"):
    ax.annotate("", xy=q, xytext=p, arrowprops=dict(arrowstyle=head, lw=1.3, color="black",
                                                    ls=(0, (4, 3)) if dashed else "-", shrinkA=0, shrinkB=0))


# ------------------------------------------------------------------ activity
def activity(path):
    fig, ax = plt.subplots(figsize=(7.4, 10.4))
    ax.set_xlim(0, 87); ax.set_ylim(0, 122); ax.axis("off")
    lanes = [(2.5, 26.5, "Admin"), (28.7, 28.3, "Aplikasi Web\n(Next.js)"), (57, 28.5, "API Route &\nMesin Inferensi")]
    for x, w, t in lanes:
        ax.add_patch(Rectangle((x, 1), w, 119, fill=False, lw=1.5))
        ax.add_patch(Rectangle((x, 113.5), w, 6.5, fc="#e6e6e6", ec="black", lw=1.5))
        ax.text(x + w / 2, 116.75, t, ha="center", va="center", fontsize=10, weight="bold", linespacing=1.1)

    def act(cx, cy, text, w=23.5, h=7.4):
        ax.add_patch(FancyBboxPatch((cx - w / 2, cy - h / 2), w, h, boxstyle="round,pad=0,rounding_size=1.4",
                                    fc="white", ec="black", lw=1.4))
        ax.text(cx, cy, text, ha="center", va="center", fontsize=8.4, linespacing=1.2)
        return cx, cy, w, h

    def dec(cx, cy, text, w=22, h=9.5):
        ax.add_patch(Polygon([(cx, cy + h / 2), (cx + w / 2, cy), (cx, cy - h / 2), (cx - w / 2, cy)],
                             fc="white", ec="black", lw=1.4))
        ax.text(cx, cy, text, ha="center", va="center", fontsize=FS, linespacing=1.2)
        return cx, cy, w, h

    A, W, M = 15.75, 42.85, 71.25
    ax.add_patch(Circle((A, 109.5), 1.1, color="black"))
    a1 = act(A, 101.5, "Mengisi kredensial login")
    w1 = act(W, 101.5, "Memvalidasi kredensial\n(POST /api/auth/login)")
    d1 = dec(W, 89, "Kredensial\nvalid?")
    a2 = act(A, 89, "Melihat pesan\nkesalahan login")
    w2 = act(W, 77, "Menampilkan dashboard")
    a3 = act(A, 77, "Memilih menu\nEstimasi Harga")
    a4 = act(A, 66.5, "Mengisi form\n8 fitur motor")
    w3 = act(W, 66.5, "Memvalidasi masukan")
    d2 = dec(W, 54.5, "Masukan\nvalid?")
    a5 = act(A, 54.5, "Memperbaiki\nmasukan")
    w4 = act(W, 42.5, "Mengirim data ke\nPOST /api/prediksi")
    m1 = act(M, 42.5, "Praproses fitur\n(one-hot encoding)")
    m2 = act(M, 32, "Memprediksi harga\ndengan model terbaik")
    m3 = act(M, 21.5, "Mengembalikan harga\nestimasi (JSON)")
    w5 = act(W, 21.5, "Menampilkan hasil\nestimasi")
    a6 = act(A, 21.5, "Menentukan harga\njual akhir")
    a7 = act(A, 11, "Menyimpan data motor")
    w6 = act(W, 11, "Menyimpan data ke\nPostgreSQL")

    def r(b): return (b[0] + b[2] / 2, b[1])
    def l(b): return (b[0] - b[2] / 2, b[1])
    def t(b): return (b[0], b[1] + b[3] / 2)
    def bt(b): return (b[0], b[1] - b[3] / 2)

    arrow(ax, (A, 108.4), t(a1))
    arrow(ax, r(a1), l(w1)); arrow(ax, bt(w1), t(d1))
    arrow(ax, l(d1), r(a2)); ax.text(29.3, d1[1] + 1.9, "Tidak", ha="left", fontsize=8)
    arrow(ax, t(a2), bt(a1))
    arrow(ax, bt(d1), t(w2)); ax.text(W + 1, bt(d1)[1] - 1.3, "Ya", fontsize=8.5)
    arrow(ax, l(w2), r(a3)); arrow(ax, bt(a3), t(a4))
    arrow(ax, r(a4), l(w3)); arrow(ax, bt(w3), t(d2))
    arrow(ax, l(d2), r(a5)); ax.text(29.3, d2[1] + 1.9, "Tidak", ha="left", fontsize=8)
    ax.plot([l(a5)[0], 3.8, 3.8], [a5[1], a5[1], a4[1]], color="black", lw=1.3)
    arrow(ax, (3.8, a4[1]), l(a4))
    arrow(ax, bt(d2), t(w4)); ax.text(W + 1, bt(d2)[1] - 1.3, "Ya", fontsize=8.5)
    arrow(ax, r(w4), l(m1)); arrow(ax, bt(m1), t(m2)); arrow(ax, bt(m2), t(m3))
    arrow(ax, l(m3), r(w5)); arrow(ax, l(w5), r(a6)); arrow(ax, bt(a6), t(a7))
    arrow(ax, r(a7), l(w6))
    arrow(ax, bt(w6), (W, 4.6))
    ax.add_patch(Circle((W, 3.3), 1.3, fc="white", ec="black", lw=1.4))
    ax.add_patch(Circle((W, 3.3), 0.8, color="black"))
    fig.savefig(path, dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)


# ------------------------------------------------------------------ sequence
def sequence(path):
    fig, ax = plt.subplots(figsize=(9.2, 9.6))
    ax.set_xlim(0, 100); ax.set_ylim(0, 100); ax.axis("off")
    parts = ["Admin", "Antarmuka Web\n(Next.js)", "API Route\n/api/prediksi", "Mesin Inferensi\n(mlEngine)", "PostgreSQL"]
    xs = [10, 30, 50, 70, 89]
    for x, p in zip(xs, parts):
        ax.add_patch(Rectangle((x - 8.3, 89), 16.6, 7.5, fc="#f2f2f2", ec="black", lw=1.4))
        ax.text(x, 92.75, p, ha="center", va="center", fontsize=9.5, weight="bold", linespacing=1.15)
        ax.plot([x, x], [3, 89], ls=(0, (4, 3)), color="#666666", lw=1.1)

    def msg(y, i, j, text, ret=False):
        a, b = xs[i], xs[j]
        d = 0.5 if b > a else -0.5
        ax.annotate("", xy=(b - d, y), xytext=(a + d, y),
                    arrowprops=dict(arrowstyle="->" if ret else "-|>", lw=1.3, color="black",
                                    ls=(0, (4, 2)) if ret else "-"))
        ax.text((a + b) / 2, y + 1.1, text, ha="center", va="bottom", fontsize=FS)

    def self_msg(y, i, text):
        x = xs[i]
        ax.plot([x + 0.3, x + 6.5, x + 6.5], [y + 1.6, y + 1.6, y - 1.6], color="black", lw=1.3)
        ax.annotate("", xy=(x + 0.4, y - 1.6), xytext=(x + 6.5, y - 1.6),
                    arrowprops=dict(arrowstyle="-|>", lw=1.3, color="black"))
        ax.text(x + 7.4, y, text, ha="left", va="center", fontsize=FS)

    msg(84, 0, 1, "1: mengisi form 8 fitur motor")
    self_msg(77, 1, "2: validasiMasukan()")
    msg(70, 1, 2, "3: POST /api/prediksi (JSON)")
    msg(63, 2, 3, "4: predictPrice(fitur)")
    self_msg(56, 3, "5: prediksi()")
    msg(49, 3, 2, "6: harga estimasi", ret=True)
    msg(42, 2, 4, "7: INSERT riwayat prediksi")
    msg(35, 2, 1, "8: respons JSON", ret=True)
    msg(28, 1, 0, "9: menampilkan estimasi", ret=True)
    msg(21, 0, 1, "10: menentukan harga jual, simpan")
    msg(14, 1, 4, "11: POST /api/motor → INSERT motor")
    msg(7.5, 4, 1, "12: berhasil disimpan", ret=True)
    msg(2.5, 1, 0, "13: konfirmasi data tersimpan", ret=True)
    fig.savefig(path, dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)


activity(os.path.join(OUT, "uml_activity_estimasi.png"))
sequence(os.path.join(OUT, "uml_sequence_estimasi.png"))
print("saved to", OUT)
