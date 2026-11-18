import json

with open('C:/Users/LENOVO/.gemini/antigravity-cli/brain/6773396f-a9b6-45f0-a5dd-9655f4dbc6a9/scratch/motors_187.json', 'r', encoding='utf-8') as f:
    motors = json.load(f)

tuples = []
for m in motors:
    tuples.append([
        m['id_motor'],
        m['tipe'],
        m['merek'],
        m['tahun'],
        m['kelengkapan_dokumen'],
        m['kilometer'],
        m['harga_beli'],
        m['kondisi_mesin'],
        m['domisili_samsat'],
        m['cc'],
        m['harga_jual'],
        m['status']
    ])

ts_code = '''import { Motor } from "./mockShowroomData";

const BRAND_PHOTOS: Record<string, string[]> = {
  Honda: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCeKZ6MHGP-odobRcjSN-aeaH9mdtyoJ2dn65ZX8HrTay_V4JYgDcoX7_cTXUtpRTXniFBvA2DgZTwfGUbsSgVfjvZBSy1eNHF-33AoMDkL4U7opyMGLYO3RRVpmeZqB--q3mKZ7FZeJQtqr1gXZHRoypMyY-oaHFKsEbdnP4Gfu7468vat38VLiJg6DpwAhwOFbmTsG0SnvrNrDYc1WyDUxizFwV8CsMwX3aiigg6F",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAMsI9k2qZ58VV6Dd8AfOC5KpKWxTp1oJEkPIUiODzIxgwaECsFXmfaZK_x-qKRQ_yOi_cwhYx0JbHbEVr_UwTxF9zg7GqeGMtm4bf98i8XdzScE-NukMEfrgeVcm9FXxozwkUP7fS5VnMDqq9SE6naq4SUR1hJ8jSBCtil7m9-g_pxPVb6ABWojASQMTW_tECU5Hp6N25hNugOTmkJdk6IMt-YmQLs2GKpU15Uvt1s",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCThJxZeq_2sbPe98wbCeHWPpJ1RfX_PTOZrUy61kmhQ4aBRe3YMQ3lN3K_u0L11_juHWd8HJ5tc1TQXYimVZgncDT9rL15Jl75IOM7BsktlhEm76BQCmDDwoNoT8k7nSzDmNvLOWBLUPXngkcpUVNazUG09uNouJgjkZq2qGUSukuCDr8EDbMvoSOSqjeI1RQtKvPtx3cBEIe4OT6juioqtJpDNXT6rhtyp03xjZcM",
  ],
  Yamaha: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBL8RUhQYdCeKqSYvGJ3xqGhoQx2oGnEwxbNgikJ1pRXLbUvtX0cWijsKyFVjdfTAgW0FAgZJ41dj0RYJ7SbBIPRu2miqs7nZq2V3Z1cBGvi3UoQwYnM-txTWEhbWSszLNwP7bIztDsn6cvAHOjbyVQVKqWNexJvzkXoyxSHlT-qETlKx90DGVARcVJmCzb3-IIjn1ZYQlTAvHWP5ZmAhs_sjfZx7NY12iyiuqH5pAw",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAG0hEsnWSoYMN_HSKKqTAzC-5v6o3pQzdrKuQZT9cfaZZHH53ySz__Nfpn36YgsqrT3p_K3tnhk0mb_oJFfGFMjPR7X27xIopMIZd5I22IryHSIo5O8iMyuJ2o5kR6WazDvwdbKIWvdWVD8tynLnVJ-fCaGnOMUCpeX9a34oA2GUQSZa47NSRmsnarTIX0c9FB4tmkY-TMToq0EnvSmubOeNiLgYoIuvPgwGjWuUgQ",
  ],
  Vespa: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB35HIgUm3m7vw_PtcgcMuIBgxXunyCUu0p5DdMNyaP29wdZdYuT6h5EZF56ILjP_M-XhlsX2FyIgMacJqtwdYNtJ2A40xyfO69N-WkmAYA3tdbVOuD84Z31EqdIVDALpnh3-wiDqc7LfBBtYI8uezPRu8ufwWKvZg67ZfxnS_r-WDZDrrnLjk2fOi2zwIjxLOkWMmYNe8GE2CkfX0I2W931UXiBeS6kNofAXd668qO",
  ],
  Suzuki: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAg-zhSydX7NhOipZzzekDtkPyTjvsPx2asSnocAYeki42wdwfv_fnnxwxT6eYJM90yhDQy5V8oy3_AQgEXPRdE3KTcVNmqVDra5lKPXZoPVIDMXipM0xF3H1VIf4JMHDpb69eXwNJvSvw89vZnKuSC5hG4Tp4Pdc0N10jpMjAY_A62qnNz8-wO1pk7pE9qr_yVjSerj9CivZ9tHRfqx9WzwX5DURpR6zetnEyguuFf",
  ],
  Kawasaki: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBL8RUhQYdCeKqSYvGJ3xqGhoQx2oGnEwxbNgikJ1pRXLbUvtX0cWijsKyFVjdfTAgW0FAgZJ41dj0RYJ7SbBIPRu2miqs7nZq2V3Z1cBGvi3UoQwYnM-txTWEhbWSszLNwP7bIztDsn6cvAHOjbyVQVKqWNexJvzkXoyxSHlT-qETlKx90DGVARcVJmCzb3-IIjn1ZYQlTAvHWP5ZmAhs_sjfZx7NY12iyiuqH5pAw",
  ],
};

// 187 data rows from Capstone Dataset (Tabel 3.1)
const RAW_TUPLES: Array<[number, string, string, number, string, number, number, string, string, number, number, string]> = ''' + json.dumps(tuples, separators=(',', ':')) + ''';

export const DATASET_187_MOTORS: Motor[] = RAW_TUPLES.map((t, idx) => {
  const [id_motor, tipe, merek, tahun, kelengkapan, kilometer, harga_beli, kondisi_mesin, domisili_samsat, cc, harga_jual, status] = t;
  
  const brandKey = (merek in BRAND_PHOTOS) ? merek : 'Honda';
  const photoList = BRAND_PHOTOS[brandKey];
  const photoUrl = photoList[idx % photoList.length];
  
  const platPrefix = domisili_samsat.includes('Malang') ? 'N' : domisili_samsat.includes('Surabaya') ? 'L' : domisili_samsat.includes('Sidoarjo') ? 'W' : 'AG';
  const nopol = `${platPrefix} ${1000 + (idx * 37) % 8999} ${String.fromCharCode(65 + (idx % 26))}${String.fromCharCode(65 + ((idx * 5) % 26))}`;
  const sku = `RDK-${String(tahun).slice(-2)}-${merek.slice(0, 3).toUpperCase()}-${String(id_motor).padStart(3, '0')}`;
  const harga_pasar_coret = Math.round((harga_jual * 1.05) / 50000) * 50000;

  return {
    id_motor,
    id_user: 1,
    sku,
    nopol,
    merek: merek as Motor['merek'],
    tipe,
    tahun,
    cc,
    kilometer,
    kondisi_mesin,
    kelengkapan_dokumen: kelengkapan,
    domisili_samsat,
    pajak_info: 'Pajak hidup aktif',
    harga_beli,
    harga_jual,
    harga_pasar_coret,
    deskripsi: `Unit showroom ${merek} ${tipe} tahun ${tahun}. Mesin ${kondisi_mesin}, jarak tempuh ${kilometer.toLocaleString('id-ID')} km, kelengkapan ${kelengkapan}, Samsat ${domisili_samsat}. Lolos inspeksi 120+ titik, siap pakai bergaransi showroom Roda.Motorku.`,
    status: status as Motor['status'],
    created_at: new Date(Date.now() - idx * 3600 * 1000 * 6).toISOString().slice(0, 19).replace('T', ' '),
    views_week: 35 + (idx * 7) % 180,
    foto_motor: [
      {
        id_foto: id_motor * 10 + 1,
        id_motor,
        nama_file: photoUrl,
        label: 'Tampak Depan',
        caption: `Tampak Depan ${merek} ${tipe}`,
        is_utama: true,
      },
    ],
  };
});
'''

out_path = 'C:/Users/LENOVO/.gemini/antigravity-cli/brain/6773396f-a9b6-45f0-a5dd-9655f4dbc6a9/scratch/dataset187Motors.ts'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(ts_code)

print('SUCCESS! Wrote scratch/dataset187Motors.ts, size:', len(ts_code))
